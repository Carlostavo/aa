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
      // Intentar diferentes formatos de email
      const loginAttempts = [
        { email: email, password: password },
        { email: email.includes('@') ? email : `${email}@residuos.com`, password: password },
        { email: email.includes('@') ? email : `${email}@gmail.com`, password: password }
      ];
      
      let authData;
      for (const attempt of loginAttempts) {
        authData = await supabase.auth.signInWithPassword(attempt);
        if (!authData.error) break;
      }
      
      if (authData.error) {
        alert("Email o contraseña incorrectos. Use admin@residuos.com / Admin1234")
      } else {
        setSession(authData.session)
        setShowModal(false)
        // Recargar la página para actualizar el estado global
        window.location.reload()
      }
    } catch (error) {
      alert("Error al iniciar sesión. Por favor, intente nuevamente.")
    }
    setLoading(false)
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setRole('viewer')
      setEditMode(false)
      // Recargar la página para actualizar el estado
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleEditMode = () => {
    const newEditMode = !editMode
    setEditMode(newEditMode)
    
    // Aquí puedes agregar lógica para el modo edición
    if (newEditMode) {
      document.body.classList.add('edit-mode-active')
      alert('Modo edición activado')
    } else {
      document.body.classList.remove('edit-mode-active')
      alert('Modo edición desactivado')
    }
  }

  // Si ya hay sesión, mostrar información del usuario
  if (session) {
    return (
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{session.user.email}</span>
          <span className="user-role">{role}</span>
        </div>
        <button onClick={signOut} className="logout-btn" title="Cerrar sesión">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="logout-text">Cerrar sesión</span>
        </button>
        {(role === 'admin' || role === 'tecnico') && (
          <button 
            onClick={toggleEditMode} 
            className={`edit-btn ${editMode ? 'active' : ''}`} 
            title={editMode ? "Desactivar modo edición" : "Activar modo edición"}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            <span className="edit-text">{editMode ? 'Editando' : 'Editar'}</span>
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
                    placeholder="admin@residuos.com"
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
                    placeholder="Admin1234"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
