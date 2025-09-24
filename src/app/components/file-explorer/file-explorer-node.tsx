// components/FileExplorerNode.tsx
'use client';

import React, { useState } from 'react';
import CreateDropdown from './create-dropdown';
import { FileExplorerNodeProps } from '../types/file-explorer';

const FileExplorerNode: React.FC<FileExplorerNodeProps> = ({
  item,
  level,
  expandedFolders,
  onToggleFolder,
  onDeleteItem,
  onRenameItem,
  onFileSelect,
  onAddItem
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const isExpanded = expandedFolders.has(item.id);

  const handleToggle = () => {
    if (item.type === 'folder') {
      onToggleFolder(item.id);
    } else {
      onFileSelect?.(item);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      onRenameItem(item.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(item.name);
    }
  };

  const getFileIcon = () => {
    if (item.type === 'folder') {
      return isExpanded ? '📂' : '📁';
    }

    const ext = item.name.split('.').pop()?.toLowerCase() ?? ''; // default to empty string
    const iconMap: { [key: string]: string } = {
      js: '📄',
      ts: '📄',
      jsx: '⚛️',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
      txt: '📝',
    };

    return iconMap[ext] || '📄'; // safe because ext is now string
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between group px-2 py-1 rounded hover:bg-gray-700 cursor-pointer`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onDoubleClick={handleToggle}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {item.type === 'folder' && (
            <button
              onClick={() => onToggleFolder(item.id)}
              className="w-4 h-4 flex items-center justify-center"
            >
              <svg
                className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <span className="mr-2">{getFileIcon()}</span>
          
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="bg-gray-800 text-white border border-blue-500 rounded px-1 flex-1 min-w-0"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 truncate select-none"
              onClick={handleToggle}
            >
              {item.name}
            </span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          {item.type === 'folder' && (
            <CreateDropdown onAddItem={onAddItem} parentId={item.id} />
          )}
          <button
            onClick={() => onDeleteItem(item.id)}
            className="p-1 rounded hover:bg-gray-600"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsRenaming(true);
              setNewName(item.name);
            }}
            className="p-1 rounded hover:bg-gray-600"
            title="Rename"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-20 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          >
            <button
              onClick={() => {
                setIsRenaming(true);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-700"
            >
              Rename
            </button>
            <button
              onClick={() => {
                onDeleteItem(item.id);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 text-red-400"
            >
              Delete
            </button>
          </div>
        </>
      )}

      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileExplorerNode
              key={child.id}
              item={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
              onFileSelect={onFileSelect}
              onAddItem={onAddItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorerNode;