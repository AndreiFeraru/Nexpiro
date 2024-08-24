import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStorageComponent } from './view-storage.component';

describe('ViewStorageComponent', () => {
  let component: ViewStorageComponent;
  let fixture: ComponentFixture<ViewStorageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewStorageComponent],
    });
    fixture = TestBed.createComponent(ViewStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
