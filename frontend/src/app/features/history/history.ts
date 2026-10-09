
import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  AdventureService
} from '../../core/services/adventure.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class History {

  private readonly adventureService =
    inject(AdventureService);

  readonly currentAdventure =
    this.adventureService.currentAdventure;

}
