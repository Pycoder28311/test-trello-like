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
}