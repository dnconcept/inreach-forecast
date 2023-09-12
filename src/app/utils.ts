export interface IPosition {
  lat: number;
  lng: number;
}

export function round( value: number, rounded = 3 ): number {
  const k = Math.pow(10, rounded);
  return Math.round(value * k) / k;
}

export function countDecimal( n: number ): number {
  if (n === null || Math.floor(n) === n) {
    return 0;
  } // No decimal places
  const decimalPart = n.toString().split('.')[1];
  if (!decimalPart) {
    return 0;
  } // No decimal places after the dot
  return decimalPart.length;
}

export function calculateNewPosition( lat: number, lng: number, speed: number,
                                      cap: number, durationAsSecond: number ): IPosition {
  // Rayon moyen de la Terre en mètres
  const R = 6371000;

  // Convertir la vitesse en mètres par seconde
  const vitesseMps = speed * 0.514444;

  // Convertir le cap en radians
  const capRad = (cap * Math.PI) / 180;

  // Convertir la latitude et la longitude en radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Calculer la distance parcourue en mètres
  const distanceMeters = vitesseMps * durationAsSecond;

  // Calculer la nouvelle latitude et la nouvelle longitude
  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(distanceMeters / R) +
    Math.cos(latRad) * Math.sin(distanceMeters / R) * Math.cos(capRad)
  );

  const newLngRad = lngRad + Math.atan2(
    Math.sin(capRad) * Math.sin(distanceMeters / R) * Math.cos(latRad),
    Math.cos(distanceMeters / R) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  // Convertir la nouvelle latitude et la nouvelle longitude en degrés
  const newLat = (newLatRad * 180) / Math.PI;
  const newLng = (newLngRad * 180) / Math.PI;

  return { lat: round(newLat), lng: round(newLng) };
}
