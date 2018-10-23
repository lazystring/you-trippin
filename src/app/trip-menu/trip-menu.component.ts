import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Trip } from '../trip';
import { TripMapStore } from '../stores/trip-map.store';
import { TripMenuStore } from '../stores/trip-menu.store';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-trip-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-menu.component.html',
  styleUrls: ['./trip-menu.component.css']
})
export class TripMenuComponent implements OnInit {
  private tripNames: string[];

  constructor(
    private tripService: TripService,
    private mapStore: TripMapStore,
    private menuStore: TripMenuStore) { }

  ngOnInit() {
    this.tripService.list().subscribe(
      data => this.menuStore.setTripNames(data));
  }

  onSelectTrip(tripName: string) {
    this.tripService.get(tripName).subscribe(
      (trip: Trip) => this.mapStore.setSelectedTrip(trip));
  }

  onSearch(tripSearchTerm: string) {
    this.menuStore.setFilter(tripSearchTerm);
  }
}
