import { Feature } from 'geojson';
import { GeoJSONSourceRaw, Layer, LngLat } from 'mapbox-gl';

/** Converts a LngLat object to an array of coords, because nobody can agree. */
export function getGeoJsonCoordinates(locationSample: LngLat): [number, number] {
  return [locationSample.lng, locationSample.lat];
}

/** Creates a set of data to add to a mapboxgl source. */
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

/** Creates a mapboxgl layer to hold the data and styling for the trip route. */
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
