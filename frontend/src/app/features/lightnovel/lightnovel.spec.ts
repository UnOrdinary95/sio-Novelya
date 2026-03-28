import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lightnovel } from './lightnovel';

describe('Lightnovel', () => {
  let component: Lightnovel;
  let fixture: ComponentFixture<Lightnovel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lightnovel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lightnovel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
