import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Mountain,
  FileText,
  Shovel,
  Package,
  Scale,
  Truck,
  Users,
  ShoppingCart,
  CreditCard,
  Navigation,
  PackageCheck,
  ShieldAlert,
  MessageSquare,
  BarChart3,
  UserCog,
  Sliders,
  ClipboardList,
  Smartphone,
  ChevronRight,
  X,
  PanelLeftClose,
  QrCode,
  Cpu,
  ShieldCheck,
  PanelLeft,
  Headset,
  BellRing,
  ListOrdered,
  SlidersHorizontal,
} from "lucide-react";
import { useLayout } from "../LayoutContext";
import { IMAGES } from "@/assets/images";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: {
    text: string;
    variant: "danger-pill" | "danger-circle" | "primary";
  };
  submenu?: { label: string; path: string }[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Executive Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "State Dashboard",
        path: "/dashboard",
      },
      {
        icon: Map,
        label: "GIS Sand Mining Map",
        path: "/gis-map",
      },
    ],
  },

  {
    title: "Stockyard Registration & Management",
    items: [
      {
        icon: Mountain,
        label: "Mining Reach Master",
        path: "/mining-reach",
      },
      {
        icon: Package,
        label: "Stockyard Management",
        path: "/stockyard",
      },
    ],
  },
    {
    title: "Excavation & Production Tracking",
    items: [
      {
        icon: Shovel,
        label: "Excavation Management",
        path: "/excavation",
      },
      {
        icon: ShieldCheck,
        label: "SRO Reach Officer App",
        path: "/sro-portal",
        badge: { text: "SRO", variant: "primary" },
      },
    ],
  },
  {
    title: "Transportation to Sub-Stockyards & Sand Bazaars",
    items: [
      {
        icon: Truck,
        label: "Vehicle Fleet",
        path: "/vehicles",
      },
      {
        icon: Users,
        label: "Driver Registry",
        path: "/drivers",
      },
      {
        icon: ListOrdered,
        label: "Vehicle Queue Management",
        path: "/vehicles/queue-management",
        badge: { text: "FIFO", variant: "primary" },
      },
      {
        icon: Cpu,
        label: "Auto Vehicle Allocation",
        path: "/vehicles/allocation-queue",
        badge: { text: "ENGINE", variant: "primary" },
      },
      {
        icon: SlidersHorizontal,
        label: "Transport KM Slabs",
        path: "/transport-tariff-slabs",
        badge: { text: "SLABS", variant: "primary" },
      },
      {
        icon: Scale,
        label: "Weighbridge Management",
        path: "/weighbridge",
      },
      // {
      //   icon: QrCode,
      //   label: "Dispatch Management",
      //   path: "/dispatch-management",
      // },
      {
        icon: FileText,
        label: "e-Pass Verification",
        path: "/epass-verification",
      },
      {
        icon: Navigation,
        label: "Live GPS Tracking",
        path: "/gps-tracking",
        badge: { text: "LIVE", variant: "danger-pill" },
      },
      // {
      //   icon: Smartphone,
      //   label: "Driver / Operator Portal",
      //   path: "/driver-dashboard",
      //   badge: { text: "PORTAL", variant: "danger-pill" },
      // },
    ],
  },
  {
    title: "Sales, Booking & Last-Mile Delivery",
    items: [
      {
        icon: ShoppingCart,
        label: "Sand Booking",
        path: "/sand-booking",
      },
      {
        icon: CreditCard,
        label: "Payment & Invoicing",
        path: "/payment-settlement",
      },
       {
        icon: BellRing,
        label: "Notification & SMS Module",
        path: "/notifications-sms",
        badge: { text: "10 STAGES", variant: "primary" },
      },
      {
        icon: PackageCheck,
        label: "Proof of Delivery",
        path: "/delivery-confirmation",
      },
      {
        icon: Headset,
        label: "Call Centre (Delivery Updation)",
        path: "/call-centre",
        badge: { text: "HELP", variant: "primary" },
      },
      {
        icon: MessageSquare,
        label: "Grievance Helpdesk",
        path: "/grievance",
      },
      {
        icon: BarChart3,
        label: "Revenue Reconciliation",
        path: "/revenue-reconciliation",
      },
    ],
  },
 

  
  {
    title: "Governance & Intelligence",
    items: [
      {
        icon: FileText,
        label: "Legal Permits & Compliance",
        path: "/legal-permits",
      },
      {
        icon: ShieldAlert,
        label: "Enforcement & Anti-Illegal",
        path: "/enforcement",
        badge: { text: "2", variant: "danger-circle" },
      },
      {
        icon: Smartphone,
        label: "Field Officer App",
        path: "/field-officer-app",
      },
      {
        icon: BarChart3,
        label: "Reports & MIS",
        path: "/reports-mis/daily-excavation",
        submenu: [
          { label: "Daily Excavation", path: "/reports-mis/daily-excavation" },
          { label: "Reach Production", path: "/reports-mis/reach-production" },
          { label: "Stockyard Stock", path: "/reports-mis/stockyard-stock" },
          { label: "Vehicle / Trips", path: "/reports-mis/vehicle-trips" },
          { label: "Booking Registry", path: "/reports-mis/bookings" },
          { label: "Revenue & Payments", path: "/reports-mis/revenue-payments" },
          { label: "Dispatch & POD", path: "/reports-mis/dispatch-delivery" },
          { label: "Illegal Mining / Alerts", path: "/reports-mis/enforcement-alerts" },
          { label: "Permit Expiry", path: "/reports-mis/permit-expiry" },
          { label: "District Consolidated MIS", path: "/reports-mis/district-consolidated" },
        ],
      },
    ],
  },
  {
    title: "System Administration",
    items: [
      {
        icon: UserCog,
        label: "Users & Roles (RBAC)",
        path: "/user-roles",
      },
      {
        icon: Sliders,
        label: "Masters & Config",
        path: "/masters-config",
      },
      {
        icon: ClipboardList,
        label: "Audit Trail",
        path: "/audit-log",
      },
    ],
  },
];


const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  "Citizen / Customer": [
    "/sand-booking",
    "/payment-settlement",
    "/grievance",
    "/notifications-sms",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
  ],
  "Citizen": [
    "/sand-booking",
    "/payment-settlement",
    "/grievance",
    "/notifications-sms",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
  ],
  "Vehicle Owner": [
    "/vehicles",
    "/vehicles/queue-management",
    "/drivers",
    "/payment-settlement",
    "/grievance",
  ],
  "Driver": [
    "/driver-dashboard",
    "/vehicles/queue-management",
    "/epass-verification",
    "/delivery-confirmation",
    "/grievance",
  ],
  "Vehicle Owner / Driver": [
    "/driver-dashboard",
    "/vehicles",
    "/vehicles/queue-management",
    "/drivers",
    "/epass-verification",
    "/delivery-confirmation",
    "/payment-settlement",
    "/grievance",
  ],
  "SRO – Sand Reach Officer": [
    "/dashboard",
    "/mining-reach",
    "/excavation",
    "/sro-portal",
    "/stockyard",
    "/weighbridge",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/dispatch-management",
    "/epass-verification",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/dispatch-delivery",
  ],
  "Sand Reach Officer (SRO)": [
    "/dashboard",
    "/mining-reach",
    "/excavation",
    "/sro-portal",
    "/stockyard",
    "/weighbridge",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/dispatch-management",
    "/epass-verification",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/dispatch-delivery",
  ],
  "Sand Reach Operator": [
    "/sro-portal",
    "/weighbridge",
    "/vehicles/queue-management",
    "/dispatch-management",
    "/epass-verification",
  ],
  "Weighbridge Operator": [
    "/sro-portal",
    "/weighbridge",
    "/vehicles/queue-management",
    "/dispatch-management",
    "/epass-verification",
  ],
  "Call Centre Operator": [
    "/call-centre",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/grievance",
    "/notifications-sms",
  ],
  "Call Centre": [
    "/call-centre",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/grievance",
    "/notifications-sms",
  ],
  "District Officer": [
    "/dashboard",
    "/gis-map",
    "/mining-reach",
    "/legal-permits",
    "/excavation",
    "/stockyard",
    "/vehicles",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/drivers",
    "/dispatch-management",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/payment-settlement",
    "/revenue-reconciliation",
    "/grievance",
    "/notifications-sms",
    "/enforcement",
    "/field-officer-app",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/bookings",
    "/reports-mis/revenue-payments",
    "/reports-mis/dispatch-delivery",
    "/reports-mis/enforcement-alerts",
    "/reports-mis/permit-expiry",
    "/reports-mis/district-consolidated",
    "/audit-log",
  ],
  "District Mining Officer": [
    "/dashboard",
    "/gis-map",
    "/mining-reach",
    "/legal-permits",
    "/excavation",
    "/stockyard",
    "/vehicles",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/drivers",
    "/dispatch-management",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/payment-settlement",
    "/revenue-reconciliation",
    "/grievance",
    "/notifications-sms",
    "/enforcement",
    "/field-officer-app",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/bookings",
    "/reports-mis/revenue-payments",
    "/reports-mis/dispatch-delivery",
    "/reports-mis/enforcement-alerts",
    "/reports-mis/permit-expiry",
    "/reports-mis/district-consolidated",
    "/audit-log",
  ],
  "Finance / Payment Officer": [
    "/dashboard",
    "/sand-booking",
    "/payment-settlement",
    "/revenue-reconciliation",
    "/reports-mis",
    "/reports-mis/bookings",
    "/reports-mis/revenue-payments",
    "/reports-mis/district-consolidated",
    "/audit-log",
  ],
  "Mining Department / Monitoring Officer": [
    "/dashboard",
    "/gis-map",
    "/mining-reach",
    "/legal-permits",
    "/excavation",
    "/stockyard",
    "/vehicles",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/drivers",
    "/dispatch-management",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/grievance",
    "/notifications-sms",
    "/enforcement",
    "/field-officer-app",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/bookings",
    "/reports-mis/revenue-payments",
    "/reports-mis/dispatch-delivery",
    "/reports-mis/enforcement-alerts",
    "/reports-mis/permit-expiry",
    "/reports-mis/district-consolidated",
    "/audit-log",
  ],
  "Mining Department Officer": [
    "/dashboard",
    "/gis-map",
    "/mining-reach",
    "/legal-permits",
    "/excavation",
    "/stockyard",
    "/vehicles",
    "/vehicles/queue-management",
    "/vehicles/allocation-queue",
    "/drivers",
    "/dispatch-management",
    "/epass-verification",
    "/gps-tracking",
    "/delivery-confirmation",
    "/sand-booking",
    "/grievance",
    "/notifications-sms",
    "/enforcement",
    "/field-officer-app",
    "/reports-mis",
    "/reports-mis/daily-excavation",
    "/reports-mis/reach-production",
    "/reports-mis/stockyard-stock",
    "/reports-mis/vehicle-trips",
    "/reports-mis/bookings",
    "/reports-mis/revenue-payments",
    "/reports-mis/dispatch-delivery",
    "/reports-mis/enforcement-alerts",
    "/reports-mis/permit-expiry",
    "/reports-mis/district-consolidated",
    "/audit-log",
  ],
  "Enforcement Officer": [
    "/dashboard",
    "/gis-map",
    "/epass-verification",
    "/gps-tracking",
    "/enforcement",
    "/field-officer-app",
    "/reports-mis",
    "/reports-mis/enforcement-alerts",
    "/audit-log",
  ],
  "Stockyard Incharge": [
    "/dashboard",
    "/stockyard",
    "/weighbridge",
    "/vehicles/queue-management",
    "/dispatch-management",
    "/epass-verification",
    "/reports-mis",
    "/reports-mis/stockyard-stock",
    "/reports-mis/dispatch-delivery",
  ],
  "Contractor / Transporter": [
    "/vehicles",
    "/vehicles/queue-management",
    "/drivers",
    "/payment-settlement",
    "/grievance",
  ],
};

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useLayout();
  const { activeRole } = useSandMining();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Forms: true,
    "Reports & MIS": true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Filter sections and submenus based on the active role
  const visibleSections = React.useMemo(() => {
    const isSuperAdmin =
      !activeRole ||
      activeRole === "State Admin" ||
      activeRole === "Super Admin" ||
      activeRole === "State Administrator";

    if (isSuperAdmin) {
      return MENU_SECTIONS;
    }

    const allowed = ROLE_ALLOWED_PATHS[activeRole] || [];

    return MENU_SECTIONS.map((section) => {
      const filteredItems = section.items
        .map((item) => {
          // If item has a submenu, filter its subitems
          if (item.submenu && item.submenu.length > 0) {
            const filteredSub = item.submenu.filter((sub) =>
              allowed.some((path) => path === sub.path)
            );
            if (filteredSub.length > 0) {
              return {
                ...item,
                submenu: filteredSub,
              };
            }
            return null;
          }

          // Direct item match
          if (allowed.some((path) => path === item.path)) {
            return item;
          }

          return null;
        })
        .filter((item): item is MenuItem => item !== null);

      return {
        ...section,
        items: filteredItems,
      };
    }).filter((section) => section.items.length > 0);
  }, [activeRole]);

  useEffect(() => {
    // Keep Forms open if on /form-elements
    if (location.pathname === "/form-elements") {
      setOpenSubmenus((prev) => ({ ...prev, Forms: true }));
    }
    // Auto-open Reports & MIS if on /reports-mis route
    if (location.pathname.startsWith("/reports-mis")) {
      setOpenSubmenus((prev) => ({ ...prev, "Reports & MIS": true }));
    }
  }, [location.pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const sidebarWidthClass = isCollapsed ? "w-[76px]" : "w-[260px]";

  const renderItem = (item: MenuItem) => {
    const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
    const isOpen = Boolean(openSubmenus[item.label]);
    const isChildActive = item.submenu?.some((sub) => sub.path === location.pathname);
    const isActive = location.pathname === item.path || isChildActive;

    const ItemIcon = item.icon;

    return (
      <div key={item.label} className="w-full mb-1">
        <button
          type="button"
          onClick={() => {
            if (hasSubmenu && !isCollapsed) {
              toggleSubmenu(item.label);
            } else {
              handleNavigate(item.path);
            }
          }}
          title={isCollapsed ? item.label : undefined}
          style={
            isActive
              ? {
                backgroundColor: "#C2410C",
              }
              : undefined
          }
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer group relative ${isActive
            ? "text-white shadow-sm font-bold"
            : "text-slate-900 hover:bg-white/80 hover:text-black hover:shadow-xs"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
        >
          <ItemIcon
            size={18}
            className={`shrink-0 transition-colors ${isActive
              ? "text-white"
              : "text-slate-800 group-hover:text-black"
              }`}
          />

          {!isCollapsed && (
            <>
              <span className="truncate flex-1 text-start leading-tight">{item.label}</span>

              {item.badge && item.badge.variant === "danger-pill" && (
                <span className="bg-[#fe1c06] text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none uppercase shadow-xs">
                  {item.badge.text}
                </span>
              )}

              {item.badge && item.badge.variant === "danger-circle" && (
                <span className="size-5 rounded-full bg-[#fe1c06] text-white text-[11px] font-bold flex items-center justify-center leading-none shadow-xs">
                  {item.badge.text}
                </span>
              )}

              {hasSubmenu && (
                <ChevronRight
                  size={15}
                  className={`transition-transform duration-200 ${isActive ? "text-white" : "text-slate-700 group-hover:text-slate-950"
                    } ${isOpen ? "rotate-90" : "rotate-0"}`}
                />
              )}
            </>
          )}

          {/* Floating Tooltip when Collapsed */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
              {item.label}
            </div>
          )}
        </button>

        {/* Submenu with Bullet Points */}
        {!isCollapsed && hasSubmenu && isOpen && (
          <div className="mt-1 ml-4 pl-3 border-l-2 border-amber-900/30 space-y-1">
            {item.submenu?.map((sub) => {
              const isSubActive = location.pathname === sub.path;
              return (
                <button
                  key={sub.label}
                  type="button"
                  onClick={() => handleNavigate(sub.path)}
                  style={
                    isSubActive
                      ? { backgroundColor: "#C2410C" }
                      : undefined
                  }
                  className={`w-full text-start px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer rounded-md flex items-center gap-2 ${isSubActive
                    ? "text-white font-bold shadow-2xs"
                    : "text-slate-800 hover:text-[#C2410C] hover:bg-white/60"
                    }`}
                >
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${isSubActive ? "bg-white ring-2 ring-white/40" : "bg-slate-700"
                      }`}
                  />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="relative z-10 h-full flex flex-col p-3 select-none overflow-hidden">
      {/* Logo / Header with Collapse Button */}
      <div
        className={`shrink-0 flex items-center pb-3.5 mb-2 border-b border-amber-900/15 ${isCollapsed ? "justify-center" : "justify-between"
          }`}
      >
        {!isCollapsed && (
          <div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            onClick={() => handleNavigate("/dashboard")}
          >
            <div className="flex flex-col truncate">
              <span
                className="text-xl font-bold tracking-tight truncate leading-tight text-[#C2410C]"
                style={{ color: "#C2410C" }}
              >
                SMMS
              </span>
            </div>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex size-8 items-center justify-center rounded-lg border border-amber-900/20 bg-white/80 text-slate-800 hover:bg-white hover:text-black transition-colors cursor-pointer shadow-2xs"
          title="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 text-slate-700 hover:text-slate-950"
        >
          <X size={18} />
        </button>
      </div>

      {/* Menu Sections with User's Navigation Data */}
      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden sidebar-scrollbar pr-1">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed ? (
              <p className="px-3 mb-1.5 text-[11px] font-extrabold tracking-wider text-slate-800 uppercase">
                {section.title}
              </p>
            ) : (
              <div className="h-px bg-amber-900/15 my-2.5 mx-2" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Full-Height Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-full z-30 transition-all duration-300 ease-in-out ${sidebarWidthClass}`}
      >
        <div
          className="relative h-full bg-[#FAF5EE] dark:bg-slate-900 bg-cover bg-center bg-no-repeat border-r border-amber-900/15 dark:border-gray-800 overflow-hidden"
          style={{ backgroundImage: `url(${IMAGES.SIDEBAR_BG})` }}
        >
          {/* Progressive blur gradient: high at bottom, low at top */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)",
            }}
          />
          {/* Gentle supporting gradient wash */}
          <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-white/35 via-white/10 to-transparent" />
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-[260px] max-w-full h-full p-2 z-10 animate-in slide-in-from-left duration-200">
            <div
              className="relative h-full bg-[#FAF5EE] dark:bg-slate-900 bg-cover bg-center bg-no-repeat rounded-2xl border border-amber-900/15 dark:border-gray-800 shadow-xl overflow-hidden"
              style={{ backgroundImage: `url(${IMAGES.SIDEBAR_BG})` }}
            >
              {/* Progressive blur gradient: high at bottom, low at top */}
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  maskImage:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)",
                }}
              />
              <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-white/35 via-white/10 to-transparent" />
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
