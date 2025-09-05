import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useEdit } from '../contexts/EditContext'

export default function Editor({ element, field, onSave }) {
  const [content, setContent] = useState(element[field] || '')
  const [saving, setSaving] = useState(false)
  const { editMode } = useEdit()

  useEffect(() => {
    setContent(element[field] || '')
  }, [element, field])

  const handleSave = async () => {
    if (!editMode) return
    
    setSaving(true)
    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('paginas')
        .upsert(
          { 
            slug: window.location.pathname,
            content: JSON.stringify({ ...element, [field]: content }),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'slug' }
        )

      if (error) {
        console.error('Error saving:', error)
        alert('Error al guardar: ' + error.message)
      } else {
        if (onSave) onSave(field, content)
        alert('¡Cambios guardados!')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar los cambios')
    }
    setSaving(false)
  }

  if (!editMode) {
    return <>{element[field] || ''}</>
  }

  return (
    <div className="editor-container">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="editor-textarea"
        rows={field === 'desc' ? 3 : 2}
        placeholder={`Editar ${field === 'title' ? 'título' : 'descripción'}`}
      />
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="editor-save-btn"
      >
        {saving ? '💾 Guardando...' : '💾 Guardar'}
      </button>
    </div>
  )
}
