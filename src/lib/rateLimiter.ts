// Simple client-side rate limiter for signup attempts
// In production, this should be implemented server-side

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs; // 15 minutes
    this.blockDurationMs = blockDurationMs; // 30 minutes
  }

  private getKey(identifier: string, action: string): string {
    return `${action}:${identifier}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (entry.blockedUntil && entry.blockedUntil < now) {
        this.storage.delete(key);
      } else if (!entry.blockedUntil && (now - entry.lastAttempt) > this.windowMs) {
        this.storage.delete(key);
      }
    }
  }

  public isBlocked(identifier: string, action: string): boolean {
    this.cleanupExpiredEntries();
    
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    
    if (!entry) return false;
    
    const now = Date.now();
    
    // Check if currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return true;
    }
    
    // Check if within rate limit window
    if ((now - entry.lastAttempt) > this.windowMs) {
      // Reset if outside window
      this.storage.delete(key);
      return false;
    }
    
    return entry.attempts >= this.maxAttempts;
  }

  public recordAttempt(identifier: string, action: string): {
    blocked: boolean;
    attemptsRemaining: number;
    resetTime?: number;
    blockedUntil?: number;
  } {
    this.cleanupExpiredEntries();
    
    const key = this.getKey(identifier, action);
    const now = Date.now();
    let entry = this.storage.get(key);
    
    if (!entry) {
      entry = { attempts: 0, lastAttempt: now };
    }
    
    // Reset if outside window
    if ((now - entry.lastAttempt) > this.windowMs) {
      entry = { attempts: 0, lastAttempt: now };
    }
    
    entry.attempts++;
    entry.lastAttempt = now;
    
    // Block if exceeded max attempts
    if (entry.attempts >= this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs;
    }
    
    this.storage.set(key, entry);
    
    return {
      blocked: entry.attempts >= this.maxAttempts,
      attemptsRemaining: Math.max(0, this.maxAttempts - entry.attempts),
      resetTime: entry.lastAttempt + this.windowMs,
      blockedUntil: entry.blockedUntil,
    };
  }

  public getRemainingTime(identifier: string, action: string): number {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    
    if (!entry || !entry.blockedUntil) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.blockedUntil - now);
  }

  public reset(identifier: string, action: string): void {
    const key = this.getKey(identifier, action);
    this.storage.delete(key);
  }

  public getAttemptCount(identifier: string, action: string): number {
    const key = this.getKey(identifier, action);
    const entry = this.storage.get(key);
    return entry?.attempts || 0;
  }
}

// Create singleton instances for different actions
export const signupRateLimiter = new RateLimiter(3, 15 * 60 * 1000, 30 * 60 * 1000); // 3 attempts per 15 min, block for 30 min
export const emailVerificationRateLimiter = new RateLimiter(5, 5 * 60 * 1000, 10 * 60 * 1000); // 5 attempts per 5 min, block for 10 min
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000, 15 * 60 * 1000); // 5 attempts per 15 min, block for 15 min

// Utility functions
export const getClientIP = (): string => {
  // In a real application, this would get the actual client IP
  // For now, we'll use a combination of user agent and timestamp as a fingerprint
  const userAgent = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a simple fingerprint
  const fingerprint = btoa(`${userAgent}:${screen}:${timezone}`).slice(0, 16);
  return fingerprint;
};

export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return '0 seconds';
  
  const minutes = Math.floor(ms / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

// CSRF Token utilities
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

// Initialize CSRF token on app load
export const initializeCSRF = (): string => {
  let token = getCSRFToken();
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  return token;
};
