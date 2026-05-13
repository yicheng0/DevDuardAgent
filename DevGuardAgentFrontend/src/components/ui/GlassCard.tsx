import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'elevated' | 'glow';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

const variantClasses = {
  default: 'border-slate-200 bg-white',
  elevated: 'border-slate-200 bg-white shadow-sm',
  glow: 'border-blue-200 bg-blue-50',
};

export const GlassCard = ({
  variant = 'default',
  blur = 'md',
  children,
  className = '',
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border transition-colors duration-200 ${blurClasses[blur]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
