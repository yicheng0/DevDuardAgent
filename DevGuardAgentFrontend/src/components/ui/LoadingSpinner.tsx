import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};
