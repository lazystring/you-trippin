import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip, getTripName, createTrip } from './trip';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LngLat } from 'mapbox-gl';

/**
 * Service responsible for reading JSON data to retrieve coordinates to render
 * in the map.
 */
@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private http: HttpClient) { }

  /** Returns a list of all trip names stored in /data/trips. */
  list(): Observable<string[]> {
    return this.http.get<string[]>('/data/trips/index.json')
      .pipe(map(names => names.map(getTripName)));
  }

  /** Retrieves a trip by its name. */
  get(tripName: string): Observable<Trip> {
    return this.http.get<LngLat[]>(`/data/trips/${tripName}.json`)
      .pipe(map(locationSamples => createTrip(tripName, locationSamples)));
  }
}
