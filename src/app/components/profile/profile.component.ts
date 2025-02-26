import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { IUser } from '../../interface/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private subsription = new Subscription();
  user!: IUser;

  ngOnInit(): void {
    this.subsription.add(
      this.userService
        .getUserInfo()
        .pipe(
          tap((users) =>
            users.map((user) => {
              this.user = user;
              return user;
            })
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }
}
