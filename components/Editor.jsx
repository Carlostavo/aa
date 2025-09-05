import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Editor({ slug, initial }){
  const [content, setContent] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function save(){
    setSaving(true)
    const { error } = await supabase.from('paginas').upsert({ slug, content }, { onConflict: 'slug' })
    setSaving(false)
    if(error) alert(error.message)
    else alert('Guardado!')
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={e=>setContent(e.target.value)}
        className="w-full h-40 border rounded p-2"
      />
      <button onClick={save} disabled={saving} className="bg-primary text-white mt-2">
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}