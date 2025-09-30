import React, { Dispatch, SetStateAction } from "react";
import { Project, Projects } from "../types/tabsAndTrello";
import { X } from "lucide-react";

interface TabProjectProps {
  project: Project;
  id: string;
  index: number;
  projects: Projects;
  activeProjectId: string;
  isDragging: boolean;
  dragIndex: number | null;
  handlers: ReturnType<typeof import("./tabHandlers").chromeTabsHandlers>;
  setActiveProjectId: Dispatch<SetStateAction<string>>;
}

const TabItem: React.FC<TabProjectProps> = ({
  project,
  id,
  index,
  projects,
  activeProjectId,
  isDragging,
  dragIndex,
  handlers,
  setActiveProjectId,
}) => {
  const isActive = id === activeProjectId;
  const isNew = project.isNew || false;

  return (
    <div
      draggable={!isNew}
      onDragStart={() => handlers.handleDragStart(index)}
      onDragOver={(e) => handlers.handleProjectDragOver(e, index)}
      onDragEnd={handlers.handleDragEnd}
      onClick={() => !isNew && setActiveProjectId(id)}
      className={`
        group flex items-center min-w-[120px] max-w-[240px] h-8 
        border border-gray-300 border-b-0 relative
        ${isActive ? 'bg-white border-gray-300 z-10' : 'bg-gray-200 border-transparent hover:bg-gray-300'}
        ${isNew ? 'min-w-[200px] z-20' : ''}
        ${isDragging && dragIndex === index ? 'opacity-50' : ''}
        transition-all duration-200 ease-in-out
      `}
      style={{ marginLeft: index === 0 ? '0' : '-1px' }}
    >
      {/* Favicon */}
      {!isNew && (
        <div className="ml-2 mr-2 text-sm w-4 h-4 flex items-center justify-center">
          {project.favicon}
        </div>
      )}

      {/* Tab Title */}
      <div className="flex-1 min-w-0 mx-1">
        <input
          type="text"
          className="w-full bg-transparent outline-none text-sm px-1"
          value={project.title || ''}
          onChange={(e) => handlers.handleProjectNameChange(id, e.target.value)}
          onKeyDown={(e) => handlers.handleProjectInputKeyDown(id, e)}
          autoFocus={isNew}
        />
      </div>

      {/* Close Button */}
      {(!isNew || Object.keys(projects).length > 1) && (
        <button
          onClick={() => handlers.closeProject(id)}
          className={`
            w-4 h-4 rounded-full flex items-center justify-center
            mr-2 opacity-0 group-hover:opacity-100
            hover:bg-gray-400 hover:text-white
            ${isActive ? 'opacity-100' : ''}
            ${isNew ? 'opacity-100' : ''}
            transition-opacity duration-200
          `}
        >
          <X size={12} />
        </button>
      )}

      {/* Active Tab Indicator */}
      {isActive && !isNew && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
      )}

      {/* Loading indicator for new tabs */}
      {isNew && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 animate-pulse" />
      )}
    </div>
  );
};

export default TabItem;
