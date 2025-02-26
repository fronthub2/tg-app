import { Injectable, OnInit } from '@angular/core';
import { Card, Player } from '../interface/durak.game.interface';

@Injectable({
  providedIn: 'root',
})
export class DurakGameService implements OnInit {
  private suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  private fullRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
  private shortRanks = ['9', '10', 'J', 'Q', 'K', 'A'] as const;
  private deck: Card[] = [];
  private trumpSuit!: Card['suit'];
  private trumpCard!: Card;
  private discardPile: Card[] = [];
  private isFirstTurnCompleted = false; // Флаг для отслеживания первого отбоя

  ngOnInit(): void {
    this.initializeDeck(); // По умолчанию 36 карт
  }

  initializeDeck(deckSize: '24' | '36' = '36'): void {
    this.deck = [];
    console.log(deckSize)
    const ranks = deckSize === '36' ? this.fullRanks : this.shortRanks;
    for (const suit of this.suits) {
      for (const rank of ranks) {
        this.deck.push({ suit, rank, value: this.fullRanks.indexOf(rank) + 6 });
      }
    }
    this.shuffleDeck();
    const randomIndex = Math.floor(Math.random() * this.deck.length);
    this.trumpCard = this.deck[randomIndex];
    this.trumpSuit = this.trumpCard.suit;
    this.discardPile = [];
    this.isFirstTurnCompleted = false; // Сбрасываем флаг при новой игре
  }

  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards(): [Player, Player] {
    const player1 = { hand: this.deck.splice(0, 6), isAttacking: true };
    const player2 = { hand: this.deck.splice(0, 6), isAttacking: false };
    return [player1, player2];
  }

  canBeat(attackCard: Card, defendCard: Card): boolean {
    if (attackCard.suit === defendCard.suit) {
      return defendCard.value > attackCard.value;
    }
    return (
      defendCard.suit === this.trumpSuit && attackCard.suit !== this.trumpSuit
    );
  }

  getTrumpSuit(): Card['suit'] {
    return this.trumpSuit;
  }

  getTrumpCard(): Card {
    return { ...this.trumpCard };
  }

  getDeckCount(): number {
    console.log('getCount', this.deck.length);
    return this.deck.length;
  }

  getDiscardPile(): Card[] {
    return [...this.discardPile];
  }

  drawCard(): Card | undefined {
    return this.deck.shift();
  }

  refillHand(player: Player, maxCards: number = 6): void {
    while (player.hand.length < maxCards && this.deck.length > 0) {
      player.hand.push(this.drawCard()!);
    }
  }

  canAttackMore(
    player: Player,
    opponent: Player,
    table: { attack: Card; defend?: Card }[]
  ): boolean {
    if (table.length === 0) return true;
    const tableRanks = table.flatMap((pair) =>
      [pair.attack.rank, pair.defend?.rank].filter(Boolean)
    );
    const hasMatchingRank = player.hand.some((card) =>
      tableRanks.includes(card.rank)
    );
    // До первого отбоя лимит 3 карты, после — зависит от количества карт соперника
    const maxAttacks = this.isFirstTurnCompleted ? opponent.hand.length : 3;
    return hasMatchingRank && table.length < maxAttacks;
  }

  endTurn(table: { attack: Card; defend?: Card }[]): void {
    this.discardPile.push(...table.map((pair) => pair.attack));
    this.discardPile.push(...table.map((pair) => pair.defend!).filter(Boolean));
    table.length = 0;
    this.isFirstTurnCompleted = true; // Устанавливаем флаг после первого отбоя
  }

  takeCards(player: Player, table: { attack: Card; defend?: Card }[]): void {
    player.hand.push(...table.map((pair) => pair.attack));
    player.hand.push(...table.map((pair) => pair.defend!).filter(Boolean));
    table.length = 0;
  }

  checkGameEnd(human: Player, computer: Player): 'human' | 'computer' | null {
    if (human.hand.length === 0) return 'human';
    if (computer.hand.length === 0) return 'computer';
    return null;
  }

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

    const maxAttacks = this.isFirstTurnCompleted ? human.hand.length : 3;
    if (attackCard && table.length < maxAttacks) {
      table.push({ attack: attackCard });
      computer.hand = computer.hand.filter((c) => c !== attackCard);
    }
  }

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
