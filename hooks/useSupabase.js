import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchar cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.includes('@') ? email : `${email}@residuos.com`,
        password
      })

      if (error) throw error
      
      setShowModal(false)
      setEmail('')
      setPassword('')
      window.location.reload()
      
    } catch (error) {
      alert("Credenciales incorrectas. Use admin@residuos.com / Admin1234")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Recarga forzada para limpiar todo
      window.location.href = '/'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (session) {
    return (
      <div className="user-info">
        <span className="user-name">{session.user.email}</span>
        <button onClick={handleSignOut} className="logout-btn">
          <i className="fa-solid fa-right-from-bracket"></i>
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <>
      <button className="login-btn-nav" onClick={() => setShowModal(true)}>
        <i className="fa-solid fa-right-to-bracket"></i>
        Iniciar Sesión
      </button>

      {showModal && (
        <div className="auth-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSignIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}
