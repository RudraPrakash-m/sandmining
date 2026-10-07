import React from "react";
import { MessageSquare, Clock, ShieldCheck, AlertCircle, User, Phone, CheckCircle2 } from "lucide-react";
import type { GrievanceTicket } from "@/features/shared-simulation/types";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";

export interface CallCentreComplaintHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: GrievanceTicket[];
  customerName: string;
  orderId: string;
}

export const CallCentreComplaintHistory: React.FC<CallCentreComplaintHistoryProps> = ({
  isOpen,
  onClose,
  complaints,
  customerName,
  orderId,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Previous Customer Inquiries & Complaints (${complaints.length})`}
      subtitle={`Chronological call center inquiry trail for ${customerName} (Order: ${orderId})`}
      size="lg"
      footer={<ModalFooter onClose={onClose} confirmText="Close History" />}
    >
      <div className="space-y-4 pt-1 text-xs">
        {complaints.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-white">Clean Service Record</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              No prior complaints or disputes recorded for this order or consignee.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id || c.ticketId}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {c.ticketId}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {c.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        c.priority === "Urgent"
                          ? "danger"
                          : c.priority === "High"
                          ? "warning"
                          : "primary"
                      }
                      className="text-[10px]"
                    >
                      {c.priority} Priority
                    </Badge>
                    <Badge
                      variant={
                        c.status === "Resolved" || c.status === "Closed"
                          ? "success"
                          : c.status === "Escalated to District Collector"
                          ? "danger"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {c.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                  <div>
                    <span className="text-slate-400 block">Logged At:</span>
                    <span>{c.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Officer:</span>
                    <span className="font-sans font-semibold text-slate-700 dark:text-slate-300">
                      {c.assignedOfficer || "Grievance Officer"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SLA Remaining:</span>
                    <span className="text-orange-600 font-bold">{c.slaRemainingHours} Hours</span>
                  </div>
                </div>

                {c.resolutionRemarks && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold block">Resolution / Officer Note:</span>
                    <span>{c.resolutionRemarks}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CallCentreComplaintHistory;
