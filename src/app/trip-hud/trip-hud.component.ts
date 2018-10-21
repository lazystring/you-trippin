import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UiStore } from '../stores/ui.store';
import { computed } from 'mobx-angular';

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

  constructor(private uiStore: UiStore) { }

  ngOnInit() {
  }

  @computed get formattedAverageSpeed(): number {
    return Math.round(this.uiStore.selectedTrip.averageSpeed);
  }

  @computed get formattedTotalTimeIdle() {
    return formatDurationSeconds(
      this.uiStore.selectedTrip.totalTimeIdleSeconds);
  }

  @computed get formattedTripLength(): string {
    return formatDurationSeconds(this.uiStore.selectedTrip.totalTimeSeconds);
  }
}
