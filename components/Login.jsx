import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSupabase } from '../hooks/useSupabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { session, userRole, signOut } = useSupabase()

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
      }
    } catch (error) {
      alert("Error al iniciar sesión. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Forzar recarga completa para limpiar el estado
      window.location.reload()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('Error al cerrar sesión. Por favor, intenta nuevamente.')
    }
  }

  if (session) {
    return (
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{session.user.email}</span>
          <span className="user-role">{userRole}</span>
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
