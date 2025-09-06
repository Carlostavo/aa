import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabase = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('viewer');

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) await fetchUserRole(session.user.id);
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };
    
    getSession();

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
      
      if (data) {
        setUserRole(data.role);
      } else {
        setUserRole('viewer');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('viewer');
    }
  };

  const saveCanvas = async (slug, content) => {
    try {
      const { data, error } = await supabase
        .from('paginas')
        .upsert(
          { 
            slug, 
            content: JSON.stringify(content),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'slug',
            returning: 'minimal'
          }
        );

      if (error) {
        console.error('Error saving canvas:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in saveCanvas:', error);
      throw error;
    }
  };

  const loadCanvas = async (slug) => {
    try {
      const { data, error } = await supabase
        .from('paginas')
        .select('content')
        .eq('slug', slug)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error) {
        console.error('Error loading canvas:', error);
        return { items: [] };
      }

      // Si no hay datos o el contenido está vacío
      if (!data || !data.content) {
        return { items: [] };
      }

      // Validar y parsear el contenido JSON
      try {
        const parsed = JSON.parse(data.content);
        // Asegurarse de que tenga la estructura correcta
        return Array.isArray(parsed.items) ? parsed : { items: [] };
      } catch (parseError) {
        console.error('Error parsing JSON content:', parseError, 'Content:', data.content);
        // Si el contenido no es JSON válido, devolver estructura vacía
        return { items: [] };
      }
    } catch (error) {
      console.error('Error in loadCanvas:', error);
      return { items: [] };
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

  return {
    session,
    userRole,
    saveCanvas,
    loadCanvas,
    signOut
  };
};
