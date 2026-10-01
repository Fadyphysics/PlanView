import type { TeacherProfile, WeeklyPlan } from '../models';

const DB_NAME = 'PlanViewDB';
const DB_VERSION = 1;
const TEACHER_STORE = 'teachers';
const WEEKLY_PLANS_STORE = 'weeklyPlans';

let db: IDBDatabase | null = null;

// Add date utility functions for calculating next Sunday to Thursday
export function getNextSundayToDateRange(): { startDate: Date, endDate: Date, weekNumber: number } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate days until next Sunday
  let daysUntilNextSunday = 0;
  if (dayOfWeek === 0) { // If today is Sunday
    daysUntilNextSunday = 7; // Next Sunday is 7 days away
  } else {
    daysUntilNextSunday = 7 - dayOfWeek; // Days remaining until Sunday
  }
  
  // Calculate the next Sunday
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilNextSunday);
  
  // Calculate the Thursday (4 days after Sunday)
  const nextThursday = new Date(nextSunday);
  nextThursday.setDate(nextSunday.getDate() + 4);
  
  // Calculate the week number
  const weekNumber = nextSunday.getWeekNumber();
  
  return {
    startDate: nextSunday,
    endDate: nextThursday,
    weekNumber
  };
}

export async function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create teachers store
      if (!db.objectStoreNames.contains(TEACHER_STORE)) {
        const teacherStore = db.createObjectStore(TEACHER_STORE, { keyPath: 'id' });
        teacherStore.createIndex('name', 'name', { unique: false });
      }

      // Create weekly plans store
      if (!db.objectStoreNames.contains(WEEKLY_PLANS_STORE)) {
        const weeklyPlanStore = db.createObjectStore(WEEKLY_PLANS_STORE, { keyPath: 'id' });
        weeklyPlanStore.createIndex('teacherId', 'teacherId', { unique: false });
        weeklyPlanStore.createIndex('weekNumber', 'weekNumber', { unique: false });
        weeklyPlanStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export async function saveTeacherProfile(profile: TeacherProfile): Promise<TeacherProfile> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TEACHER_STORE], 'readwrite');
    const store = transaction.objectStore(TEACHER_STORE);
    const request = store.put(profile);

    request.onsuccess = () => {
      resolve(profile);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getTeacherProfile(): Promise<TeacherProfile | undefined> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TEACHER_STORE], 'readonly');
    const store = transaction.objectStore(TEACHER_STORE);
    
    // Get the first (and likely only) teacher profile
    const request = store.getAll();
    
    request.onsuccess = () => {
      const profiles = request.result;
      resolve(profiles.length > 0 ? profiles[0] : undefined);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<WeeklyPlan> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([WEEKLY_PLANS_STORE], 'readwrite');
    const store = transaction.objectStore(WEEKLY_PLANS_STORE);
    const request = store.put(plan);

    request.onsuccess = () => {
      resolve(plan);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getWeeklyPlanById(id: number): Promise<WeeklyPlan | undefined> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([WEEKLY_PLANS_STORE], 'readonly');
    const store = transaction.objectStore(WEEKLY_PLANS_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || undefined);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllWeeklyPlans(): Promise<WeeklyPlan[]> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([WEEKLY_PLANS_STORE], 'readonly');
    const store = transaction.objectStore(WEEKLY_PLANS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteWeeklyPlan(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([WEEKLY_PLANS_STORE], 'readwrite');
    const store = transaction.objectStore(WEEKLY_PLANS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Extend Date prototype to add getWeekNumber method
declare global {
  interface Date {
    getWeekNumber(): number;
  }
}

Date.prototype.getWeekNumber = function(): number {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};