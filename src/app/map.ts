import { GeoJSONSourceRaw, LngLat, Layer, GeoJSONSource } from 'mapbox-gl';
import { Feature } from 'geojson';

/** Converts a LngLat object to an array of coords, because nobody can agree. */
export function getGeoJsonCoordinates(locationSample: LngLat): [number, number] {
  return [locationSample.lng, locationSample.lat];
}

export function createTripRouteData(tripLocationSamples: LngLat[]): Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: tripLocationSamples.map(getGeoJsonCoordinates),
    }
  };
}

/** Creates a data source for a trip route on a mapbox map. */
export function createTripRouteSource(tripLocationSamples: LngLat[]):
  GeoJSONSourceRaw {
  return {
    type: 'geojson',
    lineMetrics: true,
    data: createTripRouteData(tripLocationSamples),
  };
}

export function createTripRouteLayer(): Layer {
  return {
    id: 'route',
    type: 'line',
    source: 'route-source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-width': 8,
    }
  };
}
