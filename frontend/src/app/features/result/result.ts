import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface AdventureResultState {
  xp?: number;
  distance?: number;
  elapsedSeconds?: number;
}

@Component({
  selector: 'app-result',
  imports: [RouterLink],
  templateUrl: './result.html',
  styleUrl: './result.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  xp = 0;
  distanceMeters = 0;
  elapsedSeconds = 0;

  readonly confetti = Array.from({ length: 42 }, (_, i) => {
    const colors = [
      '#b8ff17',
      '#7baa57',
      '#d8c57a',
      '#ffffff',
      '#9fc97a',
      '#dcefc8',
    ];

    return {
      x: `${((i * 19.4) % 100).toFixed(2)}%`,
      delay: `${((i * 0.055) % 1.15).toFixed(2)}s`,
      duration: `${(2.6 + (i % 5) * 0.28).toFixed(2)}s`,
      drift: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 6) * 14)}px`,
      rotation: `${280 + (i % 5) * 120}deg`,
      color: colors[i % colors.length],
    };
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const state = history.state as AdventureResultState;

    this.xp = this.safeNumber(state.xp);
    this.distanceMeters = this.safeNumber(state.distance);
    this.elapsedSeconds = this.safeNumber(state.elapsedSeconds);
  }

  private safeNumber(value: unknown): number {
    return typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0
      ? value
      : 0;
  }

  get formattedDistance(): string {
    if (this.distanceMeters < 1000) {
      return `${Math.round(this.distanceMeters)} m`;
    }

    return `${(this.distanceMeters / 1000).toFixed(2)} km`;
  }

  get formattedTime(): string {
    const total = Math.floor(this.elapsedSeconds);

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  }
}