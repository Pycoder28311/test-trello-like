// app/simple/page.tsx
'use client';

import React, { useState } from 'react';
import FileExplorerSidebar from './components/file-explorer/file-explorer-sidebar';
import { FileItem } from './components/types/file-explorer';
import TrelloBoards from './components/trello-boards';
import { DropResult } from "@hello-pangea/dnd";

const initialColumns = [
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

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const simpleData: FileItem[] = [
  {
    id: '1',
    name: 'My Project',
    type: 'folder',
    parentId: null,
    children: [
      {
        id: '2',
        name: 'index.html',
        type: 'file',
        parentId: '1',
        content: '<html>Hello World</html>'
      },
      {
        id: '3',
        name: 'styles',
        type: 'folder',
        parentId: '1',
        children: [
          {
            id: '4',
            name: 'main.css',
            type: 'file',
            parentId: '3',
            content: 'body { margin: 0; }'
          }
        ]
      }
    ]
  }
];

export default function SimplePage() {
  const [fileData, setFileData] = useState<FileItem[]>(simpleData);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
  };

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
    <div className="flex h-full bg-gray-100">
      <FileExplorerSidebar
        data={fileData}
        onUpdate={setFileData}
        onFileSelect={handleFileSelect}
        columns={columns}
      />

      <TrelloBoards
        columns={columns}
        setColumns={setColumns}
        newCardTexts={newCardTexts}
        setNewCardTexts={setNewCardTexts}
        newColumnTitle={newColumnTitle}
        setNewColumnTitle={setNewColumnTitle}
        isAddingColumn={isAddingColumn}
        setIsAddingColumn={setIsAddingColumn}
        handleDragEnd={handleDragEnd}
        handleInputChange={handleInputChange}
        addCard={addCard}
        deleteCard={deleteCard}
        addColumn={addColumn}
        deleteColumn={deleteColumn}
      />
    </div>
  );
}