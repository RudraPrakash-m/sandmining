import React from "react";
import { ArrowRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export type BreadcrumbVariant =
  | "primary"
  | "info"
  | "dark"
  | "warning"
  | "success"
  | "danger";

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  variant?: BreadcrumbVariant;
  className?: string;
  showHomeIcon?: boolean;
}

const ROUTE_MAP: Record<string, { section?: string; label: string }> = {
  "/dashboard": { label: "State Dashboard" },
  "/gis-map": { section: "GIS & Spatial", label: "GIS Sand Mining Map" },
  "/mining-reach": { section: "Stockyard & Reach", label: "Mining Reach Master" },
  "/mining-reach/add": { section: "Stockyard & Reach", label: "Add Mining Reach" },
  "/legal-permits": { section: "Governance & Intelligence", label: "Legal Mining & Permits" },
  "/legal-permits/create": { section: "Governance & Intelligence", label: "Create Permit" },
  "/excavation": { section: "Extraction Operations", label: "Excavation Management" },
  "/excavation/add": { section: "Extraction Operations", label: "Log Excavation" },
  "/stockyard": { section: "Stockyard & Inventory", label: "Stockyard Management" },
  "/stockyard/add": { section: "Stockyard & Inventory", label: "Add Stockyard" },
  "/stockyard/ledger": { section: "Stockyard & Inventory", label: "Stock Ledger" },
  "/weighbridge": { section: "Weighbridge Operations", label: "Weighbridge Management" },
  "/weighbridge/capture": { section: "Weighbridge Operations", label: "Capture Weight Slip" },
  "/vehicles": { section: "Fleet & Logistics", label: "Vehicle Fleet Management" },
  "/vehicles/register": { section: "Fleet & Logistics", label: "Register Vehicle" },
  "/drivers": { section: "Fleet & Logistics", label: "Driver Registry" },
  "/drivers/add": { section: "Fleet & Logistics", label: "Add Driver" },
  "/sand-bazaar": { section: "Citizen Sand Bazaar", label: "Sand Booking Portal" },
  "/citizen-registration": { section: "Citizen Sand Bazaar", label: "Citizen Registration" },
  "/citizen-my-orders": { section: "Citizen Sand Bazaar", label: "My Orders & e-Pass" },
  "/sand-booking": { section: "Sand Commerce", label: "Online Sand Booking" },
  "/sand-booking/create": { section: "Sand Commerce", label: "Book Sand" },
  "/payment-settlement": { section: "Finance & Treasury", label: "Payment Settlement" },
  "/revenue-reconciliation": { section: "Finance & Treasury", label: "Revenue Reconciliation" },
  "/dispatch-management": { section: "Dispatch & Telematics", label: "Dispatch Management" },
  "/dispatch-management/authorize": { section: "Dispatch & Telematics", label: "Authorize Gate-Out" },
  "/epass-verification": { section: "Dispatch & Telematics", label: "e-Pass / QR Verification" },
  "/gps-tracking": { section: "Dispatch & Telematics", label: "GPS Vehicle Tracking" },
  "/delivery-confirmation": { section: "Dispatch & Telematics", label: "Proof of Delivery (POD)" },
  "/call-centre": { section: "Sales & Delivery Support", label: "Call Centre (Delivery Updation)" },
  "/enforcement": { section: "Governance & Enforcement", label: "Enforcement Alerts" },
  "/enforcement/add": { section: "Governance & Enforcement", label: "Add Enforcement Alert" },
  "/grievance": { section: "Governance & Enforcement", label: "Helpdesk & Grievance" },
  "/grievance/raise": { section: "Governance & Enforcement", label: "Raise Grievance" },
  "/reports-mis": { section: "Reports & MIS", label: "Reports & MIS" },
  "/reports-mis/daily-collection": { section: "Reports & MIS", label: "Daily Collection Summary" },
  "/reports-mis/district-royalty": { section: "Reports & MIS", label: "District-wise Royalty" },
  "/reports-mis/transit-pass": { section: "Reports & MIS", label: "Transit Pass Movement" },
  "/reports-mis/stock-inventory": { section: "Reports & MIS", label: "Stock Inventory Ledger" },
  "/reports-mis/weighbridge-discrepancy": { section: "Reports & MIS", label: "Weighbridge Discrepancy" },
  "/reports-mis/enforcement-seizure": { section: "Reports & MIS", label: "Enforcement & Seizure" },
  "/reports-mis/contractor-performance": { section: "Reports & MIS", label: "Contractor Performance" },
  "/reports-mis/gps-violation": { section: "Reports & MIS", label: "GPS & Route Violation" },
  "/reports-mis/revenue-trend": { section: "Reports & MIS", label: "Monthly Revenue Trend" },
  "/reports-mis/district-consolidated": { section: "Reports & MIS", label: "District Consolidated MIS" },
  "/user-roles": { section: "Administration", label: "User Accounts & Roles" },
  "/masters-config": { section: "Administration", label: "Masters & Configuration" },
  "/audit-log": { section: "Administration", label: "Audit Logs & System Monitoring" },
  "/field-officer-app": { section: "Mobile Field Officer", label: "Mobile Field Officer App" },
};

const VARIANT_STYLES: Record<BreadcrumbVariant, string> = {
  primary:
    "border-amber-900/15 bg-[#FAF5EE] dark:border-gray-800 dark:bg-slate-900/80",
  info:
    "border-[#06b6d4] bg-[#ecfeff] dark:border-cyan-600 dark:bg-cyan-950/30",
  dark:
    "border-[#374151] bg-[#f9fafb] dark:border-gray-600 dark:bg-gray-900/60",
  warning:
    "border-[#f59e0b] bg-[#fffbeb] dark:border-amber-600 dark:bg-amber-950/30",
  success:
    "border-[#10b981] bg-[#ecfdf5] dark:border-emerald-600 dark:bg-emerald-950/30",
  danger:
    "border-[#ef4444] bg-[#fef2f2] dark:border-red-600 dark:bg-red-950/30",
};

export const Breadcrumb: React.FC<Readonly<BreadcrumbProps>> = ({
  items,
  variant = "primary",
  className = "",
  showHomeIcon = true,
}) => {
  const location = useLocation();

  // Auto-generate items if not explicitly provided
  const resolvedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const currentPath = location.pathname;
    const matched = ROUTE_MAP[currentPath];

    if (matched) {
      const trail: BreadcrumbItem[] = [];
      if (matched.section) {
        trail.push({ label: matched.section });
      }
      trail.push({ label: matched.label });
      return trail;
    }

    // Fallback: segment pathname
    const segments = currentPath.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const path = "/" + segments.slice(0, idx + 1).join("/");
      const formatted = seg
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        label: formatted,
        path: idx < segments.length - 1 ? path : undefined,
      };
    });
  }, [items, location.pathname]);

  const containerClasses = `${VARIANT_STYLES[variant]} border p-3 px-4 rounded-xl mb-5 flex flex-wrap items-center whitespace-nowrap gap-2 text-sm shadow-2xs transition-colors ${className}`;

  return (
  <nav aria-label="Breadcrumb" className="w-full">
  <ol className={containerClasses}>
    {/* Home Item */}
    <li className="inline-flex items-center">
      <Link
        to="/dashboard"
        className="flex w-full justify-end text-gray-700 dark:text-gray-200 hover:text-primary transition-colors font-normal"
      >
        {showHomeIcon && (
          <Home
            size={15}
            className="mr-2 mt-1 shrink-0 text-gray-600 dark:text-gray-300"
          />
        )}
        <span>Home</span>
      </Link>
    </li>

    {/* Trail Items */}
    {resolvedItems.map((item, index) => {
      const isLast = index === resolvedItems.length - 1;

      return (
        <React.Fragment key={item.path || `${item.label}-${index}`}>
          <li
            className="inline-flex items-center text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          >
            <ArrowRight size={13} className="shrink-0" />
          </li>

          <li className="inline-flex items-center">
            {isLast ? (
              <span
                className="font-bold text-gray-900 dark:text-white"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.path ? (
              <Link
                to={item.path}
                className="text-gray-700 dark:text-gray-200 hover:text-primary transition-colors font-normal"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 dark:text-gray-200 font-normal">
                {item.label}
              </span>
            )}
          </li>
        </React.Fragment>
      );
    })}
  </ol>
</nav>
  );
};

export default Breadcrumb;
