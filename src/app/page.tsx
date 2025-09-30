// app/simple/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FileExplorerSidebar from './components/fileExplorer/fileExplorerSidebar';
import { FileItem } from './components/types/fileExplorer';
import TrelloBoards from './components/trello/trelloBoards';
import ChromeTabs from './components/tabs/chromeTabs';
import { Card, Column, ChecklistItem } from './components/types/tabsAndTrello';
import { trelloHandlers } from "./components/trello/trelloHandlers";
import { DropResult } from "@hello-pangea/dnd";
import CardModal from './components/trello/cardModal';

export interface Project {
  id: string;          // unique project ID
  title: string;       // project name (shown on the tab)
  isActive: boolean;   // whether this project is currently active
  isNew: boolean;      // flag for newly created projects needing naming
  columns: Column[];   // the columns belonging to this project
  favicon?: string;
  position: number;
}

type Projects = {
  [key: string]: Project;
};

export default function SimplePage() {

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const handleFileSelect = (file: FileItem) => {
    console.log('Selected file:', file);
  };

  const [projects, setProjects] = useState<Projects>({});
  const [activeProjectId, setActiveProjectId] = useState<string>("project1");
  const [columns, setColumns] = useState<Column[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  // Load columns when switching projects
  useEffect(() => {
    if (projects[activeProjectId]) {
      setColumns(projects[activeProjectId].columns);
    } else {
      setColumns([]);
    }
  }, [activeProjectId]); // ✅ only depends on activeProjectId, not projects

  // Save columns back into active project
  useEffect(() => {
    setProjects(prev => {
      const currentProject = prev[activeProjectId];
      if (!currentProject) return prev; // safety check

      return {
        ...prev,
        [activeProjectId]: {
          ...currentProject,  // keep id, title, isActive, isNew
          columns,            // update columns only
        },
      };
    });
  }, [columns, activeProjectId]);

  // Load projects from localStorage once on mount
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      const parsed = JSON.parse(storedProjects) as Projects;
      setProjects(parsed);
      if (parsed["project1"]) {
        setColumns(parsed["project1"].columns);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const handlers = trelloHandlers({
    columns,
    setColumns,
    selectedCard,
    setSelectedCard,
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
      // Normalize source and destination IDs
      const sourceCardId = source.droppableId
        .replace("checklist-", "")
        .replace("checklist-placeholder-", "");
      const destCardId = destination.droppableId
        .replace("checklist-", "")
        .replace("checklist-placeholder-", "");

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

      // Add item to destination card (whether placeholder or checklist)
      const finalColumns = newColumns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          console.log(c.id,destCardId)
          if (c.id === destCardId && movedItem) {
            const updated = c.checklist ? [...c.checklist] : [];

            // If dropping on card name (empty droppable), append to the end
            if (destination.droppableId.startsWith("checklist-placeholder-")) {
              updated.push(movedItem);
            } else {
              updated.splice(destination.index, 0, movedItem);
            }

            return { ...c, checklist: updated };
          }
          return c;
        }),
      }));

      setColumns(finalColumns);
    }
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

  const [editingChecklistItem, setEditingChecklistItem] = useState<{
    cardId: string;
    index: number;
  } | null>(null);

  return (
    <div>
      <ChromeTabs
        projects={projects}
        setProjects={setProjects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
      />
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
          setColumns={setColumns}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
          isAddingColumn={isAddingColumn}
          setIsAddingColumn={setIsAddingColumn}
          handleDragEnd={handleDragEnd}
          addCard={handlers.addCard}
          deleteCard={handlers.deleteCard}
          addColumn={handlers.addColumn}
          deleteColumn={handlers.deleteColumn}
          onCardClick={handlers.openCardModal}
          toggleChecklistItem={toggleChecklistItem}
          addChecklistItemInCard={handlers.addChecklistItemInCard}
          deleteChecklistItem={handlers.deleteChecklistItem}
          editChecklistItem={handlers.editChecklistItem}
        />
      </div>
      {selectedCard && (
        <CardModal
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          closeCardModal={handlers.closeCardModal}
          setColumns={setColumns}
          editingChecklistItem={editingChecklistItem}
          setEditingChecklistItem={setEditingChecklistItem}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editText={editText}
          setEditText={setEditText}
          handleDescriptionChange={handlers.handleDescriptionChange}
          toggleChecklistItem={handlers.toggleChecklistItem}
          addChecklistItem={handlers.addChecklistItem}
        />
      )}
    </div>
  );
}