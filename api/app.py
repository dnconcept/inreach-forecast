#pygrib est la bibliothèque pour ouvrir un fichier grib
import pygrib
import numpy as np

MS_TO_KNOTS = 1.94384

def encode_grib_file( file_path ):
    """
    Returns encoded string representing data to be read from inreach-app
    """
    grbs = pygrib.open(file_path)
    # dans les grib le vent est décomposé en une composante verticale (V) et une horizontale (U).
    # le [1] indique la première prévision (dans ce cas prévision à 12h).
    grb = grbs.select(name='10 metre V wind component')[1]
    dataV, lats, lngs = grb.data()
    grb = grbs.select(name='10 metre U wind component')[1]
    dataU, lats, lngs = grb.data()
    grbs.close()

    ru = reduce_matrix(dataU)
    rv = reduce_matrix(dataV)
    rlats = reduce_matrix(lats)
    rlngs = reduce_matrix(lngs)

    u, v, e = encode_data(ru, rv)

    return {
        'encoded': e,
        'lats': rlats[:,0].tolist(),
        'lngs': rlngs[0,:].tolist(),
        'u': u.tolist(),
        'v': v.tolist(),
    }

def reduce_matrix(matrix, max_size=6):
    """
    Réduit une matrice à une taille maximale donnée tout en conservant
    les valeurs des extrémités et en échantillonnant les valeurs intermédiaires.

    Paramètres :
        matrix (ndarray) : Matrice d'entrée.
        max_size (int) : Taille maximale pour les lignes et colonnes.

    Retourne :
        ndarray : Matrice réduite.
    """
    # Dimensions de la matrice
    n_rows, n_cols = matrix.shape

    # Calcul des indices pour les lignes
    if n_rows > max_size:
        row_indices = np.linspace(0, n_rows - 1, max_size, dtype=int)
    else:
        row_indices = np.arange(n_rows)

    # Calcul des indices pour les colonnes
    if n_cols > max_size:
        col_indices = np.linspace(0, n_cols - 1, max_size, dtype=int)
    else:
        col_indices = np.arange(n_cols)

    # Extraction des sous-matrices
    reduced_matrix = matrix[row_indices, :][:, col_indices]
    return reduced_matrix

def encode_data(u, v):
    # Calculate wind direction
    speed_ms, speed_kts, speed_scale, direction = wind_speed_direction(u, v)
    direction_letters = direction_to_letters(direction)
    # Combinaison des deux en une matrice de chaînes
    encoded_matrix = np.array([[f"{speed}{letter}" for speed, letter in zip(row_speed, row_dir)]
                               for row_speed, row_dir in zip(speed_scale, direction_letters)])
    # Concaténer chaque ligne pour obtenir une grande chaîne continue
    encoded_string = ''.join(encoded_matrix.flatten())
    return u, v, encoded_string

def direction_to_letters(direction):
    """
    Convertit les directions en degrés (0°-360°) en lettres (A-X).

    Paramètres :
        direction (ndarray) : Matrice des directions en degrés.

    Retourne :
        ndarray : Matrice des directions converties en lettres.
    """
    # Diviser 360° en 24 intervalles (A-X)
    interval = 360 / 24  # Chaque lettre représente 15° d'intervalle
    letters = np.array([chr(65 + int(d // interval) % 24) for d in direction.flatten()])
    return letters.reshape(direction.shape)

def wind_speed_direction(U, V):
    """
    Calcule la vitesse et la direction du vent à partir des composantes U et V.

    Paramètres :
        U (array-like) : Composante horizontale du vent (vers l'Est).
        V (array-like) : Composante verticale du vent (vers le Nord).

    Retourne :
        speed (ndarray) : Vitesse du vent en m/s.
        direction (ndarray) : Direction du vent en degrés (0°-360°).
    """
    # Calcul de la vitesse du vent (norme du vecteur)
    speed_ms = np.sqrt(U**2 + V**2)

    # Conversion de la vitesse en nœuds
    speed_knots = speed_ms * MS_TO_KNOTS

    # Mise à l'échelle de 0 à 9 (max à 40 nœuds)
    speed_scale = np.clip((speed_knots / 40) * 9, 0, 9).astype(int)

    # Calcul de la direction du vent (météorologique)
    direction = np.mod(270 - np.degrees(np.arctan2(V, U)), 360)

    # Arrondi de la direction pour avoir des entiers
    direction = np.round(direction).astype(int)

    return speed_ms, speed_knots, speed_scale, direction

def extract_grib_file(file_like_object):
    """
    Extracts metadata and data from a GRIB file using pygrib.
    Returns a dictionary that can be converted to JSON.
    """
    grbs = pygrib.open(file_like_object)
    data = {}
    messages = []

    i = 0
    # Iterate through all messages in the GRIB file
    for grb in grbs:
        # Get latitude and longitude grid
        lats, lngs = grb.latlons()
        if i == 0:
          data = {
            "lats": lats[:, 0].tolist(),  # Liste unique des latitudes (colonnes fixes)
            "lngs": lngs[0, :].tolist(),  # Liste unique des longitudes (lignes fixes)
          }
        i = i + 1
        # Extract values and associated geo-information
        values = grb.values
        # print(grb)
        # Add data for this message
        json_data = {
            'parameter': grb.parameterName,
            'short': grb.shortName,
            'level': grb.level,
            'units': grb.units,
            'dataDate': grb.dataDate,
            'validDate': grb.validDate.isoformat(),
            "data": values.tolist(),  # Grille des données (valeurs)
        }
        messages.append(json_data)
    data['messages'] = messages
    grbs.close()
    return data

def encode_data_corentin(dataU, dataV):
    # retourne l'ordre des lignes du tableau pour que ca commence par les latitudes hautes
    dataV = np.flipud(dataV)
    dataU = np.flipud(dataU)

    # calcule la force du vent avec les 2 composantes U et V, et convertit m.s en nds
    e = np.sqrt(abs(dataU*dataU)+abs(dataV*dataV)) * MS_TO_KNOTS

    # écrête les vents au dessus de 40nds, puis divise et arrondit pour mettre à une échelle de vent de 0 à 9. si c'est au dessus de 40nds ca affichera 9.
    h = np.minimum(e, 40)
    f = np.around(h*10/43,0)

    # calcule l'angle du vent, puis divise et arrondit pour mettre à une échelle d'angle entre 0 et 9.
    g = 90 - np.arctan(dataV / dataU) * 180 / 3.1416
    g = np.where(dataU > 0 , (g + 180) , g)

    # arrondit à Nord les vents au dessus de 342 degrés
    g[g > 342] = 0
    v = np.around(g,0)
    h = np.around(g*10/360,0)

    # combine les données de force du vent (la dizaine) et direction de vent (l'unité) pour que les 2 infos soient contenues dans un chiffre de 00 à 99
    i = f * 10 + h

    # passe les nombres en string
    y = np.array(["%.0f" % w for w in i.reshape(i.size)])
    y = y.reshape(i.shape)

    # Convertir le tableau NumPy en liste 1D, et colle ensemble tous les caractères
    z = convert_numbers_to_chars(y).flatten()
    return ''.join(z)

# tableau d'équivalence qui convertit les nombres de 00 à 99 en caractères
def convert_numbers_to_chars(input_array):
    # Liste des caractères correspondants aux chiffres de 0 à 99
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789àâéèêîïôùûç@[]_!#$%&?()*,.-:/;{}<>=€~"

    # Dictionnaire de mappage des chiffres (0-99) vers les caractères
    mapping = {str(i): chars[i] for i in range(99)}

    # Remplacement dans le tableau d'entrée en utilisant le mappage
    output_array = np.vectorize(mapping.get)(input_array)

    return output_array
