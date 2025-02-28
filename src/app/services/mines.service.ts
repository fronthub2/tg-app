import { Injectable } from '@angular/core';

export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  neighboringMines: number;
}

@Injectable({
  providedIn: 'root',
})
export class MinesService {
  private GAME_CONFIG = {
    DEFAULT: { rows: 10, cols: 10, mines: 25 },
    RATIO_0_5: { rows: 8, cols: 8, mines: 20 },
    RATIO_1: { rows: 6, cols: 6, mines: 15 },
    RATIO_1_5: { rows: 4, cols: 4, mines: 10 },
  };

  initializeBoard(rows: number, cols: number): Cell[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false,
        isRevealed: false,
        neighboringMines: 0,
      }))
    );
  }

  configureBoard(ratio: number) {
    const config =
      {
        0.5: this.GAME_CONFIG.RATIO_0_5,
        1: this.GAME_CONFIG.RATIO_1,
        1.5: this.GAME_CONFIG.RATIO_1_5,
      }[ratio] || this.GAME_CONFIG.DEFAULT;
    return { rows: config.rows, cols: config.cols, mineCount: config.mines };
  }

  placeMines(
    board: Cell[][],
    mineCount: number,
    rows: number,
    cols: number
  ): void {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!board[row][col].isMine) {
        board[row][col].isMine = true;
        minesPlaced++;
      }
    }
  }

  calculateNeighboringMines(board: Cell[][], rows: number, cols: number): void {
    const mines = board
      .flat()
      .map((cell, idx) => (cell.isMine ? idx : -1))
      .filter((idx) => idx !== -1);
    mines.forEach((mineIdx) => {
      const row = Math.floor(mineIdx / cols);
      const col = mineIdx % cols;
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (this.isValidCell(r, c, rows, cols)) {
            board[r][c].neighboringMines++;
          }
        }
      }
    });
  }

  revealCell(
    board: Cell[][],
    row: number,
    col: number,
    rows: number,
    cols: number
  ): boolean {
    if (!this.isValidCell(row, col, rows, cols) || board[row][col].isRevealed)
      return false;

    const queue: [number, number][] = [[row, col]];
    let hitMine = false;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      if (board[r][c].isRevealed) continue;

      board[r][c].isRevealed = true;

      if (board[r][c].isMine) {
        hitMine = true;
        break;
      }

      if (board[r][c].neighboringMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const newRow = r + dr;
            const newCol = c + dc;
            if (
              this.isValidCell(newRow, newCol, rows, cols) &&
              !board[newRow][newCol].isRevealed
            ) {
              queue.push([newRow, newCol]);
            }
          }
        }
      }
    }
    return hitMine;
  }

  checkWin(
    board: Cell[][],
    rows: number,
    cols: number,
    mineCount: number
  ): boolean {
    const totalCells = rows * cols;
    const revealedCells = board.flat().filter((cell) => cell.isRevealed).length;
    return revealedCells === totalCells - mineCount;
  }

  private isValidCell(
    row: number,
    col: number,
    rows: number,
    cols: number
  ): boolean {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }
}
