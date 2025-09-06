import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabase = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('viewer');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

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
          { onConflict: 'slug' }
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
        .single();

      if (error) {
        console.error('Error loading canvas:', error);
        return { items: [] };
      }

      if (!data || !data.content) {
        return { items: [] };
      }

      // Validar y parsear el contenido JSON
      try {
        const parsed = JSON.parse(data.content);
        return parsed;
      } catch (parseError) {
        console.error('Error parsing JSON content:', parseError);
        // Si el contenido no es JSON válido, devolver estructura vacía
        return { items: [] };
      }
    } catch (error) {
      console.error('Error in loadCanvas:', error);
      return { items: [] };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    userRole,
    saveCanvas,
    loadCanvas,
    signOut
  };
};
