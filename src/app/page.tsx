// app/simple/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FileExplorerSidebar from './components/file-explorer/file-explorer-sidebar';
import { FileItem } from './components/types/file-explorer';
import TrelloBoards from './components/trello-boards';
import ChromeTabs from './components/tabs/chrome-tabs';
import { Card, Column, ChecklistItem } from './components/types/tabs';
import { trelloHandlers } from "./components/trelloHandlers";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function SimplePage() {

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [newCardTexts, setNewCardTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleFileSelect = (file: FileItem) => {
    console.log('Selected file:', file);
  };

  useEffect(() => {
    const storedColumns = localStorage.getItem("columns");
    if (storedColumns) {
      setColumns(JSON.parse(storedColumns));
    }

    const storedFiles = localStorage.getItem("files");
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("files", JSON.stringify(files));
  }, [files]);

  const handlers = trelloHandlers({
    columns,
    setColumns,
    selectedCard,
    setSelectedCard,
    newCardTexts,
    setNewCardTexts,
    newColumnTitle,
    setNewColumnTitle,
    setIsAddingColumn,
    editText,
    setEditText,
    setIsEditing,
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      // Handle column drag and drop
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      return;
    }

    if (type === "CARD") {
      // Handle card drag and drop
      if (source.droppableId === destination.droppableId) {
        const colIndex = columns.findIndex(col => col.id === source.droppableId);
        const col = columns[colIndex];
        const updatedCards = Array.from(col.cards);
        const [movedCard] = updatedCards.splice(source.index, 1);
        updatedCards.splice(destination.index, 0, movedCard);

        const newColumns = Array.from(columns);
        newColumns[colIndex] = { ...col, cards: updatedCards };
        setColumns(newColumns);
      } else {
        const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

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
      return;
    }

    if (type === "CHECKLIST") {
      const sourceCardId = source.droppableId.replace("checklist-", "");
      const destCardId = destination.droppableId.replace("checklist-", "");

      let movedItem: ChecklistItem | null = null;

      // Remove item from source card
      const newColumns = columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id === sourceCardId) {
            const updated = [...(c.checklist ?? [])];
            [movedItem] = updated.splice(source.index, 1);
            return { ...c, checklist: updated };
          }
          return c;
        }),
      }));

      // Add item to destination card
      const finalColumns = newColumns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id === destCardId && movedItem) {
            const updated = c.checklist ? [...c.checklist] : []; // <-- ensures array exists
            updated.splice(destination.index, 0, movedItem);
            return { ...c, checklist: updated };
          }
          return c;
        }),
      }));

      setColumns(finalColumns);
    }
  };

  const updateCard = (updatedCard: Card) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      }))
    );

    // Also update the selectedCard state
    setSelectedCard(updatedCard);
  };

  const reorderChecklist = (startIndex: number, endIndex: number) => {
    if (!selectedCard) return;

    const updatedChecklist = Array.from(selectedCard.checklist ?? []);
    const [moved] = updatedChecklist.splice(startIndex, 1);
    updatedChecklist.splice(endIndex, 0, moved);

    updateCard({
      ...selectedCard,
      checklist: updatedChecklist,
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedCard) return;

    reorderChecklist(result.source.index, result.destination.index);
  };

  // Reorder checklist items inside a specific card
  const reorderChecklistInCard = (cardId: string, start: number, end: number) => {
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id !== cardId) return c;

          // If checklist is undefined, default to empty array
          const updated = Array.from(c.checklist ?? []);
          const [moved] = updated.splice(start, 1);
          updated.splice(end, 0, moved);

          return { ...c, checklist: updated };
        }),
      }))
    );
  };

  // Toggle checklist item completed
  const toggleChecklistItem = (cardId: string, index: number) => {
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id !== cardId) return c;

          const updated = [...(c.checklist ?? [])]; // default to empty array
          if (updated[index]) {
            updated[index].completed = !updated[index].completed;
          }

          return { ...c, checklist: updated };
        }),
      }))
    );
  };

  return (
    <div>
      <ChromeTabs />
      <div className="flex h-full bg-gray-100 overflow-x-hidden">
        <FileExplorerSidebar
          data={files}
          onUpdate={setFiles}
          onFileSelect={handleFileSelect}
          columns={columns}
          onCardClick={handlers.openCardModal}
          handleDragEnd={handleDragEnd}
        />

        <TrelloBoards
          columns={columns}
          newCardTexts={newCardTexts}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
          isAddingColumn={isAddingColumn}
          setIsAddingColumn={setIsAddingColumn}
          handleDragEnd={handleDragEnd}
          handleInputChange={handlers.handleInputChange}
          addCard={handlers.addCard}
          deleteCard={handlers.deleteCard}
          addColumn={handlers.addColumn}
          deleteColumn={handlers.deleteColumn}
          onCardClick={handlers.openCardModal}
          reorderChecklistInCard={reorderChecklistInCard}
          toggleChecklistItem={toggleChecklistItem}
          addChecklistItem={handlers.addChecklistItem}
          addChecklistItemInCard={handlers.addChecklistItemInCard}
          deleteChecklistItem={handlers.deleteChecklistItem}
        />
      </div>
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handlers.closeCardModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Card Details</h2>

            <div className="mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlers.saveCardEdit(); // call your save handler
                      setIsEditing(false);     // exit edit mode
                    }
                  }}
                  className="w-full border rounded p-2"
                  autoFocus
                />
              ) : (
                <p
                  className="text-lg font-semibold cursor-pointer"
                  onClick={() => {
                    setEditText(selectedCard.content); // initialize input
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
                value={selectedCard?.description || ""}
                onChange={(e) => handlers.handleDescriptionChange(e.target.value)}
              />
            </div>

            {/* Checklist with DnD */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Checklist</h3>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="checklist">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {selectedCard?.checklist?.map((item, idx) => (
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
                                onChange={() => handlers.toggleChecklistItem(idx)}
                              />
                              <span
                                className={item.completed ? "line-through text-gray-400" : ""}
                              >
                                {item.text}
                              </span>
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
                      handlers.addChecklistItem(newChecklistItem);
                      setNewChecklistItem("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    handlers.addChecklistItem(newChecklistItem);
                    setNewChecklistItem("");
                  }}
                  className="px-3 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Actions ... */}
          </div>
        </div>
      )}
    </div>
  );
}