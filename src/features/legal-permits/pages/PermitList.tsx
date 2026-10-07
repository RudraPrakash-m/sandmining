import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Eye,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  PauseCircle,
  Download,
  Layers,
  AlertTriangle,
  Building2,
  Calendar,
  Award,
  Check,
  X,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { MiningPermit } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import "../styles/legalPermit.css";

export const PermitList: React.FC = () => {
  const { permits, updatePermitStatus, renewPermitQuota } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [selectedPermit, setSelectedPermit] = useState<MiningPermit | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  // Renewal Modal Form State
  const [renewalEndDate, setRenewalEndDate] = useState("2028-08-31");
  const [renewalQuotaMt, setRenewalQuotaMt] = useState(50000);
  const [renewalRemarks, setRenewalRemarks] = useState("Annual Replenishment Quota Addition");

  // Verification Modal Form State
  const [inspectorName, setInspectorName] = useState("A. K. Sharma (Mining Inspector)");
  const [inspectionNotes, setInspectionNotes] = useState("Geofence pillars, CCTV telemetry, and weighbridge calibration verified OK.");

  const getStatusBadge = (status: MiningPermit["status"]) => {
    const map: Record<string, "success" | "warning" | "danger" | "secondary" | "primary"> = {
      Active: "success",
      "Under Verification": "warning",
      Renewed: "primary",
      Suspended: "danger",
      Expired: "secondary",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  const getInspectionBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck size={12} className="text-emerald-600" />
            Verified
          </span>
        );
      case "Non-Compliant":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle size={12} className="text-rose-600" />
            Non-Compliant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Pending Inspection
          </span>
        );
    }
  };

  const handleVerifySubmit = () => {
    if (selectedPermit) {
      updatePermitStatus(selectedPermit.id, "Active");
      showSuccess(`Permit ${selectedPermit.permitNumber} verified and validated by ${inspectorName}.`);
      setIsVerifyModalOpen(false);
    }
  };

  const handleRenewSubmit = () => {
    if (selectedPermit) {
      if (renewPermitQuota) {
        renewPermitQuota(selectedPermit.id, Number(renewalQuotaMt), renewalEndDate);
      }
      showSuccess(`Permit ${selectedPermit.permitNumber} renewed until ${renewalEndDate} with +${renewalQuotaMt} MT quota.`);
      setIsRenewModalOpen(false);
    }
  };

  const handleSuspendSubmit = () => {
    if (selectedPermit) {
      updatePermitStatus(selectedPermit.id, "Suspended");
      showSuccess(`Permit ${selectedPermit.permitNumber} has been suspended immediately.`);
      setIsSuspendModalOpen(false);
    }
  };

  const handleDownloadCertificate = (permit: MiningPermit) => {
    showSuccess(`Downloading statutory Permit Certificate for ${permit.permitNumber}...`);
  };

  // ── Columns covering all Screen 05 specification fields ──────────────
  const columns: MRT_ColumnDef<MiningPermit>[] = useMemo(
    () => [
      {
        accessorKey: "permitNumber",
        header: "Permit / Lease No.",
        size: 170,
        Cell: ({ row }) => (
          <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">
            {row.original.permitNumber}
          </span>
        ),
      },
      {
        accessorKey: "holderAgency",
        header: "Permit Holder / Agency",
        size: 190,
        Cell: ({ row }) => (
          <span className="font-semibold text-gray-900 dark:text-white text-xs">
            {row.original.holderAgency}
          </span>
        ),
      },
      {
        accessorKey: "reachName",
        header: "Mining Reach",
        size: 180,
        Cell: ({ row }) => (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {row.original.reachName}
          </span>
        ),
      },
      {
        accessorKey: "approvedQuantityMt",
        header: "Approved (MT)",
        size: 130,
        Cell: ({ row }) => (
          <span className="font-bold text-xs text-gray-900 dark:text-white">
            {row.original.approvedQuantityMt.toLocaleString()} MT
          </span>
        ),
      },
      {
        accessorKey: "remainingQuotaMt",
        header: "Remaining Quota",
        size: 140,
        Cell: ({ row }) => {
          const quota = row.original.approvedQuantityMt;
          const rem = row.original.remainingQuotaMt;
          const isLow = rem < quota * 0.15;
          return (
            <span
              className={`font-bold text-xs ${
                isLow ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {rem.toLocaleString()} MT
            </span>
          );
        },
      },
      {
        accessorKey: "validityDates",
        header: "Start / End Date",
        size: 170,
        Cell: ({ row }) => (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {row.original.startDate} to {row.original.endDate}
          </span>
        ),
      },
      {
        accessorKey: "royaltyPerMt",
        header: "Royalty / Fee",
        size: 120,
        Cell: ({ row }) => (
          <span className="font-medium text-xs text-gray-900 dark:text-white">
            ₹ {row.original.royaltyPerMt} / MT
          </span>
        ),
      },
      {
        accessorKey: "clearanceDocs",
        header: "Clearance Documents",
        size: 160,
        Cell: ({ row }) => (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <FileText size={13} />
            <span>{row.original.clearanceDocs?.length || 2} Clearances Attached</span>
          </span>
        ),
      },
      {
        accessorKey: "conditions",
        header: "Conditions",
        size: 180,
        Cell: ({ row }) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[170px] inline-block" title={row.original.conditions}>
            {row.original.conditions}
          </span>
        ),
      },
      {
        accessorKey: "inspectionStatus",
        header: "Inspection Status",
        size: 140,
        Cell: ({ row }) => getInspectionBadge(row.original.inspectionStatus),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ row }) => getStatusBadge(row.original.status),
      },
    ],
    []
  );

  const exportCols = columns.map((c) => ({
    accessorKey: c.accessorKey as string,
    header: c.header as string,
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Main Table Card */}
      <Card
        title="Legal Permits & Environmental Clearances"
        icon={Layers}
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => navigate(routes.createPermit.path)}
          >
            Create Mining Permit
          </Button>
        }
      >
        <ReusableTable
          columns={columns}
          data={permits}
          enableExport={true}
          exportFileName="legal-permits_records"
          onExportExcel={(rows) => exportToExcel(exportCols, rows, "legal-permits_records")}
          onExportPDF={(rows) => exportToPDF(exportCols, rows, "legal-permits_records", "Legal Mining Permits & Clearances")}
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const permit = row.original;
            const isActiveOrRenewed = permit.status === "Active" || permit.status === "Renewed";
            const isUnderVerification = permit.status === "Under Verification";
            const isSuspended = permit.status === "Suspended";
            const isExpired = permit.status === "Expired";

            const canVerify = isUnderVerification || permit.inspectionStatus !== "Verified";
            const canApprove = isUnderVerification;
            const canRenew = isActiveOrRenewed || isExpired;
            const canSuspend = isActiveOrRenewed;
            const canDownload = isActiveOrRenewed;

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {/* 1. View Details (Always Enabled) */}
                <button
                  type="button"
                  title="View Statutory Permit"
                  onClick={() => {
                    setSelectedPermit(permit);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>

                {/* 2. Verify / Field Inspection */}
                <button
                  type="button"
                  title={canVerify ? "Verify Field Inspection" : "Already Verified"}
                  disabled={!canVerify}
                  onClick={() => {
                    if (canVerify) {
                      setSelectedPermit(permit);
                      setIsVerifyModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canVerify
                      ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <ShieldCheck size={14} />
                </button>

                {/* 3. Approve Action */}
                <button
                  type="button"
                  title={canApprove ? "Approve Permit" : permit.status === "Active" ? "Permit is already active" : "Approval not available for this status"}
                  disabled={!canApprove}
                  onClick={() => {
                    if (canApprove) {
                      updatePermitStatus(permit.id, "Active");
                      showSuccess(`Permit ${permit.permitNumber} approved successfully.`);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canApprove
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* 4. Renew Permit */}
                <button
                  type="button"
                  title={canRenew ? "Renew Permit & Term Extension" : "Renewal not available for suspended permits"}
                  disabled={!canRenew}
                  onClick={() => {
                    if (canRenew) {
                      setSelectedPermit(permit);
                      setIsRenewModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canRenew
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw size={13} />
                </button>

                {/* 5. Suspend Permit */}
                <button
                  type="button"
                  title={canSuspend ? "Suspend Permit" : isSuspended ? "Permit is already suspended" : "Cannot suspend inactive permit"}
                  disabled={!canSuspend}
                  onClick={() => {
                    if (canSuspend) {
                      setSelectedPermit(permit);
                      setIsSuspendModalOpen(true);
                    }
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canSuspend
                      ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <PauseCircle size={14} />
                </button>

                {/* 6. Download Official Permit Certificate */}
                <button
                  type="button"
                  title={canDownload ? "Download Statutory Permit PDF" : "Download available once permit is active"}
                  disabled={!canDownload}
                  onClick={() => {
                    if (canDownload) handleDownloadCertificate(permit);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    canDownload
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Download size={13} />
                </button>
              </div>
            );
          }}
        />
      </Card>

      {/* ── FULL STATUTORY PERMIT DETAILS MODAL ── */}
      {selectedPermit && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Mining Permit: ${selectedPermit.permitNumber}`}
          subtitle={`Holder: ${selectedPermit.holderAgency}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">Government of Chhattisgarh • Directorate of Geology & Mining</span>
              <Button size="sm" variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                Close Details
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Permit / Lease No.</p>
                <p className="font-mono font-bold text-blue-600 text-sm mt-0.5">{selectedPermit.permitNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                <div className="mt-0.5">{getStatusBadge(selectedPermit.status)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Inspection Status</p>
                <div className="mt-0.5">{getInspectionBadge(selectedPermit.inspectionStatus)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Permit Holder / Agency</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPermit.holderAgency}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Mining Reach Location</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPermit.reachName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Validity Term</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedPermit.startDate} to {selectedPermit.endDate}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Approved Quantity</p>
                <p className="font-bold text-emerald-600 text-sm mt-0.5">
                  {selectedPermit.approvedQuantityMt.toLocaleString()} MT
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Remaining Quota</p>
                <p className="font-bold text-blue-600 text-sm mt-0.5">
                  {selectedPermit.remainingQuotaMt.toLocaleString()} MT
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Royalty & DMF Rate</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  ₹ {selectedPermit.royaltyPerMt} / MT
                </p>
              </div>
            </div>

            {/* Environmental Conditions Box */}
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 mb-1">
                <ShieldCheck size={16} className="text-amber-600" />
                <span>Statutory Environmental Conditions</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {selectedPermit.conditions}
              </p>
            </div>

            {/* Attached Clearances */}
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Attached Clearances & Approval Orders
              </p>
              <div className="space-y-2">
                {(selectedPermit.clearanceDocs || ["SEIAA_EC_Clearance.pdf", "Mining_Lease_Agreement.pdf"]).map((doc, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{doc}</span>
                    </div>
                    <Badge variant="success">Verified Order</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── VERIFICATION MODAL ── */}
      {selectedPermit && (
        <Modal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          title={`Field Inspection Sign-Off: ${selectedPermit.permitNumber}`}
          subtitle="Official compliance validation per Chhattisgarh MMDR rules"
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsVerifyModalOpen(false)}
              onConfirm={handleVerifySubmit}
              confirmText="Authorize & Sign-Off"
            />
          }
        >
          <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Inspecting Officer Name
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Inspection Findings & Geofence Observations
              </label>
              <textarea
                rows={3}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300">
              Signing off will transition this permit to <strong>Active</strong> status and permit dispatch e-Transit generation for this agency.
            </div>
          </div>
        </Modal>
      )}

      {/* ── RENEW PERMIT MODAL ── */}
      {selectedPermit && (
        <Modal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          title={`Renew Permit Term & Quota: ${selectedPermit.permitNumber}`}
          subtitle={`Current Expiry: ${selectedPermit.endDate} • Remaining Quota: ${selectedPermit.remainingQuotaMt} MT`}
          size="md"
          footer={
            <ModalFooter
              onClose={() => setIsRenewModalOpen(false)}
              onConfirm={handleRenewSubmit}
              confirmText="Authorize Renewal"
            />
          }
        >
          <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Extended Expiry End Date
                </label>
                <input
                  type="date"
                  value={renewalEndDate}
                  onChange={(e) => setRenewalEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Additional Quota Allocation (MT)
                </label>
                <input
                  type="number"
                  value={renewalQuotaMt}
                  onChange={(e) => setRenewalQuotaMt(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Renewal Order Reference & Remarks
              </label>
              <input
                type="text"
                value={renewalRemarks}
                onChange={(e) => setRenewalRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── SUSPEND PERMIT MODAL ── */}
      {selectedPermit && (
        <Modal
          isOpen={isSuspendModalOpen}
          onClose={() => setIsSuspendModalOpen(false)}
          title={`Suspend Mining Permit: ${selectedPermit.permitNumber}`}
          size="sm"
          footer={
            <ModalFooter
              onClose={() => setIsSuspendModalOpen(false)}
              onConfirm={handleSuspendSubmit}
              confirmText="Confirm Suspension"
            />
          }
        >
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 py-1">
            <p>
              Are you sure you want to suspend Permit{" "}
              <strong className="text-slate-900 dark:text-white font-mono">{selectedPermit.permitNumber}</strong> issued to{" "}
              <strong>{selectedPermit.holderAgency}</strong>?
            </p>
            <p className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
              Suspension immediately revokes excavation authority and halts all outbound dispatch generation.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PermitList;
