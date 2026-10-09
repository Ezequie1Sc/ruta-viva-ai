import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  Adventure,
  AdventureRequest,
} from '../models/adventure.model';

@Injectable({
  providedIn: 'root',
})
export class AdventureService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://ruta-viva-ai-backend.onrender.com/api';

  readonly currentAdventure = signal<Adventure | null>(null);

  generateAdventure(
    request: AdventureRequest,
  ): Observable<Adventure> {
    return this.http
      .post<Adventure>(
        `${this.apiUrl}/adventures/generate`,
        request,
      )
      .pipe(
        tap((adventure) => {
          this.currentAdventure.set(adventure);
        }),
      );
  }

  clearAdventure(): void {
    this.currentAdventure.set(null);
  }
}