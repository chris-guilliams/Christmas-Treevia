import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyFrequencyTilemapComponent } from './daily-frequency-tilemap.component';

describe('DailyFrequencyTilemapComponent', () => {
  let component: DailyFrequencyTilemapComponent;
  let fixture: ComponentFixture<DailyFrequencyTilemapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyFrequencyTilemapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyFrequencyTilemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
