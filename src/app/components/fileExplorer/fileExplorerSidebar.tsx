// components/FileExplorerSidebar.tsx
'use client';

import React, { useState, useRef } from 'react';
import { FileItem, FileExplorerProps } from '../types/fileExplorer';
import FileExplorerNode from './fileExplorerNode';
import CreateDropdown from './createDropdown';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const FileExplorerSidebar: React.FC<FileExplorerProps> = ({
  data,
  onUpdate,
  onFileSelect,
  columns,
  onCardClick,
  handleDragEnd,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [width, setWidth] = useState(256); // default 64 * 4 = 256px
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      setWidth(e.clientX); // sidebar width = mouse X position
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const addItem = (type: 'file' | 'folder', parentId: string | null = null) => {
    const newItem: FileItem = {
      id: Date.now().toString(),
      name: type === 'file' ? 'new-file.txt' : 'new-folder',
      type,
      parentId,
      ...(type === 'folder' && { children: [] })
    };

    let newData: FileItem[];
    
    if (parentId === null) {
      newData = [...data, newItem];
    } else {
      newData = addItemToParent(data, parentId, newItem);
    }

    onUpdate(newData);
  };

  const addItemToParent = (items: FileItem[], parentId: string, newItem: FileItem): FileItem[] => {
    return items.map(item => {
      if (item.id === parentId && item.type === 'folder') {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemToParent(item.children, parentId, newItem)
        };
      }
      return item;
    });
  };

  const deleteItem = (id: string) => {
    const newData = removeItemFromTree(data, id);
    onUpdate(newData);
  };

  const removeItemFromTree = (items: FileItem[], id: string): FileItem[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children) {
        item.children = removeItemFromTree(item.children, id);
      }
      return true;
    });
  };

  const renameItem = (id: string, newName: string) => {
    const newData = renameItemInTree(data, id, newName);
    onUpdate(newData);
  };

  const renameItemInTree = (items: FileItem[], id: string, newName: string): FileItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, name: newName };
      }
      if (item.children) {
        return {
          ...item,
          children: renameItemInTree(item.children, id, newName)
        };
      }
      return item;
    });
  };

  return (
    <div
      className="h-screen bg-gray-900 text-white flex flex-col border-r border-gray-700 relative hidden"
      style={{ width }}
    >
      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-gray-600"
      />

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Explorer</h2>
        <CreateDropdown onAddItem={addItem} />
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {data.map(item => (
          <FileExplorerNode
            key={item.id}
            item={item}
            level={0}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onDeleteItem={deleteItem}
            onRenameItem={renameItem}
            onFileSelect={onFileSelect}
            onAddItem={addItem}
          />
        ))}
      </div>

      {/* Trello-like Board Below */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Droppable for columns */}
        <Droppable droppableId="columns" direction="vertical" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col h-full overflow-x-auto p-2"
            >
              {columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`mb-4 p-2 rounded shadow-sm bg-gray-700 ${
                        snapshot.isDragging ? "opacity-80" : "opacity-100"
                      }`}
                    >
                      {/* Drag handle for column */}
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab font-bold mb-2 flex items-center gap-2"
                      >
                        ⠿ {col.title}
                      </div>

                      {/* Droppable cards */}
                      <Droppable droppableId={col.id} type="CARD">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex flex-col gap-2 p-1 ${
                              snapshot.isDraggingOver ? "bg-blue-50 rounded" : ""
                            } min-h-[40px]`}
                          >
                            {col.cards.map((card, idx) => (
                              <Draggable key={card.id} draggableId={card.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => onCardClick(card)}
                                    className={`p-2 rounded shadow-sm cursor-grab ${
                                      snapshot.isDragging ? "bg-gray-500" : "bg-gray-600"
                                    }`}
                                  >
                                    {card.content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {col.cards.length === 0 && (
                              <p className="text-gray-400 text-sm italic">No tasks</p>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default FileExplorerSidebar;