import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'border border-blue-700 bg-blue-600 hover:bg-blue-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  success: 'border border-emerald-700 bg-emerald-600 hover:bg-emerald-700',
  danger: 'border border-red-700 bg-red-600 hover:bg-red-700',
};

export const GlowButton = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: GlowButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
