import * as c3 from 'c3';
import * as geolib from 'geolib';
import { animate, style, transition, trigger } from '@angular/animations';
import { autorun } from 'mobx';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { computed } from 'mobx-angular';

import { TripMapStore } from '../stores/trip-map.store';
import { TripReportStore } from '../stores/trip-report.store';


/** Number of samples to display on the chart. */
const NUM_SAMPLES_TO_PLOT = 100;

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
          type: 'spline',
        },
        axis: {
          x: {
            tick: {
              format:
                (timeSeconds: number) => `${(timeSeconds / 60).toFixed(2)} MIN`,
              count: 10,
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

    // Timestamps are recorded in seconds.
    const timeAxis: (string | number)[] = ['x'];
    const speedAxis: (string | number)[] = ['Speed (MPH)'];
    const frequency =
      Math.floor(trip.speedSamples.length / NUM_SAMPLES_TO_PLOT);
    for (let i = 0; i < trip.speedSamples.length; i += frequency) {
      timeAxis.push(i);
      speedAxis.push(trip.speedSamples[i].speedMph);
    }

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

  @computed get formattedDistance() {
    const distanceMiles =
      geolib.convertUnit('mi', this.mapStore.selectedTrip.totalDistanceMeters);
    return `${distanceMiles.toFixed(2)} mile`;
  }
}
