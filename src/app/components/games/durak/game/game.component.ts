import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card, Player } from '../../../../interface/durak.game.interface';
import { DurakGameService } from '../../../../services/durak.game.service';
import { PlayerCardsComponent } from '../player-cards/player-cards.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BetSelectionComponent } from '../bet-selection/bet-selection.component';

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
    FormsModule,
    PlayerCardsComponent,
    SidebarComponent,
    BetSelectionComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  animations: [
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
          style({ opacity: 0, transform: 'translateX(-300px) rotate(-45deg)' })
        ),
      ]),
    ]),
    trigger('cardDefend', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100px)' }),
        animate(
          '200ms',
          style({ opacity: 1, transform: 'translateY(-20px) rotate(15deg)' })
        ),
      ]),
    ]),
  ],
})
export class GameComponent {
  gameService = inject(DurakGameService);

  human = signal<Player | undefined>(undefined);
  computer = signal<Player | undefined>(undefined);
  table = signal<{ attack: Card; defend?: Card }[]>([]);
  gameStarted = signal(false);
  gameResult = signal('');
  canEndTurn = signal(false);
  balance = 10.0;
  currentBet = signal(0);
  showModal = signal(false);
  isDragging = signal(false);
  isDraggingOverTable = signal(false);
  showPlayerActionLabel = signal(false);
  showComputerActionLabel = signal(false);
  playerActionText = signal('');
  computerActionText = signal('');
  showGameEndModal = signal(false);

  getSuitSymbol(suit: Card['suit']): string {
    return (
      { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' }[suit] || ''
    );
  }

  getCardClasses(card: Card): string[] {
    return [
      'card',
      ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black',
    ];
  }

  startGameWithBet({
    bet,
    deckSize,
  }: {
    bet: number;
    deckSize: '24' | '36';
  }): void {
    // Обновляем тип аргумента
    this.currentBet.set(bet);
    if (this.balance < bet) return this.showModalWithScrollLock();
    this.balance -= bet;
    this.gameService.initializeDeck(deckSize);
    const [human, computer] = this.gameService.dealCards();
    this.human.set(human);
    this.computer.set(computer);
    this.table.set([]);
    this.gameStarted.set(true);
    this.showGameEndModal.set(false);
    this.gameResult.set('');
    this.canEndTurn.set(false);
    if (!human.isAttacking) this.delayedComputerAttack();
  }

  topUpBalance(amount: number): void {
    this.balance += amount;
    this.closeModal();
    if (this.balance >= this.currentBet())
      this.startGameWithBet({ bet: this.currentBet(), deckSize: '36' }); // Указываем дефолтный deckSize
  }

  closeModal(): void {
    this.showModal.set(false);
    this.enableScroll();
    this.currentBet.set(0);
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  resetGame(): void {
    this.gameStarted.set(false);
    this.showGameEndModal.set(false);
    this.enableScroll();
    this.gameResult.set('');
    this.currentBet.set(0);
    this.showPlayerActionLabel.set(false);
    this.showComputerActionLabel.set(false);
  }

  closeGameEndModalOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.resetGame();
  }

  exitGame(): void {
    this.gameStarted.set(false);
    this.showGameEndModal.set(false);
    this.gameResult.set('');
    this.table.set([]);
    this.canEndTurn.set(false);
  }

  canPlayerDrag(): boolean {
    const human = this.human();
    return human
      ? human.isAttacking ||
          (this.table().length > 0 &&
            !this.table()[this.table().length - 1].defend)
      : false;
  }

  onDragStart(event: DragEvent, card: Card): void {
    if (!this.canPlayerDrag()) return event.preventDefault();
    this.isDragging.set(true);
    event.dataTransfer!.setData('text/plain', JSON.stringify(card));
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
    event.dataTransfer!.setDragImage(target, 40, 60);
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging.set(false);
    this.isDraggingOverTable.set(false);
    (event.target as HTMLElement).style.opacity = '1';
  }

  onDragOverTable(event: DragEvent): void {
    if (this.canPlayerDrag()) event.preventDefault();
  }

  onDragEnterTable(event: DragEvent): void {
    if (this.canPlayerDrag()) this.isDraggingOverTable.set(true);
  }

  onDragLeaveTable(event: DragEvent): void {
    this.isDraggingOverTable.set(false);
  }

  onDropTable(event: DragEvent): void {
    if (!this.canPlayerDrag()) return;
    event.preventDefault();
    this.isDragging.set(false);
    this.isDraggingOverTable.set(false);
    const cardData = event.dataTransfer!.getData('text/plain');
    if (cardData) this.playCard(JSON.parse(cardData));
  }

  playCard(card: Card): void {
    const human = this.human();
    if (!human) return;
    const cardInHand = human.hand.find(
      (c) => c.suit === card.suit && c.rank === card.rank
    );
    if (!cardInHand) return;

    if (human.isAttacking) {
      if (
        !this.gameService.canAttackMore(human, this.computer()!, this.table())
      )
        return;
      this.table.update((t) => [...t, { attack: cardInHand }]);
      human.hand = human.hand.filter((c) => c !== cardInHand);
      this.canEndTurn.set(false);
      setTimeout(() => this.computerDefend(), 1000);
    } else if (
      this.table().length > 0 &&
      !this.table()[this.table().length - 1].defend
    ) {
      const attackCard = this.table()[this.table().length - 1].attack;
      if (!this.gameService.canBeat(attackCard, cardInHand)) return;
      this.table.update((t) => {
        t[t.length - 1].defend = cardInHand;
        return [...t];
      });
      human.hand = human.hand.filter((c) => c !== cardInHand);
      this.canEndTurn.set(false);
      setTimeout(() => this.computerContinue(), 1000);
    }
    this.checkGameEnd();
  }

  computerDefend(): void {
    if (this.gameService.computerDefend(this.computer()!, this.table())) {
      this.canEndTurn.set(true);
    } else {
      this.handleComputerTake();
    }
    this.checkGameEnd();
  }

  computerContinue(): void {
    if (!this.table().every((pair) => pair.defend)) return;
    if (
      this.gameService.canAttackMore(
        this.computer()!,
        this.human()!,
        this.table()
      )
    ) {
      setTimeout(() => this.computerAttack(), 1000);
    } else {
      this.handleComputerEndTurn();
    }
  }

  computerAttack(): void {
    this.human.update((h) => {
      if (h) h.isAttacking = false;
      return h;
    });
    this.computer.update((c) => {
      if (c) c.isAttacking = true;
      return c;
    });
    this.gameService.computerAttack(
      this.computer()!,
      this.human()!,
      this.table()
    );
    this.canEndTurn.set(true);
    this.checkGameEnd();
  }

  takeCardsToHand(): void {
    if (!this.canEndTurn() || this.human()?.isAttacking) return;
    this.gameService.takeCards(this.human()!, this.table());
    this.switchTurnToComputer();
    this.showAction('Забрал', 'player', () => this.computerAttack());
  }

  endTurn(): void {
    if (!this.canEndTurn() || !this.human()?.isAttacking) return;
    this.gameService.endTurn(this.table());
    this.switchTurnToComputer();
    this.showAction('Отбой', 'player', () => this.computerAttack());
  }

  checkGameEnd(): void {
    const result = this.gameService.checkGameEnd(
      this.human()!,
      this.computer()!
    );
    if (!result) return;
    setTimeout(() => {
      this.gameResult.set(
        result === 'human'
          ? 'Вы победили!' + ((this.balance += this.currentBet() * 2), '')
          : 'Компьютер победил! Вы - дурак!'
      );
      if (this.balance <= 0)
        this.gameResult.update((r) => r + ' У вас закончились деньги!');
      this.showGameEndModal.set(true);
      this.disableScroll();
    }, 1000);
  }

  private showModalWithScrollLock(): void {
    this.showModal.set(true);
    this.disableScroll();
  }

  private switchTurnToComputer(): void {
    this.human.update((h) => {
      if (h) h.isAttacking = false;
      return h;
    });
    this.computer.update((c) => {
      if (c) c.isAttacking = true;
      return c;
    });
    this.canEndTurn.set(false);
    this.gameService.refillHand(this.human()!);
    this.gameService.refillHand(this.computer()!);
  }

  private showAction(
    text: string,
    type: 'player' | 'computer',
    callback: () => void
  ): void {
    if (type === 'player') {
      this.showPlayerActionLabel.set(true);
      this.playerActionText.set(text);
    } else {
      this.showComputerActionLabel.set(true);
      this.computerActionText.set(text);
    }
    setTimeout(() => {
      if (type === 'player') this.showPlayerActionLabel.set(false);
      else this.showComputerActionLabel.set(false);
      callback();
    }, 1000);
  }

  private handleComputerTake(): void {
    this.gameService.takeCards(this.computer()!, this.table());
    this.human.update((h) => {
      if (h) h.isAttacking = true;
      return h;
    });
    this.computer.update((c) => {
      if (c) c.isAttacking = false;
      return c;
    });
    this.canEndTurn.set(false);
    this.gameService.refillHand(this.human()!);
    this.gameService.refillHand(this.computer()!);
    this.showAction('Забрал', 'computer', () => {});
  }

  private handleComputerEndTurn(): void {
    this.gameService.endTurn(this.table());
    this.human.update((h) => {
      if (h) h.isAttacking = true;
      return h;
    });
    this.computer.update((c) => {
      if (c) c.isAttacking = false;
      return c;
    });
    this.canEndTurn.set(false);
    this.gameService.refillHand(this.human()!);
    this.gameService.refillHand(this.computer()!);
    this.showAction('Отбой', 'computer', this.checkGameEnd.bind(this));
  }

  private delayedComputerAttack(): void {
    setTimeout(() => this.computerAttack(), 1000);
  }

  private disableScroll(): void {
    document.body.classList.add('no-scroll');
  }

  private enableScroll(): void {
    document.body.classList.remove('no-scroll');
  }
}

/*
Изменения в GameComponent:
Убраны прямые обращения к deck, trumpSuit, discardPile через this.gameService['...'].
Используются методы сервиса: getTrumpSuit, getDeckCount, getDiscardPile, refillHand, и т.д.
Логика хода компьютера и завершения игры делегирована сервису.
Исправлены ошибки в getCardClasses и canPlayerDrag.
*/
