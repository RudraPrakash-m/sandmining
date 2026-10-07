import React from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Truck,
  CreditCard,
  KeyRound,
  PackageCheck,
  UserCheck,
  AlertTriangle,
  Building2,
} from "lucide-react";
import Card from "@/shared/components/layout/Card/Card";
import Badge from "@/shared/components/ui/Badge";
import { SMS_STAGES_CONFIG } from "../types";

export const TelanganaManualComplianceCard: React.FC = () => {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-border-color dark:border-gray-800">
        <div className="flex items-start gap-2.5">
          <div className="size-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              Telangana SSMMS Statutory Notification Framework
              <Badge variant="success" size="sm">
                TSMDC VERIFIED
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict compliance with the Telangana State Mineral Development Corporation (TSMDC) Sand Sale Management & Monitoring System manual.
            </p>
          </div>
        </div>

        <a
          href="https://sand.telangana.gov.in"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold shrink-0"
        >
          <ExternalLink size={13} />
          sand.telangana.gov.in
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
        {/* Stages 1-2 */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
            Registration / OTP
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 2.1: Citizen onboarding via mobile Aadhaar OTP verification (10 min expiry).
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
            Booking Confirmation
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 3.2: Sand quota reservation SMS with 60-minute payment countdown window.
          </p>
        </div>

        {/* Stages 3-4 */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
            Payment Success
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 3.5: Treasury & bank gateway callback confirmation with DMF and mineral cess.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">4</span>
            Order ID Allotment
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 4.1: Permanent statutory Order ID allotment with portal tracking URL.
          </p>
        </div>

        {/* Stages 5-6 */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">5</span>
            Vehicle Allocation
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 5.2: Automated FIFO queue allocation with tentative delivery time window.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">6</span>
            Vehicle Number
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 5.6: Weighbridge gross tare weighment verified and vehicle number confirmed.
          </p>
        </div>

        {/* Stages 7-8 */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">7</span>
            Driver Details
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 6.3: Driver contact, Digital Transit Pass / e-Waybill, and live AIS-140 GPS link.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">8</span>
            Delivery OTP
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 7.1: Geofence arrival triggers mandatory 4-digit OTP. Customer must inspect unloading first.
          </p>
        </div>

        {/* Stages 9-10 */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">9</span>
            Delivery Confirmation
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 7.4: Digital POD closed, timestamp captured, Form-VIII receipt link sent to customer.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span className="size-4.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">10</span>
            Cancellation / Failure
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Manual § 8.2: Reach closure/breakdown reversal with refund reference & bank TAT.
          </p>
        </div>
      </div>
    </Card>
  );
};
