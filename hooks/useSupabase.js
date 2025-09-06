import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabase = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('viewer');

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole('viewer');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (data) setUserRole(data.role);
      else setUserRole('viewer');
    } catch (error) {
      setUserRole('viewer');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpiar el estado local
      setSession(null);
      setUserRole('viewer');
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // ... otras funciones (saveCanvas, loadCanvas)

  return {
    session,
    userRole,
    signOut,
    // ... otras funciones
  };
};
