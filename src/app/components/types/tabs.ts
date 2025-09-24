import { DropResult } from "@hello-pangea/dnd";

export interface Card {
  id: string;
  content: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface TrelloBoardsProps {
  columns: Column[];
  newCardTexts: Record<string, string>; // input values per column
  newColumnTitle: string;
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>;
  isAddingColumn: boolean;
  setIsAddingColumn: React.Dispatch<React.SetStateAction<boolean>>;
  handleDragEnd: (result: DropResult) => void;
  handleInputChange: (columnId: string, value: string) => void;
  addCard: (columnId: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  addColumn: () => void;
  deleteColumn: (columnId: string) => void;
}

export interface Tab {
  id: string;
  title: string;
  isActive: boolean;
  favicon?: string;
  isNew: boolean; // Flag for new tabs that need naming
}