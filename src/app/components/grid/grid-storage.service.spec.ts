import { TestBed, inject } from '@angular/core/testing';

import { GridStorageService } from './grid-storage.service';

describe('GridStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GridStorageService],
    });
  });

  it('should be created', inject([GridStorageService], (service: GridStorageService) => {
    expect(service).toBeTruthy();
  }));
});
