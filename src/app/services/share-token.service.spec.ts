import { TestBed } from '@angular/core/testing';

import { ShareTokenService } from './share-token.service';

describe('ShareTokenService', () => {
  let service: ShareTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
