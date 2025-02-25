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
  private gameService = inject(DurakGameService);

  human!: Player;
  computer!: Player;
  table: { attack: Card; defend?: Card }[] = [];
  discardPile: Card[] = [];
  deckCount = 0;
  trumpSuit!: Card['suit'];
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
  isShowExist: boolean = false;

  getSuitSymbol(suit: Card['suit']): string {
    switch (suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
    }
  }

  getCardClasses(card: Card): string[] {
    return [
      'card',
      card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black',
    ];
  }

  startGameWithBet(bet: number) {
    this.currentBet = bet;
    if (this.balance < bet) {
      this.showModal = true;
      return;
    }

    this.balance -= bet;
    this.gameService.initializeDeck();
    [this.human, this.computer] = this.gameService.dealCards();
    this.deckCount = this.gameService['deck'].length;
    this.trumpSuit = this.gameService['trumpSuit'];
    this.table = [];
    this.discardPile = [];
    this.gameStarted = true;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.canEndTurn = false;
    this.isShowExist = true;
    console.log(
      'Game started: Player is attacking:',
      this.human.isAttacking,
      'Hand:',
      this.human.hand
    );
  }

  topUpBalance(amount: number) {
    this.balance += amount;
    this.showModal = false;
    if (this.balance >= this.currentBet) {
      this.startGameWithBet(this.currentBet);
    }
  }

  closeModal() {
    this.showModal = false;
    this.currentBet = 0;
  }

  resetGame() {
    this.gameStarted = false;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.currentBet = 0;
    this.discardPile = [];
    this.showPlayerActionLabel = false;
    this.showComputerActionLabel = false;
  }

  exitGame() {
    this.isShowExist = false;
    this.gameStarted = false;
    this.showGameEndModal = false;
    this.gameResult = '';
    this.table = [];
    this.canEndTurn = false;
    console.log('Exited game');
  }

  canPlayerDrag(): boolean {
    return (
      this.human.isAttacking ||
      (!this.human.isAttacking &&
        this.table.length > 0 &&
        !this.table[this.table.length - 1].defend)
    );
  }

  onDragStart(event: DragEvent, card: Card) {
    if (!this.canPlayerDrag()) {
      console.log('Drag blocked: Not your turn or no valid action');
      event.preventDefault();
      return;
    }
    this.isDragging = true;
    event.dataTransfer!.setData('text/plain', JSON.stringify(card));
    const dragImage = event.target as HTMLElement;
    dragImage.style.opacity = '0.5';
    event.dataTransfer!.setDragImage(dragImage, 40, 60);
    console.log('Drag started:', card);
  }

  onDragEnd(event: DragEvent) {
    this.isDragging = false;
    this.isDraggingOverTable = false;
    const dragImage = event.target as HTMLElement;
    dragImage.style.opacity = '1';
    console.log('Drag ended');
  }

  onDragOverTable(event: DragEvent) {
    if (this.canPlayerDrag()) {
      event.preventDefault();
      console.log('Dragging over table');
    }
  }

  onDragEnterTable(event: DragEvent) {
    if (this.canPlayerDrag()) {
      this.isDraggingOverTable = true;
      console.log('Entered table dropzone');
    }
  }

  onDragLeaveTable(event: DragEvent) {
    this.isDraggingOverTable = false;
    console.log('Left table dropzone');
  }

  onDropTable(event: DragEvent) {
    if (!this.canPlayerDrag()) {
      console.log('Drop blocked: Not your turn or no valid action');
      return;
    }
    event.preventDefault();
    this.isDragging = false;
    this.isDraggingOverTable = false;
    const cardData = event.dataTransfer!.getData('text/plain');
    if (cardData) {
      const card: Card = JSON.parse(cardData);
      console.log('Dropped card:', card);
      this.playCard(card);
    } else {
      console.log('No card data in drop event');
    }
  }

  playCard(card: Card) {
    const cardInHand = this.human.hand.find(
      (c) => c.suit === card.suit && c.rank === card.rank
    );
    if (!cardInHand) {
      console.log('Card not in hand:', card, 'Current hand:', this.human.hand);
      return;
    }

    console.log('Player is attacking:', this.human.isAttacking);

    if (this.human.isAttacking) {
      const tableRanks = this.table.flatMap((pair) =>
        [pair.attack.rank, pair.defend?.rank].filter(Boolean)
      );
      if (this.table.length === 0 || tableRanks.includes(card.rank)) {
        this.table.push({ attack: cardInHand });
        this.human.hand = this.human.hand.filter((c) => c !== cardInHand);
        this.canEndTurn = true;
        console.log(
          'Player attacked with:',
          cardInHand,
          'Table:',
          this.table,
          'Hand:',
          this.human.hand
        );
        this.computerDefend();
      } else {
        console.log(
          'Cannot attack: Rank does not match existing cards on table',
          'Table ranks:',
          tableRanks
        );
      }
    } else if (
      this.table.length > 0 &&
      !this.table[this.table.length - 1].defend
    ) {
      const attackCard = this.table[this.table.length - 1].attack;
      if (this.gameService.canBeat(attackCard, cardInHand)) {
        this.table[this.table.length - 1].defend = cardInHand;
        this.human.hand = this.human.hand.filter((c) => c !== cardInHand);
        this.canEndTurn = true;
        console.log(
          'Player defended with:',
          cardInHand,
          'Table:',
          this.table,
          'Hand:',
          this.human.hand
        );
        setTimeout(() => this.computerContinue(), 1000);
      } else {
        console.log('Cannot defend: Card cannot beat', attackCard);
      }
    } else {
      console.log('Invalid action: Not attacking and no card to defend');
    }
    this.checkGameEnd();
  }

  computerDefend() {
    if (this.table.length === 0 || this.table[this.table.length - 1].defend)
      return;

    const attackCard = this.table[this.table.length - 1].attack;
    const possibleDefends = this.computer.hand
      .filter((card) => this.gameService.canBeat(attackCard, card))
      .sort((a, b) => {
        const isATrump = a.suit === this.trumpSuit;
        const isBTrump = b.suit === this.trumpSuit;
        if (isATrump && !isBTrump) return 1;
        if (!isATrump && isBTrump) return -1;
        return a.value - b.value;
      });

    if (possibleDefends.length > 0) {
      const defendCard =
        this.human.hand.length < 4 || this.deckCount < 6
          ? possibleDefends[0]
          : possibleDefends[Math.min(1, possibleDefends.length - 1)];

      setTimeout(() => {
        this.table[this.table.length - 1].defend = defendCard;
        this.computer.hand = this.computer.hand.filter((c) => c !== defendCard);
        this.canEndTurn = true;
        console.log(
          'Computer defended with:',
          defendCard,
          'Table:',
          this.table
        );
        this.checkGameEnd();
      }, 1000);
    } else {
      console.log('Computer cannot defend, taking cards');
      setTimeout(() => {
        this.computer.hand.push(...this.table.map((pair) => pair.attack));
        this.computer.hand.push(
          ...this.table.map((pair) => pair.defend!).filter(Boolean)
        );
        this.table = [];
        this.human.isAttacking = true;
        this.computer.isAttacking = false;
        this.canEndTurn = false;
        this.refillHands();
        this.showComputerActionLabel = true;
        this.computerActionText = 'Забрал';
        console.log(
          "Computer took cards to hand, player's turn:",
          this.computer.hand
        );
        setTimeout(() => {
          this.showComputerActionLabel = false;
        }, 1000);
        this.checkGameEnd();
      }, 1000);
    }
  }

  computerContinue() {
    if (this.human.isAttacking || this.table.length === 0) return;

    const isDefended = this.table.every((pair) => !!pair.defend);
    if (isDefended && this.canComputerAttackMore()) {
      setTimeout(() => this.computerAttack(), 1000);
    } else if (isDefended) {
      setTimeout(() => {
        this.discardPile.push(...this.table.map((pair) => pair.attack));
        this.discardPile.push(
          ...this.table.map((pair) => pair.defend!).filter(Boolean)
        );
        this.table = [];
        this.human.isAttacking = true;
        this.computer.isAttacking = false;
        this.canEndTurn = false;
        this.refillHands();
        this.showComputerActionLabel = true;
        this.computerActionText = 'Отбой';
        console.log('Computer ended turn: Cards to discard pile');
        setTimeout(() => {
          this.showComputerActionLabel = false;
        }, 1000);
        this.checkGameEnd();
      }, 1000);
    }
  }

  canAttackMore(): boolean {
    if (this.table.length === 0) return true;
    const tableRanks = this.table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    return (
      this.human.hand.some((card) => tableRanks.includes(card.rank)) &&
      this.table.length < this.computer.hand.length
    );
  }

  canComputerAttackMore(): boolean {
    if (this.table.length === 0) return true;
    const tableRanks = this.table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    return (
      this.computer.hand.some((card) => tableRanks.includes(card.rank)) &&
      this.table.length < this.human.hand.length
    );
  }

  isDefendingComplete(): boolean {
    if (this.table.length === 0) return false;
    const lastPair = this.table[this.table.length - 1];
    return (
      !!lastPair.defend ||
      !this.human.hand.some((card) =>
        this.gameService.canBeat(lastPair.attack, card)
      )
    );
  }

  takeCardsToHand() {
    if (!this.canEndTurn || this.human.isAttacking) return;

    setTimeout(() => {
      this.human.hand.push(...this.table.map((pair) => pair.attack));
      this.human.hand.push(
        ...this.table.map((pair) => pair.defend!).filter(Boolean)
      );
      this.table = [];
      this.human.isAttacking = false;
      this.computer.isAttacking = true;
      this.canEndTurn = false;
      this.refillHands();
      this.showPlayerActionLabel = true;
      this.playerActionText = 'Забрал';
      console.log(
        "Player took cards to hand, computer's turn:",
        this.human.hand
      );
      setTimeout(() => {
        this.showPlayerActionLabel = false;
        this.computerAttack();
      }, 1000);
      this.checkGameEnd();
    }, 1000);
  }

  endTurn() {
    if (!this.canEndTurn || !this.human.isAttacking) return;

    setTimeout(() => {
      this.discardPile.push(...this.table.map((pair) => pair.attack));
      this.discardPile.push(
        ...this.table.map((pair) => pair.defend!).filter(Boolean)
      );
      this.table = [];
      this.human.isAttacking = false;
      this.computer.isAttacking = true;
      this.canEndTurn = false;
      this.showPlayerActionLabel = true;
      this.playerActionText = 'Отбой';
      console.log('Player ended turn: Cards to discard pile');
      this.refillHands();
      setTimeout(() => {
        this.showPlayerActionLabel = false;
        this.computerAttack();
      }, 1000);
      this.checkGameEnd();
    }, 1000);
  }

  computerAttack() {
    if (this.computer.hand.length === 0) return;

    this.human.isAttacking = false;
    this.computer.isAttacking = true;
    console.log(
      'Computer is attacking, player is defending:',
      !this.human.isAttacking
    );

    const tableRanks = this.table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    const handCopy = [...this.computer.hand];

    handCopy.sort((a, b) => {
      const isATrump = a.suit === this.trumpSuit;
      const isBTrump = b.suit === this.trumpSuit;
      if (isATrump && !isBTrump) return 1;
      if (!isATrump && isBTrump) return -1;
      return a.value - b.value;
    });

    let attackCard: Card | undefined;

    if (tableRanks.length > 0) {
      attackCard = handCopy.find((card) => tableRanks.includes(card.rank));
    }

    if (!attackCard) {
      if (this.human.hand.length < 3 && this.deckCount < 6) {
        attackCard = handCopy[handCopy.length - 1];
      } else {
        attackCard =
          handCopy.find((card) => card.suit !== this.trumpSuit) || handCopy[0];
      }
    }

    if (attackCard && this.table.length < this.human.hand.length) {
      this.table.push({ attack: attackCard });
      this.computer.hand = this.computer.hand.filter((c) => c !== attackCard);
      this.canEndTurn = true;
      console.log('Computer attacked with:', attackCard, 'Table:', this.table);
    }
    this.checkGameEnd();
  }

  refillHands() {
    const deck = this.gameService['deck'];
    while (this.human.hand.length < 6 && deck.length > 0) {
      this.human.hand.push(deck.shift()!);
    }
    while (this.computer.hand.length < 6 && deck.length > 0) {
      this.computer.hand.push(deck.shift()!);
    }
    this.deckCount = deck.length;
    console.log(
      'Hands refilled: Player:',
      this.human.hand.length,
      'Computer:',
      this.computer.hand.length
    );
  }

  checkGameEnd() {
    if (this.human.hand.length === 0 || this.computer.hand.length === 0) {
      setTimeout(() => {
        if (this.human.hand.length === 0) {
          this.gameResult = 'Вы победили!';
          this.balance += this.currentBet * 2;
        } else if (this.computer.hand.length === 0) {
          this.gameResult = 'Компьютер победил! Вы - дурак!';
        }

        if (this.balance <= 0) {
          this.gameResult += ' У вас закончились деньги!';
        }
        this.showGameEndModal = true;
        console.log('Game ended:', this.gameResult);
      }, 1000);
    }
  }
}
