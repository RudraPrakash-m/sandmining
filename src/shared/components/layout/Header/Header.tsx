import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCheck,
  LogOut,
  Settings,
  User as UserIcon,
  Menu,
} from "lucide-react";
import {
  authApi,
  useGetUserProfileQuery,
  useLogoutMutation,
} from "@/features/auth/service/AuthService";
import { clearAuth } from "@/features/auth/slice/authSlice";
import type { RootState } from "@/app/store";
import { useLayout } from "../LayoutContext";
import { IMAGES } from "@/assets/images";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";

const getRoleDisplayName = (role?: string): { full: string; short: string } => {
  const currentRole = role || "State Admin";
  switch (currentRole) {
    case "Citizen / Customer":
    case "Citizen":
      return { full: "Citizen / Customer", short: "Citizen" };
    case "Vehicle Owner":
      return { full: "Vehicle Owner", short: "Owner" };
    case "Driver":
      return { full: "Driver / Transporter", short: "Driver" };
    case "SRO – Sand Reach Officer":
    case "Sand Reach Officer (SRO)":
      return { full: "Sand Reach Officer (SRO)", short: "SRO" };
    case "Sand Reach Operator":
    case "Weighbridge Operator":
      return { full: "Sand Reach Operator", short: "Operator" };
    case "Call Centre Operator":
    case "Call Centre":
      return { full: "Call Centre Operator", short: "Call Centre" };
    case "District Officer":
    case "District Mining Officer":
      return { full: "District Officer", short: "District Off." };
    case "State Admin":
    case "Super Admin":
    case "State Administrator":
      return { full: "State Admin", short: "Admin" };
    case "Finance / Payment Officer":
      return { full: "Finance / Payment Officer", short: "Finance" };
    case "Mining Department / Monitoring Officer":
    case "Mining Department Officer":
      return { full: "Mining Monitoring Officer", short: "Mining Dept" };
    case "Stockyard Incharge":
      return { full: "Stockyard Incharge", short: "Stockyard" };
    case "Enforcement Officer":
      return { full: "Enforcement Officer", short: "Enforcement" };
    case "Contractor / Transporter":
      return { full: "Contractor / Transporter", short: "Contractor" };
    default:
      if (currentRole.length > 12) {
        return {
          full: currentRole,
          short: currentRole.split(/[\s/–-]+/)[0] || currentRole.slice(0, 10),
        };
      }
      return { full: currentRole, short: currentRole };
  }
};

export const Header: React.FC = () => {
  const { toggleMobileSidebar } = useLayout();
  const { customerNotifications, activeRole } = useSandMining();
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { data: profileResponse } = useGetUserProfileQuery(undefined, {
    skip: !token || !isAuthenticated,
  });

  const [logoutMutation] = useLogoutMutation();
  const user = profileResponse?.data || profileResponse;
  const roleDisplay = getRoleDisplayName(activeRole || user?.roles);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(clearAuth());
      dispatch(authApi.util.resetApiState());
      navigate("/");
    }
  };

  return (
    <header className="w-full bg-header-bg text-black shadow-md px-3 sm:px-6 py-2.5 z-40 shrink-0 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left Branding: Mobile Toggle + Government of Odisha Emblem + Portal Titles */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-black/20 text-black shadow-2xs transition-colors cursor-pointer shrink-0"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Official SMMS Branding + Chhattisgarh State Emblem */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none min-w-0"
            title="Chhattisgarh Sand Mining Management System — Department of Mines and Geology"
          >
            <img
              src={IMAGES.CHHATTISGARH_LOGO}
              alt="Government of Chhattisgarh Emblem"
              className="h-13 w-13 object-contain rounded-full"
            />
            <img
              src={IMAGES.CMDC_LOGO}
              alt="Chhattisgarh Mineral Development Corporation"
              className="h-13 w-13 object-contain"
            />

            <div className="flex flex-col justify-center min-w-0">
              <div className="inline-block pb-0.5 max-w-full">
                <h1 className="font-header text-[12px] sm:text-[15px] lg:text-[16.5px] font-bold text-black tracking-wide leading-tight truncate sm:whitespace-nowrap drop-shadow-xs">
                  Chhattisgarh Mineral Development Corporation Ltd. (CMDC)
                </h1>
              </div>
              <p className="font-header text-[11px] sm:text-[12px] lg:text-[12px] font-bold text-black leading-tight pt-0.5 tracking-tight truncate sm:whitespace-nowrap">
                 Government of Chhattisgarh
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative size-8.5 rounded-lg bg-white/12 hover:bg-white/22 active:bg-white/30 border border-black/20 flex items-center justify-center text-black transition-colors shadow-2xs cursor-pointer"
              title="Notifications & SMS Gateway"
            >
              <Bell size={16} />
              {customerNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] rounded-full ring-2 ring-white leading-tight shadow-xs">
                  {customerNotifications.length > 9 ? "9+" : customerNotifications.length}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-gray-900 border border-border-color dark:border-gray-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-black">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-color dark:border-gray-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    SSMMS Customer SMS Gateway
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {customerNotifications.length} Logs
                  </span>
                </div>

                <div className="space-y-2 text-xs max-h-72 overflow-y-auto scrollbar-thin">
                  {customerNotifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate("/notifications-sms");
                      }}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-gray-800/60 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-primary text-white leading-none">
                          Stage {n.stageNumber}: {n.stageName}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {n.dispatchedAt.split(" ")[1] || "Today"}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {n.recipientName} {n.orderId ? `• ${n.orderId}` : ""}
                      </p>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {n.messageText}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-border-color dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate("/notifications-sms");
                    }}
                    className="w-full py-1.5 px-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg text-center cursor-pointer transition-colors shadow-2xs block"
                  >
                    Open 10-Stage SMS & Notification Gateway →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative ml-1" ref={userRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-1.5 py-1 rounded-xl hover:bg-white/15 active:bg-white/22 transition-colors cursor-pointer"
              title={`Logged in as: ${roleDisplay.full}`}
            >
              <span className="text-xs sm:text-sm font-bold text-black tracking-tight select-none">
                {roleDisplay.short}
              </span>
              <div className="size-8 sm:size-9 rounded-full bg-white border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                <UserIcon size={18} className="text-black" aria-hidden="true" />
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-border-color dark:border-gray-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 text-black">
                <div className="px-3.5 py-2.5 border-b border-border-color dark:border-gray-800">
                  <p className="text-xs font-bold text-black flex items-center justify-between gap-1">
                    <span>{roleDisplay.full}</span>
                  </p>
                  <p className="text-[10px] text-black/60 mt-0.5">
                    Logged in as: <strong className="text-primary">{roleDisplay.short}</strong>
                  </p>
                  <p className="text-[9.5px] text-black/50">
                    Chhattisgarh Sand Mining Management
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-black hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <UserIcon size={14} /> My Profile ({roleDisplay.short})
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-black hover:bg-slate-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Settings size={14} /> System Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-danger hover:bg-danger/10 cursor-pointer border-t border-border-color dark:border-gray-800 mt-1 pt-2 font-medium"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
