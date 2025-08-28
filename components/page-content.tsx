"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PageCard {
  title: string
  desc: string
  icon: string
  color: string
  class: string
  page?: string
  disabled?: boolean
}

interface PageData {
  title: string
  subtitle: string
  cards?: PageCard[]
}

interface PageContentProps {
  page: string
  editMode: boolean
  onPageChange: (page: string) => void
}

export function PageContent({ page, editMode, onPageChange }: PageContentProps) {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState(false)
  const { profile } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadPageContent()
  }, [page])

  const loadPageContent = async () => {
    try {
      if (!supabase) {
        console.warn("Supabase not configured, using default content")
        setSupabaseError(true)
        setPageData(getDefaultContent(page))
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from("page_content").select("content").eq("page_name", page).single()

      if (error) {
        console.error("Error loading page content:", error)
        setPageData(getDefaultContent(page))
      } else {
        setPageData(data.content as PageData)
      }
    } catch (error) {
      console.error("Error:", error)
      setPageData(getDefaultContent(page))
    } finally {
      setLoading(false)
    }
  }

  const savePageContent = async (newData: PageData) => {
    if (!profile || (profile.role !== "admin" && profile.role !== "tecnico")) return

    if (!supabase) {
      console.warn("Cannot save: Supabase not configured")
      return
    }

    try {
      const { error } = await supabase.from("page_content").upsert({
        page_name: page,
        content: newData,
        updated_by: profile.id,
      })

      if (error) {
        console.error("Error saving page content:", error)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleTextEdit = (field: "title" | "subtitle", value: string) => {
    if (!pageData) return

    const newData = { ...pageData, [field]: value }
    setPageData(newData)

    // Debounced save
    setTimeout(() => savePageContent(newData), 1000)
  }

  const handleCardClick = (card: PageCard) => {
    if (editMode) return

    if (card.disabled && (!profile || profile.role === "viewer")) {
      alert("Acceso denegado. Esta función no está disponible en este momento.")
      return
    }

    if (card.page) {
      onPageChange(card.page)
    }
  }

  const getDefaultContent = (pageName: string): PageData => {
    const defaultPages: Record<string, PageData> = {
      home: {
        title: "Sistema de Gestión de Residuos Sólidos",
        subtitle:
          "La plataforma para monitorear indicadores, gestionar metas y generar reportes para una gestión ambiental eficiente.",
        cards: [
          {
            title: "Gestión de Metas",
            desc: "Establece y sigue tus objetivos de sostenibilidad de manera intuitiva.",
            icon: "fa-bullseye",
            color: "#38a169",
            class: "metas",
            page: "metas",
            disabled: true,
          },
          {
            title: "Dashboard de Indicadores",
            desc: "Visualiza en tiempo real el rendimiento del sistema de gestión.",
            icon: "fa-chart-line",
            color: "#4299e1",
            class: "indicadores",
            page: "indicadores",
            disabled: false,
          },
          {
            title: "Seguimiento de Avances",
            desc: "Revisa el progreso de tus proyectos de reciclaje y reducción de residuos.",
            icon: "fa-chart-area",
            color: "#ecc94b",
            class: "avances",
            page: "avances",
            disabled: true,
          },
          {
            title: "Generación de Reportes",
            desc: "Crea y exporta informes detallados para auditorías o análisis.",
            icon: "fa-file-lines",
            color: "#e53e3e",
            class: "reportes",
            page: "reportes",
            disabled: true,
          },
          {
            title: "Formularios de Datos",
            desc: "Ingresa y gestiona datos a través de formularios personalizados.",
            icon: "fa-file-alt",
            color: "#673ab7",
            class: "formularios",
            page: "formularios",
            disabled: false,
          },
        ],
      },
      indicadores: {
        title: "Dashboard de Indicadores Clave",
        subtitle:
          "Aquí podrás ver todos los indicadores de gestión de residuos en tiempo real. Utiliza las herramientas de edición para añadir gráficos y métricas.",
        cards: [
          {
            title: "Métricas de Reciclaje",
            desc: "Cantidad de material reciclado por mes, tasa de recuperación, etc.",
            icon: "fa-recycle",
            color: "#38a169",
            class: "metas",
          },
          {
            title: "Indicadores Financieros",
            desc: "Costos de gestión, ingresos por ventas de material, etc.",
            icon: "fa-dollar-sign",
            color: "#4299e1",
            class: "indicadores",
          },
          {
            title: "Rendimiento Operacional",
            desc: "Eficiencia de rutas de recolección, tiempo de procesamiento, etc.",
            icon: "fa-road",
            color: "#ecc94b",
            class: "avances",
          },
          {
            title: "Impacto Ambiental",
            desc: "Reducción de emisiones de CO2, ahorro de agua, etc.",
            icon: "fa-tree",
            color: "#e53e3e",
            class: "reportes",
          },
        ],
      },
    }

    return defaultPages[pageName] || { title: "Página", subtitle: "Contenido de la página" }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  if (!pageData) {
    return <div className="flex justify-center items-center h-64">Error al cargar el contenido</div>
  }

  return (
    <div className="p-6">
      {supabaseError && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <strong>Configuración pendiente:</strong> Para habilitar la funcionalidad completa (autenticación y guardado
            automático), configura las variables de entorno de Supabase en tu proyecto de Vercel.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-12 mb-8 text-center border border-green-200">
        <h1
          className={`text-4xl font-bold text-green-700 mb-4 max-w-4xl mx-auto leading-tight ${
            editMode ? "outline-dashed outline-2 outline-blue-400 outline-offset-4 p-2" : ""
          }`}
          contentEditable={editMode}
          suppressContentEditableWarning={true}
          onBlur={(e) => handleTextEdit("title", e.target.textContent || "")}
        >
          {pageData.title}
        </h1>
        <p
          className={`text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed ${
            editMode ? "outline-dashed outline-2 outline-blue-400 outline-offset-4 p-2" : ""
          }`}
          contentEditable={editMode}
          suppressContentEditableWarning={true}
          onBlur={(e) => handleTextEdit("subtitle", e.target.textContent || "")}
        >
          {pageData.subtitle}
        </p>
      </div>

      {/* Cards Grid */}
      {pageData.cards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageData.cards.map((card, index) => {
            const isDisabled = card.disabled && (!profile || profile.role === "viewer")

            return (
              <Card
                key={index}
                className={`transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                  isDisabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
                } ${editMode ? "ring-2 ring-blue-200" : ""}`}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: card.color }}
                    >
                      <i className={`fas ${card.icon} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{card.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
