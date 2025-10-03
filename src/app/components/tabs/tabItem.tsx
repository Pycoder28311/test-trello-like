import React, { Dispatch, SetStateAction } from "react";
import { Project, Projects, User } from "../types/tabsAndTrello";
import { X } from "lucide-react";
import { useState } from "react";

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
  inputRef?: (el: HTMLInputElement | null) => void;
  user: User | null;
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
  user,
}) => {
  const isActive = id === activeProjectId;
  const isNew = project.isNew || false;

  const [editing, setEditing] = useState(!!isNew);

  const saveProject = async (project: Project) => {
    try {
      let res: Response;

      if (project.isNew) {
        // Add new project
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: project.id,
            title: project.title,
            position: Object.keys(projects).length,
            favicon: project.favicon || null,
          }),
        });

        if (!res.ok) throw new Error("Failed to create project");

      } else {
        // Edit existing project
        res = await fetch(`/api/projects/${project.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: project.title }),
        });

        if (!res.ok) throw new Error("Failed to save project");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlur = () => {
    setEditing(false);
    saveProject(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setEditing(false);
    } else if (e.key === "Escape") {
      setEditing(false);
    }
    handlers.handleProjectInputKeyDown?.(id, e);
  };

  return (
    <div
      draggable={!isNew}
      onClick={() => {
        setActiveProjectId(id); 
      }}
      className={`
        group flex items-center min-w-[10px] max-w-[240px] h-12 md:h-8
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
        <div className="ml-2 mr-2 text-lg md:text-sm w-6 md:w-4 h-6 md:h-4 flex items-center justify-center">
          {project.favicon}
        </div>
      )}

      {/* Tab Title */}
      <div className="mx-1 flex-1 min-w-[10px] max-w-full">
        {editing ? (
          <input
            type="text"
            className="w-full bg-transparent outline-none border-0 text-lg md:text-sm px-1 box-border"
            value={project.title || ""}
            onChange={(e) => handlers.handleProjectNameChange(id, e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <span
            className="block text-lg md:text-sm px-1 truncate cursor-text"
            onClick={() => setEditing(true)}
            title={project.title}
          >
            {project.title || "Untitled"}
          </span>
        )}
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
