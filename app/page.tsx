"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Topbar } from "@/components/topbar"
import { PageContent } from "@/components/page-content"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home")
  const [editMode, setEditMode] = useState(false)
  const { profile, loading } = useAuth()

  // Reset edit mode when user logs out or role changes
  useEffect(() => {
    if (!profile || profile.role === "viewer") {
      setEditMode(false)
    }
  }, [profile])

  const handleToggleEdit = () => {
    if (profile && (profile.role === "admin" || profile.role === "tecnico")) {
      setEditMode(!editMode)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        editMode={editMode}
        onToggleEdit={handleToggleEdit}
      />

      <main className="container mx-auto max-w-7xl">
        <PageContent page={currentPage} editMode={editMode} onPageChange={setCurrentPage} />
      </main>
    </div>
  )
}
