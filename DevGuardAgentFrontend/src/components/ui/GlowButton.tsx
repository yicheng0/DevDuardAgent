import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary:
    'border border-cyan-300/25 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_28px_rgba(34,211,238,0.22)] hover:shadow-[0_0_34px_rgba(34,211,238,0.34)]',
  secondary:
    'border border-emerald-300/20 bg-gradient-to-r from-cyan-600 to-emerald-500 shadow-[0_0_28px_rgba(16,185,129,0.2)] hover:shadow-[0_0_34px_rgba(16,185,129,0.32)]',
  success:
    'border border-emerald-300/25 bg-emerald-600 shadow-[0_0_28px_rgba(16,185,129,0.2)] hover:bg-emerald-500',
  danger:
    'border border-red-300/25 bg-red-600 shadow-[0_0_28px_rgba(248,113,113,0.18)] hover:bg-red-500',
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
      className={`rounded-xl px-6 py-3 font-medium text-white transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
