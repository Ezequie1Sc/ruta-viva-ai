export interface Mission {
  title: string;
  description: string;
  xp: number;
}

export type MissionStatus =
  | 'pending'
  | 'active'
  | 'completed';

export interface MissionProgress extends Mission {
  status: MissionStatus;
}