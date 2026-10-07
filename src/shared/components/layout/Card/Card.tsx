import React, { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, Copy, CheckCheck } from "lucide-react";

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  showCodeButton?: boolean;
  onToggleCode?: () => void;
  codeButtonLabel?: string;
  codeSnippet?: string;
  isCodeVisible?: boolean;
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  noHeaderBorder?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const CardHeader: React.FC<{
  children: ReactNode;
  className?: string;
  noBorder?: boolean;
}> = ({ children, className = "", noBorder = false }) => (
  <div
    className={`pb-5 mb-5 flex items-center justify-between flex-wrap gap-3 ${noBorder ? "" : "border-b border-border-color dark:border-gray-800"
      } ${className}`}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}> = ({ children, className = "", icon: Icon }) => (
  <div className="flex items-center gap-2.5">
    {Icon && <Icon size={19} className="text-primary shrink-0" />}
    <h2
      className={`text-gray-900 dark:text-white text-base md:text-lg font-bold mb-0 leading-snug tracking-tight ${className}`}
    >
      {children}
    </h2>
  </div>
);

export const CardSubtitle: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <p
    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight ${className}`}
  >
    {children}
  </p>
);

export const CardAction: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`flex items-center gap-2 ml-auto ${className}`}>{children}</div>
);

export const CardCodeButton: React.FC<{
  onClick?: () => void;
  label?: string;
  className?: string;
}> = ({ onClick, label = "Show Code", className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 border border-border-color dark:border-gray-700 py-1.5 px-3 text-xs md:text-sm font-semibold rounded-md bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-750 transition-colors shadow-2xs cursor-pointer ${className}`}
  >
    <Eye size={15} className="text-gray-500 dark:text-gray-400" />
    <span>{label}</span>
  </button>
);

export const CardContent: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`preview-content ${className}`}>{children}</div>
);

export const Card: React.FC<Readonly<CardProps>> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  showCodeButton = false,
  onToggleCode,
  codeButtonLabel,
  codeSnippet,
  isCodeVisible,
  children,
  className = "",
  containerClassName = "",
  bodyClassName = "",
  headerClassName = "",
  titleClassName = "",
  noHeaderBorder = false,
  onClick,
}) => {
  const combinedContainerClass = className || containerClassName;
  const [internalShowCode, setInternalShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeCodeVisible =
    typeof isCodeVisible === "boolean" ? isCodeVisible : internalShowCode;

  const handleToggle = () => {
    if (onToggleCode) {
      onToggleCode();
    } else {
      setInternalShowCode(!internalShowCode);
    }
  };

  const handleCopyCode = () => {
    if (!codeSnippet) return;
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvedCodeLabel =
    codeButtonLabel || (activeCodeVisible ? "Hide Code" : "Show Code");

  const hasHeader = title || subtitle || action || showCodeButton || codeSnippet;

  return (
    <div
      onClick={onClick}
      className={`preview-card bg-white dark:bg-gray-900 rounded-xl border border-border-color dark:border-gray-800 p-5 md:p-6 mb-6 shadow-2xs transition-colors ${combinedContainerClass}`}
    >
      {/* Card Header & Heading */}
      {hasHeader && (
        <div
          className={`pb-5 mb-5 flex items-center justify-between flex-wrap gap-3 ${noHeaderBorder ? "" : "border-b border-border-color dark:border-gray-800"
            } ${headerClassName}`}
        >
          <div className="flex items-center gap-2.5">
            {Icon && <Icon size={19} className="text-primary shrink-0" />}
            <div>
              {title && (
                <h2
                  className={`text-gray-900 dark:text-white text-base md:text-lg font-bold mb-0 leading-snug tracking-tight ${titleClassName}`}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {action}
            {(showCodeButton || codeSnippet) && (
              <button
                type="button"
                onClick={handleToggle}
                className="flex items-center gap-2 border border-border-color dark:border-gray-700 py-1.5 px-3 text-xs md:text-sm font-semibold rounded-md bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-750 transition-colors shadow-2xs cursor-pointer"
              >
                <Eye size={15} className="text-gray-500 dark:text-gray-400" />
                <span>{resolvedCodeLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className={`preview-content ${bodyClassName}`}>{children}</div>

      {/* Code Snippet Accordion if codeSnippet provided */}
      {activeCodeVisible && codeSnippet && (
        <div className="relative mt-5 rounded-lg bg-gray-950 text-gray-100 p-4 font-mono text-xs overflow-hidden">
          <button
            type="button"
            onClick={handleCopyCode}
            className="absolute top-3 right-3 flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white text-[11px] px-2.5 py-1 rounded shadow cursor-pointer transition-colors"
          >
            {copied ? (
              <CheckCheck size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <pre className="overflow-x-auto pr-16">{codeSnippet}</pre>
        </div>
      )}
    </div>
  );
};

export default Card;
