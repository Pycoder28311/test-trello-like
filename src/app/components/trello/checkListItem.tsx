import React from "react";
import { Card, ChecklistItem as ChecklistItemType } from "../types/tabsAndTrello"; // adjust path
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";

interface ChecklistItemProps {
  card: Card;
  item: ChecklistItemType;
  index: number;
  editingChecklistItem: { cardId: string; index: number } | null;
  setEditingChecklistItem: React.Dispatch<React.SetStateAction<{ cardId: string; index: number } | null>>;
  toggleChecklistItem: (cardId: string, idx: number) => void;
  editChecklistItem: (cardId: string, idx: number, newText: string) => void;
  deleteChecklistItem: (cardId: string, idx: string) => void;
  provided: DraggableProvided; // from react-beautiful-dnd Draggable
  snapshot: DraggableStateSnapshot; // from react-beautiful-dnd Draggable
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  card,
  item,
  index,
  editingChecklistItem,
  setEditingChecklistItem,
  toggleChecklistItem,
  editChecklistItem,
  deleteChecklistItem,
  provided,
  snapshot,
}) => {
  return (
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
        onChange={() => toggleChecklistItem(card.id, index)}
      />

      {editingChecklistItem?.cardId === card.id && editingChecklistItem.index === index ? (
        <input
          type="text"
          value={item.text}
          onChange={(e) => editChecklistItem(card.id, index, e.target.value)}
          onBlur={() => setEditingChecklistItem(null)}
          onKeyDown={(e) => e.key === "Enter" && setEditingChecklistItem(null)}
          autoFocus
          className="flex-1 border rounded p-1"
        />
      ) : (
        <span
          className={item.completed ? "line-through text-gray-400" : ""}
          onClick={() => setEditingChecklistItem({ cardId: card.id, index })}
        >
          {item.text}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent dragging when clicking delete
          deleteChecklistItem(card.id, item.id);
        }}
        className="text-red-500 hover:text-red-700 font-bold"
      >
        ×
      </button>
    </div>
  );
};

export default ChecklistItem;
