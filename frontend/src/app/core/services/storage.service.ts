import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private readonly adventuresKey =
    'ruta-viva-adventures';

  private readonly statsKey =
    'ruta-viva-stats';

  save<T>(
    key: string,
    data: T,
  ): void {

    localStorage.setItem(
      key,
      JSON.stringify(data),
    );
  }

  get<T>(
    key: string,
    fallback: T,
  ): T {

    const stored = localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    try {
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.removeItem(
      this.adventuresKey,
    );

    localStorage.removeItem(
      this.statsKey,
    );
  }
}