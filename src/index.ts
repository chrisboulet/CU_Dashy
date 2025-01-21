import { ClickUpAuthWidget } from './widgets/clickup-auth';
import { ApiLimitsWidget } from './widgets/api-limits';

// Définir les custom elements
customElements.define('custom-clickup-auth', ClickUpAuthWidget);
customElements.define('custom-api-limits', ApiLimitsWidget);

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si les variables d'environnement sont disponibles
  const clientId = process.env.CLICKUP_CLIENT_ID;
  const clientSecret = process.env.CLICKUP_CLIENT_SECRET;
  const redirectUri = process.env.CLICKUP_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Variables d\'environnement manquantes pour ClickUp OAuth');
    return;
  }

  // Configurer les widgets via leurs attributs HTML
  const authWidget = document.querySelector('custom-clickup-auth');
  if (authWidget) {
    authWidget.setAttribute('client-id', clientId);
    authWidget.setAttribute('client-secret', clientSecret);
    authWidget.setAttribute('redirect-uri', redirectUri);
  }

  // Configurer le thème en fonction des préférences système
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  // Écouter les changements de thème
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  });

  // Ajouter un gestionnaire d'erreurs global
  window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    // Ici on pourrait envoyer l'erreur à un service de monitoring
  });

  // Ajouter un gestionnaire de promesses non gérées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse non gérée:', event.reason);
    // Ici on pourrait envoyer l'erreur à un service de monitoring
  });

  console.log('Application CU_Dashy initialisée avec succès!');
});

// Exposer une API publique pour Dashy
window.CU_Dashy = {
  version: '1.0.0',
  refreshWidgets: () => {
    document.querySelectorAll('custom-api-limits').forEach((widget: any) => {
      if (widget.fetchLimits) {
        widget.fetchLimits();
      }
    });
  },
  clearCache: () => {
    localStorage.clear();
    console.log('Cache effacé');
  }
};
