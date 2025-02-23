import { Routes } from '@angular/router';
import { SignUpUserComponent } from './shared/sign-up-user/sign-up-user.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   redirectTo: '/signUp',
  // },
  {
    path: '',
    component: SignUpUserComponent,
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/board/board.component').then(
        (v) => v.BoardComponent
      ),
  },
  {
    path: 'game-slots',
    loadComponent: () =>
      import('./components/games/slots/slots.component').then(
        (c) => c.SlotsComponent
      ),
  },
  {
    path: 'game-mines',
    loadComponent: () =>
      import('./components/games/rules-mines/rules-mines.component').then(
        (c) => c.RulesMinesComponent
      ),
  },
  {
    path: 'settings-user',
    loadComponent: () =>
      import('./components/settings-user/settings-user.component').then(
        (c) => c.SettingsUserComponent
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
