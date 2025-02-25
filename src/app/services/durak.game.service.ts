import { Injectable } from '@angular/core';
import { Card, Player } from '../interface/durak.game.interface';

@Injectable({
  providedIn: 'root',
})
export class DurakGameService {
  private suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  private ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
  private deck: Card[] = [];
  private trumpSuit!: Card['suit'];
  private discardPile: Card[] = [];

  constructor() {
    this.initializeDeck();
  }

  // Инициализация колоды
  initializeDeck(): void {
    this.deck = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.deck.push({ suit, rank, value: this.ranks.indexOf(rank) + 6 });
      }
    }
    this.shuffleDeck();
    this.trumpSuit = this.deck[this.deck.length - 1].suit;
    this.discardPile = [];
  }

  // Тасование колоды
  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Раздача карт
  dealCards(): [Player, Player] {
    const player1 = { hand: this.deck.splice(0, 6), isAttacking: true };
    const player2 = { hand: this.deck.splice(0, 6), isAttacking: false };
    return [player1, player2];
  }

  // Проверка, может ли карта побить другую
  canBeat(attackCard: Card, defendCard: Card): boolean {
    if (attackCard.suit === defendCard.suit) {
      return defendCard.value > attackCard.value;
    }
    return (
      defendCard.suit === this.trumpSuit && attackCard.suit !== this.trumpSuit
    );
  }

  // Геттеры для доступа к приватным свойствам
  getTrumpSuit(): Card['suit'] {
    return this.trumpSuit;
  }

  getDeckCount(): number {
    return this.deck.length;
  }

  getDiscardPile(): Card[] {
    return [...this.discardPile];
  }

  // Извлечение карты из колоды
  drawCard(): Card | undefined {
    return this.deck.shift();
  }

  // Пополнение руки игрока
  refillHand(player: Player, maxCards: number = 6): void {
    while (player.hand.length < maxCards && this.deck.length > 0) {
      player.hand.push(this.drawCard()!);
    }
  }

  // Проверка, можно ли атаковать ещё
  // canAttackMore(
  //   player: Player,
  //   table: { attack: Card; defend?: Card }[]
  // ): boolean {
  //   if (table.length === 0) return true;
  //   const tableRanks = table.flatMap((pair) =>
  //     [pair.attack.rank, pair.defend?.rank].filter(Boolean)
  //   );
  //   return player.hand.some((card) => tableRanks.includes(card.rank));
  // }
  canAttackMore(
    player: Player,
    opponent: Player,
    table: { attack: Card; defend?: Card }[]
  ): boolean {
    if (table.length === 0) return true;
    const tableRanks = table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    return (
      player.hand.some((card) => tableRanks.includes(card.rank)) &&
      table.length < opponent.hand.length
    );
  }

  // Завершение хода (отбой)
  endTurn(table: { attack: Card; defend?: Card }[]): void {
    this.discardPile.push(...table.map((pair) => pair.attack));
    this.discardPile.push(...table.map((pair) => pair.defend!).filter(Boolean));
    table.length = 0; // Очищаем стол
  }

  // Взятие карт в руку
  takeCards(player: Player, table: { attack: Card; defend?: Card }[]): void {
    player.hand.push(...table.map((pair) => pair.attack));
    player.hand.push(...table.map((pair) => pair.defend!).filter(Boolean));
    table.length = 0; // Очищаем стол
  }

  // Проверка окончания игры
  checkGameEnd(human: Player, computer: Player): 'human' | 'computer' | null {
    if (human.hand.length === 0) return 'human';
    if (computer.hand.length === 0) return 'computer';
    return null;
  }

  // Логика атаки компьютера
  computerAttack(
    computer: Player,
    human: Player,
    table: { attack: Card; defend?: Card }[]
  ): void {
    const tableRanks = table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    const handCopy = [...computer.hand].sort((a, b) => {
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
      if (human.hand.length < 3 && this.deck.length < 6) {
        attackCard = handCopy[handCopy.length - 1];
      } else {
        attackCard =
          handCopy.find((card) => card.suit !== this.trumpSuit) || handCopy[0];
      }
    }

    if (attackCard && table.length < human.hand.length) {
      table.push({ attack: attackCard });
      computer.hand = computer.hand.filter((c) => c !== attackCard);
    }
  }

  // Логика защиты компьютера
  computerDefend(
    computer: Player,
    table: { attack: Card; defend?: Card }[]
  ): boolean {
    if (table.length === 0 || table[table.length - 1].defend) return false;

    const attackCard = table[table.length - 1].attack;
    const possibleDefends = computer.hand
      .filter((card) => this.canBeat(attackCard, card))
      .sort((a, b) => {
        const isATrump = a.suit === this.trumpSuit;
        const isBTrump = b.suit === this.trumpSuit;
        if (isATrump && !isBTrump) return 1;
        if (!isATrump && isBTrump) return -1;
        return a.value - b.value;
      });

    if (possibleDefends.length > 0) {
      const defendCard = possibleDefends[0];
      table[table.length - 1].defend = defendCard;
      computer.hand = computer.hand.filter((c) => c !== defendCard);
      return true;
    }
    return false;
  }

  /*
  Применённые улучшения:
  Инкапсуляция: Добавлены геттеры (getTrumpSuit, getDeckCount, getDiscardPile) и метод drawCard.
  Логика value: Теперь value основано на индексе ранга в ranks (от 6 до 14), что ближе к традиционной логике "Дурака".
  Расширение функционала: Добавлен refillHand для пополнения руки.
  Типизация: Применена строгая типизация, хотя интерфейсы пока оставим как есть (их можно обновить позже).
  Перенесённая логика:
  endTurn, takeCards, checkGameEnd, computerAttack, computerDefend, canAttackMore перенесены из GameComponent.
  */
}
