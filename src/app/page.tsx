// app/simple/page.tsx
'use client';

import React, { useState } from 'react';
import FileExplorerSidebar from './components/file-explorer-sidebar';
import { FileItem } from './components/types/file-explorer';

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

  return (
    <div className="flex h-screen bg-gray-100">
      <FileExplorerSidebar
        data={fileData}
        onUpdate={setFileData}
        onFileSelect={handleFileSelect}
      />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Simple File Explorer</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Selected File Info:</h2>
          {selectedFile ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
              <p><strong>ID:</strong> {selectedFile.id}</p>
              <p><strong>Content:</strong> {selectedFile.content || 'No content'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No file selected. Click on a file in the sidebar.</p>
          )}
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usage Instructions:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Click folders to expand/collapse</li>
            <li>Click files to select them</li>
            <li>Use the + button to create new files/folders</li>
            <li>Use the delete button (trash icon) to remove items</li>
            <li>Double-click or use the rename button to rename items</li>
            <li>Right-click for context menu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}