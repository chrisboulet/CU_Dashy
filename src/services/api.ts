import axios, { AxiosInstance } from 'axios';

export interface RateLimits {
  global: {
    used: number;
    limit: number;
  };
  oauth: {
    used: number;
    limit: number;
  };
}

export class ClickUpService {
  private static instance: ClickUpService;
  private baseUrl = 'https://api.clickup.com/api/v2';
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 60 secondes

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });

    // Intercepteur pour les headers de rate limit
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Mettre à jour le cache des limites
        const limits: RateLimits = {
          global: {
            used: parseInt(response.headers['x-ratelimit-remaining'] || '0'),
            limit: parseInt(response.headers['x-ratelimit-limit'] || '100'),
          },
          oauth: {
            used: parseInt(response.headers['x-ratelimit-oauth-remaining'] || '0'),
            limit: parseInt(response.headers['x-ratelimit-oauth-limit'] || '100'),
          },
        };
        this.cache.set('rateLimits', { data: limits, timestamp: Date.now() });
        return response;
      },
      (error) => {
        console.error('Erreur API ClickUp:', error);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ClickUpService {
    if (!ClickUpService.instance) {
      ClickUpService.instance = new ClickUpService();
    }
    return ClickUpService.instance;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  public setToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public async getRateLimits(): Promise<RateLimits> {
    const cached = this.getFromCache<RateLimits>('rateLimits');
    if (cached) return cached;

    // Faire une requête légère pour obtenir les headers de limite
    await this.axiosInstance.get('/user');
    return this.getFromCache<RateLimits>('rateLimits') as RateLimits;
  }

  public async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.clickup.com/api/v2/oauth/token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        return response.data.access_token;
      }

      throw new Error('Token invalide reçu du serveur');
    } catch (error) {
      console.error("Erreur d'échange de token:", error);
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

// Export une instance singleton
export const clickUpService = ClickUpService.getInstance();
