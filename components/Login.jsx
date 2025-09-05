import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, role, editMode, signIn, signOut, toggleEditMode } = useAuth()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await signIn(email, password)
    
    if (result.success) {
      setShowModal(false)
      setEmail('')
      setPassword('')
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.success) {
      console.error('Logout error:', result.error)
    }
  }

  if (user) {
    return (
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{user.email}</span>
          <span className="user-role">{role}</span>
        </div>
        <button onClick={handleSignOut} className="logout-btn" title="Cerrar sesión">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="logout-text">Cerrar sesión</span>
        </button>
        {(role === 'admin' || role === 'tecnico') && (
          <button 
            onClick={toggleEditMode} 
            className={`edit-btn ${editMode ? 'active' : ''}`} 
            title={editMode ? "Desactivar modo edición" : "Activar modo edición"}
          >
            <i className={`fa-solid ${editMode ? 'fa-check' : 'fa-pen-to-square'}`}></i>
            <span className="edit-text">{editMode ? 'Editando' : 'Editar'}</span>
          </button>
        )}
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
              aria-label="Cerrar modal"
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

            <form className="auth-form" onSubmit={handleSignIn}>
              <div className="input-group">
                <label htmlFor="login-user">Usuario o Email</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    id="login-user"
                    type="email" 
                    placeholder="admin@residuos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}

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

              <div className="auth-hint">
                <p>Credenciales de prueba: admin@residuos.com / Admin1234</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
