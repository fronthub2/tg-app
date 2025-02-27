import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICard, IPlayer } from '../../../../interface/durak.game.interface';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() human!: IPlayer | undefined;
  @Input() deckCount = 0;
  @Input() trumpCard!: ICard;
  @Input() discardPile: ICard[] = [];
  @Input() canEndTurn = false;
  @Output() endTurn = new EventEmitter<void>();
  @Output() takeCards = new EventEmitter<void>();

  getSuitSymbol(suit: ICard['suit']): string {
    return { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' }[suit] || '';
  }

  getCardClasses(card: ICard): string[] {
    return ['card', ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'];
  }
}
