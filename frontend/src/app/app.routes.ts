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
    path: 'loading',
    loadComponent: () =>
      import('./features/loading/loading').then((m) => m.Loading),
  },
  {
    path: 'adventure',
    loadComponent: () =>
      import('./features/adventure/adventure').then((m) => m.Adventure),
  },
  {
    path: 'exploration',
    loadComponent: () =>
      import('./features/exploration/exploration').then(
        (m) => m.Exploration,
      ),
  },
  {
    path: 'result',
    loadComponent: () =>
      import('./features/result/result').then((m) => m.Result),
  },
  {
    path: 'badges',
    loadComponent: () =>
      import('./features/badges/badges').then((m) => m.Badges),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/history').then((m) => m.History),
  },
  {
    path: '**',
    redirectTo: '',
  },
];