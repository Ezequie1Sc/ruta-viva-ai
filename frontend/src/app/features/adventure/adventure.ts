import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-adventure',
  imports: [RouterLink],
  templateUrl: './adventure.html',
  styleUrl: './adventure.scss',
})
export class Adventure {
  missions = [
    {
      title: 'Observa la corteza',
      description: 'Encuentra un árbol y observa sus detalles.',
      xp: 25,
    },
    {
      title: 'Escucha tu entorno',
      description: 'Identifica tres sonidos naturales.',
      xp: 25,
    },
    {
      title: 'Descubre algo nuevo',
      description: 'Busca algo que nunca hayas notado antes.',
      xp: 25,
    },
  ];
}