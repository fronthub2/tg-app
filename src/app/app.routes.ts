import { Routes } from '@angular/router';
import { minesGuard } from './guards/mines.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/profile',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
  },
  {
    path: 'board-games',
    loadComponent: () =>
      import('./components/board-games/board-games.component').then(
        (c) => c.BoardGamesComponent
      ),
  },
  {
    path: 'board-games/game-mines',
    loadComponent: () =>
      import('./components/games/rules-mines/rules-mines.component').then(
        (c) => c.RulesMinesComponent
      ),
  },
  {
    path: 'board-games/game-mines/start-mines',
    canActivate: [minesGuard],
    loadComponent: () =>
      import('./components/games/mines/mines.component').then(
        (c) => c.MinesComponent
      ),
  },
  {
    path: 'board-games/game-durak',
    loadComponent: () =>
      import('./components/games/durak/game/game.component').then(
        (c) => c.GameComponent
      ),
  },
  {
    path: 'cash-in',
    loadComponent: () =>
      import('./components/cash-in/cash-in.component').then(
        (c) => c.CashInComponent
      ),
  },
  {
    path: 'profile/cash-in',
    redirectTo: '/cash-in',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/not-found-page/not-found-page.component').then(
        (c) => c.NotFoundPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
