import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Card, GameState, Player } from '../../../interface/durak.game.interface';
import { DurakGameService } from '../../../services/durak.game.service';
import { PlayerComponent } from './player/player.component';

@Component({
  selector: 'app-durak',
  imports: [CommonModule, PlayerComponent],
  templateUrl: './durak.component.html',
  styleUrls: ['./durak.component.scss'], // Исправлено на styleUrls
})
export class DurakComponent implements OnInit {
  private gameService = inject(DurakGameService);
  gameState!: GameState; // Используем интерфейс GameState

  ngOnInit() {
    this.gameService.gameState$.subscribe((state: GameState) => {
      this.gameState = state;
    });
  }

  startGame(bet: number) {
    this.gameService.startGame(bet);
    console.log('start');
  }

  addPlayer(player: Player) {
    // Используем интерфейс Player
    this.gameService.addPlayer(player);
  }

  shuffleCards() {
    this.gameService.shuffleCards();
  }

  beatCard(card: Card) {
    // Используем интерфейс Card
    this.gameService.beatCard(card);
  }

  acceptCard(card: Card) {
    // Используем интерфейс Card
    this.gameService.acceptCard(card);
  }

  passCard(card: Card) {
    // Используем интерфейс Card
    this.gameService.passCard(card);
  }

  throwCard(card: Card) {
    // Используем интерфейс Card
    this.gameService.throwCard(card);
  }
}
