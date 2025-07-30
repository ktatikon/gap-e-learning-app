import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  getCurrentUser,
  signOut as authSignOut,
  signUpWithPassword,
  verifyEmailConfirmation,
  resendVerificationEmail,
  type User,
  type SignupData,
  type SignupResult,
  type EmailVerificationResult
} from './auth';
import { auditApi } from './api';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signUp: (signupData: SignupData) => Promise<SignupResult>;
  verifyEmail: (token: string, email: string) => Promise<EmailVerificationResult>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      // Log logout before signing out
      if (user) {
        await auditApi.logLogout(user.id);
      }

      await authSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signUp = async (signupData: SignupData): Promise<SignupResult> => {
    try {
      const result = await signUpWithPassword(signupData);

      // If signup was successful and user is immediately confirmed (unlikely in production)
      if (result.session && result.user) {
        setSession(result.session);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }

      return result;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string, email: string): Promise<EmailVerificationResult> => {
    try {
      const result = await verifyEmailConfirmation(token, email);

      if (result.success && result.user) {
        setUser(result.user);
        // Get the session after email verification
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      }

      return result;
    } catch (error) {
      console.error('Error during email verification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email verification failed'
      };
    }
  };

  const resendVerification = async (email: string): Promise<void> => {
    try {
      await resendVerificationEmail(email);
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        
        if (session) {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Error getting user after auth change:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
    signUp,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to check if user has specific role
export const useRole = (role: string): boolean => {
  const { user } = useAuth();
  return user?.roles.includes(role) || false;
};

// Hook to check if user has any of the specified roles
export const useRoles = (roles: string[]): boolean => {
  const { user } = useAuth();
  return user?.roles.some(userRole => roles.includes(userRole)) || false;
};

// Hook to get user's primary role (first role in the list)
export const usePrimaryRole = (): string | null => {
  const { user } = useAuth();
  return user?.roles[0] || null;
};
