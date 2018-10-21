import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MobxAngularModule } from 'mobx-angular';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { TripService } from './trip.service';
import { TripMenuComponent } from './trip-menu/trip-menu.component';
import { UiStore } from './stores/ui.store';
import { LocationService } from './location.service';
import { TripHudComponent } from './trip-hud/trip-hud.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TripMenuComponent,
    TripHudComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MobxAngularModule
  ],
  providers: [
    LocationService,
    TripService,
    UiStore,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
