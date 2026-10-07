// src/components/ui/Badge/index.tsx
import React from 'react';
import type { BadgeProps } from './badge.types';
import { baseBadgeStyle, badgeVariants, badgeSizes } from './badge.styles';

export const Badge: React.FC<Readonly<BadgeProps>> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${baseBadgeStyle} ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <span className="mr-2 animate-spin">⏳</span>}
      {children || 'Badge Component'}
    </div>
  );
};

export default Badge;
