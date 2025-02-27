import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../interface/user.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private lsService = inject(LocalStorageService);
  private userBSubject!: BehaviorSubject<IUser[]>;
  private key = 'user';

  constructor() {
    const getLS = this.lsService.getLocalStorage(this.key);
    this.userBSubject = new BehaviorSubject<IUser[]>(getLS);
    console.log('user', this.userBSubject.getValue());
    console.log(getLS);
  }

  getUserInfo(): Observable<IUser[]> {
    return this.userBSubject.asObservable();
  }

  updateUserInfo(user: IUser[]) {
    this.userBSubject.next(user);
  }

  saveInLocalStorage(key: string): void {
    this.lsService.setLocalStorage(key, this.userBSubject.getValue());
  }
}
