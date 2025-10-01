'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChromeTabsProps } from '../types/tabsAndTrello';
import { chromeTabsHandlers } from './tabHandlers';
import TabItem from './tabItem';

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
}) => {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isDragging, setIsDragging] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const ids = Object.keys(projects);

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

    // reorder
    const newIds = Array.from(ids);
    const [removed] = newIds.splice(source.index, 1);
    newIds.splice(destination.index, 0, removed);

    // rebuild projects with new order
    const newProjects: typeof projects = {};
    newIds.forEach((id) => {
      newProjects[id] = projects[id];
    });

    setProjects(newProjects);
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
    <div className="flex items-center bg-gray-100 border-b border-gray-300">
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: 'thin' }}
      >
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <Droppable
            droppableId="tabs"
            direction="horizontal"
          >
            {(provided) => (
              <div
                className="flex items-center"
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  maxWidth: '1000px',
                  whiteSpace: 'nowrap',
                }}
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
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add Tab Button */}
                <button
                  onClick={() => handlers.createProject?.('new project')}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 mx-2 rounded flex-shrink-0"
                  title="Add new tab"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ChromeTabs;
