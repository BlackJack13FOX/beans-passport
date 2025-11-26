
export enum AppScreen {
  WELCOME = 'WELCOME',
  FLAVOR_SELECT = 'FLAVOR_SELECT',
  BALANCE = 'BALANCE',
  RESULT = 'RESULT',
  PASSPORT = 'PASSPORT',
  CHAT = 'CHAT'
}

export type Language = 'en' | 'zh';

export interface FlavorProfile {
  id: string;
  // name is now handled via translation, but keeping basic props if needed for internal logic
  color: string;
  icon: string; 
}

export interface RadarData {
  sweetness: number;
  acidity: number;
  body: number;
  bitterness: number;
  aroma: number;
  aftertaste: number;
}

export interface CoffeeResult {
  title: string;
  shortDescription: string;
  story: string; // Detailed narrative
  origin: string;
  region: string; // Specific region
  altitude: string; // e.g. 1800m
  process: string; // e.g. Washed
  roastLevel: string;
  tastingNotes: string[];
  brewingMethod: string;
  matchScore: number;
  radarData: RadarData;
}

export interface HistoryEntry {
  date: string;
  result: CoffeeResult;
  moodColor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}