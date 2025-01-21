import { BaseWidget, WidgetConfig } from '../../types/widget';
import { clickUpService } from '../../services/api';

interface ClickUpAuthConfig extends WidgetConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class ClickUpAuthWidget extends BaseWidget<ClickUpAuthConfig> {
  private token: string | null = null;
  private static TOKEN_KEY = 'clickup_token';

  constructor() {
    super();
    this.token = localStorage.getItem(ClickUpAuthWidget.TOKEN_KEY);
    this.initialize();
  }

  protected getConfig(): ClickUpAuthConfig {
    return {
      clientId: this.getAttribute('client-id') || '',
      clientSecret: this.getAttribute('client-secret') || '',
      redirectUri: this.getAttribute('redirect-uri') || ''
    };
  }

  static get observedAttributes(): string[] {
    return ['client-id', 'client-secret', 'redirect-uri'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;
    this.config = this.getConfig();
  }

  async initialize(): Promise<void> {
    // Vérifier si on a un code dans l'URL (callback OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      try {
        await this.exchangeCodeForToken(code);
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        this.updateState({ error: "Échec de l'authentification" });
      }
    }

    this.updateState({
      isAuthenticated: !!this.token,
      isLoading: false
    });
  }

  private async exchangeCodeForToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('Code OAuth manquant');
    }

    try {
      this.token = await clickUpService.exchangeCodeForToken(
        code,
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      localStorage.setItem(ClickUpAuthWidget.TOKEN_KEY, this.token);
      this.updateState({ isAuthenticated: true, error: null });
      
      // Mettre à jour le service avec le nouveau token
      clickUpService.setToken(this.token);
      
      // Émettre un événement pour informer les autres widgets
      this.dispatchEvent(new CustomEvent('auth-success', {
        bubbles: true,
        composed: true,
        detail: { token: this.token }
      }));
    } catch (error) {
      console.error("Erreur d'échange de token:", error);
      this.updateState({ 
        error: error instanceof Error ? error.message : "Erreur d'authentification inconnue",
        isAuthenticated: false 
      });
      throw error;
    }
  }

  login(): void {
    const authUrl = new URL('https://app.clickup.com/api/v2/oauth/authorize');
    authUrl.searchParams.append('client_id', this.config.clientId);
    authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    window.location.href = authUrl.toString();
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem(ClickUpAuthWidget.TOKEN_KEY);
    clickUpService.clearCache();
    this.updateState({ isAuthenticated: false });
    
    // Émettre un événement de déconnexion
    this.dispatchEvent(new CustomEvent('auth-logout', {
      bubbles: true,
      composed: true
    }));
  }

  getToken(): string | null {
    return this.token;
  }

  protected renderContent(): string {
    const { isAuthenticated, isLoading, error } = this.state;
    return `
      <div class="clickup-auth-widget">
        ${isLoading ? '<div class="loading">Chargement...</div>' : ''}
        ${error ? `<div class="error">${error}</div>` : ''}
        ${isAuthenticated 
          ? '<button onclick="this.getRootNode().host.logout()" class="auth-button logout">Se déconnecter de ClickUp</button>'
          : '<button onclick="this.getRootNode().host.login()" class="auth-button login">Se connecter avec ClickUp</button>'
        }
      </div>
    `;
  }

  getStyles(): string {
    return `
      .clickup-auth-widget {
        padding: 1rem;
        text-align: center;
      }
      .auth-button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      .login {
        background: #7B68EE;
        color: white;
        border: none;
      }
      .login:hover {
        background: #6A5ACD;
      }
      .logout {
        background: #DC143C;
        color: white;
        border: none;
      }
      .logout:hover {
        background: #B22222;
      }
      .loading {
        color: #666;
        margin-bottom: 1rem;
      }
      .error {
        color: #DC143C;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
        background: rgba(220, 20, 60, 0.1);
      }
    `;
  }
}

// Définir le custom element
customElements.define('custom-clickup-auth', ClickUpAuthWidget);
