import { create } from 'zustand';
import { User } from './auth';
import type {
  Module,
  UserProgress,
  ModuleStatus,
  ModuleType,
  QuizQuestion,
  AuditLog
} from './types';

// Note: This store is now deprecated in favor of React Query hooks and Supabase
// Keeping minimal interface for backward compatibility during migration

// Legacy interfaces moved to types.ts - keeping references for compatibility

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
  
  // Training Data
  modules: Module[];
  userProgress: UserProgress[];
  auditLogs: AuditLog[];
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  lockAccount: () => void;
  
  // Progress Actions
  updateProgress: (userId: string, moduleId: string, progress: number) => void;
  completeModule: (userId: string, moduleId: string, score?: number) => void;
  saveSignature: (userId: string, moduleId: string, signature: string) => void;
  addAuditLog: (action: string, userId: string, moduleId?: string, details?: string) => void;
  
  // Data getters
  getUserProgress: (userId: string, moduleId: string) => UserProgress | undefined;
  getCompletedModules: (userId: string) => UserProgress[];
  getModuleById: (moduleId: string) => Module | undefined;
}

// Demo modules with complete data
const DEMO_MODULES: Module[] = [
  {
    id: 'gmp-fundamentals',
    title: 'GMP Fundamentals',
    description: 'Learn the basics of Good Manufacturing Practices including quality systems, documentation, and regulatory compliance.',
    type: 'video',
    category: 'GMP',
    prerequisites: [],
    hasQuiz: true,
    requiresSignature: true
  },
  {
    id: 'cfr-part-11',
    title: '21 CFR Part 11 Overview',
    description: 'Electronic Records and Electronic Signatures compliance requirements for FDA-regulated industries.',
    type: 'pdf',
    category: 'Regulatory',
    prerequisites: ['gmp-fundamentals'],
    hasQuiz: false,
    requiresSignature: true,
    content: 'This comprehensive guide covers all aspects of 21 CFR Part 11 compliance including system validation, audit trails, electronic signatures, and record retention requirements.'
  },
  {
    id: 'deviations-capa',
    title: 'Deviations & CAPA',
    description: 'Corrective and Preventive Action procedures for handling quality deviations and implementing effective CAPA systems.',
    type: 'scorm',
    category: 'Quality',
    prerequisites: ['gmp-fundamentals'],
    hasQuiz: true,
    requiresSignature: true
  },
  {
    id: 'data-integrity',
    title: 'Data Integrity Principles',
    description: 'ALCOA+ principles and best practices for maintaining data integrity in GxP environments.',
    type: 'video',
    category: 'Quality',
    prerequisites: ['gmp-fundamentals', 'cfr-part-11'],
    hasQuiz: true,
    requiresSignature: true
  },
  {
    id: 'validation-basics',
    title: 'Computer System Validation',
    description: 'Introduction to CSV requirements, GAMP 5 guidelines, and validation lifecycle processes.',
    type: 'pdf',
    category: 'Validation',
    prerequisites: ['cfr-part-11'],
    hasQuiz: true,
    requiresSignature: true
  }
];

// Simplified store for backward compatibility during migration
// Most functionality has been moved to React Query hooks and Supabase
export const useStore = create<AppState>()((set, get) => ({
  // Initial state - mostly deprecated
  user: null,
  isAuthenticated: false,
  loginAttempts: 0,
  isLocked: false,
  modules: DEMO_MODULES, // Keep demo modules for now
  userProgress: [],
  auditLogs: [],

  // Deprecated auth actions - use useAuth hook instead
  login: (user) => {
    console.warn('useStore.login is deprecated. Use Supabase Auth instead.');
    set({ user, isAuthenticated: true, loginAttempts: 0 });
  },

  logout: () => {
    console.warn('useStore.logout is deprecated. Use Supabase Auth instead.');
    set({ user: null, isAuthenticated: false });
  },

  incrementLoginAttempts: () => set((state) => ({
    loginAttempts: state.loginAttempts + 1
  })),

  resetLoginAttempts: () => set({ loginAttempts: 0 }),

  lockAccount: () => set({ isLocked: true }),

  // Deprecated progress actions - use useProgress hooks instead
  updateProgress: (userId, moduleId, progress) => {
    console.warn('useStore.updateProgress is deprecated. Use useUpdateModuleProgress hook instead.');
  },

  completeModule: (userId, moduleId, score) => {
    console.warn('useStore.completeModule is deprecated. Use useCompleteModule hook instead.');
  },

  saveSignature: (userId, moduleId, signature) => {
    console.warn('useStore.saveSignature is deprecated. Use signaturesApi instead.');
  },

  addAuditLog: (action, userId, moduleId, details = '') => {
    console.warn('useStore.addAuditLog is deprecated. Use auditApi instead.');
  },

  // Deprecated getters - use React Query hooks instead
  getUserProgress: (userId, moduleId) => {
    console.warn('useStore.getUserProgress is deprecated. Use useModuleProgress hook instead.');
    return undefined;
  },

  getCompletedModules: (userId) => {
    console.warn('useStore.getCompletedModules is deprecated. Use useCompletedCourses hook instead.');
    return [];
  },

  getModuleById: (moduleId) => {
    return get().modules.find(m => m.id === moduleId);
  }
}));

// Clear existing localStorage data
export const clearLegacyData = () => {
  try {
    // Clear the old Zustand persistence data
    localStorage.removeItem('gxp-lms-storage');

    // Clear any other potential localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('gxp') || key.includes('lms') || key.includes('training'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('Legacy localStorage data cleared successfully');
  } catch (error) {
    console.error('Error clearing legacy data:', error);
  }
};