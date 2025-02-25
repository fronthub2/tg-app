export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number;
}

export interface Player {
  hand: Card[];
  isAttacking: boolean;
}
