-- Seeding initial data for the waste management system
-- Insert default users (these will be managed through Supabase Auth)
INSERT INTO users (email, username, role) VALUES
  ('admin@gestionrs.com', 'admin', 'admin'),
  ('tecnico@gestionrs.com', 'tecnico', 'tecnico'),
  ('viewer@gestionrs.com', 'viewer', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_name, content) VALUES
  ('home', '{
    "title": "Sistema de Gestión de Residuos Sólidos",
    "subtitle": "La plataforma para monitorear indicadores, gestionar metas y generar reportes para una gestión ambiental eficiente.",
    "cards": [
      {
        "title": "Gestión de Metas",
        "desc": "Establece y sigue tus objetivos de sostenibilidad de manera intuitiva.",
        "icon": "fa-bullseye",
        "color": "#38a169",
        "class": "metas",
        "page": "metas",
        "disabled": true
      },
      {
        "title": "Dashboard de Indicadores",
        "desc": "Visualiza en tiempo real el rendimiento del sistema de gestión.",
        "icon": "fa-chart-line",
        "color": "#4299e1",
        "class": "indicadores",
        "page": "indicadores",
        "disabled": false
      },
      {
        "title": "Seguimiento de Avances",
        "desc": "Revisa el progreso de tus proyectos de reciclaje y reducción de residuos.",
        "icon": "fa-chart-area",
        "color": "#ecc94b",
        "class": "avances",
        "page": "avances",
        "disabled": true
      },
      {
        "title": "Generación de Reportes",
        "desc": "Crea y exporta informes detallados para auditorías o análisis.",
        "icon": "fa-file-lines",
        "color": "#e53e3e",
        "class": "reportes",
        "page": "reportes",
        "disabled": true
      },
      {
        "title": "Formularios de Datos",
        "desc": "Ingresa y gestiona datos a través de formularios personalizados.",
        "icon": "fa-file-alt",
        "color": "#673ab7",
        "class": "formularios",
        "page": "formularios",
        "disabled": false
      }
    ]
  }'),
  ('indicadores', '{
    "title": "Dashboard de Indicadores Clave",
    "subtitle": "Aquí podrás ver todos los indicadores de gestión de residuos en tiempo real. Utiliza las herramientas de edición para añadir gráficos y métricas.",
    "cards": [
      {
        "title": "Métricas de Reciclaje",
        "desc": "Cantidad de material reciclado por mes, tasa de recuperación, etc.",
        "icon": "fa-recycle",
        "color": "#38a169",
        "class": "metas"
      },
      {
        "title": "Indicadores Financieros",
        "desc": "Costos de gestión, ingresos por ventas de material, etc.",
        "icon": "fa-dollar-sign",
        "color": "#4299e1",
        "class": "indicadores"
      },
      {
        "title": "Rendimiento Operacional",
        "desc": "Eficiencia de rutas de recolección, tiempo de procesamiento, etc.",
        "icon": "fa-road",
        "color": "#ecc94b",
        "class": "avances"
      },
      {
        "title": "Impacto Ambiental",
        "desc": "Reducción de emisiones de CO2, ahorro de agua, etc.",
        "icon": "fa-tree",
        "color": "#e53e3e",
        "class": "reportes"
      }
    ]
  }')
ON CONFLICT (page_name) DO NOTHING;
