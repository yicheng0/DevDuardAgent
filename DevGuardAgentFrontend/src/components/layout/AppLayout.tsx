import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed left-0 top-0 h-full z-30 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <div
        className={`h-full transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-[calc(100vh-64px)] overflow-hidden"
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}
    </div>
  );
};

export default AppLayout;
