import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/setup/setup').then((m) => m.Setup),
  },
  {
    path: '**',
    redirectTo: '',
  },
];