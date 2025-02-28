import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser } from '../../../interface/user.interface';
import { UserService } from '../../../services/user.service';
import { Cell, MinesService } from '../../../services/mines.service';

const enum GameState {
  INITIAL = 'initial',
  PLAYING = 'playing',
  LOST = 'lost',
  WON = 'won',
}

type Ratio = '0.2' | '0.5' | '1' | '1.5';

@Component({
  selector: 'app-mines',
  imports: [CommonModule, RouterLink],
  templateUrl: './mines.component.html',
  styleUrl: './mines.component.scss',
})
export class MinesComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private userService = inject(UserService);
  private gameService = inject(MinesService);

  user!: IUser;
  wins: number = 0;
  stake: number = 0;
  count: number = 0;
  ratio: number = 0;

  rows: number = 0;
  cols: number = 0;
  mineCount: number = 0;
  board: Cell[][] = [];
  gameState: GameState = GameState.INITIAL;
  isShowButtonExit: boolean = false;

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserInfo().subscribe({
        next: (user) => {
          this.user = user;
          this.stake = this.userService.getStake();
          this.ratio = this.userService.getRatio();
          if (this.stake <= 0 || !this.ratio) {
            console.error('Некорректные данные: ставка или коэффициент');
            return;
          }
          this.startGame();
        },
        error: (err) => console.error('Ошибка загрузки пользователя:', err),
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  startGame(): void {
    const config = this.gameService.configureBoard(this.ratio);
    this.rows = config.rows;
    this.cols = config.cols;
    this.mineCount = config.mineCount;
    this.board = this.gameService.initializeBoard(this.rows, this.cols);
    this.gameService.placeMines(
      this.board,
      this.mineCount,
      this.rows,
      this.cols
    );
    this.gameService.calculateNeighboringMines(
      this.board,
      this.rows,
      this.cols
    );
    this.gameState = GameState.PLAYING;
    this.wins = 0;
    this.count = 0;
  }

  revealCell(row: number, col: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    const hitMine = this.gameService.revealCell(
      this.board,
      row,
      col,
      this.rows,
      this.cols
    );
    if (hitMine) {
      this.gameState = GameState.LOST;
      this.isShowButtonExit = true;
      this.wins = 0;
      return;
    }

    this.count++;
    this.calculateWins();

    if (
      this.gameService.checkWin(
        this.board,
        this.rows,
        this.cols,
        this.mineCount
      )
    ) {
      this.gameState = GameState.WON;
      this.setWinsCash();
    }
  }

  calculateWins(): void {
    this.wins = (this.stake + this.count) * this.ratio;
  }

  setWinsCash(): void {
    if (this.wins > 0) {
      this.user.balance += this.wins;
      this.userService.updateUserInfo(this.user);
    }
  }

  restartGame(): void {
    this.startGame();
  }
}
