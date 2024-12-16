# NiCoCo Grib App

NiCoCo Grib App permet de compresser un fichier GRIB pour l'envoyer par message via un INREACH, afin d'obtenir une météo en mer de manière efficace.

## Fonctionnement

1. **Serveur exposé sur le web** : L'application fonctionne sur un serveur accessible en ligne.
2. **Requêtes SMS** : Le client peut interroger le serveur par SMS pour obtenir les prévisions météo sur une zone géographique donnée.
3. **Réponse optimisée** : Le serveur récupère un fichier GRIB correspondant à la zone demandée, compresse les données et envoie un message encodé de 160 caractères maximum, compatible avec INREACH.
4. **Décodage et affichage** : Le client utilise une application dédiée pour décoder le message reçu et afficher les données sous forme de carte météo.

## Installation pour développement

### Pré-requis

Installez Docker sur votre machine.

### Étapes

1. **Construire l'image Docker** :
```bash
docker build -t coco-grib-app .
```

2. **Lancer le conteneur** :
```bash
docker run -it --rm -p 8000:8000 -v $(pwd)/data:/app/data coco-grib-app
```

Vous pouvez désormais utiliser l'application en local pour tester et développer les fonctionnalités.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Solution pour le déploiement

### Railway
https://railway.app/

Description: Railway is a PaaS that supports deploying Dockerized apps with generous free limits.

Features:
Free tier includes 500 hours/month and 1 GB of RAM.
Automatic deployments from GitHub.

Compte créé, repo binder à github 

Testé, fonctionne avec https://nixpacks.com/

### Render
https://render.com/

Description: Render supports deploying Dockerized applications with a free tier for web services.

Features:
Free tier includes 512 MB RAM and 0.5 CPU.

https://github.com/render-examples/fastapi/blob/main/render.yaml

### GCloud
https://console.cloud.google.com/

Description: GCP offers free-tier usage with Cloud Run for containerized apps.

Features:
Free tier includes 2 million requests/month and 1 vCPU instance.
Simple deployments with Docker images.


Si vous souhaitez déployer plusieurs services (par exemple, une API et un frontend) en utilisant Docker Compose sur Google Cloud Platform (GCP), vous pouvez suivre un processus en deux étapes principales :

Créer des images Docker pour chaque service avec Docker Compose.
Déployer ces services sur Google Cloud Platform (GCP), notamment en utilisant Google Cloud Run ou Google Kubernetes Engine (GKE).
Voici comment vous pouvez procéder étape par étape.

1. Créer des images Docker avec Docker Compose
   Vous allez créer un fichier docker-compose.yml qui définit les services nécessaires à votre application (API backend, frontend, etc.). Ensuite, vous utiliserez Docker Compose pour construire et pousser ces images vers Google Container Registry (GCR).

Le service api est votre backend, qui pourrait être une API Flask ou autre.
Le service frontend est votre interface utilisateur (par exemple, une application React ou Angular).
Les services api et frontend sont construits à partir des répertoires locaux ./api et ./frontend, respectivement.
Vous pouvez remplacer [PROJECT_ID] par l'ID de votre projet GCP pour que les images soient envoyées au bon registre Google Container Registry (GCR).

2. Construire et pousser les images vers Google Container Registry (GCR)

Étape 1 : Authentification avec Google Cloud
Avant de pousser des images vers GCR, vous devez vous authentifier auprès de Google Cloud. Si vous n'avez pas encore installé le Google Cloud SDK, vous pouvez le télécharger et l'installer depuis Google Cloud SDK.

Ensuite, authentifiez-vous avec la commande :

```bash
gcloud auth login
gcloud auth configure-docker
```
Cela permet à Docker de pousser les images vers Google Container Registry.

Étape 2 : Construire et taguer les images
Dans le répertoire où se trouve votre fichier docker-compose.yml, exécutez la commande suivante pour construire les images des services définis dans le fichier :

```bash
docker-compose -f docker-compose.prod.yml build
```
Cela va construire les images pour chaque service (api, frontend, etc.). Une fois les images construites, elles seront disponibles localement.

Étape 3 : Pousser les images vers Google Container Registry
Ensuite, vous devez pousser les images Docker vers Google Container Registry (GCR). Utilisez la commande docker-compose push pour pousser toutes les images définies dans le fichier docker-compose.yml.

```bash
docker-compose push
```
Cette commande va envoyer les images vers GCR en utilisant les tags définis dans le fichier docker-compose.yml (par exemple, gcr.io/[PROJECT_ID]/api-image).

3. Déployer les services sur Google Cloud Platform (GCP)

Déployer l'API backend : Une fois l'image api-image poussée sur GCR, vous pouvez déployer ce service sur Cloud Run avec la commande suivante :

```bash
gcloud run deploy inreach-grib-api --image gcr.io/inreach-forecast-444900/inreach-grib-api --platform managed --region europe-west1 --allow-unauthenticated \
  --set-env-vars FLASK_ENV=production
```

To list the deployed services in Google Cloud Run
> gcloud run services list --platform managed

> gcloud run services delete api-service --platform managed

Other resources for gcloud error !
  https://medium.com/@taylorhughes/how-to-deploy-an-existing-docker-container-project-to-google-cloud-run-with-the-minimum-amount-of-daca0b5978d8

## API Weather forecast

- https://saildocs.com/
https://www.saildocs.com/gribmodels

send email to "query@saildocs.com"

GFS:52N,38N,11W,0W|0.5,0.5|0,3,6..48|=
WIND,PRESS,WAVE


- https://open-meteo.com/en/docs/marine-weather-api
https://open-meteo.com/en/docs/ecmwf-api#hourly=temperature_2m,wind_speed_10m
https://pypi.org/project/openmeteo-requests/

- https://www.weatherapi.com/

### Map visualization

openstreetmap
https://leafletjs.com/

https://openlayers.org/

https://docs.mapbox.com/

https://docs.maptiler.com/leaflet/
