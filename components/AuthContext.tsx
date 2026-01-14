
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const { pushNotification } = useNotification();

  // Função auxiliar para mapear User do Supabase para UserProfile do App
  const formatUser = async (sessionUser: any) => {
    if (!sessionUser) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (profile) {
        return {
          id: profile.id,
          name: profile.name || sessionUser.email?.split('@')[0],
          email: sessionUser.email!,
          avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name}`,
          xp: profile.xp || 0,
          level: profile.level || 1,
          profession: profile.profession || 'Explorador',
          plan: { 
              name: profile.plan_name || 'Free', 
              status: 'active', 
              renewalDate: new Date().toISOString(), 
              price: profile.plan_name === 'Obsidian Pro' ? 29.90 : 0 
          },
          hasOnboarding: profile.has_onboarding
        } as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching profile:', e);
    }
    
    // Fallback if profile fetch fails but auth is valid
    return {
        id: sessionUser.id,
        name: sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email!,
        avatarUrl: `https://ui-avatars.com/api/?name=User`,
        xp: 0,
        level: 1,
        profession: 'N/A',
        plan: { name: 'Free', status: 'active', renewalDate: new Date().toISOString(), price: 0 },
        hasOnboarding: false
    } as UserProfile;
  };

  useEffect(() => {
    // 1. Check active session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const profile = await formatUser(session.user);
          setUser(profile);
        }
      } catch (error) {
        console.error('Session check failed', error);
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
        setIsDemo(false);
      } else if (!isDemo) {
        // Only clear if not in demo mode (controlled manually)
        setUser(null);
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
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
    
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
