import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function Editor({ element, field, onSave, contentType = 'text' }) {
  const [content, setContent] = useState(element[field] || '')
  const [saving, setSaving] = useState(false)
  const { editMode, role } = useAuth()

  useEffect(() => {
    setContent(element[field] || '')
  }, [element, field])

  const handleSave = async () => {
    if (!editMode || !(role === 'admin' || role === 'tecnico')) return
    
    setSaving(true)
    try {
      // Obtener contenido existente o crear nuevo
      const { data: existingPage } = await supabase
        .from('paginas')
        .select('content')
        .eq('slug', window.location.pathname)
        .single()

      let pageContent = {}
      if (existingPage?.content) {
        try {
          pageContent = JSON.parse(existingPage.content)
        } catch (e) {
          console.error('Error parsing page content:', e)
        }
      }

      // Actualizar solo el campo específico
      const updatedContent = { ...pageContent, [field]: content }

      // Guardar en Supabase
      const { error } = await supabase
        .from('paginas')
        .upsert({
          slug: window.location.pathname,
          content: JSON.stringify(updatedContent),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'slug',
          returning: 'minimal'
        })

      if (error) {
        console.error('Error saving:', error)
        throw new Error('Error al guardar: ' + error.message)
      } else {
        if (onSave) onSave(field, content)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Error al guardar los cambios')
    }
    setSaving(false)
  }

  if (!editMode || !(role === 'admin' || role === 'tecnico')) {
    return <>{element[field] || ''}</>
  }

  return (
    <div className="editor-container">
      {contentType === 'textarea' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          rows={4}
          placeholder={`Editar ${field}`}
        />
      ) : (
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-input"
          placeholder={`Editar ${field}`}
        />
      )}
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="editor-save-btn"
      >
        {saving ? (
          <>
            <i className="fa-solid fa-spinner fa-spin"></i>
            Guardando...
          </>
        ) : (
          <>
            <i className="fa-solid fa-floppy-disk"></i>
            Guardar
          </>
        )}
      </button>
    </div>
  )
}
