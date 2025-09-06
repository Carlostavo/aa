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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        await fetchUserRole(session.user.id)
      }
    }
    getSession()

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

  const fetchUserRole = async (userId) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()
      if (data) setRole(data.role)
    } catch (error) {
      setRole('viewer')
    }
  }

  async function signIn() {
    setLoading(true)
    try {
      const authData = await supabase.auth.signInWithPassword({ 
        email: email.includes('@') ? email : `${email}@residuos.com`, 
        password 
      })
      
      if (authData.error) {
        alert("Credenciales incorrectas. Use admin@residuos.com / Admin1234")
      } else {
        setSession(authData.session)
        setShowModal(false)
      }
    } catch (error) {
      alert("Error al iniciar sesión")
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRole('viewer')
  }

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
      </div>
    )
  }

  return (
    <>
      <button className="login-btn-nav" onClick={() => setShowModal(true)}>
        <i className="fa-solid fa-right-to-bracket"></i>
        <span>Iniciar Sesión</span>
      </button>

      {showModal && (
        <div className="auth-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <div className="auth-header">
              <div className="auth-icon">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h2>Iniciar Sesión</h2>
            </div>

            <div className="auth-form">
              <div className="input-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="admin@residuos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && signIn()}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-key"></i>
                  <input 
                    type="password" 
                    placeholder="Admin1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && signIn()}
                  />
                </div>
              </div>

              <button onClick={signIn} disabled={loading} className="auth-submit-btn">
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
