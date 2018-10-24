import * as geolib from 'geolib';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { computed } from 'mobx-angular';

import { TripMapStore } from '../stores/trip-map.store';
import { TripReportStore } from '../stores/trip-report.store';

function formatDurationSeconds(duration: number): string {
  if (duration > 86400) return `${(duration / 86400).toFixed(2)} DAY`;
  if (duration > 3600) return `${(duration / 3600).toFixed(2)} HR`;
  if (duration > 60) return `${(duration / 60).toFixed(2)} MIN`;

  return `${duration.toFixed(2)} SEC`;
}

@Component({
  selector: 'app-trip-hud',
  templateUrl: './trip-hud.component.html',
  styleUrls: ['./trip-hud.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms 200ms ease-in', style({ opacity: 1 }))
      ]),
    ])
  ],
})
export class TripHudComponent implements OnInit {

  constructor(
    private mapStore: TripMapStore, private reportStore: TripReportStore) { }

  ngOnInit() {
  }

  @computed get formattedAverageSpeed(): number {
    return Math.round(this.mapStore.selectedTrip.averageSpeed);
  }

  @computed get formattedTotalTimeIdle() {
    return formatDurationSeconds(
      this.mapStore.selectedTrip.totalTimeIdleSeconds);
  }

  @computed get formattedDuration(): string {
    return formatDurationSeconds(this.mapStore.selectedTrip.totalTimeSeconds);
  }

  @computed get formattedTopSpeed(): number {
    return Math.round(
      Math.max(...this.mapStore.selectedTrip.speedSamples.map(
        sample => sample.speedMph)));
  }

  @computed get formattedDistance() {
    const distanceMiles =
      geolib.convertUnit('mi', this.mapStore.selectedTrip.totalDistanceMeters);
    return `${distanceMiles.toFixed(2)} MI`;
  }

  onClickTripReportButton() {
    this.reportStore.setTripToReport(this.mapStore.selectedTrip);
  }
}
