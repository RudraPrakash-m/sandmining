import React from "react";
import type { ButtonProps, ButtonAction } from "./button.types";
import { baseButtonStyle, buttonVariants, buttonSizes } from "./button.styles";
import { Loader2 } from "lucide-react";

const actionLabelMap: Record<string, string> = {
  submit: "Submit",
  save: "Save Changes",
  update: "Update",
  approve: "Approve",
  reject: "Reject",
  cancel: "Cancel",
  reset: "Reset",
  back: "Back",
};

const getButtonType = (
  type?: "button" | "submit" | "reset",
  action?: ButtonAction
): "button" | "submit" | "reset" => {
  if (type) return type;
  if (action === "submit") return "submit";
  if (action === "reset") return "reset";
  return "button";
};

export const Button: React.FC<Readonly<ButtonProps>> = ({
  label,
  action,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = "",
  disabled,
  children,
  type,
  ...props
}) => {
  const finalLabel = label || children || (action ? actionLabelMap[action] : "");
  const buttonType = getButtonType(type, action);

  return (
    <button
      type={buttonType}
      className={`
        ${baseButtonStyle}
        ${buttonVariants[variant] || buttonVariants.primary}
        ${buttonSizes[size] || buttonSizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0 size-4" />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}

      {finalLabel && <span>{finalLabel}</span>}

      {!loading && iconRight && (
        <span className="shrink-0 flex items-center">{iconRight}</span>
      )}
    </button>
  );
};

export default Button;
