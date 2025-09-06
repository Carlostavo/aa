import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('viewer')
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener sesión activa
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
      } else {
        setUser(null)
        setRole('viewer')
      }
      setLoading(false)
    }

    getSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserRole(session.user.id)
        } else {
          setUser(null)
          setRole('viewer')
          setEditMode(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        setRole(data.role)
      } else {
        setRole('viewer')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('viewer')
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setEditMode(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const toggleEditMode = () => {
    if (role === 'admin' || role === 'tecnico') {
      const newEditMode = !editMode
      setEditMode(newEditMode)
      
      if (newEditMode) {
        document.body.classList.add('edit-mode-active')
      } else {
        document.body.classList.remove('edit-mode-active')
      }
    }
  }

  const value = {
    user,
    role,
    editMode,
    loading,
    signIn,
    signOut,
    toggleEditMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}