import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip, getTripName, createTrip } from './trip';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LngLat } from 'mapbox-gl';
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
      .pipe(map(names => names.map(getTripName)));
  }

  /** Retrieves a trip by its name. */
  get(tripName: string): Observable<Trip> {
    if (this.cachedTrips.has(tripName)) {
      return of(this.cachedTrips.get(tripName));
    }

    return this.http.get<LngLat[]>(`${TRIPS_ROUTE}/${tripName}.json`)
      .pipe(map(locationSamples => createTrip(tripName, locationSamples)),
        tap(trip => this.cachedTrips.set(tripName, trip)));
  }
}
