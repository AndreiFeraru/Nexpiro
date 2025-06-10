import { TestBed } from '@angular/core/testing';

import { StorageItemService } from './storageItem.service';

describe('StorageItemService', () => {
  let service: StorageItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
