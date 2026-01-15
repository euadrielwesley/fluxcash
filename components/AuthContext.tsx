
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('flux_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem('flux_user_profile'));
  const [isDemo, setIsDemo] = useState(false);
  const { pushNotification } = useNotification();

  // ... (formatUser function remains same)

  useEffect(() => {
    // 1. Check active session on mount
    const checkSession = async () => {
      // NOTE: Cache is already loaded in initial state. 
      // We only strictly need to verify if the token is valid.

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          const profile = await formatUser(session.user);
          setUser(profile);
          localStorage.setItem('flux_user_profile', JSON.stringify(profile));
        } else {
          // If no session and not demo, clear state
          if (!isDemo) {
            // Only clear if we actually had something that turned out invalid
            if (localStorage.getItem('flux_user_profile')) {
              localStorage.removeItem('flux_user_profile');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    try {
      // Enforce a timeout to prevent infinite loading screen
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null }, error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 7000)
      );

      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

      if (error) throw error;

      if (session?.user) {
        const profile = await formatUser(session.user);
        setUser(profile);
        // OTIMIZAÇÃO: Salvar cache atualizado
        localStorage.setItem('flux_user_profile', JSON.stringify(profile));
      } else {
        if (!isDemo) localStorage.removeItem('flux_user_profile');
      }
    } catch (error) {
      console.error('Session check failed or timeout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  checkSession();

  // 2. Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await formatUser(session.user);
      setUser(profile);
      localStorage.setItem('flux_user_profile', JSON.stringify(profile));
      setIsDemo(false);
    } else if (!isDemo) {
      // Only clear if not in demo mode (controlled manually)
      setUser(null);
      localStorage.removeItem('flux_user_profile');
    }
    setIsLoading(false);
  });

  return () => subscription.unsubscribe();
}, [isDemo]);

const login = async (email: string, pass: string) => {
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw new Error(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message);
    }
  } catch (err) {
    setIsLoading(false);
    throw err;
  }
};

const loginDemo = async () => {
  setIsLoading(true);

  const demoUser: UserProfile = {
    id: 'demo-user-123',
    name: 'Usuário Demo',
    email: 'demo@fluxcash.ai',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=random&color=fff&background=7c3aed',
    xp: 2450,
    level: 5,
    profession: 'Tester',
    plan: { name: 'Obsidian Pro', status: 'active', renewalDate: new Date().toISOString(), price: 29.90 },
    hasOnboarding: false // Trigger onboarding for demo
  };

  setIsDemo(true);
  setUser(demoUser);
  setIsLoading(false);

  pushNotification({
    title: 'Modo Demonstração',
    message: 'Você está em um ambiente local. Dados não serão salvos na nuvem.',
    type: 'info',
    category: 'system'
  });
};

const register = async (name: string, email: string, pass: string) => {
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name: name }
      }
    });

    if (error) throw new Error(error.message);

    pushNotification({
      title: 'Conta Criada!',
      message: 'Verifique seu email se necessário ou faça login.',
      type: 'success',
      category: 'system'
    });
  } catch (err) {
    setIsLoading(false);
    throw err;
  }
};

const logout = async () => {
  if (isDemo) {
    setIsDemo(false);
    setUser(null);
  } else {
    await supabase.auth.signOut();
    setUser(null);
  }
  localStorage.clear();
  window.location.reload();
};

return (
  <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    isLoading,
    isDemo,
    login,
    loginDemo,
    register,
    logout
  }}>
    {children}
  </AuthContext.Provider>
);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
