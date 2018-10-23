import { Injectable } from '@angular/core';
import { observable, action, computed } from 'mobx';
import { Trip, TripSpeedSample } from '../trip';

/**
 * Store for shared data used in rendering routes and other features of the
 * map.
 */
@Injectable()
export class TripMapStore {
  @observable selectedTrip?: Trip;
  @observable hoverSpeedSample?: TripSpeedSample;

  @action setSelectedTrip(trip: Trip) {
    this.selectedTrip = trip;
  }

  @action setHoverSpeedSample(sample: TripSpeedSample | undefined) {
    this.hoverSpeedSample = sample;
  }

  @computed get formattedCurrentSpeed(): number {
    if (!this.hoverSpeedSample) return 0;
    return Math.round(this.hoverSpeedSample.speedMph);
  }
}
