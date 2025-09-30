import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Card } from "../types/tabsAndTrello"; // adjust import path
import ChecklistItem from "./checkListItem";
import ChecklistInput from "./addCheckListItem";

interface CardProps {
  card: Card;
  index: number;
  colId: string;
  openChecklists: Record<string, boolean>;
  toggleChecklist: (cardId: string) => void;
  onCardClick: (card: Card) => void;
  deleteCard: (colId: string, cardId: string) => void;
  editingChecklistItem: { cardId: string; index: number } | null;
  setEditingChecklistItem: React.Dispatch<React.SetStateAction<{ cardId: string; index: number } | null>>;
  toggleChecklistItem: (cardId: string, idx: number) => void;
  editChecklistItem: (cardId: string, idx: number, newText: string) => void;
  deleteChecklistItem: (cardId: string, idx: number) => void;
  addChecklistItemInCard: (card: Card, text: string) => void;
}

const CardItem: React.FC<CardProps> = ({
  card,
  index,
  colId,
  openChecklists,
  toggleChecklist,
  onCardClick,
  deleteCard,
  editingChecklistItem,
  setEditingChecklistItem,
  toggleChecklistItem,
  editChecklistItem,
  deleteChecklistItem,
  addChecklistItemInCard,
}) => {
  return (
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
            {!openChecklists[card.id] ? (
              <Droppable droppableId={`checklist-${card.id}`} type="CHECKLIST" isDropDisabled={false}>
                {(providedDroppable, snapshotDroppable) => (
                  <div
                    ref={providedDroppable.innerRef}
                    {...providedDroppable.droppableProps}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onCardClick(card)}
                  >
                    <span className={`${snapshotDroppable.isDraggingOver ? "text-blue-500" : ""}`}>
                      {card.content}
                    </span>
                    {providedDroppable.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onCardClick(card)}>
                <span>{card.content}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button onClick={() => toggleChecklist(card.id)} className="text-gray-500 hover:text-gray-700">
                {openChecklists[card.id] ? "▼" : "▶"}
              </button>
              <button onClick={() => deleteCard(colId, card.id)} className="text-red-500 font-bold hover:text-red-700">
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
                      snapshot.isDraggingOver ? "bg-blue-50 rounded" : ""
                    } ${
                      card.checklist && card.checklist.length === 0
                        ? "min-h-[50px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded"
                        : ""
                    }`}
                  >
                    {card.checklist && card.checklist.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-gray-400 text-sm">Drop items here</p>
                    )}

                    {card.checklist?.map((item, idx) => (
                      <Draggable key={idx} draggableId={`${card.id}-check-${idx}`} index={idx}>
                        {(provided, snapshot) => (
                          <ChecklistItem
                            card={card}
                            item={item}
                            index={idx}
                            editingChecklistItem={editingChecklistItem}
                            setEditingChecklistItem={setEditingChecklistItem}
                            toggleChecklistItem={toggleChecklistItem}
                            editChecklistItem={editChecklistItem}
                            deleteChecklistItem={deleteChecklistItem}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <ChecklistInput addChecklistItem={(text) => addChecklistItemInCard(card, text)} />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;
