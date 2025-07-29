export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin' | 'compliance';
  department?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
}

// Hardcoded users for demo
export const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'student@gxp.in',
    password: '123456789',
    name: 'John Student',
    role: 'student',
    department: 'Quality Assurance'
  },
  {
    id: '2',
    email: 'admin@gxp.in',
    password: '123456789',
    name: 'Sarah Admin',
    role: 'admin',
    department: 'IT'
  },
  {
    id: '3',
    email: 'compliance@gxp.in',
    password: '123456789',
    name: 'Mike Compliance',
    role: 'compliance',
    department: 'Compliance'
  }
];

export const validateCredentials = (email: string, password: string): User | null => {
  return DEMO_USERS.find(user => user.email === email && user.password === password) || null;
};

export const getRoleBasedRoute = (role: string): string => {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'admin':
      return '/dashboard/admin';
    case 'compliance':
      return '/dashboard/compliance';
    default:
      return '/login';
  }
};