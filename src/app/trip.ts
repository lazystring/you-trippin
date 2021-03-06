import * as geolib from 'geolib';
import { LngLat } from 'mapbox-gl';

/** An attempt to classify speeds to help with visualization. */
export enum SpeedClass {
  IDLE = 'IDLE',               // 0 MPH
  SLOW = 'SLOW',               // 0 - 25 MPH
  RESIDENTIAL = 'RESIDENTIAL', // 25 - 35 MPH
  MODERATE = 'MODERATE',       // 35 - 55 MPH
  HIGHWAY = 'HIGHWAY',         // 55 - 70 MPH
  FAST = 'FAST',               // 70 - 90 MPH
  EXTREME = 'EXTREME',         // 90+ MPH
}

/** Represents a speed sample computed from two sampled coordinate points. */
export interface TripSpeedSample {
  speedMph: number;
  class: SpeedClass;

  // Location at which the speed was sampled.
  location: LngLat;

  // Distance over which the speed was sampled.
  distanceMeters: number;
}

/** The bounding coordinate window of a trip. */
export interface TripCoordinateBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Data (extracted and computed from location samples) pertaining to a trip. */
export interface Trip {
  // Trip name corresponds to the JSON file name.
  name: string;

  // A list of coordinates sampled once per second from the trip.
  locationSamples: LngLat[];

  startLocation?: LngLat;
  endLocation?: LngLat;

  tripBounds?: TripCoordinateBounds;

  speedSamples: TripSpeedSample[];
  averageSpeed: number;
  totalTimeIdleSeconds: number;

  totalTimeSeconds: number;
  totalDistanceMeters: number;
}

/**
 *  Determines which speed sample in an array is closest to the given location.
 */
export function getClosestSpeedSample(
  location: LngLat, candidates: TripSpeedSample[]): TripSpeedSample {
  if (!candidates.length) return undefined;
  let closest = candidates[0];
  candidates.forEach(candidate => {
    const distanceToCurrent = getDistanceMeters(location, candidate.location);
    const distanceToClosest = getDistanceMeters(location, closest.location);
    closest = distanceToCurrent < distanceToClosest ? candidate : closest;
  });

  return closest;
}

/** Computes the distance (in meters) between two sampled locations. */
export function getDistanceMeters(a: LngLat, b: LngLat) {
  return geolib.getDistance(
    { latitude: a.lat, longitude: a.lng },
    { latitude: b.lat, longitude: b.lng });
}

function getSpeedMilesPerHour(speedMetersPerSecond: number): number {
  return geolib.convertUnit('mi', speedMetersPerSecond) * 3600;
}

function getSpeedClass(speedMph): SpeedClass {
  if (speedMph === 0) return SpeedClass.IDLE;
  if (speedMph > 0 && speedMph <= 25) return SpeedClass.SLOW;
  if (speedMph > 25 && speedMph <= 35) return SpeedClass.RESIDENTIAL;
  if (speedMph > 35 && speedMph <= 55) return SpeedClass.MODERATE;
  if (speedMph > 55 && speedMph <= 70) return SpeedClass.HIGHWAY;
  if (speedMph > 70 && speedMph <= 90) return SpeedClass.FAST;

  return SpeedClass.EXTREME;
}

function getTripSpeedSamples(locationSamples: LngLat[]): TripSpeedSample[] {
  // We need at least two points to calculate the distance/speed.
  if (locationSamples.length < 2) return [];

  const speedSamples: TripSpeedSample[] = [];
  for (let i = 1; i < locationSamples.length; i++) {
    const distanceMeters = getDistanceMeters(
      locationSamples[i - 1], locationSamples[i]);
    // Sampled at 1 Hz.
    const speedMph = getSpeedMilesPerHour(distanceMeters);
    speedSamples.push({
      speedMph,
      class: getSpeedClass(speedMph),
      location: locationSamples[i],
      distanceMeters,
    });
  }

  return speedSamples;
}

function getAverageSpeed(speedSamples: TripSpeedSample[]) {
  if (!speedSamples.length) return 0;
  const speedSum = speedSamples.reduce(
    (accum, sample) => accum + sample.speedMph, 0);

  return speedSum / speedSamples.length;
}

function getTotalTimeIdleSeconds(speedSamples: TripSpeedSample[]) {
  return speedSamples.filter(sample => sample.class === SpeedClass.IDLE).length;
}

export function getTripName(fileName: string) {
  return fileName.replace('.json', '');
}

function getTripBounds(locationSamples: LngLat[]):
  TripCoordinateBounds | undefined {
  if (!locationSamples.length) return undefined;

  return {
    west: Math.min(...locationSamples.map(sample => sample.lng)),
    south: Math.min(...locationSamples.map(sample => sample.lat)),
    east: Math.max(...locationSamples.map(sample => sample.lng)),
    north: Math.max(...locationSamples.map(sample => sample.lat)),
  };
}

/** Creates a Trip, deriving all stats from the given set of coordinates. */
export function createTrip(tripName: string, locationSamples: LngLat[]): Trip {
  const speedSamples = getTripSpeedSamples(locationSamples);
  const totalDistance = speedSamples.reduce(
    (accum, sample) => accum + sample.distanceMeters, 0);

  return {
    name: tripName,
    locationSamples,
    startLocation: locationSamples.length ? locationSamples[0] : undefined,
    endLocation:
      locationSamples.length ? locationSamples[locationSamples.length - 1]
        : undefined,
    tripBounds: getTripBounds(locationSamples),
    speedSamples: speedSamples,
    averageSpeed: getAverageSpeed(speedSamples),
    totalTimeIdleSeconds: getTotalTimeIdleSeconds(speedSamples),
    totalTimeSeconds: speedSamples.length,
    totalDistanceMeters: totalDistance,
  };
}
