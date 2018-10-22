import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { TripService } from '../trip.service';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../environments/environment';
import { TripMapStore } from '../stores/trip-map.store';
import { autorun, computed } from 'mobx';
import { SpeedClass, Trip, getClosestSpeedSample } from '../trip';
import { LocationService } from '../location.service';
import { createTripRouteLayer, createTripRouteData, createTripRouteSource, getGeoJsonCoordinates } from '../map';
import { TripReportStore } from '../stores/trip-report.store';

const DEFAULT_MAPBOX_OPTIONS: mapboxgl.MapboxOptions = {
  container: 'map',
  style: `${environment.tileserver.url}/styles/klokantech-basic/style.json`,
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
  private map?: mapboxgl.Map;
  private startPopup?: mapboxgl.Popup;
  private finishPopup?: mapboxgl.Popup;

  // Hover card showing the speed at the location of the user's cursor.
  // Seriously Angular, is there not a nicer way to query for elements?
  private hoverSpeedCard: HTMLElement;
  @ViewChild('hoverSpeedCard') set hoverSpeedCardRef(
    ref: ElementRef | undefined) {
    if (!ref) return;
    this.hoverSpeedCard = ref.nativeElement;
  }

  constructor(private tripService: TripService,
    private mapStore: TripMapStore, private locationService: LocationService, private reportStore: TripReportStore) {
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
      if (this.mapStore.selectedTrip) {
        this.updateSelectedTrip();
      }
    });

    this.map.on('mousemove', 'route', (e) => {
      const speedSamples = this.mapStore.selectedTrip.speedSamples;

      // TODO: Look into optimizing with constant time lookup by some id.
      const closest = getClosestSpeedSample(e.lngLat, speedSamples);
      if (!closest) return;

      this.mapStore.setHoverSpeedSample(closest);
      const { clientX, clientY } = e.originalEvent;
      this.movSpeedHoverCard(clientX, clientY);
    });

    this.map.on('mouseleave', 'route', () => this.hideSpeedHoverCard());

    // Close the trip report when clicking on the map.
    this.map.on('mousedown', () => this.reportStore.setTripToReport(undefined));
  }

  private movSpeedHoverCard(x: number, y: number) {
    if (!this.hoverSpeedCard) return;
    this.hoverSpeedCard.style.opacity = '1';
    this.hoverSpeedCard.style.top = `${y}px`;
    this.hoverSpeedCard.style.left = `${x}px`;
  }

  private hideSpeedHoverCard() {
    if (!this.hoverSpeedCard) return;
    this.hoverSpeedCard.style.opacity = '0';
  }

  private flyTo(lat: number, lng: number) {
    this.map.flyTo({ center: [lng, lat], zoom: DEFAULT_MAPBOX_OPTIONS.zoom });
  }

  updateSelectedTrip() {
    if (!this.map || !this.mapStore.selectedTrip) return;
    const selectedTrip = this.mapStore.selectedTrip;

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
      ...getLineProgress(selectedTrip),
    ]);

    this.removePopups();
    this.startPopup = this.addPopup(selectedTrip.startLocation, 'Start');
    this.finishPopup = this.addPopup(selectedTrip.endLocation, 'Finish');
  }

  addPopup(location: mapboxgl.LngLat | undefined, text: string):
    mapboxgl.Popup | undefined {
    if (!location) return undefined;
    return new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
      .setLngLat(getGeoJsonCoordinates(location)).setHTML(text).addTo(this.map);
  }

  removePopups() {
    if (this.startPopup) this.startPopup.remove();
    if (this.finishPopup) this.finishPopup.remove();
  }

  @computed get formattedCurrentSpeed(): number {
    if (!this.mapStore.hoverSpeedSample) return 0;
    return Math.round(this.mapStore.hoverSpeedSample.speedMph);
  }
}
