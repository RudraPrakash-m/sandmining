import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pickaxe,
  Save,
  ArrowLeft,
  MapPin,
  Upload,
  Calendar,
  Layers,
  ShieldCheck,
  FileText,
  CheckCircle2,
  UserCheck,
  Radio,
  Compass,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import Card from "@/shared/components/layout/Card/Card";
import Button from "@/shared/components/ui/Button";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import "../styles/miningReach.css";

const DISTRICT_MANDALS: Record<string, string[]> = {
  Raipur: ["Arang", "Abhanpur", "Dharsiwa", "Tilda"],
  Durg: ["Durg", "Patan", "Dhamdha"],
  Bilaspur: ["Bilaspur", "Kota", "Takhatpur", "Masturi"],
  Korba: ["Korba", "Katghora", "Pali", "Kartala"],
  Rajnandgaon: ["Rajnandgaon", "Dongargaon", "Dongargarh", "Khairagarh"],
  Raigarh: ["Raigarh", "Kharsia", "Gharghoda", "Sarangarh"],
  Dhamtari: ["Dhamtari", "Kurud", "Nagri", "Magarlod"],
  "Janjgir-Champa": ["Janjgir", "Champa", "Akaltara", "Nawagarh"],
  Bastar: ["Jagdalpur", "Bastanar", "Tokapal", "Lohandiguda"],
};

const RIVERS_STREAMS = [
  "Mahanadi River",
  "Shivnath River",
  "Hasdeo River",
  "Indravati River",
  "Arpa River",
  "Kelo River",
  "Mand River",
  "Jonk River",
  "Pairi River",
  "Sabar River",
  "Godavari Basin Channel",
  "Krishna Basin Inflow",
];

const SOURCE_TYPES = [
  "Riverbed (In-stream Perennial)",
  "De-siltation Reservoir / Dam",
  "Sand Bar / Floodplain",
  "Pattaland / Agricultural Sand Area",
  "Canal De-siltation Reach",
];

const SAND_TYPES = [
  "Coarse River Sand",
  "Fine Plastering Sand",
  "Medium Concrete Sand",
  "Gravel Sand",
];

export const AddMiningReach: React.FC = () => {
  const { addReach, stockyards } = useSandMining();
  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reachId: `TG-${Math.floor(Math.random() * 89 + 10)}-RCH-${Math.floor(Math.random() * 890 + 100)}`,
    reachName: "",
    district: "Raipur",
    block: "Arang",
    mandal: "Arang",
    village: "",
    riverStream: "Mahanadi River",
    sourceType: SOURCE_TYPES[0],
    sandType: SAND_TYPES[0],
    approvedQuantityMt: 120000,
    availableQuantityMt: 120000,
    currentStockMt: 15000,
    areaHectares: 14.5,
    status: "Approved",
    validityStartDate: "2026-10-01",
    validityEndDate: "2027-09-30",
    responsibleOfficer: "Er. Rameshwar Sharma",
    responsibleOfficerDesignation: "Assistant Director of Mines",
    responsibleOfficerContact: "+91 98261 44521",
    latitude: 21.2514,
    longitude: 81.6296,
    geofenceRadiusMeters: 450,
    linkedStockyardId: stockyards[0]?.id || "STK-001",
    environmentalClearanceRef: "EC/SEIAA/TG/MIN/2026/0891",
    cteCtoRef: "CTO/SPCB/AIR-WATER/2026/4102",
    electronicMonitoringEnabled: true,
    cctvSurveillanceLive: true,
    documentsAttached: ["SEIAA EC Approval Certificate", "Mining Plan Approval", "Consent to Operate (CTO)"],
  });

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    const defaultMandal = DISTRICT_MANDALS[dist]?.[0] || "Block 01";
    setFormData((prev) => ({
      ...prev,
      district: dist,
      block: defaultMandal,
      mandal: defaultMandal,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reachName.trim() || !formData.village.trim() || !formData.responsibleOfficer.trim()) {
      showError("Please fill all mandatory fields (Reach Name, Village, and Responsible Officer).");
      return;
    }

    if (new Date(formData.validityEndDate) <= new Date(formData.validityStartDate)) {
      showError("Validity End Date must be strictly after Start Date.");
      return;
    }

    const linkedYard = stockyards.find((s) => s.id === formData.linkedStockyardId);

    addReach({
      reachId: formData.reachId,
      reachName: formData.reachName,
      district: formData.district,
      block: formData.block || formData.mandal,
      mandal: formData.mandal,
      village: formData.village,
      riverStream: formData.riverStream,
      sourceType: formData.sourceType,
      sandType: formData.sandType,
      approvedQuantityMt: Number(formData.approvedQuantityMt),
      permittedQuantityMt: Number(formData.approvedQuantityMt),
      availableQuantityMt: Number(formData.availableQuantityMt),
      currentStockMt: Number(formData.currentStockMt),
      excavatedQuantityMt: 0,
      areaVolume: `${formData.areaHectares} Hectares / ${Number(formData.approvedQuantityMt).toLocaleString()} MT`,
      validityStartDate: formData.validityStartDate,
      validityEndDate: formData.validityEndDate,
      status: formData.status,
      responsibleOfficer: formData.responsibleOfficer,
      responsibleOfficerDesignation: formData.responsibleOfficerDesignation,
      responsibleOfficerContact: formData.responsibleOfficerContact,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      gpsCoordinates: `${Number(formData.latitude).toFixed(4)}° N, ${Number(formData.longitude).toFixed(4)}° E`,
      geofenceRadiusMeters: Number(formData.geofenceRadiusMeters),
      linkedStockyardId: formData.linkedStockyardId,
      linkedStockyardName: linkedYard ? linkedYard.name : "Central Sand Stockyard",
      environmentalClearanceRef: formData.environmentalClearanceRef,
      documentsCount: formData.documentsAttached.length,
      electronicMonitoringEnabled: formData.electronicMonitoringEnabled,
      cctvSurveillanceLive: formData.cctvSurveillanceLive,
    });

    showSuccess(`Sand Reach "${formData.reachName}" registered with complete 14 Master parameters!`);
    navigate(routes.miningReach.path);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.miningReach.path)}
          >
            Back to Sand Reach Master
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Pickaxe className="text-amber-600" size={22} />
              Register Sand Reach Master
            </h1>
            <p className="text-xs text-gray-500">
              Telangana TGMD Council Sand-Bearing Area Sanctioning & Electronic Documentation
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Identification & Jurisdiction (Fields 1-5) */}
        <Card
          title="1. Administrative & Jurisdiction Details"
          icon={Layers}
          subtitle="Reach ID, Reach Name, District, Block/Mandal, Village, and River Stream"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                1. Reach ID (System Generated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reachId}
                onChange={(e) => setFormData({ ...formData, reachId: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono font-semibold bg-gray-50 dark:bg-gray-800`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                2. Reach Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Godavari Basin Extraction Reach Sector 01"
                value={formData.reachName}
                onChange={(e) => setFormData({ ...formData, reachName: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                River / Stream Basin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.riverStream}
                onChange={(e) => setFormData({ ...formData, riverStream: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {RIVERS_STREAMS.map((riv) => (
                  <option key={riv} value={riv}>
                    {riv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                3. District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={handleDistrictChange}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {Object.keys(DISTRICT_MANDALS).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                4. Block / Mandal / Tehsil <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mandal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mandal: e.target.value,
                    block: e.target.value,
                  })
                }
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {(DISTRICT_MANDALS[formData.district] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                5. Village / Revenue Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chandkhuri / Eturunagaram"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Source Type, Sand Type & Stock Quotas (Fields 6-11) */}
        <Card
          title="2. Source, Material & Stock Quotas"
          icon={Pickaxe}
          subtitle="Source Type, Sand Type, Approved Quota, Available Quota, Current Stock, and Status"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                6. Source Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {SOURCE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                7. Sand Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sandType}
                onChange={(e) => setFormData({ ...formData, sandType: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {SAND_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                8. Approved Quantity (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.approvedQuantityMt}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    approvedQuantityMt: val,
                    availableQuantityMt: val,
                  });
                }}
                className={`${inputBase} ${inputNormal} font-bold text-blue-700 dark:text-blue-400`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                9. Available Quantity (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.availableQuantityMt}
                onChange={(e) => setFormData({ ...formData, availableQuantityMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-bold text-emerald-700 dark:text-emerald-400`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                10. Current Stock at Loading Apron (MT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.currentStockMt}
                onChange={(e) => setFormData({ ...formData, currentStockMt: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-bold text-indigo-700 dark:text-indigo-400`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                11. Operational Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`${inputBase} ${inputNormal} font-semibold`}
                required
              >
                <option value="Approved">Approved (Active Operations)</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Draft">Draft</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Validity, Officer & GPS Geofence (Fields 12-14) */}
        <Card
          title="3. Validity, Responsible Officer & GPS Coordinates"
          icon={MapPin}
          subtitle="Validity dates, Nodal Officer contact, Geofence radius, and telemetry monitoring"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                12. Validity Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validityStartDate}
                onChange={(e) => setFormData({ ...formData, validityStartDate: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                12. Validity End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validityEndDate}
                onChange={(e) => setFormData({ ...formData, validityEndDate: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Linked Receiving Stockyard / Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.linkedStockyardId}
                onChange={(e) => setFormData({ ...formData, linkedStockyardId: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              >
                {stockyards.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                13. Responsible Officer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Er. Rameshwar Sharma"
                value={formData.responsibleOfficer}
                onChange={(e) => setFormData({ ...formData, responsibleOfficer: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Officer Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Assistant Director of Mines / Nodal Officer"
                value={formData.responsibleOfficerDesignation}
                onChange={(e) => setFormData({ ...formData, responsibleOfficerDesignation: e.target.value })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Officer Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98261 44521"
                value={formData.responsibleOfficerContact}
                onChange={(e) => setFormData({ ...formData, responsibleOfficerContact: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                14. GPS Latitude (° N) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                14. GPS Longitude (° E) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Geofence Perimeter Radius (Meters)
              </label>
              <input
                type="number"
                value={formData.geofenceRadiusMeters}
                onChange={(e) => setFormData({ ...formData, geofenceRadiusMeters: Number(e.target.value) })}
                className={`${inputBase} ${inputNormal}`}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60">
              <input
                type="checkbox"
                checked={formData.electronicMonitoringEnabled}
                onChange={(e) => setFormData({ ...formData, electronicMonitoringEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Enable Electronic Documentation & GPS Telemetry
                </span>
                <span className="text-[11px] text-gray-500">
                  Automates electronic transit passes (e-Way Bill) and GPS vehicle ping validation.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60">
              <input
                type="checkbox"
                checked={formData.cctvSurveillanceLive}
                onChange={(e) => setFormData({ ...formData, cctvSurveillanceLive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Enable ANPR & CCTV Live Surveillance
                </span>
                <span className="text-[11px] text-gray-500">
                  Automatic number plate recognition at quarry entrance and weighbridge exit.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Section 4: Environmental Clearance Reference & Attachments */}
        <Card
          title="4. Statutory Clearances & Documentation"
          icon={ShieldCheck}
          subtitle="SEIAA EC order, CTO reference, and approved progressive mining plan"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                SEIAA EC Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. EC/SEIAA/TG/MIN/2026/0891"
                value={formData.environmentalClearanceRef}
                onChange={(e) => setFormData({ ...formData, environmentalClearanceRef: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Consent to Operate (CTO) Reference
              </label>
              <input
                type="text"
                placeholder="e.g. CTO/SPCB/AIR-WATER/2026/4102"
                value={formData.cteCtoRef}
                onChange={(e) => setFormData({ ...formData, cteCtoRef: e.target.value })}
                className={`${inputBase} ${inputNormal} font-mono`}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mandatory Compliance Attachments
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formData.documentsAttached.map((doc, idx) => (
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
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(routes.miningReach.path)}
            >
              Cancel
            </Button>
            <Button action="save" type="submit" icon={<Save size={15} />}>
              Save & Authorize Sand Reach Master
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddMiningReach;
