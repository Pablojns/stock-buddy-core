import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        glow && 'kpi-glow',
        'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
GlassCard.displayName = 'GlassCard';
