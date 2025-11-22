import React, { useState } from "react";
import { Draggable, Droppable, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import CardItem from "./cardItem";
import AddCardInput from "./addCardItem";
import { Column, Card, Projects } from "../types/tabsAndTrello";

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
  toggleChecklistItem: (cardId: string, idx: string) => void;
  editChecklistItem: (cardId: string, idx: number, newText: string) => void;
  deleteChecklistItem: (cardId: string, idx: string) => void;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  projects: Projects,
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
  projects,
}) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(col.projectId || "");

  const saveColumn = async (
    id: string,
    data: { title?: string; position?: number; projectId?: string }
  ) => {
    try {
      const res = await fetch(`/api/columns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to save column");
      }

      return res.json(); // optional: return updated column
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

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
                    onBlur={async (e) => {
                      setEditingColumn(null);
                      await saveColumn(col.id, { title: e.target.value }); // freshest input value
                    }}
                    onKeyDown={async (event) => {
                      if (event?.key === "Enter") {
                        setEditingColumn(null);
                        await saveColumn(col.id, { title: col.title });
                      }
                    }}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  <span className="cursor-pointer" onClick={() => setEditingColumn(col.id)}>
                    {col.title} 
                    <span className="text-red-600 ml-2">{col.cards.length}</span>
                  </span>
                )}
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className=" p-1 text-left"
                >
                  {/* Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
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
          {isProjectModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsProjectModalOpen(false)}>
              <div className="bg-white rounded-lg p-4 w-80 max-h-[400px] overflow-y-auto" onClick={(e) => e.stopPropagation()}  >
                <h2 className="font-bold mb-2">Select a Project</h2>
                {Object.values(projects).map((project) => (
                  <div
                    key={project.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-200 ${
                      project.id === selectedProjectId ? "bg-gray-300" : ""
                    }`}
                    onClick={async () => {
                      setSelectedProjectId(project.id);
                      await saveColumn(col.id, { projectId: project.id });

                      setColumns((prev) => prev.filter((c) => c.id !== col.id));

                      setIsProjectModalOpen(false);
                    }}
                  >
                    {project.title}
                  </div>
                ))}
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="mt-2 px-4 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default ColumnItem;
