import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GridStorageService {
  private storageMap = {};

  constructor() { }

  getStorageData(key: string) {
    return this.storageMap[key];
  }

  setStorageData(key: string, data: any) {
    this.storageMap[key] = data;
  }
}
