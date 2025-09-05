import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('viewer')

  useEffect(() => {
    // Verificar sesión activa al cargar
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        // Obtener rol del usuario
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
        if (data) setRole(data.role)
      }
    }
    getSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          if (data) setRole(data.role)
        } else {
          setRole('viewer')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(){
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.includes('@') ? email : `${email}@residuos.com`, 
      password 
    })
    if (error) {
      alert(error.message)
    } else {
      setSession(data.session)
    }
  }

  async function signOut(){
    await supabase.auth.signOut()
    setSession(null)
    setRole('viewer')
  }

  if(session){
    return (
      <div className="flex gap-4 items-center">
        <span>{session.user.email}</span>
        <button onClick={signOut} className="bg-red-600 text-white">Salir</button>
        {(role === 'admin' || role === 'tecnico') && (
          <button id="toggle-edit" className="bg-primary text-white">
            <i className="fa-solid fa-pen-to-square"></i> Modo edición
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        className="border rounded px-2"
        type="text"
        placeholder="Usuario (admin, tecnico, viewer)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-2"
        type="password"
        placeholder="Contraseña (1234)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn} className="bg-secondary text-white">Entrar</button>
    </div>
  )
}
