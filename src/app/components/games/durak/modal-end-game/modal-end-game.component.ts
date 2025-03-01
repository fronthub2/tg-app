import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-end-game',
  imports: [],
  templateUrl: './modal-end-game.component.html',
  styleUrl: './modal-end-game.component.scss',
})
export class ModalEndGameComponent {
  @Input() text!: string;
}
