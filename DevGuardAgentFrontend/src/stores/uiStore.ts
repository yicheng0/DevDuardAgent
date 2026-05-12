import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMode } from '@/types';

interface UIStore {
  isSidebarOpen: boolean;
  isAIOpsOpen: boolean;
  chatMode: ChatMode;
  blurIntensity: 'low' | 'medium' | 'high';

  // Actions
  toggleSidebar: () => void;
  toggleAIOps: () => void;
  setChatMode: (mode: ChatMode) => void;
  setBlurIntensity: (intensity: 'low' | 'medium' | 'high') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isAIOpsOpen: false,
      chatMode: 'stream',
      blurIntensity: 'medium',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleAIOps: () => set((state) => ({ isAIOpsOpen: !state.isAIOpsOpen })),
      setChatMode: (mode) => set({ chatMode: mode }),
      setBlurIntensity: (intensity) => set({ blurIntensity: intensity }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
