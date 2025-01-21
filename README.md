# CU_Dashy

Interface de monitoring ClickUp basée sur Dashy, permettant de suivre les limites d'API et de gérer l'authentification OAuth dans une interface moderne et modulaire.

## 🚀 Fonctionnalités

- 🔐 Authentification OAuth avec ClickUp
- 📊 Suivi des limites d'API en temps réel
- 📈 Visualisation graphique des métriques
- 🎨 Interface utilisateur moderne et responsive
- 🔄 Mise à jour automatique des données
- 🛡️ Gestion sécurisée des tokens

## 📋 Prérequis

- Node.js 16+
- npm 7+
- Un compte ClickUp avec accès développeur
- Redis (optionnel, pour le cache)

## 🛠️ Installation

1. Cloner le projet
```bash
git clone https://github.com/chrisboulet/CU_Dashy.git
cd CU_Dashy
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

Remplir les variables suivantes dans le fichier `.env`:
- \`CLICKUP_CLIENT_ID\`: ID client de votre app ClickUp
- \`CLICKUP_CLIENT_SECRET\`: Secret client de votre app ClickUp
- \`CLICKUP_REDIRECT_URI\`: URI de redirection (par défaut: http://localhost:5173/callback)
- \`REDIS_URL\`: URL de votre serveur Redis (optionnel)

## 🚀 Développement

```bash
# Lancer en mode développement
npm run dev

# Lancer les tests
npm test

# Vérifier le code
npm run lint

# Formater le code
npm run format
```

## 🏗️ Architecture

### Structure des dossiers

\`\`\`
CU_Dashy/
├── src/
│   ├── widgets/           # Composants custom
│   │   ├── clickup-auth/  # Widget d'authentification
│   │   └── api-limits/    # Widget de suivi des limites
│   ├── services/         # Services partagés
│   │   ├── auth.ts      # Service d'authentification
│   │   └── api.ts       # Service API ClickUp
│   ├── utils/           # Utilitaires
│   └── types/           # Types TypeScript
├── public/              # Assets statiques
└── docker/             # Config Docker
\`\`\`

### Widgets disponibles

#### ClickUpAuthWidget

Gère l'authentification OAuth avec ClickUp.

```html
<custom-clickup-auth
  client-id="votre-client-id"
  client-secret="votre-client-secret"
  redirect-uri="votre-redirect-uri"
></custom-clickup-auth>
```

#### ApiLimitsWidget

Affiche et surveille les limites d'API.

```html
<custom-api-limits
  refresh-interval="60"
  show-chart="true"
></custom-api-limits>
```

## 🔒 Sécurité

- Validation des tokens JWT
- Rotation automatique des tokens
- Stockage sécurisé avec Redis
- Validation des réponses API
- Gestion sécurisée des erreurs

## 🐳 Docker

```bash
# Build l'image
docker build -t cu-dashy .

# Lancer le conteneur
docker run -p 8080:80 \
  -e CLICKUP_CLIENT_ID=your_id \
  -e CLICKUP_CLIENT_SECRET=your_secret \
  -e CLICKUP_REDIRECT_URI=your_uri \
  cu-dashy
```

## 📈 Monitoring

- Métriques Prometheus exposées sur /metrics
- Dashboard Grafana préconfigurés
- Logs structurés avec niveaux de sévérité
- Alertes configurables

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit les changements (`git commit -m 'Ajout de fonctionnalité'`)
4. Push la branche (`git push origin feature/amelioration`)
5. Créer une Pull Request

## 📝 License

ISC

## 🆘 Support

Pour toute question ou problème:
1. Consulter la [documentation ClickUp](https://clickup.com/api)
2. Ouvrir une issue dans le projet
