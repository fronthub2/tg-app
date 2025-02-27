export interface ICard {
  readonly suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  readonly rank: '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number;
}

export interface IPlayer {
  hand: ICard[];
  isAttacking: boolean;
}

export type DeckSize = '24' | '36';