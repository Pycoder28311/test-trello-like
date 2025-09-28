import { Column, Card } from './tabs';
import { DropResult } from "@hello-pangea/dnd";

// types/file-explorer.ts
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  children?: FileItem[];
  content?: string;
}

export interface FileExplorerProps {
  data: FileItem[];
  onUpdate: (data: FileItem[]) => void;
  onFileSelect?: (file: FileItem) => void;
  columns: Column[];
  onCardClick: (card: Card) => void;
  handleDragEnd: (result: DropResult) => void;
}

export interface CreateDropdownProps {
  onAddItem: (type: 'file' | 'folder', parentId: string | null) => void;
  parentId?: string | null;
}

export interface FileExplorerNodeProps {
  item: FileItem;
  level: number;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onFileSelect?: (file: FileItem) => void;
  onAddItem: (type: 'file' | 'folder', parentId: string | null) => void;
}