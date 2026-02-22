import { openDB } from 'idb';
import type { UserProfile } from '@/types';

const DB_NAME = 'maya-math-db';
const DB_VERSION = 1;
const PROFILES_STORE = 'profiles';

let dbInstance: ReturnType<typeof openDB> | null = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(PROFILES_STORE, { keyPath: 'name' });
      },
    });
  }
  return dbInstance;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDB();
  return db.getAll(PROFILES_STORE);
}

export async function getProfile(name: string): Promise<UserProfile | undefined> {
  const db = await getDB();
  return db.get(PROFILES_STORE, name);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put(PROFILES_STORE, profile);
}

export async function deleteProfile(name: string): Promise<void> {
  const db = await getDB();
  await db.delete(PROFILES_STORE, name);
}

export function createDefaultProfile(name: string): UserProfile {
  const now = new Date().toISOString();
  return {
    name,
    settings: {
      inputMode: 'choices',
      soundEnabled: true,
      musicEnabled: true,
      negativeNumbers: false,
    },
    progress: {
      totalStars: 0,
      level: 1,
      achievements: [],
      currentStreak: 0,
      bestStreak: 0,
    },
    history: [],
    createdAt: now,
    lastActiveAt: now,
  };
}
