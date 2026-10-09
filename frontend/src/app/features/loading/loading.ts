import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AdventureService } from '../../core/services/adventure.service';
import {
  AdventureRequest,
  AdventureType,
  Difficulty
} from '../../core/models/adventure.model';

@Component({
  selector: 'app-loading',
  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './loading.html',
  styleUrl: './loading.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Loading implements OnInit {
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly destroyRef = inject(DestroyRef);

  request: AdventureRequest | null = null;

  readonly error = signal(false);

  readonly currentMessage = signal(
    'Imagining the possibilities for your journey...'
  );

  private readonly messages: string[] = [
    'Imagining the possibilities for your journey...',
    'Exploring the best route for you...',
    'Designing a memorable experience...',
    'Preparing your next discovery...',
    'Almost ready to begin...'
  ];

  private messageIndex = 0;

  ngOnInit(): void {
    const request = history.state.request as
      | AdventureRequest
      | undefined;

    if (!request) {
      this.router.navigate(['/setup']);
      return;
    }

    this.request = request;

    this.startMessages();
    this.generateAdventure(request);
  }

  private startMessages(): void {
    interval(2800)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.error()) {
          return;
        }

        this.messageIndex =
          (this.messageIndex + 1) % this.messages.length;

        this.currentMessage.set(
          this.messages[this.messageIndex]
        );
      });
  }

  private generateAdventure(
    request: AdventureRequest
  ): void {
    this.error.set(false);

    this.adventureService
      .generateAdventure(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/adventure']);
        },
        error: (error: unknown) => {
          console.error('Error generating adventure:', error);
          this.error.set(true);
        }
      });
  }

  retry(): void {
    if (!this.request) {
      this.router.navigate(['/setup']);
      return;
    }

    this.messageIndex = 0;
    this.currentMessage.set(this.messages[0]);
    this.generateAdventure(this.request);
  }

  getTypeLabel(type: AdventureType): string {
    const labels: Record<AdventureType, string> = {
      nature: 'Nature',
      culture: 'Culture',
      walk: 'Walking',
      surprise: 'Surprise'
    };

    return labels[type];
  }

  getDifficultyLabel(
    difficulty: Difficulty
  ): string {
    const labels: Record<Difficulty, string> = {
      easy: 'Easy',
      medium: 'Moderate',
      hard: 'Challenging'
    };

    return labels[difficulty];
  }
}