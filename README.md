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
