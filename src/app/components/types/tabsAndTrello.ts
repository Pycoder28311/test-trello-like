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

export interface Project {
  id: string;          // unique project ID
  title: string;       // project name (shown on the tab)
  isActive: boolean;   // whether this project is currently active
  isNew: boolean;      // flag for newly created projects needing naming
  columns: Column[];   // the columns belonging to this project
  favicon?: string;
  position: number;
}

export interface Projects {
  [key: string]: Project;
};

export interface ChromeTabsProps {
  projects: Projects;
  setProjects: React.Dispatch<React.SetStateAction<Projects>>;
  activeProjectId: string;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string>>;
  renameProject?: (id: string, title: string) => void; // optional
  closeProject?: (id: string) => void; // optional
}

export interface TrelloBoardsProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
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
  addChecklistItemInCard: (card: Card, text: string) => void;
  deleteChecklistItem: (cardId: string, index: number) => void;
  editChecklistItem: (cardId: string, index: number, newText: string) => void;
}

export interface TrelloHandlersProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  selectedCard: Card | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<Card | null>>;
  newColumnTitle: string;
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>;
  setIsAddingColumn: React.Dispatch<React.SetStateAction<boolean>>;
  editText: string;
  setEditText: React.Dispatch<React.SetStateAction<string>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}