import React, { useRef, useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';
import CanvasItem from './CanvasItem';

const CanvasEditor = () => {
  const { editMode, canvasItems, setSelectedItem, addItem } = useEditor();
  const canvasRef = useRef();

  const handleCanvasClick = (e) => {
    if (!editMode) return;
    
    if (e.target === canvasRef.current) {
      setSelectedItem(null);
    }
  };

  const handleDrop = (e) => {
    if (!editMode) return;
    
    e.preventDefault();
    const type = e.dataTransfer.getData('element-type');
    const rect = canvasRef.current.getBoundingClientRect();
    
    const newItem = {
      type,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: type === 'image' ? 200 : type === 'video' ? 320 : 150,
      height: type === 'image' ? 150 : type === 'video' ? 180 : 100,
      content: type === 'text' ? 'Nuevo texto' : '',
      styles: {
        fontSize: '16px',
        color: '#000000',
        backgroundColor: '#ffffff'
      }
    };
    
    addItem(newItem);
  };

  const handleDragOver = (e) => {
    if (!editMode) return;
    e.preventDefault();
  };

  return (
    <div 
      ref={canvasRef}
      className={`canvas ${editMode ? 'edit-mode' : ''}`}
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {canvasItems.map(item => (
        <CanvasItem key={item.id} item={item} />
      ))}
      
      {editMode && canvasItems.length === 0 && (
        <div className="canvas-empty-state">
          <p>Arrastra elementos aquí para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;