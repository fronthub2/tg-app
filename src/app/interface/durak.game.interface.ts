export interface Card {
  readonly suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  readonly rank: '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number;
}

export interface Player {
  hand: Card[];
  isAttacking: boolean;
}
