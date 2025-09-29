"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DragStart } from "@hello-pangea/dnd";
import { TrelloBoardsProps } from './types/tabs';
import ScrollContainer from "react-indiana-drag-scroll";

// Correctly typed component
const TrelloBoards: React.FC<TrelloBoardsProps> = ({
  columns,
  newCardTexts,
  newColumnTitle,
  setNewColumnTitle,
  isAddingColumn,
  setIsAddingColumn,
  handleDragEnd,
  handleInputChange,
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
}) => {
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [openChecklists, setOpenChecklists] = useState<{ [cardId: string]: boolean }>({});
  const [newChecklistItem, setNewChecklistItem] = useState("");

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
                                      className={`p-4 mb-2 rounded shadow flex flex-col bg-white ${
                                        snapshot.isDragging ? "bg-blue-200" : "bg-white"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div
                                          className="flex items-center gap-2 cursor-pointer"
                                          {...provided.dragHandleProps} // allow dragging by entire header
                                          onClick={() => onCardClick(card)}
                                        >
                                          <span>{card.content}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {/* Toggle checklist arrow */}
                                          <button
                                            onClick={() => toggleChecklist(card.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            {openChecklists[card.id] ? "▼" : "▶"}
                                          </button>

                                          {/* Delete button */}
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
                                              {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps}>
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
                                                          <span className={item.completed ? "line-through text-gray-400" : ""}>
                                                            {item.text}
                                                          </span>
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
                                          <div className="flex gap-2 mt-2">
                                            <input
                                              type="text"
                                              placeholder="New item..."
                                              className="flex-1 border rounded p-2"
                                              value={newChecklistItem}
                                              onChange={(e) => setNewChecklistItem(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  addChecklistItemInCard(card, newChecklistItem);
                                                  setNewChecklistItem("");
                                                }
                                              }}
                                            />
                                            <button
                                              onClick={() => {
                                                addChecklistItemInCard(card, newChecklistItem);
                                                setNewChecklistItem("");
                                              }}
                                              className="px-3 bg-blue-500 text-white rounded"
                                            >
                                              Add
                                            </button>
                                          </div>
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

                        {/* Input to add new card */}
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="New card..."
                            value={newCardTexts[col.id] || ""}
                            onChange={(e) =>
                              handleInputChange(col.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault(); // prevent form submit if inside a form
                                addCard(col.id);
                              }
                            }}
                            className="flex-1 p-2 rounded border border-gray-300"
                          />
                          <button
                            onClick={() => addCard(col.id)}
                            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add
                          </button>
                        </div>
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