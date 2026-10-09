
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-badges',
  imports: [RouterLink],
  templateUrl: './badges.html',
  styleUrl: './badges.scss',
})
export class Badges {

  badges = [
    {
      name: 'Primer Paso',
      file: '01-primer-paso.svg',
      progress: '1 aventura',
      unlocked: true,
    },
    {
      name: 'Caminante',
      file: '02-caminante.svg',
      progress: '2.4 / 5 km',
      unlocked: false,
    },
    {
      name: 'Explorador',
      file: '03-explorador.svg',
      progress: '1 / 5',
      unlocked: false,
    },
    {
      name: 'Ojo Curioso',
      file: '04-ojo-curioso.svg',
      progress: '3 / 10',
      unlocked: false,
    },
    {
      name: 'Descubridor',
      file: '05-descubridor.svg',
      progress: '2 / 10',
      unlocked: false,
    },
    {
      name: 'Amante de la Naturaleza',
      file: '06-amante-naturaleza.svg',
      progress: '1 / 3',
      unlocked: false,
    },
    {
      name: 'Explorador Cultural',
      file: '07-explorador-cultural.svg',
      progress: '0 / 3',
      unlocked: false,
    },
    {
      name: 'Cazador de Atardeceres',
      file: '08-cazador-atardeceres.svg',
      progress: '0 / 1',
      unlocked: false,
    },
    {
      name: 'Noctámbulo',
      file: '09-noctambulo.svg',
      progress: '0 / 1',
      unlocked: false,
    },
    {
      name: 'Gran Explorador',
      file: '10-gran-explorador.svg',
      progress: '0 / 20',
      unlocked: false,
    },
    {
      name: 'Rutas Históricas',
      file: '11-rutas-historicas.svg',
      progress: '0 / 1',
      unlocked: false,
    },
    {
      name: 'Cerca del Mar',
      file: '12-cerca-del-mar.svg',
      progress: '0 / 1',
      unlocked: false,
    },
    {
      name: 'Bajo las Estrellas',
      file: '13-bajo-las-estrellas.svg',
      progress: '0 / 1',
      unlocked: false,
    },
    {
      name: 'Campeche',
      file: '14-campeche.svg',
      progress: '0 / 1',
      unlocked: false,
    },
  ];

}
