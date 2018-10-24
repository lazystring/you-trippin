import { createTrip, getTripName, Trip } from './trip';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LngLat } from 'mapbox-gl';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TripMapStore } from './stores/trip-map.store';

const TRIPS_ROUTE = '/data/trips';

/**
 * Service responsible for reading JSON data to retrieve coordinates to render
 * in the map.
 */
@Injectable({
  providedIn: 'root'
})
export class TripService {
  /** Cache trips as we fetchhem  tsince they are guarenteed not to change. */
  private cachedTrips = new Map<string, Trip>();

  constructor(private http: HttpClient, private uiStore: TripMapStore) { }

  /** Returns a list of all trip names stored in /data/trips. */
  list(): Observable<string[]> {
    return this.http.get<string[]>(`${TRIPS_ROUTE}/index.json`)
      .pipe(
        catchError(this.handleError([])),
        map(names => names.map(getTripName)));
  }

  /** Retrieves a trip by its name. */
  get(tripName: string): Observable<Trip> | undefined {
    if (this.cachedTrips.has(tripName)) {
      return of(this.cachedTrips.get(tripName));
    }

    return this.http.get<LngLat[]>(`${TRIPS_ROUTE}/${tripName}.json`)
      .pipe(
        catchError(this.handleError(undefined)),
        map(locationSamples => createTrip(tripName, locationSamples)),
        tap(trip => this.cachedTrips.set(tripName, trip)));
  }

  /** Logs an error and returns a default value to subscribers. */
  handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result);
    };
  }
}
