"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DragStart } from "@hello-pangea/dnd";
import { TrelloBoardsProps } from './types/tabs';
import ScrollContainer from "react-indiana-drag-scroll";
import ChecklistInput from "./ChecklistInput";
import AddCardInput from "./AddCardItem";

// Correctly typed component
const TrelloBoards: React.FC<TrelloBoardsProps> = ({
  columns,
  newCardTexts,
  setNewCardTexts,
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
  addChecklistItem,
  addChecklistItemInCard,
  reorderChecklistInCard,
  deleteChecklistItem,
  newChecklistItem,
  setNewChecklistItem,
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
      newValues[col.id] = inputValues[col.id] || ""; // keep existing value if present
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
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEndWrapper}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex"
            >
              {columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex-shrink-0 mr-6"
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                      }}
                    >
                      <div
                        className="bg-gray-200 p-4 rounded-md w-80 min-h-[60px] flex flex-col"
                      >
                        {/* Column header with drag handle and delete button */}
                        <div 
                          className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing "
                          {...provided.dragHandleProps}
                        >
                          <div
                            className="font-bold flex items-center gap-2"
                          >
                            <span className="text-gray-500">⠿</span>
                            <span>{col.title}</span>
                          </div>
                          <button
                            onClick={() => deleteColumn(col.id)}
                            className="text-red-500 font-bold hover:text-red-700 text-lg"
                            title="Delete column"
                          >
                            ×
                          </button>
                        </div>

                        <Droppable droppableId={col.id} type="CARD">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 transition-colors duration-200 ${
                                snapshot.isDraggingOver 
                                  ? 'bg-blue-50 rounded' 
                                  : ''
                              } ${
                                col.cards.length === 0 
                                  ? 'min-h-[60px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded' 
                                  : ''
                              }`}
                            >
                              {col.cards.length === 0 && !snapshot.isDraggingOver && (
                                <p className="text-gray-400 text-sm">Drop cards here</p>
                              )}
                              
                              {col.cards.map((card, index) => (
                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                      className={`p-4 mb-2 rounded shadow flex flex-col bg-white ${
                                        snapshot.isDragging ? "bg-blue-200" : "bg-white"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        {/* Card name droppable */}
                                        {!openChecklists[card.id] ? (
                                          <Droppable
                                            droppableId={`checklist-${card.id}`}
                                            type="CHECKLIST"
                                            isDropDisabled={false}
                                          >
                                            {(providedDroppable, snapshotDroppable) => (
                                              <div
                                                ref={providedDroppable.innerRef}
                                                {...providedDroppable.droppableProps}
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() => onCardClick(card)}
                                              >
                                                <span
                                                  className={`${
                                                    snapshotDroppable.isDraggingOver ? "text-blue-500" : ""
                                                  }`}
                                                >
                                                  {card.content} 
                                                </span>
                                                {providedDroppable.placeholder}
                                              </div>
                                            )}
                                          </Droppable>
                                        ) : (
                                          <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => onCardClick(card)}
                                          >
                                            <span
                                            >
                                              {card.content}
                                            </span>
                                          </div>
                                        )}

                                        {/* Drag handle & buttons */}
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => toggleChecklist(card.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            {openChecklists[card.id] ? "▼" : "▶"}
                                          </button>
                                          <button
                                            onClick={() => deleteCard(col.id, card.id)}
                                            className="text-red-500 font-bold hover:text-red-700"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                      {/* Checklist section */}
                                      {openChecklists[card.id] && (
                                        <div className="mt-2 border-t pt-2">
                                            <Droppable droppableId={`checklist-${card.id}`} type="CHECKLIST">
                                              {(provided, snapshot) => (
                                                <div 
                                                  ref={provided.innerRef} 
                                                  {...provided.droppableProps} 
                                                  className={`flex-1 transition-colors duration-200 ${
                                                    snapshot.isDraggingOver 
                                                      ? 'bg-blue-50 rounded' 
                                                      : ''
                                                  } ${
                                                    card.checklist && card.checklist.length === 0 
                                                      ? 'min-h-[50px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded' 
                                                      : ''
                                                  }`}
                                                >
                                                  {card.checklist && card.checklist.length === 0 && !snapshot.isDraggingOver && (
                                                    <p className="text-gray-400 text-sm">Drop items here</p>
                                                  )}
                                                  {card.checklist && card.checklist.map((item, idx) => (
                                                    <Draggable key={idx} draggableId={`${card.id}-check-${idx}`} index={idx}>
                                                      {(provided, snapshot) => (
                                                        <div
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          className={`flex items-center gap-2 mb-1 p-2 rounded border ${
                                                            snapshot.isDragging ? "bg-blue-50 border-blue-400" : "bg-white"
                                                          }`}
                                                        >
                                                          <input
                                                            type="checkbox"
                                                            checked={item.completed}
                                                            onChange={() => toggleChecklistItem(card.id, idx)}
                                                          />

                                                          {editingChecklistItem?.cardId === card.id &&
                                                          editingChecklistItem.index === idx ? (
                                                            <input
                                                              type="text"
                                                              value={item.text}
                                                              onChange={(e) => {
                                                                const newText = e.target.value;
                                                                editChecklistItem(card.id, idx, newText);
                                                              }}
                                                              onBlur={() => setEditingChecklistItem(null)}
                                                              onKeyDown={(e) => e.key === "Enter" && setEditingChecklistItem(null)}
                                                              autoFocus
                                                              className="flex-1 border rounded p-1"
                                                            />
                                                          ) : (
                                                            <span className={item.completed ? "line-through text-gray-400" : ""} onClick={() => setEditingChecklistItem({ cardId: card.id, index: idx })}>
                                                              {item.text}
                                                            </span>
                                                          )}
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation(); // prevent dragging when clicking delete
                                                              deleteChecklistItem(card.id, idx);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold"
                                                          >
                                                            ×
                                                          </button>
                                                        </div>
                                                      )}
                                                    </Draggable>
                                                  ))}
                                                  {provided.placeholder}
                                                </div>
                                              )}
                                            </Droppable>

                                          {/* Add new checklist item */}
                                          <ChecklistInput addChecklistItem={(text) => {
                                            addChecklistItemInCard(card, text)
                                          }} />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <AddCardInput
                          colId={col.id}
                          addCard={(id, text) => {
                            addCard(id, text)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Add Column Button */}
              <div className="flex-shrink-0 mr-6">
                {isAddingColumn ? (
                  <div className="bg-gray-100 p-4 rounded-md w-80 min-h-[60px] flex flex-col">
                    <input
                      type="text"
                      placeholder="Column title..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="p-2 rounded border border-gray-300 mb-2"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addColumn();
                        if (e.key === 'Escape') {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addColumn}
                        className="flex-1 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }}
                        className="px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="bg-gray-200 hover:bg-gray-300 p-4 rounded-md w-80 min-h-[60px] flex items-center justify-center text-gray-600 font-medium transition-colors"
                  >
                    + Add Column
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ScrollContainer>
  );
}

export default TrelloBoards;