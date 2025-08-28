"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn, supabaseConfigured } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabaseConfigured) {
      // Simulate local authentication for demo purposes
      const validCredentials = [
        { email: "admin@gestionrs.com", password: "1234", role: "admin" },
        { email: "tecnico@gestionrs.com", password: "1234", role: "tecnico" },
        { email: "viewer@gestionrs.com", password: "1234", role: "viewer" },
      ]

      const validUser = validCredentials.find((cred) => cred.email === email && cred.password === password)

      if (validUser) {
        // Store user info in localStorage for demo
        localStorage.setItem(
          "demo_user",
          JSON.stringify({
            email: validUser.email,
            role: validUser.role,
            username: validUser.role,
          }),
        )

        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent("demo_auth_change", { detail: validUser }))

        onClose()
        setEmail("")
        setPassword("")
      } else {
        setError(
          "Credenciales incorrectas. Use: admin@gestionrs.com, tecnico@gestionrs.com o viewer@gestionrs.com con contraseña '1234'",
        )
      }
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)

    if (error) {
      setError("Credenciales incorrectas. Use las credenciales predeterminadas.")
    } else {
      onClose()
      setEmail("")
      setPassword("")
    }

    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Iniciar sesión</DialogTitle>
        </DialogHeader>

        {!supabaseConfigured && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Modo demo:</strong> Use las credenciales de prueba para acceder al sistema.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Usuario/Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@gestionrs.com / tecnico@gestionrs.com / viewer@gestionrs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Entrar"}
            </Button>

            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={onClose}>
              Salir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
