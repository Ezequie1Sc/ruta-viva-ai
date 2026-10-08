import { Mission } from './mission.model';

export type AdventureType =
  | 'nature'
  | 'culture'
  | 'walk'
  | 'surprise';

export type Difficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export interface AdventureRequest {
  duration: number;
  adventure_type: AdventureType;
  difficulty: Difficulty;
}

export interface Adventure {
  title: string;
  description: string;
  duration: number;
  missions: Mission[];
  total_xp: number;
}