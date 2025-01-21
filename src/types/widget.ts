export interface WidgetState {
  isLoading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  [key: string]: any;
}

export interface WidgetConfig {
  [key: string]: any;
}

export abstract class BaseWidget<TConfig extends WidgetConfig = WidgetConfig> extends HTMLElement {
  protected state: WidgetState = {};
  protected config: TConfig;
  protected shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.config = this.getConfig();
    
    // Ajouter les styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadow.appendChild(style);
    
    // Créer le conteneur principal
    const container = document.createElement('div');
    container.className = 'widget-container';
    this.shadow.appendChild(container);
  }

  protected abstract getConfig(): TConfig;

  protected updateState(newState: Partial<WidgetState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  protected render(): void {
    const container = this.shadow.querySelector('.widget-container');
    if (container) {
      container.innerHTML = this.renderContent();
    }
  }

  protected abstract renderContent(): string;
  protected abstract getStyles(): string;

  // Lifecycle callbacks
  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    // Cleanup si nécessaire
  }
}
