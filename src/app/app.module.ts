import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MobxAngularModule } from 'mobx-angular';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { TripService } from './trip.service';
import { TripMenuComponent } from './trip-menu/trip-menu.component';
import { TripMapStore } from './stores/trip-map.store';
import { TripMenuStore } from './stores/trip-menu.store';
import { LocationService } from './location.service';
import { TripHudComponent } from './trip-hud/trip-hud.component';
import { TripReportComponent } from './trip-report/trip-report.component';
import { TripReportStore } from './stores/trip-report.store';

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
