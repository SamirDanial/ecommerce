import { useState } from "react";

export type ViewMode = "grid" | "list";

export const useViewMode = () => {
  // Default to grid view for both mobile and desktop
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const toggleToGrid = () => setViewMode("grid");
  const toggleToList = () => setViewMode("list");

  return {
    viewMode,
    setViewMode,
    toggleToGrid,
    toggleToList,
  };
};
