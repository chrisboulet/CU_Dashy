#!/bin/bash

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Vérifier la présence du fichier .env
if [ ! -f .env ]; then
    echo "Création du fichier .env à partir de .env.example..."
    cp .env.example .env
    echo "Veuillez configurer les variables dans le fichier .env avant de continuer."
    exit 1
fi

# Démarrer les services
echo "Démarrage des services..."
docker-compose -f docker/docker-compose.yml up -d

# Attendre que les services soient prêts
echo "Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "Vérification de l'état des services..."
docker-compose -f docker/docker-compose.yml ps

echo "
🚀 CU_Dashy est démarré!

📊 Accès aux interfaces:
- Application: http://localhost:8080
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

Pour arrêter les services:
docker-compose -f docker/docker-compose.yml down

Pour voir les logs:
docker-compose -f docker/docker-compose.yml logs -f
"
