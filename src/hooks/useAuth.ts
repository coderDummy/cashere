import { useState, useEffect, createContext, useContext } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as Profile } from '../types';

export interface AuthContextType {
  authUser: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useProvideAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setAuthUser(user);

        if (user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();
          setProfile(userProfile as Profile | null);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Error fetching session or profile", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setAuthUser(user);
        if (user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();
          setProfile(userProfile as Profile | null);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  return {
    authUser,
    profile,
    loading,
    signIn,
    signOut,
  };
}