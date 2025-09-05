import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('viewer')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    // Verificar sesión activa al cargar
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        // Obtener rol del usuario
        await fetchUserRole(session.user.id)
      }
    }
    getSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          await fetchUserRole(session.user.id)
        } else {
          setRole('viewer')
          setEditMode(false)
        }
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
        // Si no tiene rol asignado, por defecto es viewer
        setRole('viewer')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('viewer')
    }
  }

  async function signIn() {
    setLoading(true)
    try {
      // Intentar iniciar sesión con email completo primero
      let authData = await supabase.auth.signInWithPassword({ 
        email: email.includes('@') ? email : `${email}@residuos.com`, 
        password 
      })
      
      // Si falla, intentar con el usuario como email sin dominio
      if (authData.error && !email.includes('@')) {
        authData = await supabase.auth.signInWithPassword({ 
          email: email, 
          password 
        })
      }
      
      if (authData.error) {
        alert("Credenciales incorrectas. Por favor, intente nuevamente.")
        console.error('Login error:', authData.error)
      } else {
        setSession(authData.session)
        setShowModal(false)
      }
    } catch (error) {
      alert("Error al iniciar sesión. Por favor, intente nuevamente.")
      console.error('Login exception:', error)
    }
    setLoading(false)
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setRole('viewer')
      setEditMode(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleEditMode = () => {
    setEditMode(prev => !prev)
    // Aquí puedes agregar lógica adicional para el modo edición
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
          <button 
            onClick={toggleEditMode} 
            className={`edit-btn ${editMode ? 'active' : ''}`} 
            title="Modo edición"
          >
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
                <label htmlFor="login-user">Usuario o Email</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    id="login-user"
                    type="text" 
                    placeholder="admin, admin@residuos.com"
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

              <div className="auth-hint">
                <p>💡 Tip: Puedes usar tu nombre de usuario o email completo</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
