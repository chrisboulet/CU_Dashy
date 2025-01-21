import { BaseWidget, WidgetConfig } from '../../types/widget';
import { clickUpService, RateLimits } from '../../services/api';

interface ApiLimitsConfig extends WidgetConfig {
  refreshInterval: number;
  showChart: boolean;
}

export class ApiLimitsWidget extends BaseWidget<ApiLimitsConfig> {
  private refreshTimer: number | null = null;
  private limits: RateLimits | null = null;

  constructor() {
    super();
    this.startRefreshTimer();

    // Écouter les événements d'authentification
    window.addEventListener('auth-success', () => {
      this.fetchLimits();
    });

    window.addEventListener('auth-logout', () => {
      this.limits = null;
      this.updateState({ error: 'Non authentifié' });
    });
  }

  protected getConfig(): ApiLimitsConfig {
    return {
      refreshInterval: Number(this.getAttribute('refresh-interval')) || 60,
      showChart: this.hasAttribute('show-chart')
    };
  }

  private startRefreshTimer(): void {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
    }

    // Rafraîchir immédiatement puis selon l'intervalle
    this.fetchLimits();
    this.refreshTimer = window.setInterval(
      () => this.fetchLimits(),
      this.config.refreshInterval * 1000
    );
  }

  private async fetchLimits(): Promise<void> {
    try {
      this.limits = await clickUpService.getRateLimits();
      this.updateState({ error: null });
    } catch (error) {
      console.error('Erreur lors de la récupération des limites:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Erreur de récupération des limites'
      });
    }
  }

  private getUsageColor(percentage: number): string {
    if (percentage <= 50) return '#4CAF50';
    if (percentage <= 75) return '#FFA500';
    return '#DC143C';
  }

  private renderChart(): string {
    if (!this.limits || !this.config.showChart) return '';

    const globalPercentage = (this.limits.global.used / this.limits.global.limit) * 100;
    const oauthPercentage = (this.limits.oauth.used / this.limits.oauth.limit) * 100;

    const globalColor = this.getUsageColor(globalPercentage);
    const oauthColor = this.getUsageColor(oauthPercentage);

    return `
      <div class="limits-chart">
        <div class="chart-bar">
          <div class="bar-header">
            <div class="bar-label">Limite Globale</div>
            <div class="bar-text">${this.limits.global.used}/${this.limits.global.limit}</div>
          </div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${globalPercentage}%; background-color: ${globalColor}">
              <span class="bar-percentage">${Math.round(globalPercentage)}%</span>
            </div>
          </div>
        </div>

        <div class="chart-bar">
          <div class="bar-header">
            <div class="bar-label">Limite OAuth</div>
            <div class="bar-text">${this.limits.oauth.used}/${this.limits.oauth.limit}</div>
          </div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${oauthPercentage}%; background-color: ${oauthColor}">
              <span class="bar-percentage">${Math.round(oauthPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected renderContent(): string {
    const { error } = this.state;

    if (error) {
      return `<div class="api-limits-widget"><div class="error">${error}</div></div>`;
    }

    if (!this.limits) {
      return `<div class="api-limits-widget"><div class="loading">Chargement des limites...</div></div>`;
    }

    return `
      <div class="api-limits-widget">
        <div class="widget-header">
          <h3>Limites d'API ClickUp</h3>
          <button onclick="this.getRootNode().host.fetchLimits()" class="refresh-button">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        ${this.renderChart()}
        <div class="last-update">
          Dernière mise à jour: ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
  }

  static get observedAttributes(): string[] {
    return ['refresh-interval', 'show-chart'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;
    
    if (name === 'refresh-interval') {
      this.config = this.getConfig();
      this.startRefreshTimer();
    } else if (name === 'show-chart') {
      this.config = this.getConfig();
      this.render();
    }
  }

  disconnectedCallback(): void {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  getStyles(): string {
    return `
      .api-limits-widget {
        padding: 1rem;
        background: var(--bg-color, white);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .widget-header h3 {
        margin: 0;
        color: var(--text-color, #333);
      }

      .refresh-button {
        background: none;
        border: none;
        color: var(--primary-color, #7B68EE);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .refresh-button:hover {
        background: rgba(123, 104, 238, 0.1);
      }

      .limits-chart {
        margin-top: 1rem;
      }

      .chart-bar {
        margin-bottom: 1.5rem;
      }

      .bar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .bar-label {
        font-weight: bold;
        color: var(--text-color, #333);
      }

      .bar-container {
        background: #eee;
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: width 0.3s ease;
        position: relative;
      }

      .bar-percentage {
        color: white;
        font-size: 0.875rem;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }

      .bar-text {
        font-size: 0.875rem;
        color: var(--text-color, #666);
      }

      .last-update {
        margin-top: 1rem;
        text-align: right;
        font-size: 0.75rem;
        color: var(--text-color, #666);
      }

      .error {
        color: var(--error-color, #DC143C);
        padding: 1rem;
        border-radius: 4px;
        background: rgba(220, 20, 60, 0.1);
        text-align: center;
      }

      .loading {
        color: var(--text-color, #666);
        text-align: center;
        padding: 1rem;
      }

      @media (prefers-color-scheme: dark) {
        .bar-container {
          background: #2d2d2d;
        }
      }
    `;
  }
}

// Définir le custom element
customElements.define('custom-api-limits', ApiLimitsWidget);
