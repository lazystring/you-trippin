import { Injectable } from '@angular/core';
import { observable, computed, action } from 'mobx';
import { Trip, TripSpeedSample } from '../trip';
import { LngLat } from 'mapbox-gl';

@Injectable()
export class UiStore {
  @observable.ref selectedTrip?: Trip;
  @observable tripNameResults: string[] = [];
  @observable tripNames: string[] = [];
  @observable filter = '';
  @observable hoverSpeedSample?: TripSpeedSample;

  @action setSelectedTrip(trip: Trip) {
    this.selectedTrip = trip;
  }

  @computed get filteredTripNames(): string[] {
    return this.tripNames.filter(name => name.includes(this.filter));
  }

  @action setFilter(filter: string) {
    this.filter = filter;
  }

  @action setHoverSpeedSample(sample: TripSpeedSample | undefined) {
    this.hoverSpeedSample = sample;
  }
}
