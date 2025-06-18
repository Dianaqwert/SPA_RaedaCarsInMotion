import { TestBed } from '@angular/core/testing';

import { ContrasteService } from './contraste.service';

describe('ContrasteService', () => {
  let service: ContrasteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContrasteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
