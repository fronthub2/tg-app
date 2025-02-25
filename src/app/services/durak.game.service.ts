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

  constructor() {
    this.initializeDeck();
  }

  initializeDeck() {
    this.deck = [];
    let value = 1;
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.deck.push({ suit, rank, value: value++ });
      }
    }
    this.shuffleDeck();
    this.trumpSuit = this.deck[this.deck.length - 1].suit;
  }

  shuffleDeck() {
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
      return (
        this.ranks.indexOf(defendCard.rank) >
        this.ranks.indexOf(attackCard.rank)
      );
    }
    return (
      defendCard.suit === this.trumpSuit && attackCard.suit !== this.trumpSuit
    );
  }
}
