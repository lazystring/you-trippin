import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Trip } from '../trip';
import { TripMapStore } from '../stores/trip-map.store';
import { TripMenuStore } from '../stores/trip-menu.store';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-trip-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-menu.component.html',
  styleUrls: ['./trip-menu.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-110%)' }),
        animate('200ms 100ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(-110%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms 200ms ease-in', style({ opacity: 1 }))
      ]),
    ])
  ],
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

  onClickBackButton() {
    this.menuStore.setFilter('');
    this.mapStore.setSelectedTrip(undefined);
  }
}
