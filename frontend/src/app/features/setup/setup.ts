import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  AdventureRequest,
  AdventureType,
  Difficulty,
} from '../../core/models/adventure.model';

@Component({
  selector: 'app-setup',
  imports: [RouterLink],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  private readonly router = inject(Router);

  duration = 30;
  type: AdventureType = 'nature';
  difficulty: Difficulty = 'easy';

  selectDuration(value: number): void {
    this.duration = value;

    console.log('Duración seleccionada:', this.duration);
  }

  selectType(value: AdventureType): void {
    this.type = value;

    console.log('Tipo seleccionado:', this.type);
  }

  selectDifficulty(value: Difficulty): void {
    this.difficulty = value;

    console.log('Dificultad seleccionada:', this.difficulty);
  }

  createAdventure(): void {
    const request: AdventureRequest = {
      duration: this.duration,
      adventure_type: this.type,
      difficulty: this.difficulty,
    };

    console.log('Enviando aventura:', request);

    this.router.navigate(['/loading'], {
      state: {
        request,
      },
    });
  }
}