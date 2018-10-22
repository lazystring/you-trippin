import { Injectable } from '@angular/core';
import { observable } from 'mobx';
import { computed, action } from 'mobx-angular';
import { Trip } from '../trip';

/** Store for shared data pertaining to the trip. */
@Injectable()
export class TripReportStore {
  @observable tripToReport: Trip;

  @action setTripToReport(trip: Trip) {
    this.tripToReport = trip;
  }
}
