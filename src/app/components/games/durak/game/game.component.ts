import {
  animate,
  keyframes,
  sequence,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Card, Player } from '../../../../interface/durak.game.interface';
import { DurakGameService } from '../../../../services/durak.game.service';

@Component({
  selector: 'app-game',
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  animations: [
    trigger('cardAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })
        ),
      ]),
    ]),
    trigger('cardMove', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '400ms ease-in',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({
              opacity: 0.5,
              transform: 'translateX(-200px) rotate(-30deg)',
              offset: 0.7,
            }),
            style({
              opacity: 0,
              transform: 'translateX(-300px) rotate(-45deg)',
              offset: 1,
            }),
          ])
        ),
      ]),
    ]),
    trigger('cardDefend', [
      transition(':enter', [
        sequence([
          style({ opacity: 0, transform: 'translateY(100px) rotate(0deg)' }),
          animate(
            '200ms',
            style({ opacity: 1, transform: 'translateY(-20px) rotate(15deg)' })
          ),
        ]),
      ]),
    ]),
  ],
})
export class GameComponent {
  gameService = inject(DurakGameService);

  human!: Player;
  computer!: Player;
  table: { attack: Card; defend?: Card }[] = [];
  gameStarted = false;
  gameResult = '';
  canEndTurn = false;
  balance = 10.0;
  currentBet = 0;
  showModal = false;
  isDragging = false;
  isDraggingOverTable = false;
  showPlayerActionLabel = false;
  showComputerActionLabel = false;
  playerActionText = '';
  computerActionText = '';
  showGameEndModal = false;

  getSuitSymbol(suit: Card['suit']): string {
    switch (suit) {
      case 'hearts':
        return '♥️';
      case 'diamonds':
        return '♦️';
      case 'clubs':
        return '♣️';
      case 'spades':
        return '♠️';
    }
  }

  getCardClasses(card: Card): string[] {
    return [
      'card',
      card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black',
    ];
  }

  startGameWithBet(bet: number): void {
    this.currentBet = bet;
    if (this.balance < bet) {
      this.showModal = true;
      return;
    }

    this.balance -= bet;
    this.gameService.initializeDeck();
    [this.human, this.computer] = this.gameService.dealCards();
    this.table = [];
    this.gameStarted = true;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.canEndTurn = false;
    if (!this.human.isAttacking) setTimeout(() => this.computerAttack(), 1000);
  }

  topUpBalance(amount: number): void {
    this.balance += amount;
    this.showModal = false;
    if (this.balance >= this.currentBet) this.startGameWithBet(this.currentBet);
  }

  closeModal(): void {
    this.showModal = false;
    this.currentBet = 0;
  }

  resetGame(): void {
    this.gameStarted = false;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.currentBet = 0;
    this.showPlayerActionLabel = false;
    this.showComputerActionLabel = false;
  }

  exitGame(): void {
    this.gameStarted = false;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.table = [];
    this.canEndTurn = false;
  }

  canPlayerDrag(): boolean {
    return (
      this.human.isAttacking ||
      (!this.human.isAttacking &&
        this.table.length > 0 &&
        !this.table[this.table.length - 1].defend)
    );
  }

  onDragStart(event: DragEvent, card: Card): void {
    if (!this.canPlayerDrag()) {
      event.preventDefault();
      return;
    }
    this.isDragging = true;
    event.dataTransfer!.setData('text/plain', JSON.stringify(card));
    const dragImage = event.target as HTMLElement;
    dragImage.style.opacity = '0.5';
    event.dataTransfer!.setDragImage(dragImage, 40, 60);
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
    this.isDraggingOverTable = false;
    const dragImage = event.target as HTMLElement;
    dragImage.style.opacity = '1';
  }

  onDragOverTable(event: DragEvent): void {
    if (this.canPlayerDrag()) event.preventDefault();
  }

  onDragEnterTable(event: DragEvent): void {
    if (this.canPlayerDrag()) this.isDraggingOverTable = true;
  }

  onDragLeaveTable(event: DragEvent): void {
    this.isDraggingOverTable = false;
  }

  onDropTable(event: DragEvent): void {
    if (!this.canPlayerDrag()) return;
    event.preventDefault();
    this.isDragging = false;
    this.isDraggingOverTable = false;
    const cardData = event.dataTransfer!.getData('text/plain');
    if (cardData) this.playCard(JSON.parse(cardData));
  }

  playCard(card: Card): void {
    const cardInHand = this.human.hand.find(
      (c) => c.suit === card.suit && c.rank === card.rank
    );
    if (!cardInHand) return;

    if (this.human.isAttacking) {
      if (
        this.gameService.canAttackMore(this.human, this.computer, this.table)
      ) {
        this.table.push({ attack: cardInHand });
        this.human.hand = this.human.hand.filter((c) => c !== cardInHand);
        this.canEndTurn = false;
        setTimeout(() => this.computerDefend(), 1000);
      }
    } else if (
      this.table.length > 0 &&
      !this.table[this.table.length - 1].defend
    ) {
      const attackCard = this.table[this.table.length - 1].attack;
      if (this.gameService.canBeat(attackCard, cardInHand)) {
        this.table[this.table.length - 1].defend = cardInHand;
        this.human.hand = this.human.hand.filter((c) => c !== cardInHand);
        this.canEndTurn = false;
        setTimeout(() => this.computerContinue(), 1000);
      }
    }
    this.checkGameEnd();
  }

  computerDefend(): void {
    if (this.gameService.computerDefend(this.computer, this.table)) {
      this.canEndTurn = true;
    } else {
      this.gameService.takeCards(this.computer, this.table);
      this.human.isAttacking = true;
      this.computer.isAttacking = false;
      this.canEndTurn = false;
      this.gameService.refillHand(this.human);
      this.gameService.refillHand(this.computer);
      this.showComputerActionLabel = true;
      this.computerActionText = 'Забрал';
      setTimeout(() => (this.showComputerActionLabel = false), 1000);
    }
    this.checkGameEnd();
  }

  computerContinue(): void {
    const isDefended = this.table.every((pair) => !!pair.defend);
    if (isDefended) {
      if (
        this.gameService.canAttackMore(this.computer, this.human, this.table)
      ) {
        setTimeout(() => this.computerAttack(), 1000);
      } else {
        this.gameService.endTurn(this.table);
        this.human.isAttacking = true;
        this.computer.isAttacking = false;
        this.canEndTurn = false;
        this.gameService.refillHand(this.human);
        this.gameService.refillHand(this.computer);
        this.showComputerActionLabel = true;
        this.computerActionText = 'Отбой';
        setTimeout(() => (this.showComputerActionLabel = false), 1000);
        this.checkGameEnd();
      }
    }
  }

  computerAttack(): void {
    this.human.isAttacking = false;
    this.computer.isAttacking = true;
    this.gameService.computerAttack(this.computer, this.human, this.table);
    this.canEndTurn = true; 
    this.checkGameEnd();
  }

  takeCardsToHand(): void {
    if (!this.canEndTurn || this.human.isAttacking) return;
    this.gameService.takeCards(this.human, this.table);
    this.human.isAttacking = false;
    this.computer.isAttacking = true;
    this.canEndTurn = false;
    this.gameService.refillHand(this.human);
    this.gameService.refillHand(this.computer);
    this.showPlayerActionLabel = true;
    this.playerActionText = 'Забрал';
    setTimeout(() => {
      this.showPlayerActionLabel = false;
      this.computerAttack();
    }, 1000);
    this.checkGameEnd();
  }

  endTurn(): void {
    if (!this.canEndTurn || !this.human.isAttacking) return;
    this.gameService.endTurn(this.table);
    this.human.isAttacking = false;
    this.computer.isAttacking = true;
    this.canEndTurn = false;
    this.gameService.refillHand(this.human);
    this.gameService.refillHand(this.computer);
    this.showPlayerActionLabel = true;
    this.playerActionText = 'Отбой';
    setTimeout(() => {
      this.showPlayerActionLabel = false;
      this.computerAttack();
    }, 1000);
    this.checkGameEnd();
  }

  checkGameEnd(): void {
    const result = this.gameService.checkGameEnd(this.human, this.computer);
    if (result) {
      setTimeout(() => {
        if (result === 'human') {
          this.gameResult = 'Вы победили!';
          this.balance += this.currentBet * 2;
        } else {
          this.gameResult = 'Компьютер победил! Вы - дурак!';
        }
        if (this.balance <= 0) this.gameResult += ' У вас закончились деньги!';
        this.showGameEndModal = true;
      }, 1000);
    }
  }
}

/*
Изменения в GameComponent:
Убраны прямые обращения к deck, trumpSuit, discardPile через this.gameService['...'].
Используются методы сервиса: getTrumpSuit, getDeckCount, getDiscardPile, refillHand, и т.д.
Логика хода компьютера и завершения игры делегирована сервису.
Исправлены ошибки в getCardClasses и canPlayerDrag.
*/

//добавить при модалке overflow hidden
