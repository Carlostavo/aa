import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home(){
  const [role, setRole] = useState('viewer')
  const [content, setContent] = useState({
    title: "Sistema de Gestión de Residuos Sólidos",
    subtitle: "La plataforma para monitorear indicadores, gestionar metas y generar reportes para una gestión ambiental eficiente.",
    cards: [
      { title: "Gestión de Metas", desc: "Establece y sigue tus objetivos de sostenibilidad de manera intuitiva.", icon: "fa-bullseye", color: "#38a169", class: "metas", page: "metas", disabled: true },
      { title: "Dashboard de Indicadores", desc: "Visualiza en tiempo real el rendimiento del sistema de gestión.", icon: "fa-chart-line", color: "#4299e1", class: "indicadores", page: "indicadores", disabled: false },
      { title: "Seguimiento de Avances", desc: "Revisa el progreso de tus proyectos de reciclaje y reducción de residuos.", icon: "fa-chart-area", color: "#ecc94b", class: "avances", page: "avances", disabled: true },
      { title: "Generación de Reportes", desc: "Crea y exporta informes detallados para auditorías o análisis.", icon: "fa-file-lines", color: "#e53e3e", class: "reportes", page: "reportes", disabled: true },
      { title: "Formularios de Datos", desc: "Ingresa y gestiona datos a través de formularios personalizados.", icon: "fa-file-alt", color: "#673ab7", class: "formularios", page: "formularios", disabled: false },
    ]
  })

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
          if (data) setRole(data.role)
        } catch (error) {
          setRole('viewer')
        }
      }
    }
    getRole()
  }, [])

  const navigateToPage = (page) => {
    window.location.href = `/${page}`
  }

  return (
    <div>
      <div className="hero">
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
      </div>
      
      <div className="cards">
        {content.cards.map((card, index) => (
          <div 
            key={index} 
            className={`card ${card.class} ${card.disabled && role !== 'admin' && role !== 'tecnico' ? 'disabled' : ''}`}
            onClick={() => !card.disabled || role === 'admin' || role === 'tecnico' ? navigateToPage(card.page) : null}
          >
            <div className="card-icon" style={{background: card.color}}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <div className="card-content">
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
