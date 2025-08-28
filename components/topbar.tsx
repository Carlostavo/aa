"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "./auth-modal"
import { Button } from "@/components/ui/button"
import { Recycle, LogIn, LogOut, Edit } from "lucide-react"

interface TopbarProps {
  currentPage: string
  onPageChange: (page: string) => void
  editMode: boolean
  onToggleEdit: () => void
}

interface DemoUser {
  email: string
  role: "admin" | "tecnico" | "viewer"
  username: string
}

export function Topbar({ currentPage, onPageChange, editMode, onToggleEdit }: TopbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const { user, profile, signOut, supabaseConfigured } = useAuth()

  useEffect(() => {
    if (!supabaseConfigured) {
      // Check for stored demo user
      const storedUser = localStorage.getItem("demo_user")
      if (storedUser) {
        setDemoUser(JSON.parse(storedUser))
      }

      // Listen for demo auth changes
      const handleDemoAuthChange = (event: CustomEvent) => {
        setDemoUser(event.detail)
      }

      window.addEventListener("demo_auth_change", handleDemoAuthChange as EventListener)

      return () => {
        window.removeEventListener("demo_auth_change", handleDemoAuthChange as EventListener)
      }
    }
  }, [supabaseConfigured])

  const handleSignOut = async () => {
    if (!supabaseConfigured) {
      // Handle demo logout
      localStorage.removeItem("demo_user")
      setDemoUser(null)
      window.dispatchEvent(new CustomEvent("demo_auth_change", { detail: null }))
    } else {
      await signOut()
    }
  }

  // Use either real user/profile or demo user
  const currentUser = user || (demoUser ? { email: demoUser.email } : null)
  const currentProfile = profile || demoUser

  const navItems = [
    { id: "home", label: "Inicio", disabled: false },
    { id: "indicadores", label: "Indicadores", disabled: false },
    { id: "metas", label: "Metas", disabled: !currentProfile || currentProfile.role === "viewer" },
    { id: "avances", label: "Avances", disabled: !currentProfile || currentProfile.role === "viewer" },
    { id: "reportes", label: "Reportes", disabled: !currentProfile || currentProfile.role === "viewer" },
    { id: "formularios", label: "Formularios", disabled: false },
  ]

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-white shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Recycle className="w-8 h-8 text-green-600" />
          <span className="font-bold text-green-600 text-lg">Gestión RS</span>
        </div>

        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onPageChange(item.id)}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === item.id
                  ? "text-green-600 bg-green-50"
                  : item.disabled
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          ))}

          {currentProfile && (currentProfile.role === "admin" || currentProfile.role === "tecnico") && (
            <Button
              onClick={onToggleEdit}
              variant={editMode ? "default" : "outline"}
              size="sm"
              className={editMode ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modo edición
            </Button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm">Hola, {currentProfile?.username || currentUser.email}</span>
              <Button onClick={handleSignOut} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión
            </Button>
          )}
        </nav>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
