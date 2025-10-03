'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChromeTabsProps } from '../types/tabsAndTrello';
import { chromeTabsHandlers } from './tabHandlers';
import TabItem from './tabItem';
import Link from 'next/link';

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
} from '@hello-pangea/dnd';

const ChromeTabs: React.FC<ChromeTabsProps> = ({
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId,
  user,
  updatePositions,
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isDragging, setIsDragging] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const ids = Object.keys(projects);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Focus input when a new tab is created
  useEffect(() => {
    const newProjectId = Object.keys(projects).find((id) => projects[id].isNew);
    if (!newProjectId) return;

    const input = inputRefs.current[newProjectId];
    if (!input) return;

    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);

    setProjects((prev) => ({
      ...prev,
      [newProjectId]: { ...prev[newProjectId], isNew: false },
    }));
  }, [projects, setProjects]);

  const handlers = chromeTabsHandlers({
    projects,
    setProjects,
    setActiveProjectId,
    setDragIndex: () => {},
  });

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    const { source, destination } = result;

    if (!destination) return;
    if (source.index === destination.index) return;

    // 1️⃣ Reorder project IDs
    const newIds = Array.from(ids);
    const [removed] = newIds.splice(source.index, 1);
    newIds.splice(destination.index, 0, removed);

    // 2️⃣ Rebuild projects object in new order
    const newProjects: typeof projects = {};
    newIds.forEach((id) => {
      newProjects[id] = projects[id];
    });
    setProjects(newProjects);

    // 3️⃣ Update positions in backend
    const positions = newIds.map((id, idx) => ({ id, position: idx }));
    updatePositions("project", null, positions); // projects have no parent
  };

  const getItemStyle = (style: DraggableProvided['draggableProps']['style']) => {
    if (!style) return;
    const { transform, ...rest } = style;

    if (transform) {
      // Keep only X movement
      const match = /translate\(([^,]+),/.exec(transform);
      if (match) {
        return {
          ...rest,
          transform: `translateX(${match[1]})`,
        };
      }
    }
    return { ...rest, transform };
  };

  return (
    <div className="relative">
      {/* Desktop Tabs */}
      <div className="hidden md:flex items-center bg-gray-100 border-b border-gray-300">
        <div
          ref={tabsContainerRef}
          className="flex-1 flex items-center overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'thin' }}
        >
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="tabs" direction="horizontal">
              {(provided) => (
                <div
                  className="flex items-center"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {ids.map((id, index) => (
                    <Draggable draggableId={id} index={index} key={id}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={getItemStyle(dragProvided.draggableProps.style)}
                          className={`mx-0.5 ${snapshot.isDragging ? 'opacity-70' : ''}`}
                        >
                          <TabItem
                            id={id}
                            index={index}
                            project={projects[id]}
                            projects={projects}
                            activeProjectId={activeProjectId}
                            isDragging={isDragging}
                            dragIndex={null}
                            handlers={handlers}
                            setActiveProjectId={setActiveProjectId}
                            user={user}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <button
          onClick={() => handlers.createProject?.('new project')}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 mx-2 rounded flex-shrink-0"
        >
          <Plus size={16} />
        </button>
        {user ? (
          <Link href="/auth/signout">Sign out</Link>
        ) : (
          <Link href="/auth/signup">Connect</Link>
        )}
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden w-full bg-white flex items-center justify-between px-4 py-2 shadow">
        {/* Optional left side content (logo, title, etc.) */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">Projects</h1>
        </div>

        {/* Right side button */}
        <div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex flex-col justify-between w-8 h-6 relative focus:outline-none"
          >
            <span
              className={`block h-0.5 w-full bg-gray-800 rounded transform transition duration-300 ease-in-out
                ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}
            ></span>
            <span
              className={`block h-0.5 w-full bg-gray-800 rounded transition-opacity duration-300 ease-in-out
                ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}
            ></span>
            <span
              className={`block h-0.5 w-full bg-gray-800 rounded transform transition duration-300 ease-in-out
                ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}
            ></span>
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300
          ${isSidebarOpen ? 'fixed' : 'hidden'}`}
      >
        <div className="flex flex-col p-4 gap-2">
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {/* First vertical list */}
            <Droppable droppableId="listOne" direction="vertical">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col">
                  {ids.map((id, index) => (
                    <Draggable draggableId={id} index={index} key={id}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`mt-2 rounded ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <TabItem
                            id={id}
                            index={ids.indexOf(id)}
                            project={projects[id]}
                            projects={projects}
                            activeProjectId={activeProjectId}
                            isDragging={false}
                            dragIndex={null}
                            handlers={handlers}
                            setActiveProjectId={setActiveProjectId}
                            user={user}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          

          <button
            onClick={() => handlers.createProject?.('new project')}
            className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Add Project
          </button>
          {user ? (
            <Link href="/auth/signout">Sign out</Link>
          ) : (
            <Link href="/auth/signup">Connect</Link>
          )}
        </div>
      </div>
      {/* Optional backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}
    </div>
  );
};

export default ChromeTabs;
