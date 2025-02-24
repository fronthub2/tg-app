import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Card, GameState, Player } from '../interface/durak.game.interface';

@Injectable({
  providedIn: 'root',
})
export class DurakGameService {
  private players: Player[] = []; // Массив игроков
  private currentPlayerIndex: number = 0;
  private bet: number = 0;

  public gameState$ = new Subject<GameState>(); // Используем интерфейс GameState

  constructor() {}

  startGame(bet: number) {
    this.bet = bet;
    this.players = []; // Сброс игроков
    this.currentPlayerIndex = 0;

    // Пример добавления игроков
    this.players.push({ name: 'Игрок 1', cards: [] });
    this.players.push({ name: 'Игрок 2', cards: [] });

    // Раздаем по 6 карт каждому игроку
    const cardsPerPlayer = 6; // Количество карт для раздачи
    this.players.forEach((player) => {
      player.cards = this.dealCards(cardsPerPlayer); // Передаем количество карт
    });

    this.notifyGameState();
  }

  private suits = ['Черви', 'Бубны', 'Трефы', 'Пики'];
  private ranks = ['6', '7', '8', '9', '10', 'Валет', 'Дама', 'Король', 'Туз'];

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({ id: deck.length + 1, name: `${rank} ${suit}` });
      }
    }
    return deck;
  }

  private shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]; // Перемешивание
    }
    return deck;
  }

  dealCards(numCards: number): Card[] {
    const deck = this.shuffleDeck(this.createDeck()); // Создаем и перемешиваем колоду
    const dealtCards: Card[] = [];

    for (let i = 0; i < numCards; i++) {
      if (deck.length > 0) {
        dealtCards.push(deck.pop()!); // Берем верхнюю карту из колоды
      }
    }

    return dealtCards;
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.notifyGameState();
  }

  // Метод для отбивания карт
  beatCard(card: Card) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.cards = currentPlayer.cards.filter((c) => c.id !== card.id);
    this.nextPlayer();
  }

  // Метод для тусовки карт
  shuffleCards() {
    this.players.forEach((player) => {
      player.cards.sort(() => Math.random() - 0.5); // Перемешиваем карты игрока
    });
    this.notifyGameState(); // Уведомляем об изменении состояния игры
  }

  // Метод для принятия карт
  acceptCard(card: Card) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.cards.push(card);
    this.nextPlayer();
  }

  // Метод для отбой карт
  passCard(card: Card) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.cards = currentPlayer.cards.filter((c) => c.id !== card.id);
    this.nextPlayer();
  }

  // Метод для подкидывания карт
  throwCard(card: Card) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    currentPlayer.cards.push(card);
    this.nextPlayer();
  }

  private nextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
    this.notifyGameState();
  }

  notifyGameState() {
    this.gameState$.next({
      players: this.players,
      currentPlayer: this.players[this.currentPlayerIndex],
      bet: this.bet,
    });
  }
}
