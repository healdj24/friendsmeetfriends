'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

// ========== TYPES ==========
interface StreetSegment {
  id: number;
  coords: [number, number][];
  line?: L.Polyline;
}

interface Street {
  name: string;              // Display name (from OSM)
  normalizedName: string;    // For matching with NYC data
  priority: 'prime' | 'good' | 'avoid';
  segments: StreetSegment[];
  plowTimestamp?: string;
  hoursSincePlow?: number;
}

type LoadingState = 'idle' | 'loading-streets' | 'loading-plow' | 'ready' | 'error';

// Snow forecast from Open-Meteo API
interface HourlyForecast {
  time: string;        // ISO timestamp
  temp: number;        // °F
  snowfall: number;    // inches
  precipitation: number; // inches
  probability: number; // 0-100%
  weatherCode: number; // WMO code
}

interface SnowForecast {
  current: {
    temp: number;
    snowDepth: number;  // inches
    isSnowing: boolean;
  };
  hourly: HourlyForecast[];
  totals: {
    next6h: number;
    next12h: number;
    next24h: number;
  };
  fetchedAt: Date;
}

// ========== CONFIG ==========
const CENTER: [number, number] = [40.758, -73.985]; // Midtown

// NYC bounding box (for plow data query - covers all 5 boroughs)
const NYC_BBOX = {
  south: 40.49,
  west: -74.26,
  north: 40.92,
  east: -73.70,
};
const ZOOM = 14;

// ========== CLASSIFICATION RULES ==========
// Yellow (Prime) - narrow, alleys, dead-ends, mews
const PRIME_PATTERNS = [
  'ALLEY', 'MEWS', 'PLACE', 'SLIP', 'COURT', 'ROW', 'LANE', 'WAY',
  // West Village gems
  'GAY STREET', 'COMMERCE STREET', 'WEEHAWKEN STREET', 'JONES STREET',
  'CORNELIA STREET', 'MINETTA', 'PATCHIN PLACE', 'MILLIGAN PLACE',
  'WASHINGTON MEWS', 'MACDOUGAL ALLEY', 'GROVE COURT',
  // East Village / LES
  'STUYVESANT STREET', 'EXTRA PLACE', 'GREAT JONES ALLEY', 'SHINBONE ALLEY',
  'FREEMAN ALLEY', 'RIVINGTON',
  // Tribeca / SoHo
  'STAPLE STREET', 'CORTLANDT ALLEY', 'COLLISTER STREET', 'LAIGHT STREET',
  'HUBERT STREET', 'BEACH STREET', 'ERICSSON PLACE', 'HARRISON STREET',
  'VESTRY STREET', 'DESBROSSES STREET', 'WATTS STREET',
  // Midtown hidden
  'SHUBERT ALLEY', 'POMANDER WALK',
  // UWS / UES
  'HENDERSON PLACE',
];

// Red (Avoid) - bus routes, major arteries, always plowed first
const AVOID_PATTERNS = [
  // Major Avenues
  'BROADWAY', 'AVENUE OF THE AMERICAS', '6TH AVENUE', '7TH AVENUE',
  'VARICK STREET', 'WEST STREET', 'WEST END AVENUE',
  '1ST AVENUE', '2ND AVENUE', '3RD AVENUE', 'LEXINGTON AVENUE',
  'PARK AVENUE', 'MADISON AVENUE', '5TH AVENUE', '8TH AVENUE',
  '9TH AVENUE', '10TH AVENUE', '11TH AVENUE', '12TH AVENUE',
  'AMSTERDAM AVENUE', 'COLUMBUS AVENUE', 'CENTRAL PARK WEST',
  'AVENUE A', 'AVENUE B', 'AVENUE C', 'AVENUE D',
  'BOWERY', 'LAFAYETTE STREET', 'CENTRE STREET', 'ALLEN STREET',
  'ESSEX STREET', 'ELDRIDGE STREET', 'CHRYSTIE STREET',
  'FDR DRIVE', 'HENRY HUDSON',
  // Major Cross Streets
  '14TH STREET', '23RD STREET', '34TH STREET', '42ND STREET',
  '57TH STREET', '72ND STREET', '79TH STREET', '86TH STREET',
  '96TH STREET', '110TH STREET', '125TH STREET',
  'CANAL STREET', 'CHAMBERS STREET', 'HOUSTON STREET',
  'DELANCEY STREET', 'GRAND STREET', 'WORTH STREET',
  // Downtown arteries
  'CHURCH STREET', 'GREENWICH STREET', 'TRINITY PLACE',
  'WATER STREET', 'SOUTH STREET', 'FULTON STREET', 'WALL STREET',
];

// Ski trail rating colors
const COLORS = {
  prime: '#22C55E',   // Green circle - best for skiing
  good: '#3B82F6',    // Blue square - intermediate
  avoid: '#1a1a1a',   // Double black diamond - avoid
};

const PRIORITY_LABELS = {
  prime: 'Beginner',
  good: 'Intermediate',
  avoid: 'Expert Only',
};

// ========== HELPERS ==========
function classify(name: string): 'prime' | 'good' | 'avoid' {
  const n = (name || '').toUpperCase();

  // Check avoid first (bus routes, major arteries)
  if (AVOID_PATTERNS.some(p => n.includes(p) || n === p)) return 'avoid';

  // Check prime (narrow streets, alleys, mews)
  if (PRIME_PATTERNS.some(p => n.includes(p) || n === p)) return 'prime';

  // Default to good (residential cross streets)
  return 'good';
}

// Street name aliases - different names for the same street
const STREET_ALIASES: Record<string, string> = {
  'AVENUE OF THE AMERICAS': '6 AVENUE',
  'SIXTH AVENUE': '6 AVENUE',
  'AVE OF THE AMERICAS': '6 AVENUE',
  'FASHION AVENUE': '7 AVENUE',
  'ADAM CLAYTON POWELL JR BOULEVARD': '7 AVENUE',
  'ADAM CLAYTON POWELL BOULEVARD': '7 AVENUE',
  'FREDERICK DOUGLASS BOULEVARD': '8 AVENUE',
  'CENTRAL PARK WEST': '8 AVENUE',
  'COLUMBUS AVENUE': '9 AVENUE',
  'AMSTERDAM AVENUE': '10 AVENUE',
  'WEST END AVENUE': '11 AVENUE',
  'PARK AVENUE SOUTH': 'PARK AVENUE',
  'FOURTH AVENUE': 'PARK AVENUE',
  '4 AVENUE': 'PARK AVENUE',
  'LEXINGTON AVE': 'LEXINGTON AVENUE',
  'MADISON AVE': 'MADISON AVENUE',
  'MALCOLM X BOULEVARD': 'LENOX AVENUE',
  'LENOX AVE': 'LENOX AVENUE',
  'ST NICHOLAS AVENUE': 'SAINT NICHOLAS AVENUE',
  'SAINT MARKS PLACE': 'SAINT MARKS PLACE',
  'ST MARKS PLACE': 'SAINT MARKS PLACE',
};

// Normalize street names for matching between OSM and NYC data
// "W 4 ST" → "WEST 4 STREET", "West 4th Street" → "WEST 4 STREET"
function normalizeStreetName(name: string): string {
  let n = (name || '').toUpperCase().trim();

  // Remove directional suffixes that indicate different parts of same street
  // "7th Avenue South" → "7th Avenue"
  n = n.replace(/\s+(SOUTH|NORTH|EAST|WEST)$/g, '');

  // Expand directional abbreviations at START of name
  n = n.replace(/^N\b\.?\s*/g, 'NORTH ');
  n = n.replace(/^S\b\.?\s*/g, 'SOUTH ');
  n = n.replace(/^E\b\.?\s*/g, 'EAST ');
  n = n.replace(/^W\b\.?\s*/g, 'WEST ');

  // Convert spelled-out numbers to digits (FIRST → 1, SECOND → 2, etc.)
  const numberWords: Record<string, string> = {
    'FIRST': '1', 'SECOND': '2', 'THIRD': '3', 'FOURTH': '4', 'FIFTH': '5',
    'SIXTH': '6', 'SEVENTH': '7', 'EIGHTH': '8', 'NINTH': '9', 'TENTH': '10',
    'ELEVENTH': '11', 'TWELFTH': '12', 'THIRTEENTH': '13', 'FOURTEENTH': '14',
    'FIFTEENTH': '15', 'SIXTEENTH': '16', 'SEVENTEENTH': '17', 'EIGHTEENTH': '18',
    'NINETEENTH': '19', 'TWENTIETH': '20',
  };
  Object.entries(numberWords).forEach(([word, digit]) => {
    n = n.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  // Expand street type abbreviations
  n = n.replace(/\bST\b\.?/g, 'STREET');
  n = n.replace(/\bAVE?\b\.?/g, 'AVENUE');
  n = n.replace(/\bBLVD\b\.?/g, 'BOULEVARD');
  n = n.replace(/\bPL\b\.?/g, 'PLACE');
  n = n.replace(/\bDR\b\.?/g, 'DRIVE');
  n = n.replace(/\bRD\b\.?/g, 'ROAD');
  n = n.replace(/\bCT\b\.?/g, 'COURT');
  n = n.replace(/\bLN\b\.?/g, 'LANE');
  n = n.replace(/\bPKWY\b\.?/g, 'PARKWAY');
  n = n.replace(/\bSQ\b\.?/g, 'SQUARE');

  // Strip ordinal suffixes: 4TH → 4, 1ST → 1, 2ND → 2, 3RD → 3
  n = n.replace(/(\d+)(ST|ND|RD|TH)\b/g, '$1');

  // Remove punctuation
  n = n.replace(/[.,'-]/g, '');

  // Collapse multiple spaces
  n = n.replace(/\s+/g, ' ').trim();

  // Apply aliases to merge streets with different names
  if (STREET_ALIASES[n]) {
    n = STREET_ALIASES[n];
  }

  return n;
}

function getHoursSincePlow(timestamp: string | null): number {
  if (!timestamp) return Infinity;
  return (Date.now() - new Date(timestamp).getTime()) / 3600000;
}

function formatPlowTime(hours: number): string {
  if (hours === Infinity) return 'No plow data';
  if (hours < 1) return `Plowed ${Math.round(hours * 60)}m ago`;
  if (hours < 24) return `Plowed ${Math.round(hours)}h ago`;
  return `Plowed ${Math.round(hours / 24)}d ago`;
}

// ========== MAP COMPONENT (loaded dynamically) ==========
function MapComponent() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<L.LayerGroup | null>(null);
  const stopSignLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLightLayerRef = useRef<L.LayerGroup | null>(null);
  // Street index by normalized name - allows grouping segments
  const streetIndexRef = useRef<Record<string, Street>>({});
  // Plow data: normalized street name → most recent timestamp
  const plowLookupRef = useRef<Record<string, string>>({});

  const [mapReady, setMapReady] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [streetCount, setStreetCount] = useState(0);
  const [plowMatchCount, setPlowMatchCount] = useState(0);
  const [stopSignCount, setStopSignCount] = useState(0);
  const [trafficLightCount, setTrafficLightCount] = useState(0);
  const [showStopSigns, setShowStopSigns] = useState(false);
  const [showTrafficLights, setShowTrafficLights] = useState(false);
  const [trafficLoaded, setTrafficLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sweetSpotMode, setSweetSpotMode] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<{
    street: Street;
    position: { x: number; y: number };
  } | null>(null);
  const [debugMode] = useState(false); // Set to true for debugging
  const justClickedStreetRef = useRef(false); // Prevents map click from closing popup immediately

  // Snow forecast state
  const [snowForecast, setSnowForecast] = useState<SnowForecast | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastHours, setForecastHours] = useState<6 | 12 | 24>(24);

  // Register service worker for tile caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/map-sw.js').then(() => {
        if (debugMode) console.log('[Maps] Service worker registered');
      }).catch((err) => {
        console.warn('[Maps] Service worker registration failed:', err);
      });
    }
  }, [debugMode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = require('leaflet');

    // Use Canvas renderer for MUCH faster rendering of 100K+ polylines
    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: ZOOM,
      zoomControl: false,
      attributionControl: false,
      renderer: L.canvas({ padding: 0.5 }),
      preferCanvas: true,
    });

    // Dark satellite tiles
    L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(map);

    // Labels overlay
    L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create layer groups
    const baseLayer = L.layerGroup().addTo(map);
    const stopSignLayer = L.layerGroup().addTo(map);
    const trafficLightLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    baseLayerRef.current = baseLayer;
    stopSignLayerRef.current = stopSignLayer;
    trafficLightLayerRef.current = trafficLightLayer;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load streets after map is initialized
  useEffect(() => {
    if (mapReady && loadingState === 'idle') {
      loadStreets();
    }
  }, [mapReady]);

  // Get line style based on priority and plow status
  const getLineStyle = useCallback((priority: 'prime' | 'good' | 'avoid', hoursSincePlow?: number) => {
    const baseWeight = priority === 'prime' ? 7 : priority === 'good' ? 5 : 4;

    // Default colors (no plow data)
    let color = priority === 'avoid' ? '#2a2a2a' : COLORS[priority];
    let weight = baseWeight;
    let opacity = 0.9;

    // If we have plow data, adjust for glow effect
    if (hoursSincePlow !== undefined && hoursSincePlow !== Infinity && priority !== 'avoid') {
      if (hoursSincePlow >= 2) {
        // Good skiing - bright green glow
        color = '#22C55E';
        weight = baseWeight + 3;
        opacity = 1;
      } else if (hoursSincePlow >= 1) {
        // Building up - blue
        color = '#3B82F6';
        weight = baseWeight + 2;
        opacity = 0.95;
      } else {
        // Just plowed - dim
        color = '#666666';
        weight = baseWeight;
        opacity = 0.6;
      }
    }

    return { color, weight, opacity };
  }, []);

  // Highlight all segments of a street
  const highlightStreet = useCallback((street: Street, highlight: boolean) => {
    const style = getLineStyle(street.priority, street.hoursSincePlow);
    street.segments.forEach(seg => {
      if (seg.line) {
        if (highlight) {
          seg.line.setStyle({
            weight: style.weight + 4,
            opacity: 1,
          });
          seg.line.bringToFront();
        } else {
          seg.line.setStyle(style);
        }
      }
    });
  }, [getLineStyle]);

  // Store all street data for viewport-based loading
  const allStreetDataRef = useRef<{ n: string; k: string; p: 'prime' | 'good' | 'avoid'; s: [number, number][][] }[]>([]);
  const loadedStreetsRef = useRef<Set<string>>(new Set());

  // Check if a segment is within bounds (with padding)
  const isInBounds = useCallback((coords: [number, number][], bounds: L.LatLngBounds) => {
    // Check if any point of the segment is in bounds
    return coords.some(([lat, lon]) => bounds.contains([lat, lon]));
  }, []);

  // Load streets that are visible in the current viewport
  const loadVisibleStreets = useCallback(() => {
    if (!mapRef.current || !baseLayerRef.current) return;

    const L = require('leaflet');
    const map = mapRef.current;
    const baseLayer = baseLayerRef.current;
    const bounds = map.getBounds().pad(0.3); // Add 30% padding

    const streets = streetIndexRef.current;
    let addedCount = 0;

    allStreetDataRef.current.forEach((streetData) => {
      // Skip if already loaded
      if (loadedStreetsRef.current.has(streetData.k)) return;

      // Check if any segment is in bounds
      const hasVisibleSegment = streetData.s.some((coords) => isInBounds(coords, bounds));
      if (!hasVisibleSegment) return;

      // Create street entry
      const street: Street = {
        name: streetData.n,
        normalizedName: streetData.k,
        priority: streetData.p,
        segments: [],
      };

      const style = getLineStyle(street.priority);

      // Add segments that are in bounds
      streetData.s.forEach((coords, idx) => {
        if (!isInBounds(coords, bounds)) return;

        const line = L.polyline(coords, {
          color: style.color,
          weight: style.weight,
          opacity: style.opacity,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true,
        });

        const segment: StreetSegment = { id: idx, coords, line };
        street.segments.push(segment);

        line.on('click', (e: L.LeafletMouseEvent) => {
          justClickedStreetRef.current = true;
          setTimeout(() => { justClickedStreetRef.current = false; }, 100);
          setSelectedStreet({
            street,
            position: { x: e.containerPoint.x, y: e.containerPoint.y },
          });
        });

        line.on('mouseover', () => highlightStreet(street, true));
        line.on('mouseout', () => highlightStreet(street, false));

        baseLayer.addLayer(line);
      });

      if (street.segments.length > 0) {
        streets[street.normalizedName] = street;
        loadedStreetsRef.current.add(streetData.k);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setStreetCount(Object.keys(streets).length);
    }
  }, [getLineStyle, highlightStreet, isInBounds]);

  // Load street data file (fast - just fetches JSON)
  const loadStreets = useCallback(async () => {
    if (!mapRef.current || !baseLayerRef.current) return;

    setLoadingState('loading-streets');
    setError(null);

    try {
      const res = await fetch('/data/nyc-streets.json');
      if (!res.ok) throw new Error('Failed to load street data');

      const data = await res.json();

      // Store all data for viewport-based loading
      allStreetDataRef.current = data.streets;
      streetIndexRef.current = {};
      loadedStreetsRef.current = new Set();

      // Load streets in current viewport
      loadVisibleStreets();

      setLoadingState('ready');

      if (debugMode) {
        console.log(`[Maps] Loaded data for ${data.streets.length} streets, rendering visible ones`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streets');
      setLoadingState('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugMode]);

  // Load more streets/traffic when user pans/zooms
  useEffect(() => {
    const map = mapRef.current;
    if (!map || loadingState !== 'ready') return;

    const handleMoveEnd = () => {
      loadVisibleStreets();
      // Also update traffic control if enabled
      if (showStopSigns) renderVisibleStopSigns();
      if (showTrafficLights) renderVisibleTrafficLights();
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState, showStopSigns, showTrafficLights]);

  // Store all traffic data for viewport-based loading
  const allStopSignsRef = useRef<[number, number][]>([]);
  const allTrafficLightsRef = useRef<[number, number][]>([]);
  const loadedStopSignsRef = useRef<Set<string>>(new Set());
  const loadedTrafficLightsRef = useRef<Set<string>>(new Set());

  // Load traffic data file (just stores in refs, doesn't render)
  const loadTrafficData = useCallback(async () => {
    if (allStopSignsRef.current.length > 0) return; // Already loaded

    try {
      const res = await fetch('/data/nyc-traffic.json');
      if (!res.ok) throw new Error('Failed to load traffic data');
      const data = await res.json();
      allStopSignsRef.current = data.stopSigns;
      allTrafficLightsRef.current = data.trafficLights;
    } catch (err) {
      console.error('Failed to load traffic data:', err);
    }
  }, []);

  // Render stop signs in current viewport
  const renderVisibleStopSigns = useCallback(() => {
    if (!mapRef.current || !stopSignLayerRef.current) return;
    const L = require('leaflet');
    const map = mapRef.current;
    const layer = stopSignLayerRef.current;
    const bounds = map.getBounds();

    const stopSignIcon = L.divIcon({
      className: 'stop-sign-icon',
      html: '<div style="width:8px;height:8px;background:#DC2626;border-radius:1px;border:1px solid #fff;transform:rotate(22.5deg);"></div>',
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });

    let count = 0;
    allStopSignsRef.current.forEach((point) => {
      const key = `${point[0]},${point[1]}`;
      if (loadedStopSignsRef.current.has(key)) return;
      if (!bounds.contains(point)) return;

      const marker = L.marker(point, { icon: stopSignIcon });
      layer.addLayer(marker);
      loadedStopSignsRef.current.add(key);
      count++;
    });

    if (count > 0) setStopSignCount(loadedStopSignsRef.current.size);
  }, []);

  // Render traffic lights in current viewport
  const renderVisibleTrafficLights = useCallback(() => {
    if (!mapRef.current || !trafficLightLayerRef.current) return;
    const L = require('leaflet');
    const map = mapRef.current;
    const layer = trafficLightLayerRef.current;
    const bounds = map.getBounds();

    const trafficLightIcon = L.divIcon({
      className: 'traffic-light-icon',
      html: '<div style="width:6px;height:6px;background:#FBBF24;border-radius:50%;border:1px solid #fff;box-shadow:0 0 4px #FBBF24;"></div>',
      iconSize: [6, 6],
      iconAnchor: [3, 3],
    });

    let count = 0;
    allTrafficLightsRef.current.forEach((point) => {
      const key = `${point[0]},${point[1]}`;
      if (loadedTrafficLightsRef.current.has(key)) return;
      if (!bounds.contains(point)) return;

      const marker = L.marker(point, { icon: trafficLightIcon });
      layer.addLayer(marker);
      loadedTrafficLightsRef.current.add(key);
      count++;
    });

    if (count > 0) setTrafficLightCount(loadedTrafficLightsRef.current.size);
  }, []);

  // Legacy function for compatibility
  const loadTrafficControl = useCallback(async () => {
    await loadTrafficData();
  }, [loadTrafficData]);

  // Toggle stop signs visibility (loads data on first click, renders viewport only)
  const toggleStopSigns = useCallback(async () => {
    const map = mapRef.current;
    const layer = stopSignLayerRef.current;
    if (!map || !layer) return;

    if (!showStopSigns) {
      // Turning ON - load data if needed, then render visible ones
      if (!trafficLoaded) {
        await loadTrafficData();
        setTrafficLoaded(true);
      }
      renderVisibleStopSigns();
      map.addLayer(layer);
    } else {
      // Turning OFF
      map.removeLayer(layer);
    }

    setShowStopSigns(prev => !prev);
  }, [showStopSigns, trafficLoaded, loadTrafficData, renderVisibleStopSigns]);

  // Toggle traffic lights visibility (loads data on first click, renders viewport only)
  const toggleTrafficLights = useCallback(async () => {
    const map = mapRef.current;
    const layer = trafficLightLayerRef.current;
    if (!map || !layer) return;

    if (!showTrafficLights) {
      // Turning ON - load data if needed, then render visible ones
      if (!trafficLoaded) {
        await loadTrafficData();
        setTrafficLoaded(true);
      }
      renderVisibleTrafficLights();
      map.addLayer(layer);
    } else {
      // Turning OFF
      map.removeLayer(layer);
    }

    setShowTrafficLights(prev => !prev);
  }, [showTrafficLights, trafficLoaded, loadTrafficData, renderVisibleTrafficLights]);

  // Traffic control is loaded on-demand when user clicks buttons (not auto-loaded)

  // Apply plow status to streets (update their visual style)
  const applyPlowDataToStreets = useCallback(() => {
    const streets = streetIndexRef.current;
    const plowLookup = plowLookupRef.current;
    let matchCount = 0;
    const unmatched: string[] = [];

    Object.values(streets).forEach(street => {
      const timestamp = plowLookup[street.normalizedName];

      if (timestamp) {
        street.plowTimestamp = timestamp;
        street.hoursSincePlow = getHoursSincePlow(timestamp);
        matchCount++;
      } else {
        street.plowTimestamp = undefined;
        street.hoursSincePlow = undefined;
        if (street.priority !== 'avoid') {
          unmatched.push(street.normalizedName);
        }
      }

      // Update visual style for all segments
      const style = getLineStyle(street.priority, street.hoursSincePlow);
      street.segments.forEach(seg => {
        seg.line?.setStyle(style);
      });
    });

    setPlowMatchCount(matchCount);

    if (debugMode && unmatched.length > 0) {
      console.log(`[Maps] ${matchCount} streets matched with plow data`);
      console.log(`[Maps] ${unmatched.length} streets unmatched (sample):`, unmatched.slice(0, 20));
    }
  }, [getLineStyle, debugMode]);

  // Load plow data from NYC Open Data
  const loadPlowData = useCallback(async () => {
    setLoadingState('loading-plow');
    setError(null);

    try {
      // Step 1: Fetch plow tracking data (physical_id → timestamp)
      const plowUrl = 'https://data.cityofnewyork.us/resource/rmhc-afj9.json?$limit=100000&$order=timestamp%20DESC';
      const plowRes = await fetch(plowUrl);

      if (!plowRes.ok) throw new Error(`Plow API returned ${plowRes.status}`);

      const plowData = await plowRes.json();

      if (!plowData?.length) {
        setError('No active storm data');
        setLoadingState('ready');
        return;
      }

      // Build physical_id → timestamp map (most recent per segment)
      const physicalIdToTimestamp: Record<string, string> = {};
      plowData.forEach((r: { physical_id?: string; timestamp?: string }) => {
        if (r.physical_id && r.timestamp) {
          if (!physicalIdToTimestamp[r.physical_id] || r.timestamp > physicalIdToTimestamp[r.physical_id]) {
            physicalIdToTimestamp[r.physical_id] = r.timestamp;
          }
        }
      });

      if (debugMode) {
        console.log(`[Maps] Loaded ${Object.keys(physicalIdToTimestamp).length} plow timestamps`);
      }

      // Step 2: Fetch centerlines to get physical_id → street name mapping
      // Use NYC-wide bounding box for all 5 boroughs
      const bbox = `${NYC_BBOX.west},${NYC_BBOX.south},${NYC_BBOX.east},${NYC_BBOX.north}`;
      const centerlineUrl = `https://data.cityofnewyork.us/resource/exjm-f27b.geojson?$limit=200000&$where=within_box(the_geom,${bbox})`;

      const centerlineRes = await fetch(centerlineUrl);
      const centerlineData = await centerlineRes.json();

      // Build normalized street name → most recent timestamp
      const streetNameToTimestamp: Record<string, string> = {};

      (centerlineData.features || []).forEach((f: GeoJSON.Feature) => {
        const physId = (f.properties as { physicalid?: string })?.physicalid;
        const streetName = (f.properties as { full_stree?: string })?.full_stree || '';

        if (!physId || !streetName) return;

        const timestamp = physicalIdToTimestamp[physId];
        if (!timestamp) return;

        const normalizedName = normalizeStreetName(streetName);

        // Keep the most recent timestamp for this street
        if (!streetNameToTimestamp[normalizedName] || timestamp > streetNameToTimestamp[normalizedName]) {
          streetNameToTimestamp[normalizedName] = timestamp;
        }
      });

      plowLookupRef.current = streetNameToTimestamp;

      if (debugMode) {
        console.log(`[Maps] Built lookup for ${Object.keys(streetNameToTimestamp).length} unique street names`);
      }

      // Step 3: Apply plow data to our OSM streets
      applyPlowDataToStreets();

      setLoadingState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plow data');
      setLoadingState('ready');
    }
  }, [applyPlowDataToStreets, debugMode]);

  // Toggle sweet spot mode - highlight only skiable streets
  const toggleSweetSpot = useCallback(() => {
    setSweetSpotMode(prev => {
      const newMode = !prev;
      const streets = streetIndexRef.current;

      Object.values(streets).forEach(street => {
        const hours = street.hoursSincePlow;
        const isSkiable = hours !== undefined && hours >= 2 && street.priority !== 'avoid';

        street.segments.forEach(seg => {
          if (newMode) {
            // Sweet spot mode: highlight skiable, dim everything else
            if (isSkiable) {
              seg.line?.setStyle({
                color: '#22C55E',
                weight: 12,
                opacity: 1,
              });
              seg.line?.bringToFront();
            } else {
              seg.line?.setStyle({
                opacity: 0.15,
                weight: 3,
              });
            }
          } else {
            // Normal mode: restore original styling
            const style = getLineStyle(street.priority, street.hoursSincePlow);
            seg.line?.setStyle(style);
          }
        });
      });

      return newMode;
    });
  }, [getLineStyle]);

  // Fetch snow forecast from Open-Meteo API
  const fetchSnowForecast = useCallback(async () => {
    setForecastLoading(true);
    try {
      // Open-Meteo API - uses NOAA HRRR model for US (same data as NWS)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${CENTER[0]}&longitude=${CENTER[1]}&hourly=temperature_2m,snowfall,snow_depth,precipitation,precipitation_probability,weather_code&current=temperature_2m,snowfall,snow_depth,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=America/New_York&forecast_days=2`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch forecast');

      const data = await res.json();

      // Parse hourly data
      const hourly: HourlyForecast[] = data.hourly.time.map((time: string, i: number) => ({
        time,
        temp: data.hourly.temperature_2m[i],
        snowfall: data.hourly.snowfall[i] || 0,
        precipitation: data.hourly.precipitation[i] || 0,
        probability: data.hourly.precipitation_probability[i] || 0,
        weatherCode: data.hourly.weather_code[i],
      }));

      // Find current hour index
      const now = new Date();
      const currentHourIndex = hourly.findIndex(h => {
        const forecastTime = new Date(h.time);
        return forecastTime.getHours() === now.getHours() &&
               forecastTime.getDate() === now.getDate();
      });

      // Calculate totals for next 6, 12, 24 hours
      const startIdx = Math.max(0, currentHourIndex);
      const next6h = hourly.slice(startIdx, startIdx + 6).reduce((sum, h) => sum + h.snowfall, 0);
      const next12h = hourly.slice(startIdx, startIdx + 12).reduce((sum, h) => sum + h.snowfall, 0);
      const next24h = hourly.slice(startIdx, startIdx + 24).reduce((sum, h) => sum + h.snowfall, 0);

      // Snow weather codes: 71, 73, 75, 77, 85, 86
      const snowCodes = [71, 73, 75, 77, 85, 86];
      const isSnowing = data.current?.weather_code ? snowCodes.includes(data.current.weather_code) : false;

      const forecast: SnowForecast = {
        current: {
          temp: data.current?.temperature_2m || hourly[startIdx]?.temp || 32,
          snowDepth: (data.current?.snow_depth || 0) * 39.37, // meters to inches
          isSnowing,
        },
        hourly: hourly.slice(startIdx, startIdx + 24), // Next 24 hours from now
        totals: {
          next6h: Math.round(next6h * 100) / 100,
          next12h: Math.round(next12h * 100) / 100,
          next24h: Math.round(next24h * 100) / 100,
        },
        fetchedAt: new Date(),
      };

      setSnowForecast(forecast);
      setShowForecast(true);

      if (debugMode) {
        console.log('[Maps] Snow forecast loaded:', forecast);
      }
    } catch (err) {
      console.error('Failed to fetch snow forecast:', err);
      setError('Failed to load forecast');
    } finally {
      setForecastLoading(false);
    }
  }, [debugMode]);

  // Close popup when clicking map (but not when clicking a street)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = () => {
      // Ignore if we just clicked on a street
      if (justClickedStreetRef.current) return;
      setSelectedStreet(null);
    };
    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

      {/* Loading overlay */}
      {(loadingState === 'loading-streets' || loadingState === 'loading-plow') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#4ADE80',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{
            marginTop: 16,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontWeight: 500,
          }}>
            {loadingState === 'loading-streets' ? 'Loading NYC streets...' : 'Loading plow data...'}
          </p>
        </div>
      )}

      {/* Legend + Controls - Bottom, full width on mobile */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        padding: '8px 12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}>
        {/* Snow Forecast Chart - same container so width matches */}
        {showForecast && snowForecast && (
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                  {snowForecast.totals.next24h.toFixed(1)}"
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                  24h
                </span>
              </div>
            </div>

            {/* Chart */}
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Y-axis */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 80,
              }}>
                {[4, 3, 2, 1, 0].map((inch) => (
                  <span key={inch} style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 9,
                    lineHeight: 1,
                    textAlign: 'right',
                    width: 12,
                  }}>
                    {inch}
                  </span>
                ))}
              </div>

              {/* Bars + X-axis */}
              <div style={{ flex: 1 }}>
                {/* Bars */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: 80,
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  paddingLeft: 2,
                }}>
                  {snowForecast.hourly.slice(0, 24).map((hour, i) => {
                    const maxInches = 4;
                    const heightPercent = Math.min((hour.snowfall / maxInches) * 100, 100);
                    const hasSnow = hour.snowfall > 0;

                    return (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: hasSnow ? `${Math.max(heightPercent, 5)}%` : 2,
                          background: hasSnow
                            ? hour.snowfall > 1 ? '#22C55E' : hour.snowfall > 0.3 ? '#60A5FA' : 'rgba(255,255,255,0.5)'
                            : 'rgba(255,255,255,0.15)',
                          borderRadius: 1,
                        }}
                      />
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  paddingLeft: 2,
                }}>
                  {[0, 6, 12, 18, 23].map((idx) => {
                    const hour = snowForecast.hourly[idx];
                    if (!hour) return null;
                    const time = new Date(hour.time);
                    const h = time.getHours();
                    const label = h === 0 ? '12a' : h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`;

                    return (
                      <span key={idx} style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 9,
                      }}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Legend */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Difficulty Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="8" fill="#22C55E" />
              </svg>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>Beginner</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <rect x="1" y="1" width="16" height="16" fill="#3B82F6" rx="2" />
              </svg>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>Intermediate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="18" viewBox="0 0 20 18">
                <path d="M5 9L9 2L13 9L9 16Z" fill="#1a1a1a" stroke="#fff" strokeWidth="1" />
                <path d="M7 9L11 2L15 9L11 16Z" fill="#1a1a1a" stroke="#fff" strokeWidth="1" />
              </svg>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>Expert</span>
            </div>
          </div>

          {/* Plow Status Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 20,
                height: 10,
                borderRadius: 5,
                background: '#22C55E',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
              }} />
              <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 500 }}>2+ hrs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 20,
                height: 10,
                borderRadius: 5,
                background: '#3B82F6',
              }} />
              <span style={{ color: '#60a5fa', fontSize: 11, fontWeight: 500 }}>1-2 hrs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 20,
                height: 10,
                borderRadius: 5,
                background: '#333',
                border: '1px solid rgba(255,255,255,0.2)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }}>&lt;1 hr</span>
            </div>
          </div>
        </div>

        {/* Buttons Row - Black bg, white icons, invert when active */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {/* Plow button */}
          <button
            onClick={loadPlowData}
            disabled={loadingState === 'loading-plow'}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: plowMatchCount > 0 ? '#fff' : 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: loadingState === 'loading-plow' ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loadingState === 'loading-plow' ? (
              <span style={{ color: plowMatchCount > 0 ? '#000' : '#fff', fontSize: 12 }}>...</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 16h2v2H2v-2zm18-4h2v6h-4v-2h2v-4zM6 12h8l4 4H6v-4zm0 0V8l-4 4h4zm8 0h4V8h-4v4z"
                  fill={plowMatchCount > 0 ? '#000' : '#fff'}/>
                <circle cx="7" cy="18" r="2" fill={plowMatchCount > 0 ? '#000' : '#fff'}/>
                <circle cx="15" cy="18" r="2" fill={plowMatchCount > 0 ? '#000' : '#fff'}/>
              </svg>
            )}
          </button>

          {/* Forecast button - Snowflake */}
          <button
            onClick={() => {
              if (!snowForecast) fetchSnowForecast();
              setShowForecast(!showForecast);
            }}
            disabled={forecastLoading}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: showForecast ? '#fff' : 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: forecastLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {forecastLoading ? (
              <span style={{ color: showForecast ? '#000' : '#fff', fontSize: 12 }}>...</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={showForecast ? '#000' : '#fff'}>
                <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83M12 8a4 4 0 100 8 4 4 0 000-8z" stroke={showForecast ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            )}
          </button>

          {/* Ski mode button */}
          <button
            onClick={toggleSweetSpot}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: sweetSpotMode ? '#fff' : 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={sweetSpotMode ? '#000' : '#fff'}>
              <circle cx="12" cy="4" r="2.5"/>
              <path d="M6 20l10-4M9.5 13l2.5-4 3 5-1 2M8 10l3 1"/>
              <line x1="5" y1="21" x2="19" y2="15" stroke={sweetSpotMode ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Stop signs button - Octagon with STOP */}
          <button
            onClick={toggleStopSigns}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: showStopSigns ? '#fff' : 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <polygon
                points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7"
                fill="none"
                stroke={showStopSigns ? '#000' : '#fff'}
                strokeWidth="1.5"
              />
              <text x="12" y="13.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill={showStopSigns ? '#000' : '#fff'}>STOP</text>
            </svg>
          </button>

          {/* Traffic lights button */}
          <button
            onClick={toggleTrafficLights}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: showTrafficLights ? '#fff' : 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="18" viewBox="0 0 14 22">
              <rect x="2" y="1" width="10" height="20" rx="2" fill="none" stroke={showTrafficLights ? '#000' : '#fff'} strokeWidth="1.5"/>
              <circle cx="7" cy="5" r="2" fill="none" stroke={showTrafficLights ? '#000' : '#fff'} strokeWidth="1.5"/>
              <circle cx="7" cy="11" r="2" fill="none" stroke={showTrafficLights ? '#000' : '#fff'} strokeWidth="1.5"/>
              <circle cx="7" cy="17" r="2" fill="none" stroke={showTrafficLights ? '#000' : '#fff'} strokeWidth="1.5"/>
            </svg>
          </button>

          {/* FAQ button */}
          <button
            onClick={() => setShowFaq(true)}
            style={{
              flex: 1,
              padding: '12px 10px',
              background: 'rgba(20,20,25,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFaq && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }} onClick={() => setShowFaq(false)}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,20,25,0.98), rgba(10,10,15,0.99))',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: 16,
            maxWidth: 380,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              ⛷️ NYC Street Ski Map
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 14 }}>Find the best streets to ski during NYC snowstorms using real-time plow data.</p>

              <p style={{ marginBottom: 8, color: '#fff', fontWeight: 500 }}>Trail Difficulty</p>
              <p style={{ marginBottom: 14 }}>
                <span style={{ color: '#22C55E' }}>●</span> Beginner — alleys, mews, quiet one-ways<br />
                <span style={{ color: '#3B82F6' }}>■</span> Intermediate — cross streets<br />
                <span style={{ color: '#fff' }}>◆◆</span> Expert — avenues, bus routes
              </p>

              <p style={{ marginBottom: 8, color: '#fff', fontWeight: 500 }}>Plow Status</p>
              <p style={{ marginBottom: 14 }}>
                <span style={{ color: '#22C55E' }}>2+ hrs</span> — good snow buildup<br />
                <span style={{ color: '#3B82F6' }}>1-2 hrs</span> — snow building up<br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>&lt;1 hr</span> — just plowed, avoid
              </p>

              <p style={{ marginBottom: 8, color: '#fff', fontWeight: 500 }}>Controls</p>
              <p>
                ❄️ Load real-time plow data<br />
                🌨️ Snow forecast (next 24h)<br />
                ⛷️ Highlight best skiing streets<br />
                🛑 Toggle stop signs<br />
                🚦 Toggle traffic lights
              </p>
            </div>
            <button onClick={() => setShowFaq(false)} style={{
              marginTop: 20, width: '100%', padding: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>Got it</button>
          </div>
        </div>
      )}


      {/* Street info popup - Trail sign style */}
      {selectedStreet && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(selectedStreet.position.x + 10, window.innerWidth - 240),
            top: Math.max(selectedStreet.position.y - 80, 10),
            background: 'linear-gradient(145deg, rgba(30,30,35,0.98), rgba(15,15,20,0.99))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: '14px 18px',
            zIndex: 1001,
            minWidth: 200,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Trail sign header: Symbol + Street Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}>
            {/* Ski Symbol */}
            {selectedStreet.street.priority === 'prime' && (
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#22C55E" />
              </svg>
            )}
            {selectedStreet.street.priority === 'good' && (
              <svg width="24" height="24" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" fill="#3B82F6" rx="2" />
              </svg>
            )}
            {selectedStreet.street.priority === 'avoid' && (
              <svg width="28" height="24" viewBox="0 0 28 24">
                <path d="M7 12L12 3L17 12L12 21Z" fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" />
                <path d="M11 12L16 3L21 12L16 21Z" fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" />
              </svg>
            )}
            <h3 style={{
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}>
              {selectedStreet.street.name}
            </h3>
          </div>

          {/* Plow status */}
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            fontWeight: 500,
          }}>
            {formatPlowTime(selectedStreet.street.hoursSincePlow ?? Infinity)}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function MapsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render map on server
  if (!mounted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#4ADE80',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      overflow: 'hidden',
    }}>
      <MapComponent />
    </div>
  );
}
