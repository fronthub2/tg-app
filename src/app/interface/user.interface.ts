export interface IUser {
  id: string | number;
  firstname: string;
  games: string | number;
  wins: string | number;
  earnings: string | number;
  balance: string | number;
  rules: 'admin' | 'user' | 'support';
}

export const testUser: IUser = {
  "id": "asds",
  "firstname": "ad",
  "games": "33",
  "wins": "12",
  "earnings": "11",
  "balance": "112",
  "rules": "user",
};
