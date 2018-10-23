import { Injectable } from '@angular/core';
import { observable, action, computed } from 'mobx';
import { Trip } from '../trip';

/** Store for shared data pertaining to the trip. */
@Injectable()
export class TripReportStore {
  @observable tripToReport: Trip;

  @action setTripToReport(trip: Trip) {
    this.tripToReport = trip;
  }

  @computed get formattedDistanceMiles() {
    const distanceMiles =
      geolib.convertUnit('mi', this.tripToReport.totalDistanceMeters);
    return `${distanceMiles.toFixed(2)} mile`;
  }
}
