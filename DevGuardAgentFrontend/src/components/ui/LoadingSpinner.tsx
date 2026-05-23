import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-[#4f8cff]/25 border-t-[#8fb5ff]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};
