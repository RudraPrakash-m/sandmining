import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCheck,
  Send,
  Eye,
  RotateCcw,
  Download,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Clock,
  Phone,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import type { CustomerSmsNotification, SmsStageKey } from "../types";
import { SMS_STAGES_CONFIG } from "../types";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";

interface CustomerSmsLogTableProps {
  notifications: CustomerSmsNotification[];
  onResendSms?: (id: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

export const CustomerSmsLogTable: React.FC<CustomerSmsLogTableProps> = ({
  notifications,
  onResendSms,
  onSelectOrder,
}) => {
  const { showSuccess } = useStatusModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [activeDossierNotification, setActiveDossierNotification] = useState<CustomerSmsNotification | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Filtered dataset
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Stage filter
      if (selectedStage !== "ALL" && n.stage !== selectedStage) return false;
      // Status filter
      if (selectedStatus !== "ALL" && n.status !== selectedStatus) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesMobile = n.recipientMobile.toLowerCase().includes(query);
        const matchesName = n.recipientName.toLowerCase().includes(query);
        const matchesOrder = n.orderId?.toLowerCase().includes(query) ?? false;
        const matchesRef = n.smsRefId.toLowerCase().includes(query);
        const matchesText = n.messageText.toLowerCase().includes(query);
        if (!matchesMobile && !matchesName && !matchesOrder && !matchesRef && !matchesText) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, selectedStage, selectedStatus, searchQuery]);

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      "SMS Ref ID",
      "Stage No",
      "Stage Name",
      "Order ID",
      "Recipient Name",
      "Recipient Mobile",
      "Message Text",
      "Status",
      "Dispatched At",
      "Carrier Route",
      "DLT Template ID",
    ];
    const rows = filteredNotifications.map((n) => [
      n.smsRefId,
      n.stageNumber,
      `"${n.stageName}"`,
      n.orderId || "N/A",
      `"${n.recipientName}"`,
      n.recipientMobile,
      `"${n.messageText.replace(/"/g, '""')}"`,
      n.status,
      n.dispatchedAt,
      `"${n.carrierRoute}"`,
      n.dltTemplateId,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Telangana_SSMMS_Customer_SMS_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Customer SMS dispatch audit log exported to CSV.");
  };

  return (
    <Card className="p-0 overflow-hidden">
      {/* Table Header / Action Bar */}
      <div className="p-4 sm:p-5 border-b border-border-color dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-black dark:text-white">
              Customer SMS Dispatch & Carrier Audit Registry
            </h3>
            <Badge variant="outline" size="sm">
              {filteredNotifications.length} of {notifications.length} Logs
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time TRAI DLT delivery logs across all 10 stages under Telangana SSMMS sand regulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs"
          >
            <Download size={13} className="mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 sm:px-5 bg-slate-50 dark:bg-gray-900/60 border-b border-border-color dark:border-gray-800 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Mobile, Citizen Name, or SMS content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-500 font-medium">Stage:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All 10 Stages</option>
            <option value="REGISTRATION_OTP">1. Registration / OTP</option>
            <option value="BOOKING_CONFIRMATION">2. Booking Confirmation</option>
            <option value="PAYMENT_SUCCESS">3. Payment Success</option>
            <option value="ORDER_ID">4. Order ID</option>
            <option value="VEHICLE_ALLOCATION">5. Vehicle Allocation</option>
            <option value="VEHICLE_NUMBER">6. Vehicle Number</option>
            <option value="DRIVER_DETAILS">7. Driver Details</option>
            <option value="DELIVERY_OTP">8. Delivery OTP</option>
            <option value="DELIVERY_CONFIRMATION">9. Delivery Confirmation</option>
            <option value="CANCELLATION_FAILURE">10. Cancellation / Failure</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Gateway Statuses</option>
            <option value="Delivered">Delivered (DLT ACK)</option>
            <option value="Sent">Sent / In Flight</option>
            <option value="Failed">Failed / Retried</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100/75 dark:bg-gray-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-border-color dark:border-gray-800">
            <tr>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-3">Order / Ref</th>
              <th className="py-3 px-3">Recipient</th>
              <th className="py-3 px-3 min-w-[260px]">Customer SMS Text</th>
              <th className="py-3 px-3">Gateway Carrier</th>
              <th className="py-3 px-3">Delivery Status</th>
              <th className="py-3 px-3">Dispatched</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color dark:divide-gray-800">
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No notifications match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredNotifications.map((notif) => {
                const config = SMS_STAGES_CONFIG[notif.stage];

                return (
                  <tr
                    key={notif.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Stage Badge */}
                    <td className="py-3 px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-6 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: config?.color || "#4f46e5" }}
                        >
                          {notif.stageNumber}
                        </span>
                        <div className="leading-tight">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {config?.name || notif.stageName}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {config?.category || "Govt Notification"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Order / Ref */}
                    <td className="py-3 px-3">
                      <div className="leading-tight">
                        {notif.orderId ? (
                          <button
                            type="button"
                            onClick={() => onSelectOrder?.(notif.orderId!)}
                            className="font-mono font-bold text-primary dark:text-sky-400 hover:underline cursor-pointer block"
                          >
                            {notif.orderId}
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">N/A (Pre-order)</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          {notif.smsRefId}
                        </span>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-3">
                      <div className="leading-tight">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {notif.recipientName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          {notif.recipientMobile}
                        </p>
                      </div>
                    </td>

                    {/* Message Excerpt */}
                    <td className="py-3 px-3">
                      <div className="line-clamp-2 text-[11.5px] leading-relaxed text-slate-800 dark:text-slate-200">
                        {notif.messageText}
                      </div>
                      {notif.metadata?.otpCode && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <span>OTP:</span>
                          <span className="font-mono bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                            {notif.metadata.otpCode}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Gateway Carrier */}
                    <td className="py-3 px-3">
                      <div className="leading-tight">
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                          {notif.carrierRoute}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400">
                          {notif.telecomMessageId}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCheck size={14} className="text-emerald-500" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {notif.status}
                        </span>
                      </div>
                    </td>

                    {/* Dispatched */}
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {notif.dispatchedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setActiveDossierNotification(notif)}
                          title="View Complete Statutory Dossier"
                          className="size-7 p-0 flex items-center justify-center text-slate-600 hover:text-primary"
                        >
                          <Eye size={13} />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            onResendSms?.(notif.id);
                            showSuccess(`Re-dispatched Stage ${notif.stageNumber} SMS to ${notif.recipientMobile}`);
                          }}
                          title="Resend SMS to Customer"
                          className="size-7 p-0 flex items-center justify-center text-slate-600 hover:text-emerald-600"
                        >
                          <RotateCcw size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Statutory SMS Dossier Modal */}
      {activeDossierNotification && (
        <Modal
          isOpen={!!activeDossierNotification}
          onClose={() => setActiveDossierNotification(null)}
          title={`Statutory Customer SMS Dossier - Stage ${activeDossierNotification.stageNumber}: ${activeDossierNotification.stageName}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Regulatory Header Badge */}
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                    Telangana State Mineral Development Corporation (TSMDC)
                  </h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Mandatory Customer SMS Regulation • Sand Telangana SSMMS Manual Reference
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
                HEADER: {activeDossierNotification.senderHeader}
              </span>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-gray-800/50 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">SMS Ref ID</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeDossierNotification.smsRefId}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Associated Order</span>
                <p className="font-mono font-bold text-primary dark:text-sky-400">
                  {activeDossierNotification.orderId || "N/A (Pre-order)"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recipient Mobile</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeDossierNotification.recipientMobile}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Gateway Status</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCheck size={13} /> {activeDossierNotification.status}
                </p>
              </div>
            </div>

            {/* Message Payload Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Full Customer SMS Payload (Transmitted to Citizen Handset)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(activeDossierNotification.messageText)}
                  className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check size={12} /> : <Copy size={12} />}
                  {copiedText ? "Copied" : "Copy Message"}
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-700 shadow-inner whitespace-pre-wrap select-all">
                {activeDossierNotification.messageText}
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                <span>Character Count: {activeDossierNotification.messageText.length} chars (1 SMS segment)</span>
                <span>Encoding: GSM 7-bit ASCII</span>
              </div>
            </div>

            {/* Telecom Carrier & Statutory DLT Verification Details */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                TRAI Distributed Ledger Technology (DLT) Statutory Audit Trail
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">DLT Template ID:</span>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {activeDossierNotification.dltTemplateId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Telecom Carrier Route:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeDossierNotification.carrierRoute}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Telecom ACK Code:</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeDossierNotification.deliveryAckCode || "DELIVRD_000"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDossierNotification(null)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onResendSms?.(activeDossierNotification.id);
                showSuccess(`Re-sent Stage ${activeDossierNotification.stageNumber} SMS to ${activeDossierNotification.recipientMobile}`);
                setActiveDossierNotification(null);
              }}
            >
              <RotateCcw size={13} className="mr-1.5" />
              Re-send to Customer
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Card>
  );
};
