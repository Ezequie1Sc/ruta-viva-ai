
import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './home.html',
  styleUrl: './home.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {

  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

}
