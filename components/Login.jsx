import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('viewer')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

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

  async function signIn() {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.includes('@') ? email : `${email}@residuos.com`, 
      password 
    })
    
    if (error) {
      alert("Credenciales incorrectas. Por favor, intente nuevamente.")
    } else {
      setSession(data.session)
      setShowModal(false)
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRole('viewer')
  }

  // Si ya hay sesión, mostrar información del usuario
  if (session) {
    return (
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{session.user.email.split('@')[0]}</span>
          <span className="user-role">{role}</span>
        </div>
        <button onClick={signOut} className="logout-btn" title="Cerrar sesión">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
        {(role === 'admin' || role === 'tecnico') && (
          <button id="toggle-edit" className="edit-btn" title="Modo edición">
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        )}
      </div>
    )
  }

  // Si no hay sesión, mostrar botón de login
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

            <div className="auth-form">
              <div className="input-group">
                <label htmlFor="login-user">Usuario</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    id="login-user"
                    type="text" 
                    placeholder="Ingresa tu usuario"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && signIn()}
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
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && signIn()}
                  />
                </div>
              </div>

              <button 
                onClick={signIn} 
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
