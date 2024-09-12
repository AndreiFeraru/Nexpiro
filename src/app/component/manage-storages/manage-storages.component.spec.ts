import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStoragesComponent } from './manage-storages.component';

describe('ManageStoragesComponent', () => {
  let component: ManageStoragesComponent;
  let fixture: ComponentFixture<ManageStoragesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManageStoragesComponent]
    });
    fixture = TestBed.createComponent(ManageStoragesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
