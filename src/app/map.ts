export interface IGeometry {
  type: string;
  coordinates: number[];
}

export interface IGeoJson {
  type: string;
  geometry: IGeometry;
  properties?: any;
  $key?: string;
}

export class GeoJson implements IGeoJson {
  type = 'Feature';
  geometry: IGeometry;

  constructor(coordinates: number[], public properties?: any) {
    this.geometry = {
      type: 'Point',
      coordinates: coordinates,
    };
  }
}

export class FeatureCollection {
  type = 'FeatureCollection'

  constructor(public features: Array<GeoJson>) {}
}