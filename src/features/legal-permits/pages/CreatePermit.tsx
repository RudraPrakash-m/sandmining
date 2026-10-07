import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, ShieldCheck, CheckCircle2, Upload } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/legalPermit.css";

export const CreatePermit: React.FC = () => {
  const { reaches, createPermit } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    permitNumber: `CG-MIN-PERMIT-2026-00${Math.floor(Math.random() * 90) + 10}`,
    holderAgency: "",
    reachId: reaches[0]?.id || "RCH-001",
    approvedQuantityMt: 100000,
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    royaltyPerMt: 85,
    dmfPerMt: 25,
    securityDepositRs: 500000,
    conditions: "Strict daytime extraction only (06:00 to 18:00). Max 3m riverbed depth. 50m riparian buffer zone mandatory.",
    clearanceDocs: ["Mining_Lease_Agreement.pdf", "SEIAA_EC_Clearance.pdf", "Consent_To_Operate_CECB.pdf"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holderAgency.trim()) {
      showError("Please enter Permit Holder / Agency Name.");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showError("Expiry End Date must be strictly after Start Date.");
      return;
    }

    const selectedReach = reaches.find(
      (r) => r.id === formData.reachId || r.reachId === formData.reachId
    );

    createPermit({
      permitNumber: formData.permitNumber,
      holderAgency: formData.holderAgency,
      reachId: formData.reachId,
      reachName: selectedReach?.reachName || "Mahanadi Basin Reach Sector 01",
      approvedQuantityMt: Number(formData.approvedQuantityMt),
      excavatedQuantityMt: 0,
      remainingQuotaMt: Number(formData.approvedQuantityMt),
      startDate: formData.startDate,
      endDate: formData.endDate,
      royaltyPerMt: Number(formData.royaltyPerMt),
      clearanceDocs: formData.clearanceDocs,
      conditions: formData.conditions,
      inspectionStatus: "Verified",
      status: "Active",
      dmfPerMt: Number(formData.dmfPerMt),
      securityDepositRs: Number(formData.securityDepositRs),
    });

    showSuccess(`Mining Permit ${formData.permitNumber} issued to "${formData.holderAgency}" successfully!`);
    navigate(routes.legalPermits.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.legalPermits.path)}
        >
          Back to Permits
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Issue Statutory Mining Permit & Lease
          </h1>
          <p className="text-xs text-gray-500">
            Authorize legal sand mining concession per Government of Chhattisgarh MMDR rules
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Permit Parameters */}
        <Card
          title="Permit & Lease Parameters"
          subtitle="Statutory lease identity, concessionaire agency, and riverbed reach allocation"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Permit / Lease Number (Auto-Generated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.permitNumber}
                readOnly
                className={`${inputBase} ${inputNormal} bg-gray-50 dark:bg-gray-800 font-mono font-bold text-blue-700 dark:text-blue-400`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Permit Holder / Contractor Agency <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chhattisgarh State Mining Development Corp"
                value={formData.holderAgency}
                onChange={(e) => setFormData({ ...formData, holderAgency: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Sanctioned Mining Reach <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reachId}
                onChange={(e) => setFormData({ ...formData, reachId: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {reaches.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reachName} ({r.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Approved Annual Extraction Quota (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.approvedQuantityMt}
                onChange={(e) => setFormData({ ...formData, approvedQuantityMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-bold text-emerald-600`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Lease Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Lease Expiry End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Royalty Rate (₹ / MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.royaltyPerMt}
                onChange={(e) => setFormData({ ...formData, royaltyPerMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                DMF Levy Rate (₹ / MT)
              </label>
              <input
                type="number"
                value={formData.dmfPerMt}
                onChange={(e) => setFormData({ ...formData, dmfPerMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Security Performance Deposit (₹)
              </label>
              <input
                type="number"
                value={formData.securityDepositRs}
                onChange={(e) => setFormData({ ...formData, securityDepositRs: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>
        </Card>

        {/* Environmental Conditions & Clearance Attachments */}
        <Card
          title="Environmental Conditions & Clearances"
          subtitle="Mandatory covenants, SEIAA clearance order, and CTO certificates"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Statutory Mining & Environmental Conditions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className={`${inputBase} ${inputNormal}`}
              required
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Attached Compliance Certificates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formData.clearanceDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {doc}
                    </span>
                  </div>
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>

            <div className="doc-upload-zone p-4 rounded-xl text-center mt-3 cursor-pointer">
              <Upload size={18} className="mx-auto text-blue-500 mb-1" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                Upload Additional Clearance Orders & Consent Certificates (PDF / JPG)
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(routes.legalPermits.path)}
            >
              Cancel
            </Button>
            <Button action="save" type="submit" icon={<Save size={15} />}>
              Issue & Sanction Permit
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreatePermit;
