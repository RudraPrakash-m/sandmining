import type { ButtonVariant, ButtonSize } from "./button.types";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-xs focus:ring-2 focus:ring-primary/20",
  secondary:
    "bg-secondary hover:bg-secondary/90 text-white shadow-xs focus:ring-2 focus:ring-secondary/20",
  success:
    "bg-success hover:bg-success/90 text-white shadow-xs focus:ring-2 focus:ring-success/20",
  danger:
    "bg-danger hover:bg-danger/90 text-white shadow-xs focus:ring-2 focus:ring-danger/20",
  warning:
    "bg-warning hover:bg-warning/90 text-white shadow-xs focus:ring-2 focus:ring-warning/20",
  dark:
    "bg-gray-900 hover:bg-black text-white shadow-xs focus:ring-2 focus:ring-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700",
  light:
    "bg-slate-100 hover:bg-slate-200 text-gray-800 shadow-2xs dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
  outline:
    "border border-border-color bg-white hover:bg-slate-50 text-gray-700 shadow-2xs dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
  ghost:
    "hover:bg-slate-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
  soft:
    "bg-primary/10 text-primary hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-primary-foreground",
};

export const buttonSizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9.5 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-base gap-2.5 rounded-xl",
};

export const baseButtonStyle =
  "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none outline-none";
