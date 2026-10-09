import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AdventureRequest,
  AdventureType,
  Difficulty
} from '../../core/models/adventure.model';

interface AdventureTypeOption {
  value: AdventureType;
  label: string;
  description: string;
}

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  level: number;
}

@Component({
  selector: 'app-setup',
  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './setup.html',
  styleUrl: './setup.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Setup {

  private readonly router = inject(Router);

  duration = 30;
  type: AdventureType = 'nature';
  difficulty: Difficulty = 'easy';

  readonly durations: number[] = [
    15,
    30,
    45,
    60
  ];

  readonly adventureTypes: AdventureTypeOption[] = [
    {
      value: 'nature',
      label: 'Nature',
      description: 'Explore landscapes, plants, and the outdoors.'
    },
    {
      value: 'culture',
      label: 'Culture',
      description: 'Discover local stories, places, and heritage.'
    },
    {
      value: 'walk',
      label: 'Walking',
      description: 'Enjoy a refreshing walk at your own pace.'
    },
    {
      value: 'surprise',
      label: 'Surprise me',
      description: 'Let AI choose your next experience.'
    }
  ];

  readonly difficulties: DifficultyOption[] = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Relaxed exploration',
      level: 1
    },
    {
      value: 'medium',
      label: 'Moderate',
      description: 'A balanced challenge',
      level: 2
    },
    {
      value: 'hard',
      label: 'Challenging',
      description: 'For bold explorers',
      level: 3
    }
  ];

  get typeLabel(): string {
    return (
      this.adventureTypes.find(
        option => option.value === this.type
      )?.label ?? this.type
    );
  }

  get difficultyLabel(): string {
    return (
      this.difficulties.find(
        option => option.value === this.difficulty
      )?.label ?? this.difficulty
    );
  }

  selectDuration(value: number): void {
    this.duration = value;
  }

  selectType(value: AdventureType): void {
    this.type = value;
  }

  selectDifficulty(value: Difficulty): void {
    this.difficulty = value;
  }

  createAdventure(): void {
    const request: AdventureRequest = {
      duration: this.duration,
      adventure_type: this.type,
      difficulty: this.difficulty
    };

    this.router.navigate(['/loading'], {
      state: {
        request
      }
    });
  }

}