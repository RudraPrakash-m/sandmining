import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "../Button";

import type { ButtonVariant } from "../Button/button.types";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  animation?: "scale" | "top";
}

export interface ModalFooterProps {
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  confirmVariant?: ButtonVariant;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
  "3xl": "max-w-5xl",
  "4xl": "max-w-6xl",
  full: "max-w-full mx-4",
};

export const ModalFooter: React.FC<Readonly<ModalFooterProps>> = ({
  onClose,
  onConfirm,
  confirmText = "Save Changes",
  cancelText = "Close",
  showCancel = true,
  showConfirm = true,
  confirmDisabled = false,
  confirmLoading = false,
  confirmIcon,
  cancelIcon,
  confirmVariant = "primary",
  className = "",
  children,
}) => {
  if (children) {
    return (
      <div className={`flex items-center justify-end gap-2.5 w-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-end gap-2.5 w-full ${className}`}>
      {showCancel && onClose && (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onClose}
          icon={cancelIcon}
        >
          {cancelText}
        </Button>
      )}
      {showConfirm && onConfirm && (
        <Button
          type="button"
          variant={confirmVariant}
          size="md"
          onClick={onConfirm}
          disabled={confirmDisabled}
          loading={confirmLoading}
          icon={confirmIcon}
        >
          {confirmText}
        </Button>
      )}
    </div>
  );
};

export const Modal: React.FC<Readonly<ModalProps>> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  const [isMounted, setIsMounted] = React.useState(isOpen);
  const [animateShow, setAnimateShow] = React.useState(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const raf = requestAnimationFrame(() => {
        setAnimateShow(true);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateShow(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isMounted && !isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${animateShow ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 ${animateShow ? "opacity-100" : "opacity-0"
          }`}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Card - DreamsIoT style */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md
          } bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border-color dark:border-gray-800 overflow-hidden transform transition-all duration-200 z-10 ${animateShow ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"
          }`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-color dark:border-gray-800 shrink-0">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="size-8 inline-flex justify-center items-center rounded-full border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-danger hover:border-danger hover:text-white dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-sm text-gray-700 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border-color dark:border-gray-800 bg-[#FAF5EE]/70 dark:bg-gray-800/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
