// app/simple/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FileExplorerSidebar from './components/fileExplorer/fileExplorerSidebar';
import { FileItem } from './components/types/fileExplorer';
import TrelloBoards from './components/trello/trelloBoards';
import ChromeTabs from './components/tabs/chromeTabs';
import { Card, Column, ChecklistItem, Projects, User, Project } from './components/types/tabsAndTrello';
import { trelloHandlers } from "./components/trello/trelloHandlers";
import { DropResult } from "@hello-pangea/dnd";
import CardModal from './components/trello/cardModal';

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
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch session
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");
        const session = await response.json();

        if (session?.user) {
          setUser(session.user);
          if (session.user.lastProjectId) {
            setActiveProjectId(session.user.lastProjectId);
          }

          // Fetch projects for that user
          const resProjects = await fetch("/api/projects/names");
          if (!resProjects.ok) throw new Error("Failed to fetch projects");

          const projectsArray: { id: string; title: string; position: number }[] =
            await resProjects.json();

          const projects: Record<string, Project> = Object.fromEntries(
            projectsArray.map(p => [
              p.id,
              {
                id: p.id,
                title: p.title,
                position: p.position,
                isActive: false,
                isNew: false,
                columns: [],
                favicon: undefined,
              } as Project,
            ])
          );

          setProjects(projects);

          const initialId =
            session.user.lastProjectId && projects[session.user.lastProjectId]
              ? session.user.lastProjectId
              : projectsArray[0]?.id;

          if (initialId) {
            setActiveProjectId(initialId);

            // 4️⃣ Fetch active project data + columns immediately
            const resActive = await fetch(`/api/projects/${initialId}`);
            if (!resActive.ok) throw new Error("Failed to fetch active project");

            const activeProjectData = await resActive.json();
            setColumns(activeProjectData.columns || []);

            setProjects(prev => ({
              ...prev,
              [activeProjectData.id]: {
                ...prev[activeProjectData.id],
                ...activeProjectData,
                isActive: true,
              },
            }));
          }
        }
      } catch (err) {
        console.error("Init failed:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const updateActiveProject = async () => {
      if (!activeProjectId || !user) return;

      const activeProject = projects[activeProjectId];
      if (!activeProject) {
        setColumns([]);
        return;
      }

      try {
        if (!activeProject.isNew) {
          const resActive = await fetch(`/api/projects/${activeProjectId}`);
          if (!resActive.ok) throw new Error("Failed to fetch active project");

          const activeProjectData = await resActive.json();

          setColumns(activeProjectData.columns || []);
          setProjects(prev => ({
            ...prev,
            [activeProjectData.id]: {
              ...prev[activeProjectData.id],
              ...activeProjectData,
              isActive: true,
            },
          }));
        } else {
          setColumns([]);
        }

        // Save lastProjectId
        if (user?.id) {
          await fetch("/api/lastProject", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              lastProjectId: activeProjectId,
            }),
          });
        }
      } catch (err) {
        console.error("Failed to update active project:", err);
      }
    };

    updateActiveProject();
  }, [activeProjectId, user]);

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
    activeProjectId,
  });

  type PositionItem = { id: string; position: number };

  const updatePositions = async (
    table: "checklistItem" | "card" | "boardColumn" | "project",
    parentId: string | null, // checklistItem -> cardId, card -> columnId, column -> projectId, project -> null
    items: PositionItem[]
  ) => {
    try {
      await fetch(`/api/updatePositions/${table}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, positions: items }),
      });
    } catch (err) {
      console.error(`Failed to update positions for ${table}:`, err);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      // Handle column drag and drop
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      const positions = newColumns.map((col, idx) => ({ id: col.id, position: idx }));
      updatePositions("boardColumn", activeProjectId, positions);
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
        const positions = updatedCards.map((card, idx) => ({ id: card.id, position: idx }));
        updatePositions("card", col.id, positions);
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
        updatePositions("card", sourceCol.id, sourceCards.map((card, idx) => ({ id: card.id, position: idx })));
        updatePositions("card", destCol.id, destCards.map((card, idx) => ({ id: card.id, position: idx })));
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

      if (selectedCard) 
      if (selectedCard.id === destCardId) {
        const updatedChecklist = finalColumns
          .find(col => col.cards.some(c => c.id === selectedCard.id))
          ?.cards.find(c => c.id === selectedCard.id)?.checklist;

        if (updatedChecklist) {
          setSelectedCard({ ...selectedCard, checklist: updatedChecklist });
        }
      }
      const affectedCardIds = new Set([sourceCardId, destCardId]);
      affectedCardIds.forEach(cardId => {
        const checklist = finalColumns
          .flatMap(col => col.cards)
          .find(c => c.id === cardId)?.checklist;

        if (checklist) {
          const positions = checklist.map((item, idx) => ({ id: item.id, position: idx }));
          updatePositions("checklistItem", cardId, positions);
        }
      });
    }
  };
  
  const toggleChecklistItem = async (cardId: string, itemId: string) => {
    let newValue = false;

    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id !== cardId) return c;

          const updated = (c.checklist ?? []).map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );

          const changedItem = updated.find((item) => item.id === itemId);
          if (changedItem) newValue = changedItem.completed;

          return { ...c, checklist: updated };
        }),
      }))
    );

    // send the updated value to the backend
    await fetch(`/api/checklistItems/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newValue }),
    });
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
        user={user || null}
        updatePositions={updatePositions}
      />
      <div className="flex h-[calc(100vh-2rem)] bg-gray-100 overflow-x-auto overflow-y-hidden">
        <FileExplorerSidebar
          data={files}
          onUpdate={setFiles}
          onFileSelect={handleFileSelect}
          columns={columns}
          onCardClick={handlers.openCardModal}
          handleDragEnd={handleDragEnd}
        />
        {user && (
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
            projects={projects}
          />
        )}
      </div>
      {selectedCard && (
        <CardModal
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          closeCardModal={handlers.closeCardModal}
          columnId={columns.find(col => col.cards.some(card => card.id === selectedCard.id))?.id || ""}
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
          updateCardTitle={handlers.updateCardTitle}
          handleDragEnd={handleDragEnd}
          deleteChecklistItem={handlers.deleteChecklistItem}
        />
      )}
    </div>
  );
}