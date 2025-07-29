import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './auth';

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';
export type ModuleType = 'video' | 'pdf' | 'scorm';

export interface Module {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  category: string;
  prerequisites: string[];
  hasQuiz: boolean;
  requiresSignature: boolean;
  content?: string; // For PDF/SCORM content
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  status: ModuleStatus;
  progress: number; // 0-100
  attempts: number;
  score?: number;
  completedAt?: Date;
  signatureData?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  moduleId?: string;
  userId: string;
  ipAddress: string;
  details: string;
}

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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      loginAttempts: 0,
      isLocked: false,
      modules: DEMO_MODULES,
      userProgress: [],
      auditLogs: [],
      
      // Auth actions
      login: (user) => {
        set({ user, isAuthenticated: true, loginAttempts: 0 });
        get().addAuditLog('login', user.id, undefined, 'User logged in successfully');
      },
      
      logout: () => {
        const { user } = get();
        if (user) {
          get().addAuditLog('logout', user.id, undefined, 'User logged out');
        }
        set({ user: null, isAuthenticated: false });
      },
      
      incrementLoginAttempts: () => set((state) => ({ 
        loginAttempts: state.loginAttempts + 1 
      })),
      
      resetLoginAttempts: () => set({ loginAttempts: 0 }),
      
      lockAccount: () => set({ isLocked: true }),
      
      // Progress actions
      updateProgress: (userId, moduleId, progress) => {
        set((state) => {
          const existing = state.userProgress.find(
            p => p.userId === userId && p.moduleId === moduleId
          );
          
          if (existing) {
            return {
              userProgress: state.userProgress.map(p =>
                p.userId === userId && p.moduleId === moduleId
                  ? { ...p, progress, status: progress === 100 ? 'completed' : 'in-progress' }
                  : p
              )
            };
          } else {
            return {
              userProgress: [...state.userProgress, {
                userId,
                moduleId,
                status: progress === 100 ? 'completed' : 'in-progress',
                progress,
                attempts: 0
              }]
            };
          }
        });
        
        get().addAuditLog('progress_update', userId, moduleId, `Progress updated to ${progress}%`);
      },
      
      completeModule: (userId, moduleId, score) => {
        set((state) => {
          const existing = state.userProgress.find(
            p => p.userId === userId && p.moduleId === moduleId
          );
          
          if (existing) {
            return {
              userProgress: state.userProgress.map(p =>
                p.userId === userId && p.moduleId === moduleId
                  ? { 
                      ...p, 
                      status: 'completed' as ModuleStatus, 
                      progress: 100, 
                      score,
                      completedAt: new Date() 
                    }
                  : p
              )
            };
          } else {
            return {
              userProgress: [...state.userProgress, {
                userId,
                moduleId,
                status: 'completed' as ModuleStatus,
                progress: 100,
                attempts: 1,
                score,
                completedAt: new Date()
              }]
            };
          }
        });
        
        get().addAuditLog('module_completed', userId, moduleId, `Module completed with score: ${score || 'N/A'}`);
      },
      
      saveSignature: (userId, moduleId, signature) => {
        set((state) => ({
          userProgress: state.userProgress.map(p =>
            p.userId === userId && p.moduleId === moduleId
              ? { ...p, signatureData: signature }
              : p
          )
        }));
        
        get().addAuditLog('signature_captured', userId, moduleId, 'Digital signature captured');
      },
      
      addAuditLog: (action, userId, moduleId, details = '') => {
        const newLog: AuditLog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          action,
          moduleId,
          userId,
          ipAddress: '192.168.1.100', // Demo IP
          details
        };
        
        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs].slice(0, 100) // Keep last 100 logs
        }));
      },
      
      // Getters
      getUserProgress: (userId, moduleId) => {
        return get().userProgress.find(p => p.userId === userId && p.moduleId === moduleId);
      },
      
      getCompletedModules: (userId) => {
        return get().userProgress.filter(p => p.userId === userId && p.status === 'completed');
      },
      
      getModuleById: (moduleId) => {
        return get().modules.find(m => m.id === moduleId);
      }
    }),
    {
      name: 'gxp-lms-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
        auditLogs: state.auditLogs,
        loginAttempts: state.loginAttempts,
        isLocked: state.isLocked
      })
    }
  )
);