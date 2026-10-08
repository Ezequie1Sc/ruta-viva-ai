import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AdventureService } from '../../core/services/adventure.service';

@Component({
  selector: 'app-adventure',
  imports: [RouterLink],
  templateUrl: './adventure.html',
  styleUrl: './adventure.scss',
})
export class Adventure {
  private readonly router = inject(Router);

  readonly adventureService =
    inject(AdventureService);

  readonly adventure =
    this.adventureService.currentAdventure;

  startAdventure(): void {
    this.router.navigate(['/exploration']);
  }
}