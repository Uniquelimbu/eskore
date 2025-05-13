import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * Provides DnD context to child components
 */
const DndContext = ({ children }) => {
  console.log('DndContext rendered');
  
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default DndContext;
