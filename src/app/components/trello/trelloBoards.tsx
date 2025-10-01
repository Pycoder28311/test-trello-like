"use client";

import React, { useState, useEffect,useRef } from "react";
import { DragDropContext, Droppable, DropResult, DragStart } from "@hello-pangea/dnd";
import { TrelloBoardsProps } from '../types/tabsAndTrello';
import ScrollContainer from "react-indiana-drag-scroll";
import AddColumn from "./addColumn";
import ColumnItem from "./columnItem";

// Correctly typed component
const TrelloBoards: React.FC<TrelloBoardsProps> = ({
  columns,
  setColumns,
  newColumnTitle,
  setNewColumnTitle,
  isAddingColumn,
  setIsAddingColumn,
  handleDragEnd,
  addCard,
  deleteCard,
  addColumn,
  deleteColumn,
  onCardClick,
  toggleChecklistItem,
  addChecklistItemInCard,
  deleteChecklistItem,
  editChecklistItem,
}) => {
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [openChecklists, setOpenChecklists] = useState<{ [cardId: string]: boolean }>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [editingChecklistItem, setEditingChecklistItem] = useState<{
    cardId: string;
    index: number;
  } | null>(null);

  // Sync inputValues whenever columns change
  useEffect(() => {
    const newValues: Record<string, string> = {};
    columns.forEach((col) => {
      newValues[col.id] = inputValues[col.id] || "";
    });
    setInputValues(newValues);
  }, [columns]);

  const handleDragStart = (start: DragStart) => {
    if (start.type === "COLUMN" || start.type === "CARD" || start.type === "CHECKLIST") {
      setIsDraggingItem(true); // disable scroll while dragging item
    }
  };

  const handleDragEndWrapper = (result: DropResult) => {
    setIsDraggingItem(false); // re-enable scroll after drag
    handleDragEnd(result);
  };

  const toggleChecklist = (cardId: string) => {
    setOpenChecklists((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <ScrollContainer
      className="p-8 flex cursor-grab"
      hideScrollbars={false}
      horizontal={!isDraggingItem}
      ignoreElements='input' // <-- This is the key
    >
      <DragDropContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEndWrapper}
      >
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex"
            >
              {columns.map((col, index) => (
                <ColumnItem
                  key={col.id}
                  col={col}
                  index={index}
                  openChecklists={openChecklists}
                  onCardClick={onCardClick}
                  toggleChecklist={toggleChecklist}
                  deleteColumn={deleteColumn}
                  deleteCard={deleteCard}
                  addCard={addCard}
                  addChecklistItemInCard={addChecklistItemInCard}
                  editingChecklistItem={editingChecklistItem}
                  setEditingChecklistItem={setEditingChecklistItem}
                  toggleChecklistItem={toggleChecklistItem}
                  editChecklistItem={editChecklistItem}
                  deleteChecklistItem={deleteChecklistItem}
                  setColumns={setColumns}
                />
              ))}
              {provided.placeholder}
              
              {/* Add Column Button */}
              <AddColumn
                isAddingColumn={isAddingColumn}
                setIsAddingColumn={setIsAddingColumn}
                newColumnTitle={newColumnTitle}
                setNewColumnTitle={setNewColumnTitle}
                addColumn={addColumn}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ScrollContainer>
  );
}

export default TrelloBoards;