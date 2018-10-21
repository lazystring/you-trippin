import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  /** Attempts to retrieve the user's current position. */
  getPosition(): Observable<Position> {
    return Observable.create(observer => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          observer.next(position);
          observer.complete();
        },
          error => observer.error(error));
      } else {
        observer.error('Browser not supported.');
      }
    });
  }
}
