import { DropResult } from "@hello-pangea/dnd";

export interface ChecklistItem {
  text: string;
  completed: boolean;
}

export interface Card {
  id: string;              // unique card ID
  content: string;         // card title
  description?: string;    // optional detailed description
  checklist?: ChecklistItem[]; // optional checklist
  createdAt?: string;      // optional timestamp
  updatedAt?: string;      // optional timestamp
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface TrelloBoardsProps {
  columns: Column[];
  newCardTexts: string; // input values per column
  setNewCardTexts: React.Dispatch<React.SetStateAction<string>>;
  newColumnTitle: string;
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>;
  isAddingColumn: boolean;
  setIsAddingColumn: React.Dispatch<React.SetStateAction<boolean>>;
  handleDragEnd: (result: DropResult) => void;
  addCard: (columnId: string, text: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  addColumn: () => void;
  deleteColumn: (columnId: string) => void;
  onCardClick: (card: Card) => void;
  toggleChecklistItem: (cardId: string, idx: number) => void;
  addChecklistItem: (text: string) => void;
  addChecklistItemInCard: (card: Card, text: string) => void;
  reorderChecklistInCard: (cardId: string, startIndex: number, endIndex: number) => void;
  deleteChecklistItem: (cardId: string, index: number) => void;
  newChecklistItem: string;
  setNewChecklistItem: React.Dispatch<React.SetStateAction<string>>;
  editChecklistItem: (cardId: string, index: number, newText: string) => void;
}

export interface Tab {
  id: string;
  title: string;
  isActive: boolean;
  favicon?: string;
  isNew: boolean; // Flag for new tabs that need naming
}