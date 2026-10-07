import React from "react";
import {
  FileEdit,
  FileText,
  Clock,
  CreditCard,
  CheckCircle,
  Cpu,
  Truck,
  UserCheck,
  Navigation,
  MapPin,
  Layers,
  Scale,
  QrCode,
  KeyRound,
  PackageCheck,
  CheckCheck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  AlertOctagon,
  PauseCircle,
} from "lucide-react";
import type { OrderStatus } from "../types";
import { getOrderStatusMetadata } from "../services/orderStatusEngine";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileEdit,
  FileText,
  Clock,
  CreditCard,
  CheckCircle,
  Cpu,
  Truck,
  UserCheck,
  Navigation,
  MapPin,
  Layers,
  Scale,
  QrCode,
  KeyRound,
  PackageCheck,
  CheckCheck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  AlertOctagon,
  PauseCircle,
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md" | "lg";
  showStep?: boolean;
  className?: string;
  onClick?: () => void;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
  showStep = true,
  className = "",
  onClick,
}) => {
  const meta = getOrderStatusMetadata(status);
  const IconComponent = ICON_MAP[meta.iconName] || FileText;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  return (
    <span
      onClick={onClick}
      title={`${meta.label}: ${meta.description}`}
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs transition-all ${meta.bgColor} ${meta.textColor} ${meta.borderColor} ${sizeClasses} ${
        onClick ? "cursor-pointer hover:opacity-85" : ""
      } ${className}`}
    >
      {showStep && meta.stepNumber !== null && (
        <span
          className="size-3.5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
          style={{ backgroundColor: meta.color }}
        >
          {meta.stepNumber}
        </span>
      )}
      <IconComponent size={iconSizes} className="shrink-0" />
      <span className="truncate">{meta.label}</span>
      {meta.isException && (
        <span className="text-[9px] uppercase tracking-wider font-black px-1 rounded bg-red-600 text-white shrink-0">
          EXCEPTION
        </span>
      )}
    </span>
  );
};
