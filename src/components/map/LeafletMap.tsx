import { useEffect, useRef, useState } from 'preact/hooks';
import { computeCurvePoints } from './FlightPath';

interface Location {
  id: string;
  month: string;
  year: number;
  city: string;
  country: string;
  lat: number;
  lng: number;
  label: string;
  current?: boolean;
}

interface Props {
  locations: Location[];
}

export default function LeafletMap({ locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const pathsRef = useRef<any[]>([]);
  const activeMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(locations.length - 1);
  const [leafletReady, setLeafletReady] = useState(false);

  // Dynamically import Leaflet (browser only)
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      // Dynamically import Leaflet
      const L = (await import('leaflet')).default;

      // Import Leaflet CSS
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
      });

      // CartoDB Positron tiles — clean, light, minimal
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 18,
        }
      ).addTo(map);

      // Add zoom control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      LRef.current = L;

      // Create visited markers (small muted dots) for all locations
      const visitedMarkers: any[] = [];
      locations.forEach((loc, i) => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-visited"></div>',
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon, interactive: false });
        marker.addTo(map);
        visitedMarkers.push(marker);
      });
      markersRef.current = visitedMarkers;

      // Create flight path curves between consecutive locations
      const paths: any[] = [];
      for (let i = 0; i < locations.length - 1; i++) {
        const start = { lat: locations[i].lat, lng: locations[i].lng };
        const end = { lat: locations[i + 1].lat, lng: locations[i + 1].lng };
        const curvePoints = computeCurvePoints(start, end);

        // Use a polyline approximation of the Bezier curve
        const points = approximateBezier(
          start,
          end,
          curvePoints,
          30
        );

        const polyline = L.polyline(points, {
          color: '#E07A2F',
          weight: 2,
          opacity: 0.5,
          dashArray: '6 8',
          interactive: false,
        });
        polyline.addTo(map);
        paths.push(polyline);
      }
      pathsRef.current = paths;

      // Create active marker (orange dot with pulse)
      const activeIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pulse"></div><div class="marker-dot"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const lastLoc = locations[locations.length - 1];
      const activeMarker = L.marker([lastLoc.lat, lastLoc.lng], {
        icon: activeIcon,
        zIndexOffset: 1000,
        interactive: false,
      });
      activeMarker.addTo(map);
      activeMarkerRef.current = activeMarker;

      // Add circle radius for SF Bay Area (home base)
      if (isSFBayArea(lastLoc)) {
        const circle = L.circle([lastLoc.lat, lastLoc.lng], {
          radius: 48280, // ~30 miles in meters
          color: '#E07A2F',
          fillColor: '#E07A2F',
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.4,
          dashArray: '6 4',
          interactive: false,
        });
        circle.addTo(map);
        circleRef.current = circle;
      }

      // Set initial view to show the current location
      map.setView([lastLoc.lat, lastLoc.lng], 4);

      // Update visibility based on initial index
      updatePathVisibility(locations.length - 1, paths);

      setLeafletReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when currentIndex changes
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current || !activeMarkerRef.current) return;

    const loc = locations[currentIndex];
    const map = mapInstanceRef.current;

    // Fly to new location
    map.flyTo([loc.lat, loc.lng], 4, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    // Move active marker
    activeMarkerRef.current.setLatLng([loc.lat, loc.lng]);

    // Show/hide circle for SF Bay Area
    const L = LRef.current;
    if (L) {
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      if (isSFBayArea(loc)) {
        const circle = L.circle([loc.lat, loc.lng], {
          radius: 48280, // ~30 miles in meters
          color: '#E07A2F',
          fillColor: '#E07A2F',
          fillOpacity: 0.08,
          weight: 1.5,
          opacity: 0.4,
          dashArray: '6 4',
          interactive: false,
        });
        circle.addTo(mapInstanceRef.current);
        circleRef.current = circle;
      }
    }

    // Update path visibility
    updatePathVisibility(currentIndex, pathsRef.current);
  }, [currentIndex, leafletReady]);

  function updatePathVisibility(index: number, paths: any[]) {
    paths.forEach((path, i) => {
      if (i < index) {
        path.setStyle({ opacity: 0.5 });
      } else {
        path.setStyle({ opacity: 0.1 });
      }
    });
  }

  function goBack() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function goForward() {
    setCurrentIndex((prev) => Math.min(locations.length - 1, prev + 1));
  }

  const currentLocation = locations[currentIndex];

  return (
    <div class="w-full">
      {/* Map Container */}
      <div
        ref={mapRef}
        class="w-full rounded-sm overflow-hidden border border-border"
        style={{ height: 'clamp(320px, 60vh, 560px)' }}
      />

      {/* Timeline Controls */}
      <div class="flex items-center justify-center gap-4 md:gap-6 mt-5 px-4">
        {/* Back Button */}
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          class="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-border text-text-primary hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-primary"
          aria-label="Previous location"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Location Info */}
        <div class="text-center min-w-[200px]">
          <p class="font-mono text-xs md:text-sm tracking-wider text-text-secondary uppercase">
            {currentLocation.month} {currentLocation.year}
          </p>
          <p class="text-base md:text-lg font-medium text-text-primary mt-0.5">
            {displayCity(currentLocation)}{currentLocation.country ? `, ${currentLocation.country}` : ''}
          </p>
        </div>

        {/* Forward Button */}
        <button
          onClick={goForward}
          disabled={currentIndex === locations.length - 1}
          class="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-border text-text-primary hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-primary"
          aria-label="Next location"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Check if a location is in the SF Bay Area (home base)
 */
function isSFBayArea(loc: Location): boolean {
  return loc.city === 'San Francisco' && loc.country === 'United States';
}

/**
 * Display name for a location (SF gets renamed to "SF Bay Area")
 */
function displayCity(loc: Location): string {
  if (isSFBayArea(loc)) return 'SF Bay Area';
  return loc.city;
}

/**
 * Approximate a quadratic Bezier curve with discrete points
 * for rendering as a Leaflet polyline.
 */
function approximateBezier(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  curvePoints: (string | [number, number])[],
  numPoints: number
): [number, number][] {
  // Extract control point from curve data
  // curvePoints format: ['M', [sLat, sLng], 'Q', [cLat, cLng], [eLat, eLng]]
  let controlLat = (start.lat + end.lat) / 2;
  let controlLng = (start.lng + end.lng) / 2;

  // Find the Q control point
  for (let i = 0; i < curvePoints.length; i++) {
    if (curvePoints[i] === 'Q' && i + 1 < curvePoints.length) {
      const cp = curvePoints[i + 1] as [number, number];
      controlLat = cp[0];
      controlLng = cp[1];
      break;
    }
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat =
      (1 - t) * (1 - t) * start.lat +
      2 * (1 - t) * t * controlLat +
      t * t * end.lat;
    const lng =
      (1 - t) * (1 - t) * start.lng +
      2 * (1 - t) * t * controlLng +
      t * t * end.lng;
    points.push([lat, lng]);
  }

  return points;
}
