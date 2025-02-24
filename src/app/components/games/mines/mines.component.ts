import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  neighboringMines: number;
}

@Component({
  selector: 'app-mines',
  imports: [CommonModule,RouterLink],
  templateUrl: './mines.component.html',
  styleUrl: './mines.component.scss',
})
export class MinesComponent {
  rows: number = 10;
  cols: number = 10;
  mineCount: number = 15;
  board: Cell[][] = [];

  isShowButtonExit: boolean = false;
  isPlay!: boolean;

  constructor() {}

  ngOnInit(): void {
    this.isPlay = true;
    this.initializeBoard();
    this.placeMines();
    this.calculateNeighboringMines();
  }

  //Инициализация доски
  initializeBoard() {
    if (!this.isPlay) return;

    this.isShowButtonExit = false;
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        isMine: false,
        isRevealed: false,
        neighboringMines: 0,
      }))
    );
  }

  //Расположение мины
  placeMines() {
    if (!this.isPlay) return;

    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (!this.board[row][col].isMine) {
        this.board[row][col].isMine = true;
        minesPlaced++;
      }
    }
  }

  // Рассчитать соседние шахты
  calculateNeighboringMines() {
    if (!this.isPlay) return;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isMine) {
          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                this.board[r][c].neighboringMines++;
              }
            }
          }
        }
      }
    }
  }

  // Открытие ячейки
  revealCell(row: number, col: number) {
    if (!this.isPlay) return;

    if (this.board[row][col].isRevealed) return;

    this.board[row][col].isRevealed = true;

    if (this.board[row][col].isMine) {
      console.log('Взрыв');
      // alert('Вы проиграли');
      // Перезапустите игру или обработайте логику завершения игры здесь
      this.isPlay = false;
      this.isShowButtonExit = true;
      this.initializeBoard();
      this.placeMines();
      this.calculateNeighboringMines();
    } else if (this.board[row][col].neighboringMines === 0) {
      // Если соседних мин нет, раскройте окружающие клетки
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.revealCell(r, c);
          }
        }
      }
    }
  }
}
