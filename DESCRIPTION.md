# Description du Nicoco Inreach WeatherForecast

L'application a pour objectif de fournir des informations météo pour une position donnée. Elle utilise les données GRIB (GRIdded Binary), qui sont des fichiers standard pour la transmission de données météorologiques

Fonctionnalités principales :

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
