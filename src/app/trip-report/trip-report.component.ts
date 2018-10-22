import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TripReportStore } from '../stores/trip-report.store';
import * as c3 from 'c3';
import { autorun, computed } from 'mobx';
import { TripMapStore } from '../stores/trip-map.store';
import * as geolib from 'geolib';

@Component({
  selector: 'app-trip-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-report.component.html',
  styleUrls: ['./trip-report.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ],
})
export class TripReportComponent implements OnInit {
  private chart?: c3.ChartAPI;

  @ViewChild('reportCard') reportRef: ElementRef;

  constructor(
    private reportStore: TripReportStore, private mapStore: TripMapStore, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    autorun(() => this.renderTripData());
    autorun(() => setTimeout(this.onSelectedTripChange(), 1000));
  }

  renderTripData() {
    if (!this.reportStore.tripToReport) return;

    // Render the data after the slide-in animation has completed.
    setTimeout(() => {
      this.chart = c3.generate({
        bindto: '#chart',
        data: {
          x: 'x',
          columns: this.getTripDataColumns(),
        },
        axis: {
          x: {
            tick: {
              format: timeMinutes => `${timeMinutes} MIN`,
            }
          }
        }
      });

      this.changeDetector.detectChanges();
      this.onWindowResize();
    }, 300);
  }

  getTripDataColumns(): (string | number)[][] {
    if (!this.reportStore.tripToReport) return [[], []];
    const trip = this.reportStore.tripToReport;

    // Timestamps are recorded in minutes.
    const totalTimeMinutes = Math.floor(trip.totalTimeSeconds / 60);
    const timeAxis = [
      'x',
      ...Array.from(Array(totalTimeMinutes).keys()).map(x => x + 1)];

    const speedAxis =
      ['Speed (MPH)', ...trip.speedSamples.map(sample => sample.speedMph)];

    return [timeAxis, speedAxis];
  }

  onSelectedTripChange() {
    if (!this.reportStore.tripToReport) return;

    // Check if we're still looking at the same trip that we're reporting.
    const selectedTrip = this.mapStore.selectedTrip;
    const reportTrip = this.reportStore.tripToReport;
    if (!this.mapStore.selectedTrip || selectedTrip.name !== reportTrip.name) {
      this.reportStore.setTripToReport(undefined);
    }
  }

  onWindowResize() {
    if (!this.reportRef) return;
    this.adjustChartHeight(this.reportRef.nativeElement.offsetHeight);
  }

  adjustChartHeight(reportCardHeightPx: number) {
    this.chart.resize({ height: reportCardHeightPx - 100 });
  }

  @computed get formattedDistanceMiles() {
    const distanceMiles =
      geolib.convertUnit('mi', this.mapStore.selectedTrip.totalDistanceMeters);
    return `${distanceMiles.toFixed(2)} mile`;
  }
}
