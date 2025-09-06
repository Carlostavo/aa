import React from 'react';
import { useEditor } from '../contexts/EditorContext';

const Toolbar = () => {
  const {
    editMode,
    setEditMode,
    canUndo,
    canRedo,
    undo,
    redo,
    saveChanges,
    discardChanges,
    addItem
  } = useEditor();

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('element-type', type);
  };

  const insertElements = [
    { type: 'text', icon: 'fa-font', label: 'Texto' },
    { type: 'image', icon: 'fa-image', label: 'Imagen' },
    { type: 'video', icon: 'fa-video', label: 'Video' },
    { type: 'shape', icon: 'fa-square', label: 'Forma' }
  ];

  if (!editMode) return null;

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Insertar</h3>
        <div className="insert-buttons">
          {insertElements.map(element => (
            <button
              key={element.type}
              className="insert-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, element.type)}
              onClick={() => addItem({
                type: element.type,
                x: 50,
                y: 50,
                width: element.type === 'image' ? 200 : 150,
                height: element.type === 'image' ? 150 : 100,
                content: element.type === 'text' ? 'Nuevo texto' : '',
                styles: { fontSize: '16px', color: '#000000' }
              })}
            >
              <i className={`fas ${element.icon}`}></i>
              {element.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Historial</h3>
        <div className="history-buttons">
          <button onClick={undo} disabled={!canUndo}>
            <i className="fas fa-undo"></i> Deshacer
          </button>
          <button onClick={redo} disabled={!canRedo}>
            <i className="fas fa-redo"></i> Rehacer
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Acciones</h3>
        <div className="action-buttons">
          <button onClick={saveChanges} className="save-btn">
            <i className="fas fa-save"></i> Guardar
          </button>
          <button onClick={discardChanges} className="discard-btn">
            <i className="fas fa-times"></i> Descartar
          </button>
          <button onClick={() => setEditMode(false)} className="exit-btn">
            <i className="fas fa-sign-out-alt"></i> Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;