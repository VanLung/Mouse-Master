
export enum GameType {
  MENU = 'MENU',
  BUBBLE_POP = 'BUBBLE_POP', // Clicking practice
  SHAPE_MATCH = 'SHAPE_MATCH', // Drag and Drop practice
  TRACE_PATH = 'TRACE_PATH', // Precision movement
  STATS = 'STATS'
}

export interface GameStats {
  bubblesPopped: number;
  shapesMatched: number;
  pathsCompleted: number;
  accuracy: number; // percentage
  playTimeSeconds: number;
}

export interface DragItem {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';
  color: string;
  x: number;
  y: number;
  isMatched: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  audioContext: AudioContext | null;
}
