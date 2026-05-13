import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'brand-button',
  secondary: 'brand-button brand-button-secondary',
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
      className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
