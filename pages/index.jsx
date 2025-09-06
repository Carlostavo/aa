import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Editor from '../components/Editor'
import Link from 'next/link'

export default function Home() {
  const [pageContent, setPageContent] = useState({
    title: "Sistema de Gestión de Residuos Sólidos",
    subtitle: "La plataforma para monitorear indicadores, gestionar metas y generar reportes para una gestión ambiental eficiente.",
    cards: [
      { 
        title: "Gestión de Metas", 
        desc: "Establece y sigue tus objetivos de sostenibilidad de manera intuitiva.", 
        icon: "fa-bullseye", 
        color: "#38a169", 
        class: "metas", 
        page: "metas", 
        disabled: true 
      },
      { 
        title: "Dashboard de Indicadores", 
        desc: "Visualiza en tiempo real el rendimiento del sistema de gestión.", 
        icon: "fa-chart-line", 
        color: "#4299e1", 
        class: "indicadores", 
        page: "indicadores", 
        disabled: false 
      },
      { 
        title: "Seguimiento de Avances", 
        desc: "Revisa el progreso de tus proyectos de reciclaje y reducción de residuos.", 
        icon: "fa-chart-area", 
        color: "#ecc94b", 
        class: "avances", 
        page: "avances", 
        disabled: true 
      },
      { 
        title: "Generación de Reportes", 
        desc: "Crea y exporta informes detallados para auditorías o análisis.", 
        icon: "fa-file-lines", 
        color: "#e53e3e", 
        class: "reportes", 
        page: "reportes", 
        disabled: true 
      },
      { 
        title: "Formularios de Datos", 
        desc: "Ingresa y gestiona datos a través de formularios personalizados.", 
        icon: "fa-file-alt", 
        color: "#673ab7", 
        class: "formularios", 
        page: "formularios", 
        disabled: false 
      },
    ]
  })
  const { role } = useAuth()

  useEffect(() => {
    // Cargar contenido personalizado si existe
    const loadPageContent = async () => {
      try {
        const { data, error } = await supabase
          .from('paginas')
          .select('content')
          .eq('slug', '/')
          .single()
        
        if (data?.content) {
          const savedContent = JSON.parse(data.content)
          setPageContent(prev => ({ ...prev, ...savedContent }))
        }
      } catch (error) {
        console.error('Error loading page content:', error)
      }
    }

    loadPageContent()
  }, [])

  const handleSave = (field, value) => {
    setPageContent(prev => ({ ...prev, [field]: value }))
  }

  const handleCardSave = (index, field, value) => {
    setPageContent(prev => {
      const updatedCards = [...prev.cards]
      updatedCards[index] = { ...updatedCards[index], [field]: value }
      return { ...prev, cards: updatedCards }
    })
  }

  return (
    <div>
      <div className="hero">
        <h1>
          <Editor 
            element={pageContent} 
            field="title" 
            onSave={handleSave}
          />
        </h1>
        <p>
          <Editor 
            element={pageContent} 
            field="subtitle" 
            onSave={handleSave}
            contentType="textarea"
          />
        </p>
      </div>
      
      <div className="cards">
        {pageContent.cards.map((card, index) => (
          <Link 
            key={index}
            href={(card.disabled && role !== 'admin' && role !== 'tecnico') ? '#' : `/${card.page}`}
            passHref
          >
            <div 
              className={`card ${card.class} ${card.disabled && role !== 'admin' && role !== 'tecnico' ? 'disabled' : ''}`}
              data-disabled-message={card.disabled ? "Acceso denegado. Esta función no está disponible en este momento." : ""}
            >
              <div className="card-icon" style={{background: card.color}}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <div className="card-content">
                <div className="card-title">
                  <Editor 
                    element={card} 
                    field="title" 
                    onSave={(field, value) => handleCardSave(index, field, value)}
                  />
                </div>
                <div className="card-desc">
                  <Editor 
                    element={card} 
                    field="desc" 
                    onSave={(field, value) => handleCardSave(index, field, value)}
                    contentType="textarea"
                  />
                </div>
              </div>
              {card.disabled && (
                <div className="card-badge">
                  <span>Próximamente</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
