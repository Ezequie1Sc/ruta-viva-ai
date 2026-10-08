import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  imports: [RouterLink],
  templateUrl: './setup.html',
  styleUrl: './setup.scss',
})
export class Setup {
  duration = 30;
  type = 'nature';
  difficulty = 'easy';

  constructor(private readonly router: Router) {}

  selectDuration(value: number): void {
    this.duration = value;
  }

  selectType(value: string): void {
    this.type = value;
  }

  selectDifficulty(value: string): void {
    this.difficulty = value;
  }

  createAdventure(): void {
    this.router.navigate(['/loading']);
  }
}