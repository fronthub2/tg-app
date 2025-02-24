import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/profile',
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
    loadComponent: () =>
      import('./components/games/mines/mines.component').then(
        (c) => c.MinesComponent
      ),
  },
  {
    path: 'board-games/game-durak',
    loadComponent: () =>
      import('./components/games/durak/durak.component').then(
        (c) => c.DurakComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/settings-user/settings-user.component').then(
        (c) => c.SettingsUserComponent
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./shared/sign-up-user/sign-up-user.component').then(
        (c) => c.SignUpUserComponent
      ),
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
