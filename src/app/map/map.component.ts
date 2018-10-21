import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { TripService } from '../trip.service';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
import { UiStore } from '../stores/ui.store';
import { autorun, computed } from 'mobx';
import { SpeedClass, Trip, getDistanceMeters } from '../trip';
import { LocationService } from '../location.service';
import { createTripRouteLayer, createTripRouteData, createTripRouteSource } from '../map';

const DEFAULT_MAPBOX_OPTIONS: mapboxgl.MapboxOptions = {
  container: 'map',
  style: `${environment.tileserver.url}/styles/positron/style.json`,
  center: [-122.41, 37.75],
  zoom: 10,
};

// TODO: Improve gradient
const SPEED_CLASS_TO_COLOR = new Map<SpeedClass, string>([
  [SpeedClass.IDLE, '#ff0000'],
  [SpeedClass.SLOW, '#ff6600'],
  [SpeedClass.MODERATE, '#ffee00'],
  [SpeedClass.FAST, '#00ff00'],
  [SpeedClass.EXTREME, '#00ffc3'],
  [SpeedClass.INSANE, '#00cbff'],
]);

function getLineProgress(trip: Trip): (number | string)[] {
  const lineProgress = [];
  let distanceRatioAccum = 0;
  for (const sample of trip.speedSamples) {
    const sampleDistanceRatio =
      sample.distanceMeters / trip.totalDistanceMeters;
    if (!sampleDistanceRatio) continue;
    lineProgress.push(distanceRatioAccum);
    lineProgress.push(SPEED_CLASS_TO_COLOR.get(sample.class));
    distanceRatioAccum += sampleDistanceRatio;
  }

  return lineProgress;
}

@Component({
  selector: 'app-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private hoverSpeedCard: HTMLElement;
  @ViewChild('hoverSpeedCard') set hoverSpeedCardRef(ref: ElementRef | undefined) {
    if (!ref) return;
    this.hoverSpeedCard = ref.nativeElement;
  }

  private tripNames: string[];

  private map: mapboxgl.Map;

  constructor(private tripService: TripService,
    private uiStore: UiStore, private locationService: LocationService) {
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken')
      .set(environment.mapbox.accessToken);
  }

  ngOnInit() {
    this.initMap();
    autorun(() => this.updateSelectedTrip());
  }

  private initMap() {
    this.map = new mapboxgl.Map(DEFAULT_MAPBOX_OPTIONS);
    this.map.addControl(new mapboxgl.NavigationControl());
    this.locationService.getPosition().subscribe(
      position => this.flyTo(
        position.coords.latitude, position.coords.longitude));

    // Add layer for rendering trip routes.
    this.map.on('load', () => {
      this.map.addSource('route-source', createTripRouteSource([]));
      this.map.addLayer(createTripRouteLayer());
      if (this.uiStore.selectedTrip) {
        this.updateSelectedTrip();
      }
    });

    this.map.on('mousemove', 'route', (e) => {
      const speedSamples = this.uiStore.selectedTrip.speedSamples;
      let closestSpeedSample = speedSamples.length ? speedSamples[0] : undefined;
      speedSamples.forEach(sample => {
        const distanceToCurrent = getDistanceMeters(e.lngLat, sample.location);
        const distanceToClosest =
          getDistanceMeters(e.lngLat, closestSpeedSample.location);
        closestSpeedSample =
          distanceToCurrent < distanceToClosest ? sample : closestSpeedSample;
      });

      this.uiStore.setHoverSpeedSample(closestSpeedSample);
      if (!this.hoverSpeedCard) return;
      this.hoverSpeedCard.style.opacity = '1';
      this.hoverSpeedCard.style.top = `${e.originalEvent.clientY}px`;
      this.hoverSpeedCard.style.left = `${e.originalEvent.clientX}px`;
    });

    this.map.on('mouseleave', 'route', () => {
      this.hoverSpeedCard.style.opacity = '0';
    });
  }

  private flyTo(lat: number, lng: number) {
    this.map.flyTo({ center: [lng, lat], zoom: DEFAULT_MAPBOX_OPTIONS.zoom });
  }

  updateSelectedTrip() {
    if (!this.map || !this.uiStore.selectedTrip) return;
    const selectedTrip = this.uiStore.selectedTrip;

    // Fly to center of selected path.
    const tripBounds = selectedTrip.tripBounds;
    this.map.fitBounds([
      tripBounds.west, tripBounds.south, tripBounds.east, tripBounds.north], {
        padding: 240,
      });

    const source = this.map.getSource('route-source') as mapboxgl.GeoJSONSource;
    if (!source) return;
    source.setData(createTripRouteData(selectedTrip.locationSamples));
    this.map.setPaintProperty('route', 'line-gradient', [
      'interpolate',
      ['linear'],
      ['line-progress'],
      ...getLineProgress(selectedTrip).splice(1000),
    ]);
  }

  @computed get formattedCurrentSpeed(): number {
    if (!this.uiStore.hoverSpeedSample) return 0;
    return Math.round(this.uiStore.hoverSpeedSample.speedMph);
  }
}
