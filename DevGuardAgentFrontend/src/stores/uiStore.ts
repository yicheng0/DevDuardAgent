import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMode, NavItemId } from '@/types';

interface UIStore {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isAIOpsOpen: boolean;
  isConfigOpen: boolean;
  chatMode: ChatMode;
  activeNav: NavItemId;
  blurIntensity: 'low' | 'medium' | 'high';

  // Actions
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleAIOps: () => void;
  toggleConfig: () => void;
  setConfigOpen: (open: boolean) => void;
  setChatMode: (mode: ChatMode) => void;
  setActiveNav: (nav: NavItemId) => void;
  setBlurIntensity: (intensity: 'low' | 'medium' | 'high') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      isAIOpsOpen: false,
      isConfigOpen: false,
      chatMode: 'stream',
      activeNav: 'overview',
      blurIntensity: 'medium',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleAIOps: () => set((state) => ({ isAIOpsOpen: !state.isAIOpsOpen })),
      toggleConfig: () => set((state) => ({ isConfigOpen: !state.isConfigOpen })),
      setConfigOpen: (open) => set({ isConfigOpen: open }),
      setChatMode: (mode) => set({ chatMode: mode }),
      setActiveNav: (nav) => set({ activeNav: nav }),
      setBlurIntensity: (intensity) => set({ blurIntensity: intensity }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
