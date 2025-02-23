import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SecureIdService {
  constructor() {}

  getSecureID() {
    return crypto.randomUUID().slice(0, 7);
  }
}
