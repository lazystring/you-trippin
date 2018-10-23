import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MobxAngularModule } from 'mobx-angular';
import { NgModule } from '@angular/core';

import { LocationService } from './location.service';
import { MapComponent } from './map/map.component';
import { TripHudComponent } from './trip-hud/trip-hud.component';
import { TripMapStore } from './stores/trip-map.store';
import { TripMenuComponent } from './trip-menu/trip-menu.component';
import { TripMenuStore } from './stores/trip-menu.store';
import { TripReportComponent } from './trip-report/trip-report.component';
import { TripReportStore } from './stores/trip-report.store';
import { TripService } from './trip.service';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TripMenuComponent,
    TripHudComponent,
    TripReportComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MobxAngularModule,
    BrowserAnimationsModule,
  ],
  providers: [
    LocationService,
    TripService,
    TripMenuStore,
    TripMapStore,
    TripReportStore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
