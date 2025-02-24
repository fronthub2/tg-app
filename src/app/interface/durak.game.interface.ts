export interface Card {
  id: number; // или string, в зависимости от вашей реализации
  name: string; // Название карты
}

export interface Player {
  name: string; // Имя игрока
  cards: Card[]; // Массив карт игрока
}

export interface GameState {
  players: Player[]; // Массив игроков
  currentPlayer: Player; // Текущий игрок
  bet: number; // Ставка
}
