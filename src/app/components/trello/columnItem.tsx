import React, { useState } from "react";
import { Draggable, Droppable, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import CardItem from "./cardItem";
import AddCardInput from "./addCardItem";
import { Column, Card } from "../types/tabsAndTrello"; // adjust your types

interface ColumnItemProps {
  col: Column;
  index: number;
  openChecklists: Record<string, boolean>;
  onCardClick: (card: Card) => void;
  toggleChecklist: (cardId: string) => void;
  deleteColumn: (colId: string) => void;
  deleteCard: (colId: string, cardId: string) => void;
  addCard: (colId: string, text: string) => void;
  addChecklistItemInCard: (card: Card, text: string) => void;
  editingChecklistItem: { cardId: string; index: number } | null;
  setEditingChecklistItem: React.Dispatch<React.SetStateAction<{ cardId: string; index: number } | null>>;
  toggleChecklistItem: (cardId: string, idx: number) => void;
  editChecklistItem: (cardId: string, idx: number, newText: string) => void;
  deleteChecklistItem: (cardId: string, idx: number) => void;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

const ColumnItem: React.FC<ColumnItemProps> = ({
  col,
  index,
  openChecklists,
  onCardClick,
  toggleChecklist,
  deleteColumn,
  deleteCard,
  addCard,
  addChecklistItemInCard,
  editingChecklistItem,
  setEditingChecklistItem,
  toggleChecklistItem,
  editChecklistItem,
  deleteChecklistItem,
  setColumns,
}) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  return (
    <Draggable key={col.id} draggableId={col.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex-shrink-0 mr-6"
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <div className="bg-gray-200 p-4 rounded-md w-80 min-h-[60px] flex flex-col">
            {/* Column header */}
            <div
              className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing"
              {...provided.dragHandleProps}
            >
              <div className="font-bold flex items-center gap-2">
                <span className="text-gray-500">⠿</span>
                {editingColumn === col.id ? (
                  <input
                    type="text"
                    value={col.title}
                    autoFocus
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setColumns(prev =>
                        prev.map(c => (c.id === col.id ? { ...c, title: newTitle } : c))
                      );
                    }}
                    onBlur={() => setEditingColumn(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingColumn(null)}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span className="cursor-pointer" onClick={() => setEditingColumn(col.id)}>
                    {col.title}
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteColumn(col.id)}
                className="text-red-500 font-bold hover:text-red-700 text-lg"
                title="Delete column"
              >
                ×
              </button>
            </div>

            {/* Cards */}
            <Droppable droppableId={col.id} type="CARD">
              {(providedDroppable: DroppableProvided, snapshotDroppable: DroppableStateSnapshot) => (
                <div
                  {...providedDroppable.droppableProps}
                  ref={providedDroppable.innerRef}
                  className={`flex-1 transition-colors duration-200 ${
                    snapshotDroppable.isDraggingOver ? "bg-blue-50 rounded" : ""
                  } ${col.cards.length === 0 ? "min-h-[60px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded" : ""}`}
                >
                  {col.cards.length === 0 && !snapshotDroppable.isDraggingOver && (
                    <p className="text-gray-400 text-sm">Drop cards here</p>
                  )}

                  {col.cards.map((card: Card, idx: number) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      index={idx}
                      colId={col.id}
                      openChecklists={openChecklists}
                      onCardClick={onCardClick}
                      toggleChecklist={toggleChecklist}
                      deleteCard={deleteCard}
                      addChecklistItemInCard={addChecklistItemInCard}
                      editingChecklistItem={editingChecklistItem}
                      setEditingChecklistItem={setEditingChecklistItem}
                      toggleChecklistItem={toggleChecklistItem}
                      editChecklistItem={editChecklistItem}
                      deleteChecklistItem={deleteChecklistItem}
                    />
                  ))}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add new card */}
            <AddCardInput colId={col.id} addCard={addCard} />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default ColumnItem;
