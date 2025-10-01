import { Project, Projects } from '../types/tabsAndTrello';

interface ChromeTabsHandlersProps {
  projects: Projects;
  setProjects: React.Dispatch<React.SetStateAction<Projects>>;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string>>;       // ✅ add current drag index
  setDragIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export const chromeTabsHandlers = (props: ChromeTabsHandlersProps) => {
  const { projects, setProjects, setActiveProjectId } = props;

  const handleProjectNameChange = (projectId: string, value: string) => {
      setProjects(prevProjects => ({
      ...prevProjects,
      [projectId]: { ...prevProjects[projectId], title: value },
    }));
  };

  const handleProjectInputKeyDown = (
    projectId: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const newTitle = e.currentTarget.value.trim();
      if (!newTitle) return;

      setProjects(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], title: newTitle, isNew: false },
      }));
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setProjects(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], isNew: false },
      }));
      e.currentTarget.blur();
    }
  };

  const closeProject = (projectId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    setProjects(prev => {
      // Create new object excluding the deleted project
      const remaining = Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== projectId)
      );

      const remainingIds = Object.keys(remaining);

      if (remainingIds.length === 0) {
        const defaultId = "project1";
        const defaultProject: Project = {
          id: defaultId,
          title: "Welcome",
          columns: [],
          isActive: true,
          isNew: false,
          position: 0,
        };
        setActiveProjectId(defaultId);
        return { [defaultId]: defaultProject };
      }

      const wasActive = prev[projectId]?.isActive;
      if (wasActive) {
        const firstId = remainingIds[0];
        remaining[firstId] = { ...remaining[firstId], isActive: true, isNew: false };
        setTimeout(() => setActiveProjectId(firstId), 0);
      }

      return remaining;
    });
  };

  const createProject = (name?: string) => {
    const newId = `project${Date.now()}`;
    if (projects[newId]) return;

    const newProject: Project = {
      id: newId,
      title: name || "New Project",
      isActive: true,
      isNew: true,
      columns: [],
      position: Object.keys(projects).length,
    };

    setProjects(prev => {
      const updated: Projects = {};
      Object.keys(prev).forEach(id => {
        updated[id] = { ...prev[id], isActive: false };
      });
      updated[newId] = newProject;
      return updated;
    });

    setActiveProjectId(newId);
  };

  return {
    handleProjectNameChange,
    handleProjectInputKeyDown,
    closeProject,
    createProject,
  };
}