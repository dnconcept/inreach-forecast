# Description du Nicoco Inreach WeatherForecast

L'application a pour objectif de fournir des informations météo pour une position donnée. Elle utilise les données GRIB (GRIdded Binary), qui sont des fichiers standard pour la transmission de données météorologiques

## Fonctionnalités principales :

1 - **Entrée** : Coordonnées GPS (latitude, longitude) d'un point d'intérêt.
2 - **Sortie** : Un message texte compact (160 caractères max), structuré en blocs de 3 caractères représentant :

+ **Direction du vent** : Encodée avec une lettre (A à Z) représentant un angle arrondi sur 24 secteurs (15° par secteur).
+ **Force du vent** : Un chiffre de 1 à 9 (force approximative du vent).
+ **Hauteur des vagues** : Une lettre (A à Z) représentant une hauteur de vague entre 0.1 m et 4.2 m (0.1 m par incrément).

3 - **Format du message** : 40 blocs de 3 caractères pour une grille complète.

4 - **Encodage** : Transformation des données météo issues du fichier GRIB en une chaîne de caractères optimisée.

5 - **Décodage** : Lecture de cette chaîne pour obtenir les informations météo.

Objectifs techniques :
+ Lire les données GRIB (format binaire complexe) pour extraire les informations nécessaires : vent et hauteur de vagues.
+ Encoder ces informations dans un format compact.
+ Décoder le message compact pour restituer les informations.

## Fonctionnement

Le client ( le marin en mer ) fait la requête via l'inreach.

Il a donc à disposition les informations suivantes :
 - sa position GPS
 - la taille et la position de la grille demandée
 - l'heure de demande

La requête s'effectue par email de la façon suivante :

send email to "query@saildocs.com"
Example : GFS:52N,38N,11W,0W|0.5,0.5|24,48|=WIND,PRESS,WAVE

The format for a basic grib-file request is:
gfs:lat0,lat1,lon0,lon1|dlat,dlon|VTs|Params

"lat0,lat1,lon0,lon1" are the lat-lon limits (whole degrees followed by N/S or E/W)- this field is required, there is no default.
"dlat,dlon" is the grid-spacing in degrees (e.g. "1,1" for a 1-deg by 1-deg grid), if omitted the default is "2,2". The minimum grid depends on the model, see "available models" below. This parameter has a large effect on file-size, see below.
"VTs" is a comma-separated list of valid-times (forecast-times, e.g. "24,48,72"), if omitted the default is "24,48,72". Available valid-times depend on the model, see below. Note that forecasts beyond 4 or 5 days should be viewed with increasing skepticism.
"Params" is a comma-separated list of parameters, default is pressure and wind if omitted.

La réception du message encodée doit contenir une information permettant de vérifier les informations en entrée
