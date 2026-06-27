import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Done } from './done';

describe('Done', () => {
  let component: Done;
  let fixture: ComponentFixture<Done>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Done],
    }).compileComponents();

    fixture = TestBed.createComponent(Done);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
