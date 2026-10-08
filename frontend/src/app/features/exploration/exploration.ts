import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

import { AdventureService } from '../../core/services/adventure.service';
import { LocationService } from '../../core/services/location.service';
import {
  Adventure,
} from '../../core/models/adventure.model';
import {
  MissionProgress,
  MissionStatus,
} from '../../core/models/mission.model';

@Component({
  selector: 'app-exploration',
  imports: [],
  templateUrl: './exploration.html',
  styleUrl: './exploration.scss',
})
export class Exploration
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly router = inject(Router);
  private readonly adventureService =
    inject(AdventureService);
  private readonly locationService =
    inject(LocationService);

  readonly adventure =
    this.adventureService.currentAdventure;

  missions: MissionProgress[] = [];

  private map?: L.Map;
  private userMarker?: L.CircleMarker;
  private routeLine?: L.Polyline;

  private watchId: number | null = null;
  private timerId: number | null = null;

  private routeCoordinates: L.LatLng[] = [];
  private lastPosition?: L.LatLng;

  elapsedSeconds = 0;
  distanceMeters = 0;
  totalXp = 0;

  locationError = false;
  mapReady = false;

  ngOnInit(): void {
    const currentAdventure = this.adventure();

    if (!currentAdventure) {
      this.router.navigate(['/setup']);
      return;
    }

    this.initializeMissions(currentAdventure);
    this.startTimer();
  }

  ngAfterViewInit(): void {
    this.initializeLocation();
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      this.locationService.stopWatching(
        this.watchId,
      );
    }

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }

    this.map?.remove();
  }

  private initializeMissions(
    adventure: Adventure,
  ): void {
    this.missions = adventure.missions.map(
      (mission, index) => ({
        ...mission,
        status:
          index === 0
            ? 'active'
            : 'pending',
      }),
    );

    this.totalXp = 0;
  }

  private initializeLocation(): void {
    this.locationService
      .getCurrentPosition()
      .then((position) => {
        const { latitude, longitude } =
          position.coords;

        this.initializeMap(
          latitude,
          longitude,
        );

        this.updateUserPosition(
          position,
        );

        this.startWatchingLocation();
      })
      .catch((error) => {
        console.error(
          'No se pudo obtener la ubicación:',
          error,
        );

        this.locationError = true;

        this.initializeMap(
          19.0,
          -90.5,
        );
      });
  }

  private initializeMap(
    latitude: number,
    longitude: number,
  ): void {
    this.map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
    }).setView(
      [latitude, longitude],
      17,
    );

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; OpenStreetMap contributors',
      },
    ).addTo(this.map);

    this.routeLine = L.polyline(
      [],
      {
        color: '#059669',
        weight: 5,
        opacity: 0.9,
      },
    ).addTo(this.map);

    this.mapReady = true;
  }

  private startWatchingLocation(): void {
    this.watchId =
      this.locationService.watchPosition(
        (position) => {
          this.updateUserPosition(
            position,
          );
        },
        (error) => {
          console.error(
            'Error siguiendo ubicación:',
            error,
          );

          this.locationError = true;
        },
      );
  }

  private updateUserPosition(
    position: GeolocationPosition,
  ): void {
    if (!this.map) {
      return;
    }

    const latitude =
      position.coords.latitude;

    const longitude =
      position.coords.longitude;

    const currentPosition =
      L.latLng(
        latitude,
        longitude,
      );

    if (!this.userMarker) {
      this.userMarker =
        L.circleMarker(
          currentPosition,
          {
            radius: 9,
            color: '#ffffff',
            weight: 4,
            fillColor: '#2563eb',
            fillOpacity: 1,
          },
        ).addTo(this.map);

      this.userMarker.bindTooltip(
        'Tu ubicación',
        {
          direction: 'top',
        },
      );
    } else {
      this.userMarker.setLatLng(
        currentPosition,
      );
    }

    if (this.lastPosition) {
      const segmentDistance =
        this.lastPosition.distanceTo(
          currentPosition,
        );

      if (
        segmentDistance > 1 &&
        segmentDistance < 100
      ) {
        this.distanceMeters +=
          segmentDistance;
      }
    }

    this.lastPosition =
      currentPosition;

    this.routeCoordinates.push(
      currentPosition,
    );

    this.routeLine?.setLatLngs(
      this.routeCoordinates,
    );

    this.map.setView(
      currentPosition,
      this.map.getZoom(),
      {
        animate: true,
      },
    );
  }

  private startTimer(): void {
    this.timerId = window.setInterval(() => {
      this.elapsedSeconds++;
    }, 1000);
  }

  completeCurrentMission(): void {
    const activeIndex =
      this.missions.findIndex(
        (mission) =>
          mission.status === 'active',
      );

    if (activeIndex === -1) {
      return;
    }

    const mission =
      this.missions[activeIndex];

    this.missions[activeIndex] = {
      ...mission,
      status: 'completed',
    };

    this.totalXp += mission.xp;

    const nextIndex =
      activeIndex + 1;

    if (
      nextIndex <
      this.missions.length
    ) {
      const nextMission =
        this.missions[nextIndex];

      this.missions[nextIndex] = {
        ...nextMission,
        status: 'active',
      };
    }

    this.missions = [
      ...this.missions,
    ];
  }

  completeAdventure(): void {
    if (!this.allMissionsCompleted) {
      return;
    }

    if (this.watchId !== null) {
      this.locationService.stopWatching(
        this.watchId,
      );

      this.watchId = null;
    }

    if (this.timerId !== null) {
      window.clearInterval(
        this.timerId,
      );

      this.timerId = null;
    }

    this.router.navigate(
      ['/result'],
      {
        state: {
          xp: this.totalXp,
          distance:
            this.distanceMeters,
          elapsedSeconds:
            this.elapsedSeconds,
        },
      },
    );
  }

  get activeMission():
    MissionProgress | null {
    return (
      this.missions.find(
        (mission) =>
          mission.status === 'active',
      ) ?? null
    );
  }

  get completedMissions(): number {
    return this.missions.filter(
      (mission) =>
        mission.status ===
        'completed',
    ).length;
  }

  get allMissionsCompleted(): boolean {
    return (
      this.missions.length > 0 &&
      this.completedMissions ===
        this.missions.length
    );
  }

  get progressPercent(): number {
    if (!this.missions.length) {
      return 0;
    }

    return Math.round(
      (this.completedMissions /
        this.missions.length) *
        100,
    );
  }

  get formattedTime(): string {
    const minutes = Math.floor(
      this.elapsedSeconds / 60,
    );

    const seconds =
      this.elapsedSeconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  get formattedDistance(): string {
    if (this.distanceMeters < 1000) {
      return `${Math.round(
        this.distanceMeters,
      )} m`;
    }

    return `${(
      this.distanceMeters / 1000
    ).toFixed(2)} km`;
  }
}