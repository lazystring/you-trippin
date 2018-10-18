import { Component, OnInit } from '@angular/core';
import { TripService } from '../trip.service';
import { TripLocationSample } from '../trip';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  /** Coordinate samples from the desired trip. */
  private tripSamples: TripLocationSample[];

  constructor(private tripService: TripService) { }

  ngOnInit() {
    
  }

  onClickGetTripData(tripName: string) {
    this.tripService.getTrip(tripName).subscribe(data => this.tripSamples = data);
  }

}
