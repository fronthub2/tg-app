import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import {
  DeckSize,
  ICard,
  IPlayer,
} from '../../../../interface/durak.game.interface';
import { IUser } from '../../../../interface/user.interface';
import { DurakGameService } from '../../../../services/durak.game.service';
import { UserService } from '../../../../services/user.service';
import { BetSelectionComponent } from '../bet-selection/bet-selection.component';
import { PlayerCardsComponent } from '../player-cards/player-cards.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-game',
  // Импорты необходимых модулей и компонентов для работы игры
  imports: [
    CommonModule,
    FormsModule,
    PlayerCardsComponent,
    SidebarComponent,
    BetSelectionComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  // Анимации для карт: появление и уход с игрового стола
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
export class GameComponent implements OnInit, OnDestroy {
  // Инъекция сервисов для управления игрой и пользователем
  private gameService = inject(DurakGameService);
  private userService = inject(UserService);
  private subscription = new Subscription(); // Для управления подписками
  user!: IUser; // Информация о пользователе

  // Реактивные сигналы для состояния игры
  human = signal<IPlayer | undefined>(undefined); // Игрок-человек
  computer = signal<IPlayer | undefined>(undefined); // Компьютерный оппонент
  table = signal<{ attack: ICard; defend?: ICard }[]>([]); // Карты на столе
  gameStarted = signal(false); // Флаг начала игры
  gameResult = signal(''); // Результат игры
  canEndTurn = signal(false); // Возможность завершить ход
  balance: number = 0; // Баланс игрока
  currentBet = signal(0); // Текущая ставка
  showModal = signal(false); // Показ модального окна для пополнения баланса
  isDragging = signal(false); // Флаг перетаскивания карты
  isDraggingOverTable = signal(false); // Флаг перетаскивания над столом
  showPlayerActionLabel = signal(false); // Показ метки действия игрока
  showComputerActionLabel = signal(false); // Показ метки действия компьютера
  showGameEndModal = signal(false); // Показ модального окна окончания игры

  // Инициализация компонента
  ngOnInit(): void {
    // Подписка на получение информации о пользователе
    this.subscription.add(
      this.userService
        .getUserInfo()
        .pipe(tap((user) => (this.user = user)))
        .subscribe()
    );
    this.balance = Number(this.user.balance); // Установка начального баланса
  }

  // Очистка подписок при уничтожении компонента
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Получение символа масти карты
  getSuitSymbol(suit: ICard['suit']): string {
    return (
      { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' }[suit] || ''
    );
  }

  // Определение классов для стилизации карты
  getCardClasses(card: ICard): string[] {
    return [
      'card',
      ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black',
    ];
  }

  // Получение оставшихся карт в колоде
  getDeckCount() {
    return this.gameService.getDeckCount();
  }

  // Получение козырной карты
  getTrumpCard() {
    return this.gameService.getTrumpCard();
  }

  // Получение сброшенных карт
  getDiscardPile() {
    return this.gameService.getDiscardPile();
  }

  // Начало игры с указанной ставкой и размером колоды
  startGameWithBet({
    bet,
    deckSize,
  }: {
    bet: number;
    deckSize: DeckSize;
  }): void {
    this.currentBet.set(bet);
    if (this.balance < bet) return this.showModalWithScrollLock(); // Проверка баланса
    this.balance -= bet; // Списание ставки
    this.gameService.initializeDeck(deckSize); // Инициализация колоды
    const [human, computer] = this.gameService.dealCards(); // Раздача карт
    this.human.set(human);
    this.computer.set(computer);
    this.table.set([]);
    this.gameStarted.set(true);
    this.showGameEndModal.set(false);
    this.gameResult.set('');
    this.canEndTurn.set(false);
    if (!human.isAttacking) this.delayedComputerAttack(); // Компьютер начинает, если игрок не атакует
  }

  // Пополнение баланса
  topUpBalance(amount: number): void {
    this.balance += amount;
    this.closeModal();
    if (this.balance >= this.currentBet())
      this.startGameWithBet({ bet: this.currentBet(), deckSize: '36' }); // Перезапуск игры с дефолтной колодой
  }

  // Закрытие модального окна
  closeModal(): void {
    this.showModal.set(false);
    this.enableScroll();
    this.currentBet.set(0);
  }

  // Закрытие модального окна при клике на фон
  closeModalOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  // Сброс игры
  resetGame(): void {
    this.gameStarted.set(false);
    this.showGameEndModal.set(false);
    this.enableScroll();
    this.gameResult.set('');
    this.currentBet.set(0);
    this.showPlayerActionLabel.set(false);
    this.showComputerActionLabel.set(false);
  }

  // Закрытие модального окна окончания игры при клике на фон
  closeGameEndModalOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.resetGame();
  }

  // Выход из игры
  exitGame(): void {
    this.gameStarted.set(false);
    this.showGameEndModal.set(false);
    this.gameResult.set('');
    this.table.set([]);
    this.canEndTurn.set(false);
  }

  // Проверка возможности перетаскивания карты игроком
  canPlayerDrag(): boolean {
    const human = this.human();
    return human
      ? human.isAttacking ||
          (this.table().length > 0 &&
            !this.table()[this.table().length - 1].defend)
      : false;
  }

  // Начало перетаскивания карты
  onDragStart(event: DragEvent, card: ICard): void {
    if (!this.canPlayerDrag()) return event.preventDefault();
    this.isDragging.set(true);
    event.dataTransfer!.setData('text/plain', JSON.stringify(card));
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
    event.dataTransfer!.setDragImage(target, 40, 60);
  }

  // Завершение перетаскивания
  onDragEnd(event: DragEvent): void {
    this.isDragging.set(false);
    this.isDraggingOverTable.set(false);
    (event.target as HTMLElement).style.opacity = '1';
  }

  // Обработка перетаскивания над столом
  onDragOverTable(event: DragEvent): void {
    if (this.canPlayerDrag()) event.preventDefault();
  }

  onDragEnterTable(event: DragEvent): void {
    if (this.canPlayerDrag()) this.isDraggingOverTable.set(true);
  }

  onDragLeaveTable(event: DragEvent): void {
    this.isDraggingOverTable.set(false);
  }

  // Сброс карты на стол
  onDropTable(event: DragEvent): void {
    if (!this.canPlayerDrag()) return;
    event.preventDefault();
    this.isDragging.set(false);
    this.isDraggingOverTable.set(false);
    const cardData = event.dataTransfer!.getData('text/plain');
    if (cardData) this.playCard(JSON.parse(cardData));
  }

  // Ход игрока с картой
  playCard(card: ICard): void {
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
      setTimeout(() => this.computerDefend(), 1000); // Компьютер защищается
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
      setTimeout(() => this.computerContinue(), 1000); // Компьютер продолжает
    }
    this.checkGameEnd();
  }

  // Защита компьютера
  computerDefend(): void {
    if (this.gameService.computerDefend(this.computer()!, this.table())) {
      this.canEndTurn.set(true);
    } else {
      this.handleComputerTake(); // Компьютер забирает карты
    }
    this.checkGameEnd();
  }

  // Продолжение хода компьютера
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
      this.handleComputerEndTurn(); // Компьютер завершает ход
    }
  }

  // Атака компьютера
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

  // Игрок забирает карты
  takeCardsToHand(): void {
    if (!this.canEndTurn() || this.human()?.isAttacking) return;
    this.gameService.takeCards(this.human()!, this.table());
    this.switchTurnToComputer();
    this.showAction('Забрал', 'player', () => this.computerAttack());
  }

  // Завершение хода игрока
  endTurn(): void {
    if (!this.canEndTurn() || !this.human()?.isAttacking) return;
    this.gameService.endTurn(this.table());
    this.switchTurnToComputer();
    this.showAction('Отбой', 'player', () => this.computerAttack());
  }

  // Проверка окончания игры
  checkGameEnd(): void {
    const result = this.gameService.checkGameEnd(
      this.human()!,
      this.computer()!
    );
    if (!result) return;
    setTimeout(() => {
      this.gameResult.set(
        result === 'human'
          ? 'Вы победили!' + ((this.user.balance += this.currentBet() * 2), '')
          : 'Вы проиграли!'
      );
      if (this.balance <= 0) {
        this.gameResult.update((r) => r + ' Пополните кошелек');
        this.showGameEndModal.set(true);
        this.disableScroll();
      }
    }, 1000);
  }

  private resultWin() {
    this.user.balance += this.currentBet() * 2;
    this.user.games += 1;
    this.user.earnings += 1;
    this.user.wins += 1;
    this.userService.updateUserInfo(this.user);
  }

  // Показ модального окна с блокировкой прокрутки
  private showModalWithScrollLock(): void {
    this.showModal.set(true);
    this.disableScroll();
  }

  // Переключение хода на компьютер
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

  // Показ действия игрока или компьютера
  private showAction(
    text: string,
    type: 'player' | 'computer',
    callback: () => void
  ): void {
    if (type === 'player') {
      this.showPlayerActionLabel.set(true);
    } else {
      this.showComputerActionLabel.set(true);
    }
    setTimeout(() => {
      if (type === 'player') this.showPlayerActionLabel.set(false);
      else this.showComputerActionLabel.set(false);
      callback();
    }, 1000);
  }

  // Обработка взятия карт компьютером
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

  // Завершение хода компьютера
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

  // Задержка атаки компьютера
  private delayedComputerAttack(): void {
    setTimeout(() => this.computerAttack(), 1000);
  }

  // Блокировка прокрутки страницы
  private disableScroll(): void {
    document.body.classList.add('no-scroll');
  }

  // Разблокировка прокрутки страницы
  private enableScroll(): void {
    document.body.classList.remove('no-scroll');
  }
}
