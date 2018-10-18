import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TripLocationSample } from './trip';
import { Observable } from 'rxjs';

/**
 * Service responsible for reading JSON data to retrieve coordinates to render
 * in the map.
 */
@Injectable({
    providedIn: 'root'
})
export class TripService {
  constructor(private http: HttpClient) { }

  getTrip(tripName: string): Observable<TripLocationSample[]> {
    return this.http.get(
      `/data/trips/${tripName}.json`)as Observable<TripLocationSample[]>;
  }
}
