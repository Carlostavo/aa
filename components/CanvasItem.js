import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';

const CanvasItem = ({ item }) => {
  const { editMode, selectedItem, setSelectedItem, updateItem, deleteItem } = useEditor();
  const [isEditing, setIsEditing] = useState(false);

  const handleSelect = () => {
    if (editMode) {
      setSelectedItem(item);
    }
  };

  const handleContentChange = (e) => {
    updateItem(item.id, { content: e.target.value });
  };

  const handleStyleChange = (property, value) => {
    updateItem(item.id, { 
      styles: { ...item.styles, [property]: value } 
    });
  };

  const handleDelete = () => {
    deleteItem(item.id);
  };

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return isEditing ? (
          <textarea
            value={item.content}
            onChange={handleContentChange}
            style={item.styles}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div 
            style={item.styles}
            onClick={() => editMode && setIsEditing(true)}
          >
            {item.content}
          </div>
        );
      
      case 'image':
        return (
          <img
            src={item.content || '/placeholder-image.jpg'}
            alt="Imagen"
            style={item.styles}
          />
        );
      
      case 'video':
        return (
          <iframe
            src={item.content}
            style={item.styles}
            frameBorder="0"
            allowFullScreen
          />
        );
      
      case 'shape':
        return (
          <div style={{
            ...item.styles,
            width: '100%',
            height: '100%',
            backgroundColor: item.styles.backgroundColor || '#3498db'
          }} />
        );
      
      default:
        return <div style={item.styles}>{item.content}</div>;
    }
  };

  const isSelected = selectedItem?.id === item.id;

  return (
    <div
      className={`canvas-item ${item.type} ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
        cursor: editMode ? 'move' : 'default'
      }}
      onClick={handleSelect}
    >
      {renderContent()}
      
      {isSelected && editMode && (
        <div className="item-controls">
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={handleDelete}>Eliminar</button>
          
          <div className="style-controls">
            <input
              type="color"
              value={item.styles.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
            />
            <input
              type="number"
              value={parseInt(item.styles.fontSize) || 16}
              onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasItem;