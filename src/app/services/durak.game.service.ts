import { Injectable } from '@angular/core';
import { DeckSize, ICard, IPlayer } from '../interface/durak.game.interface';

@Injectable({
  providedIn: 'root',
})
export class DurakGameService {
  // Массив мастей карт (строго типизирован через as const для неизменяемости)
  private suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

  // Полный набор рангов для колоды из 36 карт (6-A)
  private fullRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

  // Укороченный набор рангов для колоды из 24 карт (9-A)
  private shortRanks = ['9', '10', 'J', 'Q', 'K', 'A'] as const;

  // Колода карт, изначально пустая
  private deck: ICard[] = [];

  // Козырная масть, определяется при инициализации колоды
  private trumpSuit!: ICard['suit'];

  // Козырная карта, выбирается случайно из колоды
  private trumpCard!: ICard;

  // Сброс (отбой), куда уходят сыгранные карты
  private discardPile: ICard[] = [];

  // Флаг, указывающий, был ли уже первый отбой в игре
  private isFirstTurnCompleted = false;

  // Конструктор вызывается при создании сервиса
  constructor() {
    // Инициализация колоды по умолчанию (36 карт) при создании сервиса
    this.initializeDeck();
  }

  // Инициализирует колоду с заданным размером (24 или 36 карт)
  initializeDeck(deckSize: DeckSize = '36'): void {
    this.deck = []; // Очищаем текущую колоду
    console.log(deckSize); // Логируем размер колоды для отладки
    // Выбираем набор рангов в зависимости от размера колоды
    const ranks = deckSize === '36' ? this.fullRanks : this.shortRanks;
    // Создаём колоду, комбинируя масти и ранги
    for (const suit of this.suits) {
      for (const rank of ranks) {
        this.deck.push({ suit, rank, value: this.fullRanks.indexOf(rank) + 6 });
      }
    }
    this.shuffleDeck(); // Перемешиваем колоду
    const randomIndex = Math.floor(Math.random() * this.deck.length); // Выбираем случайный индекс
    this.trumpCard = this.deck[randomIndex]; // Устанавливаем козырную карту
    this.trumpSuit = this.trumpCard.suit; // Устанавливаем козырную масть
    this.deck.splice(randomIndex, 1); // Удаляем козырную карту из колоды
    this.discardPile = []; // Очищаем отбой
    this.isFirstTurnCompleted = false; // Сбрасываем флаг первого отбоя
  }

  // Перемешивает колоду по алгоритму Фишера-Йетса
  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Случайный индекс от 0 до i
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]; // Меняем местами элементы
    }
  }

  // Раздаёт карты двум игрокам: по 6 карт каждому
  dealCards(): [IPlayer, IPlayer] {
    const player1 = { hand: this.deck.splice(0, 6), isAttacking: true }; // Первый игрок атакует
    const player2 = { hand: this.deck.splice(0, 6), isAttacking: false }; // Второй игрок защищается
    console.log([player1, player2])
    return [player1, player2]; // Возвращаем кортеж игроков
  }

  // Проверяет, может ли карта защиты побить карту атаки
  canBeat(attackCard: ICard, defendCard: ICard): boolean {
    if (attackCard.suit === defendCard.suit) {
      // Если масти одинаковы, сравниваем значения (ранги)
      return defendCard.value > attackCard.value;
    }
    // Если масти разные, защита возможна только козырем против не-козыря
    return (
      defendCard.suit === this.trumpSuit && attackCard.suit !== this.trumpSuit
    );
  }

  // Возвращает козырную масть
  getTrumpSuit(): ICard['suit'] {
    return this.trumpSuit;
  }

  // Возвращает копию козырной карты
  getTrumpCard(): ICard {
    return { ...this.trumpCard };
  }

  // Возвращает текущее количество карт в колоде
  getDeckCount(): number {
    return this.deck.length;
  }

  // Возвращает копию массива сброса (отбоя)
  getDiscardPile(): ICard[] {
    return [...this.discardPile];
  }

  // Извлекает верхнюю карту из колоды, если она есть
  drawCard(): ICard | undefined {
    return this.deck.shift();
  }

  // Пополняет руку игрока до максимального числа карт (по умолчанию 6)
  refillHand(player: IPlayer, maxCards: number = 6): void {
    while (player.hand.length < maxCards && this.deck.length > 0) {
      player.hand.push(this.drawCard()!); // Добавляем карту из колоды
    }
  }

  // Проверяет, может ли игрок подкинуть ещё карту на стол
  canAttackMore(
    player: IPlayer,
    opponent: IPlayer,
    table: { attack: ICard; defend?: ICard }[]
  ): boolean {
    if (table.length === 0) return true; // Если стол пуст, можно атаковать
    // Собираем ранги всех карт на столе (атака и защита)
    const tableRanks = table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    // Проверяем, есть ли в руке игрока карта с рангом, уже присутствующим на столе
    const hasMatchingRank = player.hand.some((card) =>
      tableRanks.includes(card.rank)
    );

    // До первого отбоя лимит — 3 карты, после — зависит от количества карт у оппонента
    console.log('isFirstTurn', this.isFirstTurnCompleted);
    const maxAttacks = this.isFirstTurnCompleted
      ? opponent.hand.length || player.hand.length
      : 3;
    return hasMatchingRank && table.length < maxAttacks; // Возвращаем, можно ли атаковать дальше
  }

  // Завершает ход, отправляя все карты со стола в отбой
  endTurn(table: { attack: ICard; defend?: ICard }[]): void {
    this.discardPile.push(...table.map((pair) => pair.attack)); // Добавляем карты атаки в отбой
    this.discardPile.push(...table.map((pair) => pair.defend!).filter(Boolean)); // Добавляем карты защиты
    table.length = 0; // Очищаем стол
    this.isFirstTurnCompleted = true; // Устанавливаем флаг первого отбоя
  }

  // Игрок забирает карты со стола в руку
  takeCards(player: IPlayer, table: { attack: ICard; defend?: ICard }[]): void {
    player.hand.push(...table.map((pair) => pair.attack)); // Добавляем карты атаки в руку
    player.hand.push(...table.map((pair) => pair.defend!).filter(Boolean)); // Добавляем карты защиты
    table.length = 0; // Очищаем стол
  }

  // Проверяет, закончилась ли игра (у кого-то закончились карты)
  checkGameEnd(human: IPlayer, computer: IPlayer): 'human' | 'computer' | null {
    if (human.hand.length === 0) return 'human'; // Человек выиграл
    if (computer.hand.length === 0) return 'computer'; // Компьютер выиграл
    return null; // Игра продолжается
  }

  // Логика атаки компьютера
  computerAttack(
    computer: IPlayer,
    human: IPlayer,
    table: { attack: ICard; defend?: ICard }[]
  ): void {
    // Собираем ранги карт на столе
    const tableRanks = table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    // Копируем и сортируем руку компьютера (козыри в конце)
    const handCopy = [...computer.hand].sort((a, b) => {
      const isATrump = a.suit === this.trumpSuit;
      const isBTrump = b.suit === this.trumpSuit;
      if (isATrump && !isBTrump) return 1;
      if (!isATrump && isBTrump) return -1;
      return a.value - b.value;
    });

    let attackCard: ICard | undefined;

    // Проверяем, есть ли карта с рангом, уже присутствующим на столе
    if (tableRanks.length > 0) {
      attackCard = handCopy.find((card) => tableRanks.includes(card.rank));
    }

    // Если подходящей карты нет, выбираем стратегию
    if (!attackCard) {
      if (human.hand.length < 3 && this.deck.length < 6) {
        // Если у человека мало карт и колода почти пуста, берём старшую карту
        attackCard = handCopy[handCopy.length - 1];
      } else {
        // Иначе берём не козырь или младшую карту
        attackCard =
          handCopy.find((card) => card.suit !== this.trumpSuit) || handCopy[0];
      }
    }

    // Лимит атак: до отбоя — 3, после — зависит от руки человека
    const maxAttacks = this.isFirstTurnCompleted
      ? human.hand.length || computer.hand.length
      : 3;
    if (attackCard && table.length < maxAttacks) {
      table.push({ attack: attackCard }); // Добавляем карту атаки на стол
      computer.hand = computer.hand.filter((c) => c !== attackCard); // Удаляем из руки
    }
  }

  // Логика защиты компьютера
  computerDefend(
    computer: IPlayer,
    table: { attack: ICard; defend?: ICard }[]
  ): boolean {
    if (table.length === 0 || table[table.length - 1].defend) return false; // Нечего защищать

    const attackCard = table[table.length - 1].attack; // Последняя карта атаки
    // Находим карты, которыми можно побить атаку
    const possibleDefends = computer.hand
      .filter((card) => this.canBeat(attackCard, card))
      .sort((a, b) => {
        const isATrump = a.suit === this.trumpSuit;
        const isBTrump = b.suit === this.trumpSuit;
        if (isATrump && !isBTrump) return 1; // Козыри в конец
        if (!isATrump && isBTrump) return -1;
        return a.value - b.value; // По возрастанию значения
      });

    if (possibleDefends.length > 0) {
      const defendCard = possibleDefends[0]; // Берём младшую подходящую карту
      table[table.length - 1].defend = defendCard; // Устанавливаем защиту
      computer.hand = computer.hand.filter((c) => c !== defendCard); // Удаляем из руки
      return true; // Защита удалась
    }
    return false; // Защита невозможна
  }
}
