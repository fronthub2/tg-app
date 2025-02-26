import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, Player } from '../../../../interface/durak.game.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() human!: Player | undefined;
  @Input() deckCount = 0;
  @Input() trumpCard!: Card;
  @Input() discardPile: Card[] = [];
  @Input() canEndTurn = false;
  @Output() endTurn = new EventEmitter<void>();
  @Output() takeCards = new EventEmitter<void>();

  getSuitSymbol(suit: Card['suit']): string {
    return { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' }[suit] || '';
  }

  getCardClasses(card: Card): string[] {
    return ['card', ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'];
  }
}
