import React, { useState, useMemo } from "react";
import {
  BellRing,
  Send,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Download,
  Building2,
  Radio,
  FileCheck,
  Truck,
  CreditCard,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { MobilePhoneSmsSimulator } from "../components/MobilePhoneSmsSimulator";
import { SmsStageSimulatorCard } from "../components/SmsStageSimulatorCard";
import { CustomerSmsLogTable } from "../components/CustomerSmsLogTable";
import { TelanganaManualComplianceCard } from "../components/TelanganaManualComplianceCard";
import type { SmsStageKey } from "../types";

export const NotificationSmsHub: React.FC = () => {
  const { customerNotifications, resendCustomerSms, bookings } = useSandMining();

  const [selectedOrderId, setSelectedOrderId] = useState<string>("SMMS-ORD-2026-8801");
  const [activeTab, setActiveTab] = useState<"simulator" | "logs" | "compliance">("simulator");

  // KPI calculations
  const totalDispatched = customerNotifications.length;
  const deliveredCount = customerNotifications.filter((n) => n.status === "Delivered").length;
  const deliveryRate = totalDispatched > 0 ? ((deliveredCount / totalDispatched) * 100).toFixed(1) : "100.0";
  const activeOtpCount = customerNotifications.filter((n) => n.stage === "DELIVERY_OTP").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
              MANDATORY NOTIFICATION MODULE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-2xs">
              <Radio size={11} className="animate-pulse text-emerald-600 dark:text-emerald-400" /> DLT LIVE GATEWAY
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Telangana SSMMS (TSMDC / Sand Telangana)
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 shrink-0">
              <BellRing size={20} />
            </div>
            Automated Notification & Customer SMS Gateway
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Statutory 10-stage customer notification system under the Telangana SSMMS manual. Automated SMS alerts
            are triggered at every milestone from Citizen Registration & OTP to Vehicle Allocation, Geofence Delivery OTP, and POD Confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <a
            href="https://sand.telangana.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <Building2 size={14} />
            TSMDC Portal
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total SMS Dispatched */}
        <Card className="p-4 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Send size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Total Customer SMS
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {totalDispatched}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">10 Stages</span>
            </div>
            <p className="text-[10px] text-slate-400">All gateway transmissions</p>
          </div>
        </Card>

        {/* DLT Delivery Success Rate */}
        <Card className="p-4 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              DLT Delivery Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {deliveryRate}%
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">TRAI ACK</span>
            </div>
            <p className="text-[10px] text-slate-400">{deliveredCount} delivered successfully</p>
          </div>
        </Card>

        {/* Active Handover OTPs */}
        <Card className="p-4 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Delivery OTPs Triggered
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeOtpCount}
              </p>
              <span className="text-[10px] text-amber-600 font-bold">Stage 8</span>
            </div>
            <p className="text-[10px] text-slate-400">Geofenced customer verification</p>
          </div>
        </Card>

        {/* Telecom Carrier Routes */}
        <Card className="p-4 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Radio size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Gateway Health
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                4 Telecoms Online
              </p>
            </div>
            <p className="text-[10px] text-slate-400">Airtel • Jio • BSNL • Vi</p>
          </div>
        </Card>
      </div>

      {/* Main Interactive Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-border-color dark:border-gray-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "simulator"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Smartphone size={14} />
          Live 10-Stage Console & Phone Simulator
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <Send size={14} />
          SMS Gateway Audit Registry ({customerNotifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compliance")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "compliance"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
          }`}
        >
          <ShieldCheck size={14} />
          Telangana SSMMS Statutory Manual
        </button>
      </div>

      {/* Tab 1: Simulator View (Dual Pane) */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: 10-Stage Trigger Board */}
            <div className="xl:col-span-8 space-y-6">
              <SmsStageSimulatorCard
                selectedOrderId={selectedOrderId}
                onSelectOrder={setSelectedOrderId}
              />
              <TelanganaManualComplianceCard />
            </div>

            {/* Right Column: Smartphone Handset Simulator */}
            <div className="xl:col-span-4 flex flex-col items-center">
              <MobilePhoneSmsSimulator
                notifications={customerNotifications}
                selectedOrderId={selectedOrderId}
                onSelectOrder={setSelectedOrderId}
                onResendSms={resendCustomerSms}
              />
            </div>
          </div>

          {/* Quick Audit Table Below */}
          <CustomerSmsLogTable
            notifications={customerNotifications}
            onResendSms={resendCustomerSms}
            onSelectOrder={setSelectedOrderId}
          />
        </div>
      )}

      {/* Tab 2: Full Audit Registry */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <CustomerSmsLogTable
            notifications={customerNotifications}
            onResendSms={resendCustomerSms}
            onSelectOrder={setSelectedOrderId}
          />
        </div>
      )}

      {/* Tab 3: Telangana SSMMS Manual Reference */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <TelanganaManualComplianceCard />
          <CustomerSmsLogTable
            notifications={customerNotifications}
            onResendSms={resendCustomerSms}
            onSelectOrder={setSelectedOrderId}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationSmsHub;
