import { TestBed } from '@angular/core/testing';

import { ApiBDService } from './api-bd.service';

describe('ApiBDService', () => {
  let service: ApiBDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiBDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
