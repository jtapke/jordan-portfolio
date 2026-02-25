export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Compute quadratic Bezier curve points for a flight-path arc
 * between two lat/lng positions. The control point is offset
 * perpendicular to the line connecting start and end, creating
 * a curved arc that resembles a plane's flight path.
 */
export function computeCurvePoints(
  start: LatLng,
  end: LatLng
): (string | [number, number])[] {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const distance = Math.sqrt(dLat * dLat + dLng * dLng);

  if (distance === 0) {
    return ['M', [start.lat, start.lng] as [number, number]];
  }

  // Arc height proportional to distance, capped for very long routes
  const arcHeight = Math.min(distance * 0.25, 12);

  // Perpendicular offset (rotate 90 degrees clockwise)
  const controlLat = midLat + (dLng / distance) * arcHeight;
  const controlLng = midLng - (dLat / distance) * arcHeight;

  return [
    'M',
    [start.lat, start.lng] as [number, number],
    'Q',
    [controlLat, controlLng] as [number, number],
    [end.lat, end.lng] as [number, number],
  ];
}
