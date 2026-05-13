import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMode, NavItemId } from '@/types';

interface UIStore {
  isSidebarOpen: boolean;
  isAIOpsOpen: boolean;
  isConfigOpen: boolean;
  chatMode: ChatMode;
  activeNav: NavItemId;
  blurIntensity: 'low' | 'medium' | 'high';

  // Actions
  toggleSidebar: () => void;
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
      isAIOpsOpen: false,
      isConfigOpen: false,
      chatMode: 'stream',
      activeNav: 'alerts',
      blurIntensity: 'medium',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
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
