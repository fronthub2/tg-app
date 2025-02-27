export interface IUser {
  id: string | number;
  firstname: string;
  games: number;
  wins: number;
  earnings: number;
  balance: number;
  rules: 'admin' | 'user' | 'support';
}

export const testUser = {
  "id": "asds",
  "firstname": "ad",
  "games": "33",
  "wins": "12",
  "earnings": "11",
  "balance": "112",
  "rules": "user",
};
