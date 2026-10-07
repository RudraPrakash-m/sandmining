import type {
  OrderStatus,
  StandardOrderStatus,
  ExceptionOrderStatus,
  StatusMetadata,
  OrderPhase,
} from "../types";

// The 18 Sequential Standard Lifecycle Stages in exact progression
export const ORDER_LIFECYCLE_SEQUENCE: StandardOrderStatus[] = [
  "Draft",
  "Booking Submitted",
  "Payment Pending",
  "Payment Success",
  "Order Confirmed",
  "Vehicle Allocation Pending",
  "Vehicle Allocated",
  "Driver Accepted",
  "Pickup Pending",
  "Vehicle at Sand Reach",
  "Loading in Progress",
  "Loaded / Pickup Completed",
  "Transit Pass Generated",
  "In Transit",
  "Reached Delivery Location",
  "OTP Verification",
  "Delivered",
  "Order Closed",
];

// The 6 Exception Statuses
export const EXCEPTION_STATUSES: ExceptionOrderStatus[] = [
  "Cancelled",
  "Payment Failed",
  "Vehicle Rejected",
  "Vehicle Reallocation Pending",
  "Delivery Failed",
  "Order On Hold",
];

// Legacy alias map to canonical standard statuses
const LEGACY_STATUS_MAP: Record<string, StandardOrderStatus | ExceptionOrderStatus> = {
  "Draft": "Draft",
  "Booked": "Booking Submitted",
  "Booking Submitted": "Booking Submitted",
  "Payment Pending": "Payment Pending",
  "Paid": "Payment Success",
  "Payment Success": "Payment Success",
  "Booking Confirmed": "Order Confirmed",
  "Order Confirmed": "Order Confirmed",
  "Vehicle Allocation Pending": "Vehicle Allocation Pending",
  "Vehicle Assigned": "Vehicle Allocated",
  "Vehicle Allocated": "Vehicle Allocated",
  "Order Accepted": "Driver Accepted",
  "Driver Accepted": "Driver Accepted",
  "Pickup Pending": "Pickup Pending",
  "Vehicle at Sand Reach": "Vehicle at Sand Reach",
  "Loading at Stockyard": "Loading in Progress",
  "Loading in Progress": "Loading in Progress",
  "Loaded / Pickup Completed": "Loaded / Pickup Completed",
  "Transit Pass Generated": "Transit Pass Generated",
  "Dispatched": "In Transit",
  "In Transit": "In Transit",
  "Reached Delivery Location": "Reached Delivery Location",
  "OTP Verification": "OTP Verification",
  "Delivered": "Delivered",
  "Trip Completed": "Order Closed",
  "Closed": "Order Closed",
  "Order Closed": "Order Closed",
  // Exceptions
  "Cancelled": "Cancelled",
  "Payment Failed": "Payment Failed",
  "Vehicle Rejected": "Vehicle Rejected",
  "Order Rejected": "Vehicle Rejected",
  "Vehicle Reallocation Pending": "Vehicle Reallocation Pending",
  "Delivery Failed": "Delivery Failed",
  "Order On Hold": "Order On Hold",
};

export const ORDER_STATUS_METADATA: Record<StandardOrderStatus | ExceptionOrderStatus, StatusMetadata> = {
  // ── 1. Draft ─────────────────────────────────────────────────────────────
  Draft: {
    status: "Draft",
    canonicalStatus: "Draft",
    stepNumber: 1,
    isException: false,
    phase: "Booking & Initiation",
    label: "Draft",
    shortLabel: "Draft",
    description: "Sand booking initiated but not yet submitted by customer.",
    color: "#64748b",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-700 dark:text-slate-300",
    borderColor: "border-slate-300 dark:border-slate-700",
    iconName: "FileEdit",
    allowedNext: ["Booking Submitted", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 2. Booking Submitted ──────────────────────────────────────────────────
  "Booking Submitted": {
    status: "Booking Submitted",
    canonicalStatus: "Booking Submitted",
    stepNumber: 2,
    isException: false,
    phase: "Booking & Initiation",
    label: "Booking Submitted",
    shortLabel: "Submitted",
    description: "Customer submitted sand booking request with reach & quantity.",
    color: "#0284c7",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    textColor: "text-sky-700 dark:text-sky-300",
    borderColor: "border-sky-300 dark:border-sky-800",
    iconName: "FileText",
    allowedNext: ["Payment Pending", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 3. Payment Pending ────────────────────────────────────────────────────
  "Payment Pending": {
    status: "Payment Pending",
    canonicalStatus: "Payment Pending",
    stepNumber: 3,
    isException: false,
    phase: "Payment & Settlement",
    label: "Payment Pending",
    shortLabel: "Awaiting Pay",
    description: "Sand quota held; citizen has 60 minutes to remit statutory charges.",
    color: "#eab308",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-300 dark:border-amber-800",
    iconName: "Clock",
    allowedNext: ["Payment Success", "Payment Failed", "Cancelled"],
    allowedExceptions: ["Payment Failed", "Cancelled", "Order On Hold"],
  },

  // ── 4. Payment Success ────────────────────────────────────────────────────
  "Payment Success": {
    status: "Payment Success",
    canonicalStatus: "Payment Success",
    stepNumber: 4,
    isException: false,
    phase: "Payment & Settlement",
    label: "Payment Success",
    shortLabel: "Paid",
    description: "Treasury transaction settled with royalty, DMF cess & transport charges.",
    color: "#16a34a",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-300 dark:border-emerald-800",
    iconName: "CreditCard",
    allowedNext: ["Order Confirmed", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 5. Order Confirmed ────────────────────────────────────────────────────
  "Order Confirmed": {
    status: "Order Confirmed",
    canonicalStatus: "Order Confirmed",
    stepNumber: 5,
    isException: false,
    phase: "Payment & Settlement",
    label: "Order Confirmed",
    shortLabel: "Confirmed",
    description: "Statutory Order ID confirmed & sand entitlement locked.",
    color: "#059669",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/60",
    textColor: "text-emerald-800 dark:text-emerald-200",
    borderColor: "border-emerald-400 dark:border-emerald-700",
    iconName: "CheckCircle",
    allowedNext: ["Vehicle Allocation Pending", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 6. Vehicle Allocation Pending ─────────────────────────────────────────
  "Vehicle Allocation Pending": {
    status: "Vehicle Allocation Pending",
    canonicalStatus: "Vehicle Allocation Pending",
    stepNumber: 6,
    isException: false,
    phase: "Vehicle Allocation",
    label: "Vehicle Allocation Pending",
    shortLabel: "Queue Pending",
    description: "Awaiting automated FIFO matching with registered logistics vehicle.",
    color: "#854d0e",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    textColor: "text-yellow-800 dark:text-yellow-300",
    borderColor: "border-yellow-300 dark:border-yellow-800",
    iconName: "Cpu",
    allowedNext: ["Vehicle Allocated", "Vehicle Reallocation Pending", "Cancelled"],
    allowedExceptions: ["Vehicle Reallocation Pending", "Cancelled", "Order On Hold"],
  },

  // ── 7. Vehicle Allocated ──────────────────────────────────────────────────
  "Vehicle Allocated": {
    status: "Vehicle Allocated",
    canonicalStatus: "Vehicle Allocated",
    stepNumber: 7,
    isException: false,
    phase: "Vehicle Allocation",
    label: "Vehicle Allocated",
    shortLabel: "Allocated",
    description: "Eligible vehicle matched via FIFO queue; sent offer to transporter.",
    color: "#2563eb",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-300 dark:border-blue-800",
    iconName: "Truck",
    allowedNext: ["Driver Accepted", "Vehicle Rejected", "Vehicle Reallocation Pending", "Cancelled"],
    allowedExceptions: ["Vehicle Rejected", "Vehicle Reallocation Pending", "Cancelled", "Order On Hold"],
  },

  // ── 8. Driver Accepted ────────────────────────────────────────────────────
  "Driver Accepted": {
    status: "Driver Accepted",
    canonicalStatus: "Driver Accepted",
    stepNumber: 8,
    isException: false,
    phase: "Vehicle Allocation",
    label: "Driver Accepted",
    shortLabel: "Accepted",
    description: "Driver acknowledged consignment notification and accepted trip.",
    color: "#4f46e5",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    textColor: "text-indigo-700 dark:text-indigo-300",
    borderColor: "border-indigo-300 dark:border-indigo-800",
    iconName: "UserCheck",
    allowedNext: ["Pickup Pending", "Vehicle Rejected", "Cancelled"],
    allowedExceptions: ["Vehicle Rejected", "Cancelled", "Order On Hold"],
  },

  // ── 9. Pickup Pending ─────────────────────────────────────────────────────
  "Pickup Pending": {
    status: "Pickup Pending",
    canonicalStatus: "Pickup Pending",
    stepNumber: 9,
    isException: false,
    phase: "Sand Reach & Loading",
    label: "Pickup Pending",
    shortLabel: "Pickup Pending",
    description: "Vehicle en route to source stockyard or mining reach for loading.",
    color: "#0891b2",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    textColor: "text-cyan-700 dark:text-cyan-300",
    borderColor: "border-cyan-300 dark:border-cyan-800",
    iconName: "Navigation",
    allowedNext: ["Vehicle at Sand Reach", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 10. Vehicle at Sand Reach ─────────────────────────────────────────────
  "Vehicle at Sand Reach": {
    status: "Vehicle at Sand Reach",
    canonicalStatus: "Vehicle at Sand Reach",
    stepNumber: 10,
    isException: false,
    phase: "Sand Reach & Loading",
    label: "Vehicle at Sand Reach",
    shortLabel: "At Reach",
    description: "Vehicle entered geofence of stockyard; tare weighment in progress.",
    color: "#0d9488",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
    textColor: "text-teal-700 dark:text-teal-300",
    borderColor: "border-teal-300 dark:border-teal-800",
    iconName: "MapPin",
    allowedNext: ["Loading in Progress", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 11. Loading in Progress ───────────────────────────────────────────────
  "Loading in Progress": {
    status: "Loading in Progress",
    canonicalStatus: "Loading in Progress",
    stepNumber: 11,
    isException: false,
    phase: "Sand Reach & Loading",
    label: "Loading in Progress",
    shortLabel: "Loading",
    description: "Excavator/loader filling sand into vehicle tipper payload bed.",
    color: "#d97706",
    bgColor: "bg-amber-100 dark:bg-amber-950/50",
    textColor: "text-amber-800 dark:text-amber-200",
    borderColor: "border-amber-400 dark:border-amber-700",
    iconName: "Layers",
    allowedNext: ["Loaded / Pickup Completed", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 12. Loaded / Pickup Completed ─────────────────────────────────────────
  "Loaded / Pickup Completed": {
    status: "Loaded / Pickup Completed",
    canonicalStatus: "Loaded / Pickup Completed",
    stepNumber: 12,
    isException: false,
    phase: "Sand Reach & Loading",
    label: "Loaded / Pickup Completed",
    shortLabel: "Loaded",
    description: "Gross weight verified on weighbridge; net sand payload confirmed.",
    color: "#b45309",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    textColor: "text-orange-800 dark:text-orange-200",
    borderColor: "border-orange-300 dark:border-orange-800",
    iconName: "Scale",
    allowedNext: ["Transit Pass Generated", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 13. Transit Pass Generated ────────────────────────────────────────────
  "Transit Pass Generated": {
    status: "Transit Pass Generated",
    canonicalStatus: "Transit Pass Generated",
    stepNumber: 13,
    isException: false,
    phase: "Dispatch & Transit",
    label: "Transit Pass Generated",
    shortLabel: "Pass Sealed",
    description: "Digital Transit Pass / e-Waybill sealed with cryptographic QR & hash.",
    color: "#7c3aed",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-300 dark:border-purple-800",
    iconName: "QrCode",
    allowedNext: ["In Transit", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── 14. In Transit ────────────────────────────────────────────────────────
  "In Transit": {
    status: "In Transit",
    canonicalStatus: "In Transit",
    stepNumber: 14,
    isException: false,
    phase: "Dispatch & Transit",
    label: "In Transit",
    shortLabel: "In Transit",
    description: "Consignment actively moving along authorized GIS route to customer site.",
    color: "#2563eb",
    bgColor: "bg-blue-100 dark:bg-blue-950/60",
    textColor: "text-blue-800 dark:text-blue-200",
    borderColor: "border-blue-400 dark:border-blue-700",
    iconName: "Truck",
    allowedNext: ["Reached Delivery Location", "Delivery Failed", "Order On Hold"],
    allowedExceptions: ["Delivery Failed", "Order On Hold", "Cancelled"],
  },

  // ── 15. Reached Delivery Location ─────────────────────────────────────────
  "Reached Delivery Location": {
    status: "Reached Delivery Location",
    canonicalStatus: "Reached Delivery Location",
    stepNumber: 15,
    isException: false,
    phase: "Dispatch & Transit",
    label: "Reached Delivery Location",
    shortLabel: "Arrived",
    description: "Vehicle reached customer delivery address; entered destination geofence.",
    color: "#0284c7",
    bgColor: "bg-sky-100 dark:bg-sky-950/60",
    textColor: "text-sky-800 dark:text-sky-200",
    borderColor: "border-sky-400 dark:border-sky-700",
    iconName: "MapPin",
    allowedNext: ["OTP Verification", "Delivery Failed", "Order On Hold"],
    allowedExceptions: ["Delivery Failed", "Order On Hold", "Cancelled"],
  },

  // ── 16. OTP Verification ──────────────────────────────────────────────────
  "OTP Verification": {
    status: "OTP Verification",
    canonicalStatus: "OTP Verification",
    stepNumber: 16,
    isException: false,
    phase: "Delivery & Handover",
    label: "OTP Verification",
    shortLabel: "OTP Handover",
    description: "Sand inspected and unloaded; awaiting customer 4-digit verification OTP.",
    color: "#e11d48",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    textColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-300 dark:border-rose-800",
    iconName: "KeyRound",
    allowedNext: ["Delivered", "Delivery Failed"],
    allowedExceptions: ["Delivery Failed", "Order On Hold"],
  },

  // ── 17. Delivered ─────────────────────────────────────────────────────────
  "Delivered": {
    status: "Delivered",
    canonicalStatus: "Delivered",
    stepNumber: 17,
    isException: false,
    phase: "Delivery & Handover",
    label: "Delivered",
    shortLabel: "Delivered",
    description: "Customer OTP validated; sand successfully delivered and signed.",
    color: "#059669",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/60",
    textColor: "text-emerald-800 dark:text-emerald-200",
    borderColor: "border-emerald-400 dark:border-emerald-700",
    iconName: "PackageCheck",
    allowedNext: ["Order Closed"],
    allowedExceptions: ["Order On Hold"],
  },

  // ── 18. Order Closed ──────────────────────────────────────────────────────
  "Order Closed": {
    status: "Order Closed",
    canonicalStatus: "Order Closed",
    stepNumber: 18,
    isException: false,
    phase: "Delivery & Handover",
    label: "Order Closed",
    shortLabel: "Closed",
    description: "POD sealed, vehicle returned to FIFO queue, statutory transaction completed.",
    color: "#15803d",
    bgColor: "bg-green-100 dark:bg-green-950/80",
    textColor: "text-green-900 dark:text-green-100",
    borderColor: "border-green-500 dark:border-green-700",
    iconName: "CheckCheck",
    allowedNext: [],
    allowedExceptions: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6 EXCEPTION STATUSES
  // ═══════════════════════════════════════════════════════════════════════════

  // ── E1. Cancelled ─────────────────────────────────────────────────────────
  Cancelled: {
    status: "Cancelled",
    canonicalStatus: "Cancelled",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Cancelled",
    shortLabel: "Cancelled",
    description: "Order cancelled by customer or authority; refund initiated if applicable.",
    color: "#dc2626",
    bgColor: "bg-red-100 dark:bg-red-950/60",
    textColor: "text-red-800 dark:text-red-200",
    borderColor: "border-red-400 dark:border-red-800",
    iconName: "XCircle",
    allowedNext: [],
    allowedExceptions: [],
  },

  // ── E2. Payment Failed ────────────────────────────────────────────────────
  "Payment Failed": {
    status: "Payment Failed",
    canonicalStatus: "Payment Failed",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Payment Failed",
    shortLabel: "Pay Failed",
    description: "Online transaction declined by bank or timed out. Re-attempt permitted.",
    color: "#ea580c",
    bgColor: "bg-orange-100 dark:bg-orange-950/60",
    textColor: "text-orange-800 dark:text-orange-200",
    borderColor: "border-orange-400 dark:border-orange-800",
    iconName: "AlertTriangle",
    allowedNext: ["Payment Pending", "Cancelled"],
    allowedExceptions: ["Cancelled"],
  },

  // ── E3. Vehicle Rejected ──────────────────────────────────────────────────
  "Vehicle Rejected": {
    status: "Vehicle Rejected",
    canonicalStatus: "Vehicle Rejected",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Vehicle Rejected",
    shortLabel: "Rejected",
    description: "Transporter/driver rejected assignment. Automated reallocation triggered.",
    color: "#c026d3",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    textColor: "text-fuchsia-800 dark:text-fuchsia-200",
    borderColor: "border-fuchsia-300 dark:border-fuchsia-800",
    iconName: "Truck",
    allowedNext: ["Vehicle Reallocation Pending", "Vehicle Allocated", "Cancelled"],
    allowedExceptions: ["Vehicle Reallocation Pending", "Cancelled", "Order On Hold"],
  },

  // ── E4. Vehicle Reallocation Pending ──────────────────────────────────────
  "Vehicle Reallocation Pending": {
    status: "Vehicle Reallocation Pending",
    canonicalStatus: "Vehicle Reallocation Pending",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Vehicle Reallocation Pending",
    shortLabel: "Reallocating",
    description: "Previous vehicle rejected or unavailable; FIFO queue selecting replacement.",
    color: "#9333ea",
    bgColor: "bg-purple-100 dark:bg-purple-950/60",
    textColor: "text-purple-800 dark:text-purple-200",
    borderColor: "border-purple-400 dark:border-purple-800",
    iconName: "RotateCcw",
    allowedNext: ["Vehicle Allocated", "Cancelled"],
    allowedExceptions: ["Cancelled", "Order On Hold"],
  },

  // ── E5. Delivery Failed ───────────────────────────────────────────────────
  "Delivery Failed": {
    status: "Delivery Failed",
    canonicalStatus: "Delivery Failed",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Delivery Failed",
    shortLabel: "Deliv Failed",
    description: "Customer unavailable, inaccessible site road, or OTP failed at doorstep.",
    color: "#b91c1c",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-300 dark:border-red-800",
    iconName: "AlertOctagon",
    allowedNext: ["OTP Verification", "In Transit", "Order On Hold", "Cancelled"],
    allowedExceptions: ["Order On Hold", "Cancelled"],
  },

  // ── E6. Order On Hold ─────────────────────────────────────────────────────
  "Order On Hold": {
    status: "Order On Hold",
    canonicalStatus: "Order On Hold",
    stepNumber: null,
    isException: true,
    phase: "Exception & Resolution",
    label: "Order On Hold",
    shortLabel: "On Hold",
    description: "Suspended due to customer complaint, mining enforcement check, or flood warning.",
    color: "#475569",
    bgColor: "bg-slate-200 dark:bg-slate-800",
    textColor: "text-slate-800 dark:text-slate-200",
    borderColor: "border-slate-400 dark:border-slate-600",
    iconName: "PauseCircle",
    allowedNext: [
      "Payment Pending",
      "Vehicle Allocation Pending",
      "Vehicle Allocated",
      "In Transit",
      "OTP Verification",
      "Cancelled",
    ],
    allowedExceptions: ["Cancelled"],
  },
};

/**
 * Normalizes raw/legacy status strings to standard canonical statuses
 */
export function normalizeOrderStatus(rawStatus: string): StandardOrderStatus | ExceptionOrderStatus {
  if (LEGACY_STATUS_MAP[rawStatus]) {
    return LEGACY_STATUS_MAP[rawStatus];
  }
  // Default fallback
  return "Booking Submitted";
}

/**
 * Get full metadata for any status
 */
export function getOrderStatusMetadata(status: string): StatusMetadata {
  const canonical = normalizeOrderStatus(status);
  return ORDER_STATUS_METADATA[canonical] || ORDER_STATUS_METADATA["Booking Submitted"];
}

/**
 * Calculate chronological progression percentage (0% to 100%)
 */
export function getOrderProgressPercent(status: string): number {
  const canonical = normalizeOrderStatus(status);
  const metadata = ORDER_STATUS_METADATA[canonical];

  if (metadata.isException) {
    if (canonical === "Cancelled") return 100;
    if (canonical === "Payment Failed") return 15;
    if (canonical === "Vehicle Rejected" || canonical === "Vehicle Reallocation Pending") return 35;
    if (canonical === "Delivery Failed") return 85;
    if (canonical === "Order On Hold") return 50;
    return 50;
  }

  const step = metadata.stepNumber || 1;
  const totalSteps = ORDER_LIFECYCLE_SEQUENCE.length; // 18 steps
  return Math.round((step / totalSteps) * 100);
}

/**
 * Determine whether a transition from currentStatus to targetStatus is valid
 */
export function canTransitionOrderStatus(
  currentStatus: string,
  targetStatus: string
): { allowed: boolean; reason?: string } {
  const fromCanonical = normalizeOrderStatus(currentStatus);
  const toCanonical = normalizeOrderStatus(targetStatus);

  if (fromCanonical === toCanonical) {
    return { allowed: true };
  }

  const meta = ORDER_STATUS_METADATA[fromCanonical];
  if (!meta) {
    return { allowed: false, reason: `Unknown source status: ${currentStatus}` };
  }

  // Check if target is in allowedNext or allowedExceptions
  const isAllowed = meta.allowedNext.includes(toCanonical as any) || meta.allowedExceptions.includes(toCanonical as any);

  if (isAllowed) {
    return { allowed: true };
  }

  // In simulation/admin mode, allow linear advancing if target comes after source in sequential pipeline
  if (!meta.isException && !ORDER_STATUS_METADATA[toCanonical].isException) {
    const fromIndex = meta.stepNumber || 0;
    const toIndex = ORDER_STATUS_METADATA[toCanonical].stepNumber || 0;
    if (toIndex > fromIndex) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    reason: `Invalid transition from "${fromCanonical}" to "${toCanonical}". Allowed next: ${meta.allowedNext.join(", ")}`,
  };
}

/**
 * Get next recommended or valid statuses
 */
export function getNextAvailableStatuses(currentStatus: string): (StandardOrderStatus | ExceptionOrderStatus)[] {
  const canonical = normalizeOrderStatus(currentStatus);
  const meta = ORDER_STATUS_METADATA[canonical];
  return [...meta.allowedNext, ...meta.allowedExceptions];
}

/**
 * Check if status is a closed terminal status
 */
export function isOrderTerminal(status: string): boolean {
  const canonical = normalizeOrderStatus(status);
  return canonical === "Order Closed" || canonical === "Cancelled";
}
