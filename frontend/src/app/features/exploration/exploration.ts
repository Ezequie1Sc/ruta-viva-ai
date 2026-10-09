
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import * as L from 'leaflet';

import {
  AdventureService
} from '../../core/services/adventure.service';

import {
  LocationService
} from '../../core/services/location.service';

import {
  Adventure
} from '../../core/models/adventure.model';

import {
  MissionProgress
} from '../../core/models/mission.model';

@Component({
  selector: 'app-exploration',
  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './exploration.html',
  styleUrl: './exploration.scss'
})
export class Exploration
  implements OnInit, AfterViewInit, OnDestroy {

  // ==========================================
  // DEPENDENCIES
  // ==========================================

  private readonly router = inject(Router);

  private readonly adventureService =
    inject(AdventureService);

  private readonly locationService =
    inject(LocationService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  // ==========================================
  // ADVENTURE DATA
  // ==========================================

  readonly adventure =
    this.adventureService.currentAdventure;

  missions: MissionProgress[] = [];

  // ==========================================
  // MAP
  // ==========================================

  private map?: L.Map;

  private userMarker?: L.CircleMarker;

  private routeLine?: L.Polyline;

  private routeCoordinates: L.LatLng[] = [];

  private lastPosition?: L.LatLng;

  private currentPosition?: L.LatLng;

  // ==========================================
  // LOCATION TRACKING
  // ==========================================

  private watchId: number | null = null;

  private timerId: number | null = null;

  private destroyed = false;

  private locationRequestPending = false;

  locationError = false;

  mapReady = false;

  // ==========================================
  // STATISTICS
  // ==========================================

  elapsedSeconds = 0;

  distanceMeters = 0;

  totalXp = 0;

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {

    const currentAdventure =
      this.adventure();

    if (!currentAdventure) {
      this.router.navigate(['/setup']);
      return;
    }

    this.initializeMissions(currentAdventure);

    this.startTimer();
  }

  ngAfterViewInit(): void {

    if (!this.adventure()) {
      return;
    }

    this.initializeLocation();
  }

  ngOnDestroy(): void {

    this.destroyed = true;

    this.stopTracking();

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  // ==========================================
  // INITIALIZE MISSIONS
  // ==========================================

  private initializeMissions(
    adventure: Adventure
  ): void {

    this.missions = adventure.missions.map(
      (mission, index) => ({
        ...mission,
        status: index === 0
          ? 'active'
          : 'pending'
      })
    );

    this.totalXp = 0;
  }

  // ==========================================
  // INITIALIZE LOCATION
  // ==========================================

  private async initializeLocation(): Promise<void> {

    if (
      this.locationRequestPending ||
      this.destroyed
    ) {
      return;
    }

    this.locationRequestPending = true;
    this.locationError = false;

    this.cdr.markForCheck();

    try {

      const position =
        await this.locationService.getCurrentPosition();

      if (this.destroyed) {
        return;
      }

      const { latitude, longitude } =
        position.coords;

      if (!this.map) {

        this.initializeMap(
          latitude,
          longitude
        );

      }

      this.updateUserPosition(position);

      this.recenterMap();

      this.startWatchingLocation();

      this.locationError = false;

    } catch (error) {

      if (this.destroyed) {
        return;
      }

      console.error(
        'Unable to access location:',
        error
      );

      this.locationError = true;

      // Display a neutral fallback map.
      // This is NOT the user's location.
      if (!this.map) {

        this.initializeMap(
          19.0,
          -90.5
        );

      }

    } finally {

      this.locationRequestPending = false;

      if (!this.destroyed) {
        this.cdr.markForCheck();
      }

    }

  }

  // ==========================================
  // INITIALIZE LEAFLET MAP
  // ==========================================

  private initializeMap(
    latitude: number,
    longitude: number
  ): void {

    if (this.map) {
      return;
    }

    this.map = L.map('map', {

      zoomControl: false,

      attributionControl: true,

      scrollWheelZoom: true

    }).setView(
      [latitude, longitude],
      16
    );

    // OPENSTREETMAP TILES

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    // ZOOM CONTROLS

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    // ROUTE POLYLINE

    this.routeLine = L.polyline(
      [],
      {
        color: '#52a568',
        weight: 5,
        opacity: 0.95,

        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(this.map);

    this.mapReady = true;

    this.cdr.markForCheck();

    // Required when the map is inside
    // a responsive Angular layout.
    window.setTimeout(() => {

      if (!this.destroyed && this.map) {
        this.map.invalidateSize();
      }

    }, 150);
  }

  // ==========================================
  // WATCH LOCATION
  // ==========================================

  private startWatchingLocation(): void {

    if (this.watchId !== null) {
      return;
    }

    this.watchId =
      this.locationService.watchPosition(

        (position) => {

          if (this.destroyed) {
            return;
          }

          this.locationError = false;

          this.updateUserPosition(position);

          this.cdr.markForCheck();

        },

        (error) => {

          if (this.destroyed) {
            return;
          }

          console.error(
            'Location tracking error:',
            error
          );

          this.locationError = true;

          this.cdr.markForCheck();

        }

      );
  }

  // ==========================================
  // UPDATE USER POSITION
  // ==========================================

  private updateUserPosition(
    position: GeolocationPosition
  ): void {

    if (!this.map) {
      return;
    }

    const {
      latitude,
      longitude,
      accuracy
    } = position.coords;

    // Ignore invalid coordinates.

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    // Ignore low-confidence GPS updates
    // to reduce large position jumps.

    if (
      !Number.isFinite(accuracy) ||
      accuracy > 100
    ) {
      return;
    }

    const nextPosition = L.latLng(
      latitude,
      longitude
    );

    this.currentPosition = nextPosition;

    // ========================================
    // USER MARKER
    // ========================================

    if (!this.userMarker) {

      // Outer white ring and forest-green dot

      this.userMarker = L.circleMarker(
        nextPosition,
        {
          radius: 10,

          color: '#ffffff',
          weight: 4,

          fillColor: '#176a50',
          fillOpacity: 1,

          bubblingMouseEvents: false
        }
      ).addTo(this.map);

      this.userMarker.bindTooltip(
        'Your location',
        {
          direction: 'top',
          offset: [0, -8]
        }
      );

    } else {

      this.userMarker.setLatLng(
        nextPosition
      );

    }

    // ========================================
    // DISTANCE TRACKING
    // ========================================

    if (!this.lastPosition) {

      this.lastPosition = nextPosition;

      this.routeCoordinates.push(
        nextPosition
      );

      this.routeLine?.setLatLngs(
        this.routeCoordinates
      );

      this.cdr.markForCheck();

      return;
    }

    const segmentDistance =
      this.lastPosition.distanceTo(
        nextPosition
      );

    // Small GPS movements are often jitter.
    // The threshold adapts partially
    // to the reported position accuracy.

    const minimumMovement = Math.max(
      4,
      Math.min(accuracy * 0.5, 15)
    );

    // Prevent GPS glitches from adding
    // unrealistic distance.

    const maximumSegmentDistance = 100;

    if (
      segmentDistance >= minimumMovement &&
      segmentDistance < maximumSegmentDistance
    ) {

      this.distanceMeters +=
        segmentDistance;

      this.lastPosition =
        nextPosition;

      this.routeCoordinates.push(
        nextPosition
      );

      this.routeLine?.setLatLngs(
        this.routeCoordinates
      );

    }

    // Do not automatically recenter the map
    // on every GPS update.
    // The user can explore the map freely.

    this.cdr.markForCheck();
  }

  // ==========================================
  // RECENTER MAP
  // ==========================================

  recenterMap(): void {

    if (
      !this.map ||
      !this.currentPosition
    ) {
      return;
    }

    this.map.setView(
      this.currentPosition,
      Math.max(this.map.getZoom(), 16),
      {
        animate: true
      }
    );
  }

  // ==========================================
  // RETRY LOCATION
  // ==========================================

  retryLocation(): void {

    if (this.watchId !== null) {

      this.locationService.stopWatching(
        this.watchId
      );

      this.watchId = null;

    }

    this.initializeLocation();
  }

  // ==========================================
  // TIMER
  // ==========================================

  private startTimer(): void {

    if (this.timerId !== null) {
      return;
    }

    this.timerId = window.setInterval(
      () => {

        if (this.destroyed) {
          return;
        }

        this.elapsedSeconds++;

        this.cdr.markForCheck();

      },
      1000
    );
  }

  // ==========================================
  // COMPLETE CURRENT MISSION
  // ==========================================

  completeCurrentMission(): void {

    const activeIndex =
      this.missions.findIndex(
        mission => mission.status === 'active'
      );

    if (activeIndex === -1) {
      return;
    }

    const activeMission =
      this.missions[activeIndex];

    // Guard against duplicate XP rewards.

    if (
      activeMission.status === 'completed'
    ) {
      return;
    }

    this.missions[activeIndex] = {
      ...activeMission,
      status: 'completed'
    };

    this.totalXp +=
      activeMission.xp;

    // Activate the next mission.

    const nextIndex = activeIndex + 1;

    if (nextIndex < this.missions.length) {

      const nextMission =
        this.missions[nextIndex];

      this.missions[nextIndex] = {
        ...nextMission,
        status: 'active'
      };

    }

    this.missions = [
      ...this.missions
    ];

    this.cdr.markForCheck();
  }

  // ==========================================
  // COMPLETE ADVENTURE
  // ==========================================

  completeAdventure(): void {

    if (!this.allMissionsCompleted) {
      return;
    }

    this.stopTracking();

    this.router.navigate(
      ['/result'],
      {
        state: {
          xp: this.totalXp,

          distance:
            this.distanceMeters,

          elapsedSeconds:
            this.elapsedSeconds
        }
      }
    );
  }

  // ==========================================
  // STOP TRACKING
  // ==========================================

  private stopTracking(): void {

    if (this.watchId !== null) {

      this.locationService.stopWatching(
        this.watchId
      );

      this.watchId = null;

    }

    if (this.timerId !== null) {

      window.clearInterval(
        this.timerId
      );

      this.timerId = null;

    }
  }

  // ==========================================
  // ACTIVE MISSION
  // ==========================================

  get activeMission():
    MissionProgress | null {

    return (
      this.missions.find(
        mission => mission.status === 'active'
      ) ?? null
    );
  }

  // ==========================================
  // COMPLETED MISSIONS
  // ==========================================

  get completedMissions(): number {

    return this.missions.filter(
      mission =>
        mission.status === 'completed'
    ).length;
  }

  // ==========================================
  // ALL MISSIONS COMPLETED
  // ==========================================

  get allMissionsCompleted(): boolean {

    return (
      this.missions.length > 0 &&
      this.completedMissions ===
        this.missions.length
    );
  }

  // ==========================================
  // PROGRESS PERCENT
  // ==========================================

  get progressPercent(): number {

    if (!this.missions.length) {
      return 0;
    }

    return Math.round(
      (
        this.completedMissions /
        this.missions.length
      ) * 100
    );
  }

  // ==========================================
  // FORMATTED TIME
  // ==========================================

  get formattedTime(): string {

    const hours = Math.floor(
      this.elapsedSeconds / 3600
    );

    const minutes = Math.floor(
      (this.elapsedSeconds % 3600) / 60
    );

    const seconds =
      this.elapsedSeconds % 60;

    const mm = minutes
      .toString()
      .padStart(2, '0');

    const ss = seconds
      .toString()
      .padStart(2, '0');

    if (hours > 0) {

      const hh = hours
        .toString()
        .padStart(2, '0');

      return `${hh}:${mm}:${ss}`;

    }

    return `${mm}:${ss}`;
  }

  // ==========================================
  // FORMATTED DISTANCE
  // ==========================================

  get formattedDistance(): string {

    if (this.distanceMeters < 1000) {

      return `${Math.round(
        this.distanceMeters
      )} m`;

    }

    return `${
      (this.distanceMeters / 1000).toFixed(2)
    } km`;
  }

}
