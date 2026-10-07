import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "dark"
  | "light"
  | "outline"
  | "ghost"
  | "soft";

export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonAction = "submit" | "save" | "update" | "approve" | "reject" | "cancel" | "reset" | "back";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  action?: ButtonAction;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}
