import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, Player } from '../../../../interface/durak.game.interface';

@Component({
  selector: 'app-player',
  imports: [CommonModule, DragDropModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'], // Исправлено на styleUrls
})
export class PlayerComponent {
  @Input() player!: Player; // Используем интерфейс Player
  @Output() beat = new EventEmitter<Card>(); // Используем интерфейс Card
  @Output() accept = new EventEmitter<Card>(); // Используем интерфейс Card
  @Output() pass = new EventEmitter<Card>(); // Используем интерфейс Card
  @Output() throw = new EventEmitter<Card>(); // Используем интерфейс Card

  drop(event: CdkDragDrop<Card[]>) {
    const card: Card = event.item.data; // Получаем перетаскиваемую карту

    // Проверяем, откуда была перетащена карта
    if (event.previousContainer === event.container) {
      // Если карта была перетащена внутри одной и той же колоды (например, для перестановки)
      return;
    } else {
      // Если карта была перетащена в другую колоду
      if (event.container.id === 'cdk-drop-list-accept') {
        // Логика для принятия карты
        this.accept.emit(card);
      } else if (event.container.id === 'cdk-drop-list-beat') {
        // Логика для отбивания карты
        this.beat.emit(card);
      } else if (event.container.id === 'cdk-drop-list-pass') {
        // Логика для отбой карты
        this.pass.emit(card);
      } else if (event.container.id === 'cdk-drop-list-throw') {
        // Логика для подкидывания карты
        this.throw.emit(card);
      }
    }
  }

  onBeat(card: Card) {
    this.beat.emit(card);
  }

  onAccept(card: Card) {
    this.accept.emit(card);
  }

  onPass(card: Card) {
    this.pass.emit(card);
  }

  onThrow(card: Card) {
    this.throw.emit(card);
  }
}
