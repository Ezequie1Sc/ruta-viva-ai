import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AdventureService } from '../../core/services/adventure.service';
import {
  AdventureRequest,
  AdventureType,
  Difficulty,
} from '../../core/models/adventure.model';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  private readonly router = inject(Router);
  private readonly adventureService =
    inject(AdventureService);

  request: AdventureRequest | null = null;
  error = false;

  ngOnInit(): void {
    const request = history.state.request as
      | AdventureRequest
      | undefined;

    if (!request) {
      this.router.navigate(['/setup']);
      return;
    }

    this.request = request;

    this.generateAdventure(request);
  }

  private generateAdventure(
    request: AdventureRequest,
  ): void {
    this.adventureService
      .generateAdventure(request)
      .subscribe({
        next: () => {
          this.router.navigate(['/adventure']);
        },
        error: (error) => {
          console.error(
            'Error generando aventura:',
            error,
          );

          this.error = true;
        },
      });
  }

  retry(): void {
    this.router.navigate(['/setup']);
  }

  getTypeLabel(type: AdventureType): string {
    const labels: Record<AdventureType, string> = {
      nature: 'Naturaleza',
      culture: 'Cultura',
      walk: 'Caminata',
      surprise: 'Sorpresa',
    };

    return labels[type];
  }

  getDifficultyLabel(
    difficulty: Difficulty,
  ): string {
    const labels: Record<Difficulty, string> = {
      easy: 'Fácil',
      medium: 'Media',
      hard: 'Difícil',
    };

    return labels[difficulty];
  }
}