import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightnovelItem } from './lightnovel-item';

describe('LightnovelItem', () => {
  let component: LightnovelItem;
  let fixture: ComponentFixture<LightnovelItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightnovelItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightnovelItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
