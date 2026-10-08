export type AdventureType = 'nature' | 'culture' | 'walk' | 'surprise';
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Mission { id: string; title: string; description: string; xp: number; completed: boolean; }
export interface AdventureRequest { duration: number; adventure_type: AdventureType; difficulty: Difficulty; }
export interface Adventure { id: string; title: string; description: string; duration: number; adventure_type: AdventureType; difficulty: Difficulty; missions: Mission[]; total_xp: number; created_at: string; completed_at?: string; distance_km?: number; }
