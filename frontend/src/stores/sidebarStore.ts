import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isPinned: boolean;
  isExpanded: boolean;
  
  // Actions
  toggleCollapsed: () => void;
  togglePinned: () => void;
  expand: () => void;
  collapse: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // Initial state
  isCollapsed: true, // Start collapsed
  isPinned: false,   // Start unpinned
  isExpanded: false, // Start collapsed
  
  // Actions
  toggleCollapsed: () => {
    const { isCollapsed, isPinned } = get();
    if (isPinned) {
      // If pinned, just toggle collapsed state
      set({ isCollapsed: !isCollapsed });
    } else {
      // If not pinned, collapse and set expanded to false
      set({ isCollapsed: true, isExpanded: false });
    }
  },
  
  togglePinned: () => {
    const { isPinned, isExpanded } = get();
    const newPinned = !isPinned;
    
    if (newPinned) {
      // When pinning, expand the sidebar
      set({ isPinned: true, isExpanded: true, isCollapsed: false });
    } else {
      // When unpinning, collapse the sidebar
      set({ isPinned: false, isExpanded: false, isCollapsed: true });
    }
  },
  
  expand: () => {
    set({ isExpanded: true, isCollapsed: false });
  },
  
  collapse: () => {
    const { isPinned } = get();
    if (!isPinned) {
      // Only collapse if not pinned
      set({ isExpanded: false, isCollapsed: true });
    }
  },
  
  setExpanded: (expanded: boolean) => {
    set({ isExpanded: expanded, isCollapsed: !expanded });
  },
}));

