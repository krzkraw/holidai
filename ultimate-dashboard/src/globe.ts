import { BookingJson, formatStayPrice, getStayForDays } from './data/bookings';
import { DESTINATION_PROFILES, DestinationKey } from './model';

export type GlobeMarkerMode = 'dot' | 'pin' | 'price';

export type GlobeMarker = {
  id: string;
  destination: DestinationKey;
  name: string;
  tier: string;
  latitude: number;
  longitude: number;
  priceText: string;
  accent: string;
};

export type GlobeMarkerQuery = {
  destination: DestinationKey;
  selectedVariant: string;
  selectedStayDays: number | string;
};

export type UnitVector3 = {
  x: number;
  y: number;
  z: number;
};

export type SphericalFocus = {
  latitude: number;
  longitude: number;
  yaw: number;
  pitch: number;
  startDistance: number;
  targetDistance: number;
};

export type MarkerPresentation = {
  mode: GlobeMarkerMode;
  scale: number;
};

type CoordinateLike = {
  latitude: number;
  longitude: number;
};

const DEFAULT_FOCUS = {
  latitude: 36,
  longitude: 24,
} as const;

export function getHotelGlobeMarkers(
  bookings: readonly BookingJson[],
  query: GlobeMarkerQuery,
): readonly GlobeMarker[] {
  const markers: GlobeMarker[] = [];
  const accent = DESTINATION_PROFILES[query.destination].accent;

  for (const booking of bookings) {
    if (booking.destination !== query.destination || booking.tier !== query.selectedVariant) {
      continue;
    }

    const coordinates = booking.details.coordinates;

    if (!coordinates || !isFiniteCoordinate(coordinates.latitude) || !isFiniteCoordinate(coordinates.longitude)) {
      continue;
    }

    markers.push({
      id: `${booking.destination}:${booking.tier}:${booking.name}`,
      destination: booking.destination,
      name: booking.name,
      tier: booking.tier,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      priceText: formatStayPrice(getStayForDays(booking, query.selectedStayDays)),
      accent,
    });
  }

  return markers;
}

export function latLonToUnitVector(latitude: number, longitude: number): UnitVector3 {
  const lat = degreesToRadians(latitude);
  const lon = degreesToRadians(longitude);
  const cosLat = Math.cos(lat);

  return {
    x: roundZero(cosLat * Math.sin(lon)),
    y: roundZero(Math.sin(lat)),
    z: roundZero(cosLat * Math.cos(lon)),
  };
}

export function getSphericalFocus(coordinates: readonly CoordinateLike[]): SphericalFocus {
  if (coordinates.length === 0) {
    return createFocus(DEFAULT_FOCUS.latitude, DEFAULT_FOCUS.longitude, 3.1);
  }

  const average = coordinates.reduce(
    (sum, coordinate) => {
      const vector = latLonToUnitVector(coordinate.latitude, coordinate.longitude);
      return {
        x: sum.x + vector.x,
        y: sum.y + vector.y,
        z: sum.z + vector.z,
      };
    },
    { x: 0, y: 0, z: 0 },
  );
  const normalized = normalizeVector(average);
  const latitude = radiansToDegrees(Math.asin(normalized.y));
  const longitude = radiansToDegrees(Math.atan2(normalized.x, normalized.z));
  const latitudeSpan = getLinearSpan(coordinates.map((coordinate) => coordinate.latitude));
  const longitudeSpan = getLinearSpan(coordinates.map((coordinate) => coordinate.longitude));
  const span = Math.max(latitudeSpan, longitudeSpan);
  const targetDistance = clamp(1.82 + span * 0.045, 1.88, 3.15);

  return createFocus(latitude, longitude, targetDistance);
}

export function getMarkerPresentation(screenSpace: number): MarkerPresentation {
  const safeScreenSpace = Number.isFinite(screenSpace) ? screenSpace : 0;

  if (safeScreenSpace < 42) {
    return {
      mode: 'dot',
      scale: clamp(0.48 + safeScreenSpace / 115, 0.5, 0.78),
    };
  }

  if (safeScreenSpace < 104) {
    return {
      mode: 'pin',
      scale: clamp(0.72 + safeScreenSpace / 180, 0.82, 1.18),
    };
  }

  return {
    mode: 'price',
    scale: clamp(0.92 + safeScreenSpace / 260, 1.05, 1.5),
  };
}

function createFocus(latitude: number, longitude: number, targetDistance: number): SphericalFocus {
  const vector = latLonToUnitVector(latitude, longitude);

  return {
    latitude,
    longitude,
    yaw: Math.atan2(vector.x, vector.z),
    pitch: Math.asin(vector.y),
    startDistance: 5.8,
    targetDistance,
  };
}

function getLinearSpan(values: readonly number[]): number {
  if (values.length < 2) {
    return 0;
  }

  return Math.max(...values) - Math.min(...values);
}

function normalizeVector(vector: UnitVector3): UnitVector3 {
  const length = Math.hypot(vector.x, vector.y, vector.z);

  if (length === 0) {
    return latLonToUnitVector(DEFAULT_FOCUS.latitude, DEFAULT_FOCUS.longitude);
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value);
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundZero(value: number): number {
  return Math.abs(value) < 1e-12 ? 0 : value;
}
