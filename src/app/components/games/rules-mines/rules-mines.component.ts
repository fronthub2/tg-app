import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { IUser } from '../../../interface/user.interface';
import { UserService } from '../../../services/user.service';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-rules-mines',
  imports: [RouterLink, FormsModule, CurrencyPipe, ModalComponent],
  templateUrl: './rules-mines.component.html',
  styleUrl: './rules-mines.component.scss',
})
export class RulesMinesComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private subscription = new Subscription();

  isShowModal: boolean = false;
  user!: IUser;
  stake: number = 0;
  ratio: string = '0.2';

  ngOnInit(): void {
    this.subscription.add(
      this.userService
        .getUserInfo()
        .pipe(tap((user) => (this.user = user)))
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  connectForMines() {
    if (this.user.balance === 0) {
      this.isShowModal = true;
      return;
    }

    this.userService.setStake(this.stake);
    this.userService.setRation(Number(this.ratio));
  }

  changeRatio() {
    this.userService.setStake(Number(this.ratio));
  }
}
