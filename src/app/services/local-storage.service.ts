import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storage: Storage = localStorage;

  constructor() {}

  getLocalStorage(key: string): any {
    const value = this.storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  setLocalStorage(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  removeLocalStorageByKey(key: string): void {
    this.storage.removeItem(key);
  }

  clearLocalStorage(): void {
    this.storage.clear();
  }
}
