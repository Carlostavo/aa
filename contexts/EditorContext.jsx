import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

const EditorContext = createContext();

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor debe ser usado dentro de un EditorProvider');
  }
  return context;
};

export const EditorProvider = ({ children, pageSlug }) => {
  const [editMode, setEditMode] = useState(false);
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { saveCanvas, loadCanvas } = useSupabase();

  useEffect(() => {
    loadInitialContent();
  }, [pageSlug]);

  const loadInitialContent = async () => {
    const content = await loadCanvas(pageSlug);
    if (content && content.items) {
      setCanvasItems(content.items);
      setHistory([content.items]);
      setHistoryIndex(0);
    }
  };

  const addItem = (item) => {
    const newItems = [...canvasItems, { ...item, id: Date.now().toString() }];
    setCanvasItems(newItems);
    addToHistory(newItems);
  };

  const updateItem = (id, updates) => {
    const newItems = canvasItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setCanvasItems(newItems);
    addToHistory(newItems);
  };

  const deleteItem = (id) => {
    const newItems = canvasItems.filter(item => item.id !== id);
    setCanvasItems(newItems);
    addToHistory(newItems);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const addToHistory = (items) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(items);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasItems(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasItems(history[historyIndex + 1]);
    }
  };

  const saveChanges = async () => {
    await saveCanvas(pageSlug, { items: canvasItems });
    setEditMode(false);
  };

  const discardChanges = () => {
    loadInitialContent();
    setEditMode(false);
  };

  const value = {
    editMode,
    setEditMode,
    canvasItems,
    setCanvasItems,
    selectedItem,
    setSelectedItem,
    addItem,
    updateItem,
    deleteItem,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveChanges,
    discardChanges
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
