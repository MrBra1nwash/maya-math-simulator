export type OperationType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division';

export type DifficultyLevel =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'very_hard';

export type InputMode = 'keyboard' | 'choices';

export interface Question {
  id: string;
  operand1: number;
  operand2: number;
  operation: OperationType;
  correctAnswer: number;
  difficulty: DifficultyLevel;
}

export interface MistakeRecord {
  question: Question;
  userAnswer: number;
  wasRetried: boolean;
}

export interface SessionConfig {
  operations: OperationType[];
  difficulty: DifficultyLevel;
  questionCount: number;
  specificNumber: number | null;
  timerEnabled: boolean;
}

export interface SessionResult {
  id: string;
  date: string;
  config: SessionConfig;
  totalQuestions: number;
  correctAnswers: number;
  correctOnFirstTry: number;
  timeSpent: number | null;
  mistakes: MistakeRecord[];
}

export interface UserSettings {
  inputMode: InputMode;
  soundEnabled: boolean;
  musicEnabled: boolean;
  negativeNumbers: boolean;
}

export interface UserProgress {
  totalStars: number;
  level: number;
  achievements: string[];
  currentStreak: number;
  bestStreak: number;
}

export interface UserProfile {
  name: string;
  settings: UserSettings;
  progress: UserProgress;
  history: SessionResult[];
  createdAt: string;
  lastActiveAt: string;
}

export type MascotMood =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'dancing'
  | 'thinking';

export type AchievementId = string;

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}
