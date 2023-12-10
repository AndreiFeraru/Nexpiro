import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFridgeComponent } from './view-fridge.component';

describe('ViewFridgeComponent', () => {
  let component: ViewFridgeComponent;
  let fixture: ComponentFixture<ViewFridgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFridgeComponent]
    });
    fixture = TestBed.createComponent(ViewFridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
