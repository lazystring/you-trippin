import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TripMapStore } from '../stores/trip-map.store';
import { computed } from 'mobx-angular';
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
  styleUrls: ['./trip-hud.component.css']
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

  @computed get formattedTripDuration(): string {
    return formatDurationSeconds(this.mapStore.selectedTrip.totalTimeSeconds);
  }

  onClickTripReportButton() {
    this.reportStore.setTripToReport(this.mapStore.selectedTrip);
  }
}
