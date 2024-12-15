#pygrib est la bibliothèque pour ouvrir un fichier grib
import pygrib
import math
import numpy as np
grbs = pygrib.open("c:/Users/ordim/OneDrive/Bureau/data.grb")
#dans les grib le vent est décomposé en une composante verticale (V) et une horizontale (U). le [1] indique la première prévision (dans ce cas prévision à 12h).
grb = grbs.select(name='10 metre V wind component')[1]
dataV, lats, lons = grb.data()
grb = grbs.select(name='10 metre U wind component')[1]
dataU, lats, lons = grb.data()
#retourne l'ordre des lignes du tableau pour que ca commence par les latitudes hautes
dataV = np.flipud(dataV)
dataU = np.flipud(dataU)
#calcule la force du vent avec les 2 composantes U et V, et convertit m.s en nds
e = np.sqrt(abs(dataU*dataU)+abs(dataV*dataV))*1.943844
#écrête les vents au dessus de 40nds, puis divise et arrondit pour mettre à une échelle de vent de 0 à 9. si c'est au dessus de 40nds ca affichera 9.
h = np.minimum(e, 40)
f = np.around(h*10/43,0)
#calcule l'angle du vent, puis divise et arrondit pour mettre à une échelle d'angle entre 0 et 9.
g = 90-np.arctan(dataV/dataU)*180/3.1416
g = np.where(dataU > 0 , (g + 180) , g)
#arrondit à Nord les vents au dessus de 342 degrés
g[g > 342] = 0
v = np.around(g,0)
h = np.around(g*10/360,0)
#combine les données de force du vent (la dizaine) et direction de vent (l'unité) pour que les 2 infos soient contenues dans un chiffre de 00 à 99
i = f*10+h
#passe les nombres en string
y = np.array(["%.0f" % w for w in i.reshape(i.size)])
y = y.reshape(i.shape)
#tableau d'équivalence qui convertit les nombres de 00 à 99 en caractères
y[y=='0']='a'
y[y=='1']='b'
y[y=='2']='c'
y[y=='3']='d'
y[y=='4']='e'
y[y=='5']='f'
y[y=='6']='g'
y[y=='7']='h'
y[y=='8']='i'
y[y=='9']='j'
y[y=='10']='k'
y[y=='11']='l'
y[y=='12']='m'
y[y=='13']='n'
y[y=='14']='o'
y[y=='15']='p'
y[y=='16']='q'
y[y=='17']='r'
y[y=='18']='s'
y[y=='19']='t'
y[y=='20']='u'
y[y=='21']='v'
y[y=='22']='w'
y[y=='23']='x'
y[y=='24']='y'
y[y=='25']='z'
y[y=='26']='A'
y[y=='27']='B'
y[y=='28']='C'
y[y=='29']='D'
y[y=='30']='E'
y[y=='31']='F'
y[y=='32']='G'
y[y=='33']='H'
y[y=='34']='I'
y[y=='35']='J'
y[y=='36']='K'
y[y=='37']='L'
y[y=='38']='M'
y[y=='39']='N'
y[y=='40']='O'
y[y=='41']='P'
y[y=='42']='Q'
y[y=='43']='R'
y[y=='44']='S'
y[y=='45']='T'
y[y=='46']='U'
y[y=='47']='V'
y[y=='48']='W'
y[y=='49']='X'
y[y=='50']='Y'
y[y=='51']='Z'
y[y=='52']='0'
y[y=='53']='1'
y[y=='54']='2'
y[y=='55']='3'
y[y=='56']='4'
y[y=='57']='5'
y[y=='58']='6'
y[y=='59']='7'
y[y=='60']='8'
y[y=='61']='9'
y[y=='62']='à'
y[y=='63']='â'
y[y=='64']='é'
y[y=='65']='è'
y[y=='66']='ê'
y[y=='67']='î'
y[y=='68']='ï'
y[y=='69']='ô'
y[y=='70']='ù'
y[y=='71']='û'
y[y=='72']='ç'
y[y=='73']='@'
y[y=='74']='['
y[y=='75']=']'
y[y=='76']='_'
y[y=='77']='!'
y[y=='78']='#'
y[y=='79']='$'
y[y=='80']='%'
y[y=='81']='&'
y[y=='82']='?'
y[y=='83']='('
y[y=='84']=')'
y[y=='85']='*'
y[y=='86']='+'
y[y=='87']=','
y[y=='88']='-'
y[y=='89']='.'
y[y=='90']='/'
y[y=='91']=':'
y[y=='92']=';'
y[y=='93']='{'
y[y=='94']='}'
y[y=='95']='<'
y[y=='96']='>'
y[y=='97']='='
y[y=='98']='€'
y[y=='99']='~'

# Convertir le tableau NumPy en liste 1D, et colle ensemble tous les caractères
z = y.flatten()
r = ''.join(z)
print(r)

grbs.close()