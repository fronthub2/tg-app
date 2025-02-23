import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../interface/user.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  LocalStorageService = inject(LocalStorageService);
  userBSubject!: BehaviorSubject<IUser>;
  key = 'user';

  constructor() {
    const tasksLocalStorage =
      this.LocalStorageService.getLocalStorage(this.key) || [];
    this.userBSubject = new BehaviorSubject<IUser>(tasksLocalStorage);
  }

  getUserInfo(): Observable<IUser> {
    return this.userBSubject.asObservable();
  }

  signUpUser(userInfo: IUser) {
    this.userBSubject.next(userInfo);
    console.log('регистрация', this.userBSubject.getValue());
  }

  signInUser(userInfo: IUser) {
    this.userBSubject.next(userInfo);
    console.log('вошел:', this.userBSubject.getValue());
  }

  saveInLocalStorage(key: string): void {
    this.LocalStorageService.setLocalStorage(key, this.userBSubject);
  }
}
