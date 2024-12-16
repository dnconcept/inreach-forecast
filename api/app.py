#pygrib est la bibliothèque pour ouvrir un fichier grib
import pygrib
import numpy as np

def open_grib( file_path ):
    grbs = pygrib.open(file_path)
    # dans les grib le vent est décomposé en une composante verticale (V) et une horizontale (U).
    # le [1] indique la première prévision (dans ce cas prévision à 12h).
    grb = grbs.select(name='10 metre V wind component')[1]
    dataV, lats, lons = grb.data()
    grb = grbs.select(name='10 metre U wind component')[1]
    dataU, lats, lons = grb.data()
    grbs.close()
    return {
        'dataV': dataV.tolist(),
        'lats': lats.tolist(),
        'dataU': dataU.tolist(),
        'encoded': compress_grib(dataV, dataU)
    }

def extract_grib_data(file_like_object):
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
        lats, lons = grb.latlons()
        if i == 0:
          data = {
            "latitudes": lats[:, 0].tolist(),  # Liste unique des latitudes (colonnes fixes)
            "longitudes": lons[0, :].tolist(),  # Liste unique des longitudes (lignes fixes)
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

def compress_grib(dataV, dataU):
    # retourne l'ordre des lignes du tableau pour que ca commence par les latitudes hautes
    dataV = np.flipud(dataV)
    dataU = np.flipud(dataU)
    # calcule la force du vent avec les 2 composantes U et V, et convertit m.s en nds
    e = np.sqrt(abs(dataU*dataU)+abs(dataV*dataV))*1.943844
    # écrête les vents au dessus de 40nds, puis divise et arrondit pour mettre à une échelle de vent de 0 à 9. si c'est au dessus de 40nds ca affichera 9.
    h = np.minimum(e, 40)
    f = np.around(h*10/43,0)
    # calcule l'angle du vent, puis divise et arrondit pour mettre à une échelle d'angle entre 0 et 9.
    g = 90-np.arctan(dataV/dataU)*180/3.1416
    g = np.where(dataU > 0 , (g + 180) , g)
    # arrondit à Nord les vents au dessus de 342 degrés
    g[g > 342] = 0
    v = np.around(g,0)
    h = np.around(g*10/360,0)
    # combine les données de force du vent (la dizaine) et direction de vent (l'unité) pour que les 2 infos soient contenues dans un chiffre de 00 à 99
    i = f*10+h
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
