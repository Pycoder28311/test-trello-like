// components/ChromeTabs.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChromeTabsProps } from '../types/tabsAndTrello';
import { chromeTabsHandlers } from './tabHandlers';
import TabItem from './tabItem';

const ChromeTabs: React.FC<ChromeTabsProps> = ({
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId,
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when a new tab is created
  useEffect(() => {
    // Find the first new project
    const newProjectId = Object.keys(projects).find(id => projects[id].isNew);
    if (!newProjectId) return;

    const input = inputRefs.current[newProjectId];
    if (!input) return;

    // Focus input
    input.focus();

    // Place cursor at the end instead of selecting all text
    const length = input.value.length;
    input.setSelectionRange(length, length);

    // Mark as not new so this effect won't run again for this project
    setProjects(prev => ({
      ...prev,
      [newProjectId]: { ...prev[newProjectId], isNew: false },
    }));
  }, [projects, setProjects]);

  const handlers = chromeTabsHandlers({
    projects,
    setProjects,
    setActiveProjectId,
    isDragging,
    setIsDragging,
    dragIndex,
    setDragIndex,
  });

  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-300">
      {/* Tab Area */}
      <div 
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'thin' }}
      >
        {Object.keys(projects).map((id, index) => (
          <TabItem
            key={id}
            project={projects[id]}
            id={id}
            index={index}
            projects={projects}
            activeProjectId={activeProjectId}
            isDragging={isDragging}
            dragIndex={dragIndex}
            handlers={handlers}
            setActiveProjectId={setActiveProjectId}
          />
        ))}

        {/* Add Tab Button */}
        <button
          onClick={() => handlers.createProject("new project")}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 mx-2 rounded flex-shrink-0"
          title="Add new tab"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChromeTabs;