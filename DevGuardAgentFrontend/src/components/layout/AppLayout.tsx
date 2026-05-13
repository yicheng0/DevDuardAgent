import { ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ConfigDialog from '@/components/config/ConfigDialog';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100 text-slate-950">
      <div
        className={`fixed left-0 top-0 z-30 h-full transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <Sidebar />
      </div>

      <div
        className={`relative flex h-full flex-col transition-all duration-200 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <Topbar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}

      <ConfigDialog />
    </div>
  );
};

export default AppLayout;
