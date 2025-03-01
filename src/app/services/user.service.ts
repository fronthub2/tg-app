import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: IUser = {
    id: 's',
    firstname: 'Jkl',
    games: 0,
    wins: 0,
    earnings: 0,
    balance: 10,
    rules: 'user',
  };
  private userBSubject: BehaviorSubject<IUser> = new BehaviorSubject(this.user);
  private stake: number = 0;
  private ratio: number = 0;

  constructor() {}

  getUserInfo(): Observable<IUser> {
    //будем запрашивать через api
    return this.userBSubject.asObservable();
  }

  updateUserInfo(user: IUser) {
    this.userBSubject.next(user);
  }

  getStake() {
    return this.stake;
  }

  setStake(stake: number) {
    this.stake = Number(stake);
  }

  getRatio() {
    return this.ratio;
  }

  setRation(ratio: number) {
    this.ratio = ratio;
  }

  isConnect(): boolean {
    const result =
      this.userBSubject.value.balance >= this.stake && this.stake !== 0;
    if (result) {
      this.userBSubject.value.balance -= this.stake;
      return true;
    } else {
      return false;
    }
  }
}
