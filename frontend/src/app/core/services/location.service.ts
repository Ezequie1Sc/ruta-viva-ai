import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {

      if (!navigator.geolocation) {
        reject(
          new Error(
            'La geolocalización no está disponible en este navegador.',
          ),
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );

    });
  }

  watchPosition(
    callback: PositionCallback,
    error?: PositionErrorCallback,
  ): number {

    return navigator.geolocation.watchPosition(
      callback,
      error,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  stopWatching(
    watchId: number,
  ): void {

    navigator.geolocation.clearWatch(watchId);
  }
}