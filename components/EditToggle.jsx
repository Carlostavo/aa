import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { useSupabase } from '../hooks/useSupabase';

const EditToggle = () => {
  const { editMode, setEditMode } = useEditor();
  const { userRole } = useSupabase();

  const canEdit = ['admin', 'tecnico'].includes(userRole);

  if (!canEdit) return null;

  return (
    <button 
      onClick={() => setEditMode(!editMode)}
      className={`edit-toggle ${editMode ? 'active' : ''}`}
    >
      <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'}`}></i>
      {editMode ? 'Salir de edición' : 'Modo edición'}
    </button>
  );
};

export default EditToggle;
