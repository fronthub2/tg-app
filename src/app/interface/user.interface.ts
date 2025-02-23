export interface IUser {
  id: string | number;
  firstname: string;
  lastname: string;
  age: string | number;
  email: string;
  numberPhone: string | number;
  balance: string | number;
  rules: 'admin' | 'user' | 'support';
}
