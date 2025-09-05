import { useState } from 'react'

export default function EditToggle({ children }){
  const [editMode, setEditMode] = useState(false)

  return (
    <div>
      <button
        onClick={() => setEditMode(!editMode)}
        className="bg-secondary text-white mb-2"
      >
        {editMode ? 'Salir de edición' : 'Modo edición'}
      </button>
      {editMode && children}
    </div>
  )
}