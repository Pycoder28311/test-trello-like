// app/simple/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FileExplorerSidebar from './components/file-explorer/file-explorer-sidebar';
import { FileItem } from './components/types/file-explorer';
import TrelloBoards from './components/trello-boards';
import { DropResult } from "@hello-pangea/dnd";
import ChromeTabs from './components/tabs/chrome-tabs';
import { Card, Column } from './components/types/tabs';
import { trelloHandlers } from "./components/trelloHandlers";

export default function SimplePage() {

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [newCardTexts, setNewCardTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    // Handle column drag and drop
    if (type === "COLUMN") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      return;
    }

    // Handle card drag and drop within the same column
    if (source.droppableId === destination.droppableId) {
      const colIndex = columns.findIndex(col => col.id === source.droppableId);
      const col = columns[colIndex];
      const updatedCards = Array.from(col.cards);
      const [movedCard] = updatedCards.splice(source.index, 1);
      updatedCards.splice(destination.index, 0, movedCard);

      const newColumns = Array.from(columns);
      newColumns[colIndex] = { ...col, cards: updatedCards };
      setColumns(newColumns);
    } 
    // Handle card drag and drop across different columns
    else {
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
        />
      </div>
      {isModalOpen && selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handlers.closeCardModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Card Details</h2>

            {/* Title / Editing */}
            {isEditing ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlers.saveCardEdit();
                }}
                className="w-full border rounded p-2 mb-4"
              />
            ) : (
              <p className="mb-4 text-lg font-semibold" onClick={() => setIsEditing(true)}>
                {selectedCard.content}
              </p>
            )}

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

            {/* Checklist */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Checklist</h3>
              {selectedCard?.checklist?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handlers.toggleChecklistItem(idx)}
                  />
                  <span className={item.completed ? "line-through text-gray-400" : ""}>
                    {item.text}
                  </span>
                </div>
              ))}

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

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={handlers.saveCardEdit}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={handlers.closeCardModal}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}