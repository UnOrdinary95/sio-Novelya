import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightnovelList } from './lightnovel-list';

describe('LightnovelList', () => {
  let component: LightnovelList;
  let fixture: ComponentFixture<LightnovelList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightnovelList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightnovelList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
