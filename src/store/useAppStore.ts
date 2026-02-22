import { create } from 'zustand';
import type {
  UserProfile,
  UserSettings,
  UserProgress,
  SessionResult,
  SessionConfig,
  Question,
  MascotMood,
} from '@/types';
import {
  getProfile,
  saveProfile,
  createDefaultProfile,
  getAllProfiles,
} from '@/db/database';

interface AppState {
  currentUser: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  currentSession: {
    config: SessionConfig;
    questions: Question[];
    currentIndex: number;
    answers: {
      question: Question;
      userAnswer: number | null;
      correct: boolean;
      wasRetried: boolean;
    }[];
    startTime: number;
  } | null;
  mascotMood: MascotMood;
  login: (name: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateProgress: (progress: Partial<UserProgress>) => Promise<void>;
  addSessionResult: (result: SessionResult) => Promise<void>;
  startSession: (config: SessionConfig, questions: Question[]) => void;
  answerQuestion: (
    userAnswer: number,
    correct: boolean,
    wasRetried: boolean
  ) => void;
  endSession: () => void;
  setMascotMood: (mood: MascotMood) => void;
  getAvailableProfiles: () => Promise<string[]>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  profile: null,
  isLoading: false,
  currentSession: null,
  mascotMood: 'idle',

  login: async (name: string) => {
    set({ isLoading: true });
    try {
      let profile = await getProfile(name);
      if (!profile) {
        profile = createDefaultProfile(name);
        await saveProfile(profile);
      }
      set({ currentUser: name, profile, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Failed to load or create profile');
    }
  },

  logout: () => {
    set({ currentUser: null, profile: null });
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      settings: { ...profile.settings, ...settings },
      lastActiveAt: new Date().toISOString(),
    };
    await saveProfile(updated);
    set({ profile: updated });
  },

  updateProgress: async (progress: Partial<UserProgress>) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      progress: { ...profile.progress, ...progress },
      lastActiveAt: new Date().toISOString(),
    };
    await saveProfile(updated);
    set({ profile: updated });
  },

  addSessionResult: async (result: SessionResult) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      history: [...profile.history, result],
      lastActiveAt: new Date().toISOString(),
    };
    await saveProfile(updated);
    set({ profile: updated });
  },

  startSession: (config: SessionConfig, questions: Question[]) => {
    set({
      currentSession: {
        config,
        questions,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
      },
    });
  },

  answerQuestion: (userAnswer: number, correct: boolean, wasRetried: boolean) => {
    const { currentSession } = get();
    if (!currentSession) return;
    const { questions, currentIndex, answers } = currentSession;
    const question = questions[currentIndex];
    const newAnswers = [
      ...answers,
      { question, userAnswer, correct, wasRetried },
    ];
    const nextIndex = currentIndex + 1;
    set({
      currentSession: {
        ...currentSession,
        currentIndex: nextIndex,
        answers: newAnswers,
      },
    });
  },

  endSession: () => {
    set({ currentSession: null });
  },

  setMascotMood: (mood: MascotMood) => {
    set({ mascotMood: mood });
  },

  getAvailableProfiles: async () => {
    const profiles = await getAllProfiles();
    return profiles.map((p) => p.name);
  },
}));
