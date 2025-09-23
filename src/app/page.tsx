"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: "col-1",
    title: "To Do",
    cards: [
      { id: "1", content: "Task 1" },
      { id: "2", content: "Task 2" },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    cards: [
      { id: "3", content: "Task 3" },
      { id: "4", content: "Task 4" },
    ],
  },
  {
    id: "col-3",
    title: "Done",
    cards: [],
  },
];

export default function Page() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newCardTexts, setNewCardTexts] = useState<{ [key: string]: string }>({});
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    
    if (!destination) return;

    // Handle column drag and drop
    if (type === "COLUMN") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      return;
    }

    // Handle card drag and drop (existing logic)
    if (source.droppableId === destination.droppableId) {
      const colIndex = columns.findIndex((col) => col.id === source.droppableId);
      const col = columns[colIndex];
      const updatedCards = Array.from(col.cards);
      const [movedCard] = updatedCards.splice(source.index, 1);
      updatedCards.splice(destination.index, 0, movedCard);

      const newColumns = Array.from(columns);
      newColumns[colIndex] = { ...col, cards: updatedCards };
      setColumns(newColumns);
    } else {
      const sourceColIndex = columns.findIndex((col) => col.id === source.droppableId);
      const destColIndex = columns.findIndex((col) => col.id === destination.droppableId);

      const sourceCol = columns[sourceColIndex];
      const destCol = columns[destColIndex];

      const sourceCards = Array.from(sourceCol.cards);
      const destCards = Array.from(destCol.cards);

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      const newColumns = Array.from(columns);
      newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards };
      newColumns[destColIndex] = { ...destCol, cards: destCards };

      setColumns(newColumns);
    }
  };

  const handleInputChange = (columnId: string, value: string) => {
    setNewCardTexts({ ...newCardTexts, [columnId]: value });
  };

  const addCard = (columnId: string) => {
    const text = newCardTexts[columnId]?.trim();
    if (!text) return;

    const newColumns = columns.map((col) => {
      if (col.id === columnId) {
        const newCard: Card = { id: Date.now().toString(), content: text };
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    });
    setColumns(newColumns);
    setNewCardTexts({ ...newCardTexts, [columnId]: "" });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const newColumns = columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      }
      return col;
    });
    setColumns(newColumns);
  };

  const addColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      title: title,
      cards: [],
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    const newColumns = columns.filter((col) => col.id !== columnId);
    setColumns(newColumns);
  };

  return (
    <div className="p-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex overflow-x-auto"
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
                        className="bg-gray-100 p-4 rounded-md w-80 min-h-[60px] flex flex-col"
                      >
                        {/* Column header with drag handle and delete button */}
                        <div className="flex justify-between items-center mb-4">
                          <div
                            {...provided.dragHandleProps}
                            className="font-bold cursor-grab active:cursor-grabbing flex items-center gap-2"
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

                        <Droppable droppableId={col.id}>
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
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-4 mb-2 rounded shadow flex justify-between items-center ${
                                        snapshot.isDragging
                                          ? "bg-blue-200"
                                          : "bg-white"
                                      }`}
                                    >
                                      <span>{card.content}</span>
                                      <button
                                        onClick={() =>
                                          deleteCard(col.id, card.id)
                                        }
                                        className="text-red-500 font-bold hover:text-red-700"
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

                        {/* Input to add new card */}
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="New card..."
                            value={newCardTexts[col.id] || ""}
                            onChange={(e) =>
                              handleInputChange(col.id, e.target.value)
                            }
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
    </div>
  );
}