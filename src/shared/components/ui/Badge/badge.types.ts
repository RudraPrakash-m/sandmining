// src/components/ui/Badge/badge.types.ts
import type { ReactNode, HTMLAttributes } from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

