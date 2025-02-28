import { animate, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICard, IPlayer } from '../../../../interface/durak.game.interface';

@Component({
  selector: 'app-player-cards',
  imports: [NgClass],
  templateUrl: './player-cards.component.html',
  styleUrl: './player-cards.component.scss',
  animations: [
    trigger('cardAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })
        ),
      ]),
    ]),
  ],
})
export class PlayerCardsComponent {
  @Input() player!: IPlayer;
  @Input() isComputer = false;
  @Output() dragStart = new EventEmitter<{ event: DragEvent; card: ICard }>(); // Обновляем тип эмиттера
  @Output() dragEnd = new EventEmitter<DragEvent>();

  get canDrag(): boolean {
    return (
      !this.isComputer &&
      (this.player.isAttacking || this.player.hand.length > 0)
    );
  }

  getSuitSymbol(suit: ICard['suit']): string {
    return (
      { hearts: '♥️', diamonds: '♦️', clubs: '♣️', spades: '♠️' }[suit] || ''
    );
  }

  getCardClasses(card: ICard): string[] {
    return [
      'card',
      ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black',
    ];
  }
}
