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
  default: 'bg-white/10 border-white/20',
  elevated: 'bg-white/15 border-white/30 shadow-glass',
  glow: 'bg-white/10 border-white/20 shadow-glow hover:shadow-glow-purple',
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
      className={`rounded-2xl border transition-all duration-300 ${blurClasses[blur]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
