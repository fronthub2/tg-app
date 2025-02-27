import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeckSize } from '../../../../interface/durak.game.interface';

@Component({
  selector: 'app-bet-selection',
  imports: [FormsModule],
  templateUrl: './bet-selection.component.html',
  styleUrl: './bet-selection.component.scss',
})
export class BetSelectionComponent {
  @Input() balance: string | number = 0;
  @Output() startGame = new EventEmitter<{
    bet: number;
    deckSize: DeckSize;
  }>(); // Обновляем тип эмиттера

  deckSize: DeckSize = '36';

  updateDeckSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    // this.deckSize.set(target.value as '24' | '36');
    console.log('event', event)
  }
}
