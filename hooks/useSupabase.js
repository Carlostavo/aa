import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('viewer')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cargar sesión al iniciar
  useEffect(() => {
    checkSession()
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          await fetchUserRole(session.user.id)
        } else {
          setRole('viewer')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) {
        await fetchUserRole(session.user.id)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

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

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.includes('@') ? email : `${email}@residuos.com`,
        password
      })

      if (error) {
        alert("Credenciales incorrectas. Use admin@residuos.com / Admin1234")
      } else {
        setShowModal(false)
        setEmail('')
        setPassword('')
        // Recargar la página para actualizar el estado completamente
        window.location.reload()
      }
    } catch (error) {
      alert("Error al iniciar sesión. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error al cerrar sesión:', error)
        alert('Error al cerrar sesión. Por favor, intenta nuevamente.')
        return
      }
      
      // Forzar recarga completa de la página
      window.location.href = '/'
      
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error)
      alert('Error inesperado al cerrar sesión.')
    }
  }

  if (session) {
    return (
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{session.user.email}</span>
          <span className="user-role">{role}</span>
        </div>
        <button onClick={handleSignOut} className="logout-btn" title="Cerrar sesión">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="logout-text">Cerrar sesión</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <button 
        className="login-btn-nav"
        onClick={() => setShowModal(true)}
      >
        <i className="fa-solid fa-right-to-bracket"></i>
        <span>Iniciar Sesión</span>
      </button>

      {showModal && (
        <div className="auth-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <div className="auth-header">
              <div className="auth-icon">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSignIn} className="auth-form">
              <div className="input-group">
                <label htmlFor="login-user">Usuario o Email</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    id="login-user"
                    type="text" 
                    placeholder="admin@residuos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="login-pass">Contraseña</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-key"></i>
                  <input 
                    id="login-pass"
                    type="password" 
                    placeholder="Admin1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            <div className="auth-hint">
              <p>💡 Use: admin@residuos.com / Admin1234</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
