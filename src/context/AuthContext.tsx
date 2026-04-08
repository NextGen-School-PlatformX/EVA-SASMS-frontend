'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT' | 'APPLICANT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEYS = {
  TOKEN: 'sasms_token',
  ROLE: 'sasms_role',
  USER: 'sasms_user',
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): Pick<AuthState, 'token' | 'role' | 'user'> {
  if (typeof window === 'undefined') {
    return { token: null, role: null, user: null };
  }
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole | null;
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userJson ? (JSON.parse(userJson) as User) : null;
    return { token, role, user };
  } catch {
    return { token: null, role: null, user: null };
  }
}

import Cookies from 'js-cookie';

function setStoredAuth(token: string, role: UserRole, user: User): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  Cookies.set('sasms_token', token, { expires: 1 }); // 1 day
  Cookies.set('sasms_role', role, { expires: 1 });
}

function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER);
  Cookies.remove('sasms_token');
  Cookies.remove('sasms_role');
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    loading: true,
  });

  const initAuth = useCallback(() => {
    const { token, role, user } = getStoredAuth();
    const isAuthenticated = Boolean(token && role && user);
    setState({
      user: isAuthenticated ? user : null,
      token: isAuthenticated ? token : null,
      role: isAuthenticated ? role : null,
      isAuthenticated,
      loading: false,
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initAuth();
  }, [initAuth]);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        console.log('Attempting login to:', 'http://127.0.0.1:5001/api/auth/login');
        const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        console.log('Login response status:', response.status);

        if (!response.ok) {
          let errorMsg = 'Login failed';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } else {
              errorMsg = await response.text();
            }
          } catch (e) { }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const { user, token } = data;

        // Ensure roles match if enforced by UI, otherwise trust backend
        setStoredAuth(token, user.role, user);
        setState({
          user,
          token,
          role: user.role,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          let errorMsg = 'Registration failed';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } else {
              errorMsg = await response.text();
            }
          } catch (e) { }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const { user, token } = data;

        setStoredAuth(token, user.role, user);
        setState({
          user,
          token,
          role: user.role,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setState({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    });
    window.location.href = '/login';
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
