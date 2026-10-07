// src/components/ui/Badge/badge.styles.ts
import type { BadgeVariant } from './badge.types';

export const baseBadgeStyle =
  'inline-flex items-center justify-center transition-all duration-200 font-medium rounded-lg';

export const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'bg-orange-100 text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  outline: 'border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  info: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border border-slate-200 dark:border-slate-800',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
};

export const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-semibold',
  lg: 'px-3 py-1.5 text-sm',
};

