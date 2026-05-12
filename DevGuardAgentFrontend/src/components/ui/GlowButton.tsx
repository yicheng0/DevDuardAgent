import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl',
  secondary: 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl',
  success: 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl',
  danger: 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl',
};

export const GlowButton = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: GlowButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
