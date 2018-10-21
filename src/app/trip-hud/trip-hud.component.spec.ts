import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripHudComponent } from './trip-hud.component';

describe('TripHudComponent', () => {
  let component: TripHudComponent;
  let fixture: ComponentFixture<TripHudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripHudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
