import React, { useState } from "react";
import { Card, Column } from "../types/tabsAndTrello"; // adjust paths
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface CardModalProps {
  selectedCard: Card | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<Card | null>>;
  closeCardModal: () => void;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  editingChecklistItem: { cardId: string; index: number } | null;
  setEditingChecklistItem: React.Dispatch<React.SetStateAction<{ cardId: string; index: number } | null>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editText: string;
  setEditText: React.Dispatch<React.SetStateAction<string>>;
  handleDescriptionChange: (value: string) => void;
  toggleChecklistItem: (idx: number) => void;
  addChecklistItem: (text: string) => void;
}

const CardModal: React.FC<CardModalProps> = ({
  selectedCard,
  setSelectedCard,
  closeCardModal,
  setColumns,
  editingChecklistItem,
  setEditingChecklistItem,
  isEditing,
  setIsEditing,
  editText,
  setEditText,
  handleDescriptionChange,
  toggleChecklistItem,
  addChecklistItem,
}) => {
  const [newChecklistItem, setNewChecklistItem] = useState("");

  if (!selectedCard) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={closeCardModal}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Card Details</h2>

        {/* Card Title */}
        <div className="mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditing(false);
              }}
              className="w-full border rounded p-2"
              autoFocus
            />
          ) : (
            <p
              className="text-lg font-semibold cursor-pointer"
              onClick={() => {
                setEditText(selectedCard.content);
                setIsEditing(true);
              }}
            >
              {selectedCard.content}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Description</h3>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={selectedCard.description || ""}
            onChange={(e) => handleDescriptionChange(e.target.value)}
          />
        </div>

        {/* Checklist */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Checklist</h3>
          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="checklist">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {selectedCard.checklist?.map((item, idx) => (
                    <Draggable key={idx.toString()} draggableId={idx.toString()} index={idx}>
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
                            onChange={() => toggleChecklistItem(idx)}
                          />
                          {editingChecklistItem?.cardId === selectedCard.id && editingChecklistItem.index === idx ? (
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                              const newText = e.target.value;

                              // Update selectedCard
                              setSelectedCard((prev) => {
                                if (!prev) return prev;
                                const updatedChecklist = [...(prev.checklist ?? [])];
                                updatedChecklist[idx] = { ...updatedChecklist[idx], text: newText };
                                return { ...prev, checklist: updatedChecklist };
                              });

                              // Update columns/cards
                              setColumns((prevColumns) =>
                                prevColumns.map((col) => ({
                                  ...col,
                                  cards: col.cards.map((c) => {
                                    if (c.id === selectedCard?.id) {
                                      const updatedChecklist = [...(c.checklist ?? [])];
                                      updatedChecklist[idx] = { ...updatedChecklist[idx], text: newText };
                                      return { ...c, checklist: updatedChecklist };
                                    }
                                    return c;
                                  }),
                                }))
                              );
                            }}
                              onBlur={() => setEditingChecklistItem(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingChecklistItem(null)}
                              autoFocus
                              className={`flex-1 border rounded p-1 ${
                                item.completed ? "line-through text-gray-400" : ""
                              }`}
                            />
                          ) : (
                            <span
                              className={item.completed ? "line-through text-gray-400" : ""}
                              onClick={() => setEditingChecklistItem({ cardId: selectedCard.id, index: idx })}
                            >
                              {item.text}
                            </span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
                  addChecklistItem(newChecklistItem);
                  setNewChecklistItem("");
                }
              }}
            />
            <button
              onClick={() => {
                addChecklistItem(newChecklistItem);
                setNewChecklistItem("");
              }}
              className="px-3 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
