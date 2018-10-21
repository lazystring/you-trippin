import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TripService } from '../trip.service';
import { UiStore } from '../stores/ui.store';
import { Trip } from '../trip';

@Component({
  selector: 'app-trip-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-menu.component.html',
  styleUrls: ['./trip-menu.component.css']
})
export class TripMenuComponent implements OnInit {
  private tripNames: string[];

  constructor(private tripService: TripService, private uiStore: UiStore) {
  }

  ngOnInit() {
    this.tripService.list().subscribe(data => this.uiStore.tripNames = data);
  }

  onSelectTrip(tripName: string) {
    this.tripService.get(tripName).subscribe(
      (trip: Trip) => this.uiStore.setSelectedTrip(trip));
  }

  onSearch(tripSearchTerm: string) {
    this.uiStore.setFilter(tripSearchTerm);
  }
}
