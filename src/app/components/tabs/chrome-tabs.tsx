// components/ChromeTabs.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, MoreHorizontal } from 'lucide-react';
import { Tab } from '../types/tabs';

const ChromeTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Welcome', isActive: true, favicon: '🌐', isNew: false }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when a new tab is created
  useEffect(() => {
    const newTab = tabs.find(tab => tab.isNew);
    if (newTab && inputRefs.current[newTab.id]) {
      inputRefs.current[newTab.id]?.focus();
      inputRefs.current[newTab.id]?.select();
    }
  }, [tabs]);

  // Add new tab with input field
  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      isActive: true,
      favicon: '🌐',
      isNew: true // Mark as new to trigger input focus
    };

    setTabs(prevTabs => 
      prevTabs.map(tab => ({ ...tab, isActive: false, isNew: false }))
        .concat(newTab)
    );
  };

  // Handle tab name input
  const handleNameChange = (tabId: string, value: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, title: value } : tab
      )
    );
  };

  // Handle input key events
  const handleNewTabKeyDown = (tabId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const tabTitle = e.currentTarget.value.trim();
      if (!tabTitle) return; // don't confirm empty

      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId ? { ...tab, title: tabTitle, isNew: false } : tab
        )
      );
    } else if (e.key === "Escape") {
      setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId)); // cancel
    }
  };

  const handleInputKeyDown = (tabId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // ✅ Confirm rename
      const newTitle = e.currentTarget.value.trim();
      if (!newTitle) return;

      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === tabId ? { ...tab, title: newTitle, isNew: false } : tab
        )
      );

      e.currentTarget.blur(); // optional: remove focus after confirm
    } 
    else if (e.key === "Escape") {
      // ❌ Cancel rename (revert title to last saved)
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === tabId ? { ...tab, isNew: false } : tab
        )
      );

      e.currentTarget.blur();
    }
  };

  // Close tab
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      if (newTabs.length === 0) {
        return [{ id: '1', title: 'Welcome', isActive: true, favicon: '🌐', isNew: false }];
      }

      // If closed tab was active, activate the adjacent tab
      const closedTab = prevTabs.find(tab => tab.id === tabId);
      if (closedTab?.isActive) {
        const closedIndex = prevTabs.findIndex(tab => tab.id === tabId);
        const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
        return newTabs.map((tab, index) => ({
          ...tab,
          isActive: index === newActiveIndex,
          isNew: false
        }));
      }

      return newTabs;
    });
  };

  // Switch to tab
  const switchTab = (tabId: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
        isNew: false // Remove new flag when switching tabs
      }))
    );
  };

  // Drag and drop functionality
  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const draggedTab = newTabs[dragIndex];
      newTabs.splice(dragIndex, 1);
      newTabs.splice(index, 0, draggedTab);
      setDragIndex(index);
      return newTabs;
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragIndex(null);
  };

  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-300">
      {/* Tab Area */}
      <div 
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable={!tab.isNew} // Don't allow dragging while naming
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => !tab.isNew && switchTab(tab.id)}
            className={`
              group flex items-center min-w-[120px] max-w-[240px] h-8 
              border border-gray-300 border-b-0 relative
              ${tab.isActive 
                ? 'bg-white border-gray-300 z-10' 
                : 'bg-gray-200 border-transparent hover:bg-gray-300'
              }
              ${tab.isNew ? 'min-w-[200px] z-20' : ''}
              ${isDragging && dragIndex === index ? 'opacity-50' : ''}
              transition-all duration-200 ease-in-out
            `}
            style={{ marginLeft: index === 0 ? '0' : '-1px' }}
          >
            {/* Favicon */}
            {!tab.isNew && (
              <div className="ml-2 mr-2 text-sm w-4 h-4 flex items-center justify-center">
                {tab.favicon}
              </div>
            )}

            {/* Tab Title - Input field for new tabs, text for existing */}
            <div className="flex-1 min-w-0 mx-1">
              <input
                ref={(el) => {
                  inputRefs.current[tab.id] = el;
                }}
                type="text"
                className="w-full bg-transparent outline-none text-sm px-1"
                value={tab.title}
                onChange={(e) => handleNameChange(tab.id, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(tab.id, e)}
                onFocus={(e) => e.target.select()} // 👈 only for rename
              />
            </div>

            {/* Close Button - Show for all tabs except when naming new tabs */}
            {(!tab.isNew || tabs.length > 1) && (
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className={`
                  w-4 h-4 rounded-full flex items-center justify-center
                  mr-2 opacity-0 group-hover:opacity-100
                  hover:bg-gray-400 hover:text-white
                  ${tab.isActive ? 'opacity-100' : ''}
                  ${tab.isNew ? 'opacity-100' : ''}
                  transition-opacity duration-200
                `}
              >
                <X size={12} />
              </button>
            )}

            {/* Active Tab Indicator */}
            {tab.isActive && !tab.isNew && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}

            {/* Loading indicator for new tabs */}
            {tab.isNew && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Add Tab Button */}
      <button
        onClick={addTab}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 mx-2 rounded flex-shrink-0"
        title="Add new tab"
      >
        <Plus size={16} />
      </button>

      {/* Overflow Menu */}
      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 mr-2 rounded flex-shrink-0">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
};

export default ChromeTabs;