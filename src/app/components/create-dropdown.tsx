// components/CreateDropdown.tsx
'use client';

import React, { useState } from 'react';

interface CreateDropdownProps {
  onAddItem: (type: 'file' | 'folder', parentId?: string | null) => void;
  parentId?: string | null;
}

const CreateDropdown: React.FC<CreateDropdownProps> = ({ 
  onAddItem, 
  parentId = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddItem = (type: 'file' | 'folder') => {
    onAddItem(type, parentId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-gray-700 transition-colors"
        title="New File or Folder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
            <button
              onClick={() => handleAddItem('file')}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>New File</span>
            </button>
            <button
              onClick={() => handleAddItem('folder')}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>New Folder</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateDropdown;