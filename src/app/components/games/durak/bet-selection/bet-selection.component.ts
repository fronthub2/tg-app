import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bet-selection',
  imports: [FormsModule],
  templateUrl: './bet-selection.component.html',
  styleUrl: './bet-selection.component.scss',
})
export class BetSelectionComponent {
  @Input() balance = 0;
  @Output() startGame = new EventEmitter<{
    bet: number;
    deckSize: '24' | '36';
  }>(); // Обновляем тип эмиттера
  deckSize = signal<'24' | '36'>('36');

  updateDeckSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.deckSize.set(target.value as '24' | '36');
  }
}
