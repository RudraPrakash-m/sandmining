import React, { useState, useMemo } from "react";
import {
  Smartphone,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Truck,
  KeyRound,
  FileText,
  User,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { CustomerSmsNotification, SmsStageKey } from "../types";
import { SMS_STAGES_CONFIG } from "../types";
import Badge from "@/shared/components/ui/Badge";
import Button from "@/shared/components/ui/Button";

interface MobilePhoneSmsSimulatorProps {
  notifications: CustomerSmsNotification[];
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  onResendSms?: (id: string) => void;
}

export const MobilePhoneSmsSimulator: React.FC<MobilePhoneSmsSimulatorProps> = ({
  notifications,
  selectedOrderId,
  onSelectOrder,
  onResendSms,
}) => {
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Group notifications by Order ID or Recipient
  const distinctThreads = useMemo(() => {
    const map = new Map<string, { orderId: string; recipientName: string; mobile: string; count: number }>();
    notifications.forEach((n) => {
      const key = n.orderId || n.recipientMobile;
      if (!map.has(key)) {
        map.set(key, {
          orderId: n.orderId || "Registration",
          recipientName: n.recipientName,
          mobile: n.recipientMobile,
          count: 1,
        });
      } else {
        const item = map.get(key)!;
        item.count += 1;
      }
    });
    return Array.from(map.values());
  }, [notifications]);

  // Determine current active thread
  const activeThreadKey = useMemo(() => {
    if (selectedOrderId) return selectedOrderId;
    if (distinctThreads.length > 0) return distinctThreads[0].orderId;
    return "All";
  }, [selectedOrderId, distinctThreads]);

  // Messages for active thread (sorted oldest to newest for chat view)
  const threadMessages = useMemo(() => {
    if (activeThreadKey === "All") {
      return [...notifications].reverse();
    }
    return notifications
      .filter((n) => n.orderId === activeThreadKey || n.recipientMobile === activeThreadKey)
      .reverse();
  }, [notifications, activeThreadKey]);

  const activeRecipient = useMemo(() => {
    const msg = threadMessages[threadMessages.length - 1] || notifications[0];
    return {
      name: msg?.recipientName || "Narayana Sahu",
      mobile: msg?.recipientMobile || "+91 98260 12345",
      role: msg?.recipientRole || "Citizen",
    };
  }, [threadMessages, notifications]);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Thread Selector Tabs */}
      <div className="w-full mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            Simulate Handset:
          </span>
          {distinctThreads.map((t) => (
            <button
              key={t.orderId}
              type="button"
              onClick={() => onSelectOrder?.(t.orderId)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                activeThreadKey === t.orderId
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {t.recipientName.split(" ")[0]} ({t.orderId})
              <span className="ml-1 text-[10px] opacity-75">[{t.count}]</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="size-7 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors cursor-pointer shrink-0"
          title={soundEnabled ? "SMS Chime Enabled" : "SMS Chime Muted"}
        >
          {soundEnabled ? <Volume2 size={14} className="text-emerald-600" /> : <VolumeX size={14} />}
        </button>
      </div>

      {/* Realistic Mobile Device Shell */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-slate-900 dark:bg-black rounded-[42px] p-3 shadow-2xl border-4 border-slate-700/80 dark:border-gray-800 ring-1 ring-black/40">
        {/* Dynamic Island / Earpiece Speaker */}
        <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
          <div className="size-2 rounded-full bg-slate-800/80" />
          <div className="size-2.5 rounded-full bg-slate-900 border border-slate-700" />
        </div>

        {/* Screen Bezel Area */}
        <div className="relative bg-[#f8fafc] dark:bg-[#0f172a] rounded-[34px] overflow-hidden flex flex-col h-[580px] border border-slate-200 dark:border-gray-800">
          {/* Status Bar */}
          <div className="h-8 bg-slate-100 dark:bg-gray-900/90 backdrop-blur px-5 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0 z-20">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="tracking-tight">5G</span>
              <div className="w-5 h-2.5 border border-slate-400 dark:border-slate-500 rounded-xs p-0.5 flex items-center">
                <div className="h-full w-full bg-emerald-500 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* SMS App Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                TS
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">TG-SSMMS</span>
                  <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Govt of Telangana • Sand Portal
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                VERIFIED DLT
              </span>
            </div>
          </div>

          {/* Citizen Identity Ribbon */}
          <div className="bg-slate-100/80 dark:bg-gray-800/80 px-3 py-1 text-[10px] text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-1 truncate">
              <User size={11} className="text-slate-400" />
              <span className="font-semibold truncate">{activeRecipient.name}</span>
            </div>
            <span className="text-slate-500 font-mono text-[9.5px] shrink-0">{activeRecipient.mobile}</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin">
            {/* TRAI Regulatory Warning Notice */}
            <div className="mx-auto text-center max-w-[240px]">
              <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                TRAI Certified Govt Transactional Route
              </span>
            </div>

            {threadMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No SMS received yet. Trigger stages using the simulator buttons below.
              </div>
            ) : (
              threadMessages.map((msg) => {
                const config = SMS_STAGES_CONFIG[msg.stage];
                const isOtpStage = msg.stage === "DELIVERY_OTP" || msg.stage === "REGISTRATION_OTP";
                const otp = msg.metadata?.otpCode || (msg.stage === "DELIVERY_OTP" ? "7834" : "4921");

                return (
                  <div key={msg.id} className="flex flex-col items-start max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Stage Meta Chip */}
                    <div className="flex items-center gap-1 mb-1 ml-1 text-[9px]">
                      <span
                        className="px-1.5 py-0.5 rounded-full font-bold text-white shadow-2xs"
                        style={{ backgroundColor: config?.color || "#4f46e5" }}
                      >
                        Stage {msg.stageNumber}: {config?.name || msg.stageName}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">{msg.dispatchedAt.split(" ")[1] || "Just now"}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`relative rounded-2xl rounded-tl-sm p-3 text-xs leading-relaxed shadow-sm border ${
                        msg.stage === "DELIVERY_OTP"
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-slate-900 dark:text-slate-100"
                          : msg.stage === "DELIVERY_CONFIRMATION"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-slate-900 dark:text-slate-100"
                          : msg.stage === "CANCELLATION_FAILURE"
                          ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-slate-900 dark:text-slate-100"
                          : "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {/* Message Content */}
                      <p className="whitespace-pre-wrap">{msg.messageText}</p>

                      {/* Interactive Highlights based on stage */}
                      {isOtpStage && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <KeyRound size={14} className="text-amber-700 dark:text-amber-300 shrink-0" />
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                                {msg.stage === "DELIVERY_OTP" ? "Delivery Handover OTP" : "Registration OTP"}
                              </p>
                              <p className="text-base font-extrabold tracking-widest text-slate-900 dark:text-amber-100 font-mono">
                                {otp}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyOtp(otp)}
                            className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            {copiedOtp === otp ? (
                              <>
                                <Check size={11} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={11} /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Vehicle & Waybill Links if present */}
                      {msg.metadata?.vehicleNumber && msg.stage === "VEHICLE_NUMBER" && (
                        <div className="mt-2 p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-between text-[10.5px]">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Vehicle Tag:</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs">
                            {msg.metadata.vehicleNumber}
                          </span>
                        </div>
                      )}

                      {msg.metadata?.trackingUrl && (
                        <div className="mt-2">
                          <a
                            href={msg.metadata.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-primary dark:text-sky-400 hover:underline"
                          >
                            <ExternalLink size={12} /> Open e-Pass & Live GPS Tracking
                          </a>
                        </div>
                      )}

                      {/* Footer Info: Carrier & DLT Ack */}
                      <div className="mt-2 pt-1 border-t border-slate-200/60 dark:border-gray-800 flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate">{msg.carrierRoute.split(" ")[0]} Gateway</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[8.5px]">DLT: {msg.dltTemplateId.slice(-6)}</span>
                          <CheckCheck size={12} className="text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SMS Quick Bar */}
          <div className="p-2.5 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex items-center gap-2 shrink-0 text-xs">
            <div className="flex-1 bg-slate-100 dark:bg-gray-800 rounded-full px-3 py-1.5 text-slate-400 text-[11px] truncate select-none">
              Govt SMS Channel (Read-Only)
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
              TSMDC
            </span>
          </div>

          {/* Home Indicator */}
          <div className="h-4 bg-white dark:bg-gray-900 flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
