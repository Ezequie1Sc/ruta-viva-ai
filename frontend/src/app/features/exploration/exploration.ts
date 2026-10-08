import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exploration',
  imports: [RouterLink],
  templateUrl: './exploration.html',
  styleUrl: './exploration.scss',
})
export class Exploration {
  missions = [
    { title: 'Observa la corteza', status: 'completed', xp: 25 },
    { title: 'Escucha tu entorno', status: 'active', xp: 25 },
    { title: 'Descubre algo nuevo', status: 'pending', xp: 25 },
  ];
}