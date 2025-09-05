import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)

  async function signIn(){
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      setSession(data.session)
    }
  }

  async function signOut(){
    await supabase.auth.signOut()
    setSession(null)
  }

  if(session){
    return (
      <div className="flex gap-4 items-center">
        <span>{session.user.email}</span>
        <button onClick={signOut} className="bg-red-600 text-white">Salir</button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        className="border rounded px-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-2"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn} className="bg-secondary text-white">Entrar</button>
    </div>
  )
}