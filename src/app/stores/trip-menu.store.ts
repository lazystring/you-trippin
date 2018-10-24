import { Injectable } from '@angular/core';
import { observable } from 'mobx';
import { computed, action } from 'mobx-angular';

/** Store for shared data pertaining to the trip menu. */
@Injectable()
export class TripMenuStore {
  @observable tripNames?: string[];
  @observable filter = '';

  /** A list of trip name results with the user's filter applied. */
  @computed get filteredTripNames(): string[] {
    return this.tripNames.filter(name => name.includes(this.filter));
  }

  @action setTripNames(tripNames: string[]) {
    this.tripNames = tripNames;
  }

  @action setFilter(filter: string) {
    this.filter = filter;
  }
}
