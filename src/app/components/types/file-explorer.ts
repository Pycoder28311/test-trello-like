// types/file-explorer.ts
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  children?: FileItem[];
  content?: string;
}

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface FileExplorerProps {
  data: FileItem[];
  onUpdate: (data: FileItem[]) => void;
  onFileSelect?: (file: FileItem) => void;
  columns: Column[];
}

