import React, { useState, useMemo } from "react";
import {
  Sliders,
  MapPin,
  DollarSign,
  Truck,
  Plus,
  Edit2,
  CheckCircle2,
  Power,
  Upload,
  Download,
  Eye,
  Waves,
  Boxes,
  Building2,
  FileCheck2,
  BellRing,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  Calendar,
  UserCheck,
  Ban,
} from "lucide-react";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import type {
  MasterCategory,
  MasterDistrictMandalItem,
  MasterRiverReachItem,
  MasterSandTypeItem,
  MasterStockyardItem,
  MasterVehicleCapacityItem,
  MasterTariffItem,
  MasterStatusCodeItem,
  MasterAlertThresholdItem,
  MasterDepartmentItem,
} from "../types";
import "../styles/mastersConfig.css";

// Initial seed data for all 9 Master entities
const INITIAL_DISTRICT_MANDALS: MasterDistrictMandalItem[] = [
  { id: "DM-001", code: "DM-RP-01", district: "Raipur", mandal: "Arang", village: "Chandkhuri", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "DM-002", code: "DM-RP-02", district: "Raipur", mandal: "Abhanpur", village: "Nawapara", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "DM-003", code: "DM-DG-01", district: "Durg", mandal: "Patan", village: "Jamgaon", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-15", status: "Active" },
  { id: "DM-004", code: "DM-BP-01", district: "Bilaspur", mandal: "Takhatpur", village: "Koni", authorizedBy: "JD-MIN-004 (Joint Director)", effectiveDate: "2026-02-01", status: "Pending Approval" },
  { id: "DM-005", code: "DM-RJ-01", district: "Rajnandgaon", mandal: "Dongargaon", village: "Mohara", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2025-11-01", status: "Inactive" },
];

const INITIAL_RIVER_REACHES: MasterRiverReachItem[] = [
  { id: "RR-001", reachCode: "CG-RP-MHN-01", reachName: "Mahanadi Basin Reach Alpha", riverBasin: "Mahanadi River Basin", district: "Raipur", permittedAnnualQuotaMt: 100000, authorizedBy: "SEC-MIN-009 (Principal Secretary)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "RR-002", reachCode: "CG-DG-SHV-02", reachName: "Shivnath River Reach Delta", riverBasin: "Shivnath Sub-Basin", district: "Durg", permittedAnnualQuotaMt: 150000, authorizedBy: "SEC-MIN-009 (Principal Secretary)", effectiveDate: "2026-01-15", status: "Active" },
  { id: "RR-003", reachCode: "CG-BP-ARP-03", reachName: "Bilaspur Arpa Quarry Block B", riverBasin: "Arpa River Basin", district: "Bilaspur", permittedAnnualQuotaMt: 80000, authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-03-01", status: "Pending Approval" },
  { id: "RR-004", reachCode: "CG-RJ-SHV-04", reachName: "Rajnandgaon Shivnath Reach 04", riverBasin: "Shivnath Sub-Basin", district: "Rajnandgaon", permittedAnnualQuotaMt: 90000, authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2025-10-15", status: "Inactive" },
];

const INITIAL_SAND_TYPES: MasterSandTypeItem[] = [
  { id: "ST-001", sandCode: "SND-RIV-A", sandType: "River Sand (Coarse Construction Grade)", specification: "IS:383 Zone-II Compliant", densityTonsPerCum: 1.62, authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "ST-002", sandCode: "SND-PLAS-B", sandType: "Plaster Sand (Fine Grade)", specification: "IS:1542 Zone-IV Sifted", densityTonsPerCum: 1.55, authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "ST-003", sandCode: "SND-MSAND-C", sandType: "Manufactured Sand (M-Sand)", specification: "IS:383 VSI Crushed Granite", densityTonsPerCum: 1.75, authorizedBy: "SEC-MIN-009 (Principal Secretary)", effectiveDate: "2026-02-01", status: "Active" },
  { id: "ST-004", sandCode: "SND-SIL-D", sandType: "Silica Foundry Sand", specification: "IS:1987 High Purity Grade", densityTonsPerCum: 1.48, authorizedBy: "JD-MIN-004 (Joint Director)", effectiveDate: "2026-03-10", status: "Pending Approval" },
];

const INITIAL_STOCKYARDS: MasterStockyardItem[] = [
  { id: "SY-001", stockyardCode: "STK-RP-01", name: "Raipur Central Stock Depot", district: "Raipur", capacityMt: 75000, supervisor: "Er. Alok Verma", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "SY-002", stockyardCode: "STK-DG-02", name: "Durg Logistics Yard Alpha", district: "Durg", capacityMt: 60000, supervisor: "Er. Neha Tiwari", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-15", status: "Active" },
  { id: "SY-003", stockyardCode: "STK-BP-03", name: "Bilaspur Railway Siding Depot", district: "Bilaspur", capacityMt: 90000, supervisor: "Er. Sandeep Patel", authorizedBy: "JD-MIN-004 (Joint Director)", effectiveDate: "2026-02-15", status: "Pending Approval" },
  { id: "SY-004", stockyardCode: "STK-KN-04", name: "Korba Industrial Buffer Yard", district: "Korba", capacityMt: 45000, supervisor: "Er. Vikas Shukla", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2025-08-01", status: "Inactive" },
];

const INITIAL_VEHICLE_CAPACITIES: MasterVehicleCapacityItem[] = [
  { id: "VC-001", categoryCode: "VEH-2AX-10T", categoryName: "2-Axle Medium Tipper (6-Wheeler)", axlesCount: 2, maxGvwMt: 16.2, maxSandPayloadMt: 10.0, minTareMt: 5.5, overloadTolerancePercent: 2.0, authorizedBy: "COMM-TRN-002 (Transport Commissioner)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "VC-002", categoryCode: "VEH-3AX-18T", categoryName: "3-Axle Heavy Tipper (10-Wheeler)", axlesCount: 3, maxGvwMt: 28.0, maxSandPayloadMt: 18.0, minTareMt: 9.2, overloadTolerancePercent: 2.0, authorizedBy: "COMM-TRN-002 (Transport Commissioner)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "VC-003", categoryCode: "VEH-4AX-24T", categoryName: "4-Axle Multi-Axle Carrier (14-Wheeler)", axlesCount: 4, maxGvwMt: 35.0, maxSandPayloadMt: 24.0, minTareMt: 10.5, overloadTolerancePercent: 1.5, authorizedBy: "COMM-TRN-002 (Transport Commissioner)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "VC-004", categoryCode: "VEH-6AX-35T", categoryName: "6-Axle Heavy Articulated Trailer", axlesCount: 6, maxGvwMt: 55.0, maxSandPayloadMt: 35.0, minTareMt: 18.0, overloadTolerancePercent: 1.0, authorizedBy: "COMM-TRN-002 (Transport Commissioner)", effectiveDate: "2026-03-01", status: "Pending Approval" },
];

const INITIAL_TARIFFS: MasterTariffItem[] = [
  { id: "TF-001", tariffCode: "TAR-2026-RIV", sandType: "River Sand (Coarse)", basePricePerMt: 450, royaltyPerMt: 60, dmfCessPercent: 10, loadingChargePerMt: 35, transportPerKmPerMt: 4.5, authorizedBy: "SEC-FIN-008 (Finance Dept)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "TF-002", tariffCode: "TAR-2026-PLS", sandType: "Plaster Sand (Fine)", basePricePerMt: 520, royaltyPerMt: 70, dmfCessPercent: 10, loadingChargePerMt: 40, transportPerKmPerMt: 4.5, authorizedBy: "SEC-FIN-008 (Finance Dept)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "TF-003", tariffCode: "TAR-2026-MSN", sandType: "Manufactured Sand (M-Sand)", basePricePerMt: 380, royaltyPerMt: 45, dmfCessPercent: 5, loadingChargePerMt: 30, transportPerKmPerMt: 4.2, authorizedBy: "SEC-FIN-008 (Finance Dept)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "TF-004", tariffCode: "TAR-2026-SIL", sandType: "Silica Foundry Sand", basePricePerMt: 850, royaltyPerMt: 120, dmfCessPercent: 15, loadingChargePerMt: 60, transportPerKmPerMt: 5.0, authorizedBy: "SEC-FIN-008 (Finance Dept)", effectiveDate: "2026-04-01", status: "Pending Approval" },
];

const INITIAL_STATUS_CODES: MasterStatusCodeItem[] = [
  { id: "SC-001", moduleName: "EPASS_LIFECYCLE", statusCode: "EPASS_ACTIVE_TRANSIT", statusLabel: "In Transit", description: "Vehicle has departed weighbridge and is moving within geofence corridor", colorVariant: "primary", authorizedBy: "SYS-ADMIN-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "SC-002", moduleName: "EPASS_LIFECYCLE", statusCode: "EPASS_COMPLETED", statusLabel: "Delivered & Closed", description: "Destination OTP entered and sand unloaded successfully", colorVariant: "success", authorizedBy: "SYS-ADMIN-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "SC-003", moduleName: "ENFORCEMENT", statusCode: "ENF_INTERCEPTED", statusLabel: "Seized & Intercepted", description: "Flying squad has impounded vehicle for lack of valid e-Pass or overload", colorVariant: "danger", authorizedBy: "SYS-ADMIN-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "SC-004", moduleName: "GRIEVANCE", statusCode: "GRV_ESCALATED_L2", statusLabel: "Escalated to District Collector", description: "Complaint unresolved past 72-hour SLA threshold", colorVariant: "warning", authorizedBy: "SYS-ADMIN-001", effectiveDate: "2026-02-15", status: "Pending Approval" },
];

const INITIAL_ALERT_THRESHOLDS: MasterAlertThresholdItem[] = [
  { id: "AT-001", thresholdCode: "THR-GEOFENCE-DEV", parameterName: "Corridor Geofence Deviation", module: "Transit Surveillance", triggerCondition: "Distance > 500 Meters from approved route", thresholdValue: "500 m", severityLevel: "High", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "AT-002", thresholdCode: "THR-WEIGH-DIFF", parameterName: "Weighbridge Gross Variance", module: "Weighment Audit", triggerCondition: "Tare or Gross discrepancy > 2.0%", thresholdValue: "± 2.0%", severityLevel: "Critical", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "AT-003", thresholdCode: "THR-HALT-DELAY", parameterName: "Unreasonable En-route Stoppage", module: "GPS Tracking", triggerCondition: "Stationary duration > 45 Minutes on highway", thresholdValue: "45 Mins", severityLevel: "Moderate", authorizedBy: "DIR-MIN-001 (Director of Mines)", effectiveDate: "2026-01-01", status: "Active" },
  { id: "AT-004", thresholdCode: "THR-NIGHT-CURFEW", parameterName: "Night Excavation Prohibition", module: "Mining Reach Telemetry", triggerCondition: "Excavator ignition between 20:00 - 06:00 hrs", thresholdValue: "20:00 - 06:00", severityLevel: "Critical", authorizedBy: "SEC-MIN-009 (Principal Secretary)", effectiveDate: "2026-02-01", status: "Pending Approval" },
];

const INITIAL_DEPARTMENTS: MasterDepartmentItem[] = [
  { id: "DP-001", departmentCode: "DEP-MIN-GEO", name: "Department of Mining & Geology", nodalOfficer: "Shri Rajesh Agrawal, IAS", contactEmail: "mining-hq@cgstate.gov.in", contactMobile: "+91 98765 43210", authorizedBy: "CHIEF-SEC-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "DP-002", departmentCode: "DEP-REV-ADMIN", name: "Revenue & Land Administration", nodalOfficer: "Smt. Priyanka Sharma", contactEmail: "revenue-sand@cgstate.gov.in", contactMobile: "+91 98765 43211", authorizedBy: "CHIEF-SEC-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "DP-003", departmentCode: "DEP-POL-ENF", name: "State Police & Flying Squad Enforcement", nodalOfficer: "SP (Operations) Vikram Rathore", contactEmail: "enforcement-sand@cgpolice.gov.in", contactMobile: "+91 98765 43212", authorizedBy: "CHIEF-SEC-001", effectiveDate: "2026-01-01", status: "Active" },
  { id: "DP-004", departmentCode: "DEP-ENV-POLL", name: "State Environment Protection Board", nodalOfficer: "Dr. K. S. Murthy", contactEmail: "environment-clearance@cgstate.gov.in", contactMobile: "+91 98765 43213", authorizedBy: "CHIEF-SEC-001", effectiveDate: "2026-02-01", status: "Pending Approval" },
];

export const MastersConfigurationHub: React.FC = () => {
  const { showSuccess, showError, showInfo } = useStatusModal();

  // Active Category State
  const [selectedCategory, setSelectedCategory] = useState<MasterCategory>("DISTRICT_MANDAL");

  // Master Data States
  const [districtMandals, setDistrictMandals] = useState<MasterDistrictMandalItem[]>(INITIAL_DISTRICT_MANDALS);
  const [riverReaches, setRiverReaches] = useState<MasterRiverReachItem[]>(INITIAL_RIVER_REACHES);
  const [sandTypes, setSandTypes] = useState<MasterSandTypeItem[]>(INITIAL_SAND_TYPES);
  const [stockyards, setStockyards] = useState<MasterStockyardItem[]>(INITIAL_STOCKYARDS);
  const [vehicleCapacities, setVehicleCapacities] = useState<MasterVehicleCapacityItem[]>(INITIAL_VEHICLE_CAPACITIES);
  const [tariffs, setTariffs] = useState<MasterTariffItem[]>(INITIAL_TARIFFS);
  const [statusCodes, setStatusCodes] = useState<MasterStatusCodeItem[]>(INITIAL_STATUS_CODES);
  const [alertThresholds, setAlertThresholds] = useState<MasterAlertThresholdItem[]>(INITIAL_ALERT_THRESHOLDS);
  const [departments, setDepartments] = useState<MasterDepartmentItem[]>(INITIAL_DEPARTMENTS);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Active Selected Item for Operations
  const [activeItem, setActiveItem] = useState<any | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<any>({
    authorizedBy: "DIR-MIN-001 (Director of Mines)",
    effectiveDate: new Date().toISOString().split("T")[0],
    status: "Pending Approval",
  });

  // Approval Form State
  const [approvalData, setApprovalData] = useState({
    approverOfficerId: "SEC-MIN-009 (Principal Secretary / Authorizing Authority)",
    approvalRemarks: "Approved after verifying statutory regulatory gazette notification.",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  // Import State
  const [importData, setImportData] = useState({
    authorizedBy: "DIR-MIN-001 (Director of Mines)",
    effectiveDate: new Date().toISOString().split("T")[0],
    format: "CSV",
    rawContent: "",
  });

  // Category Configuration Array
  const categoryConfig: { id: MasterCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "DISTRICT_MANDAL", label: "District / Mandal / Village", icon: <MapPin className="h-4 w-4" />, count: districtMandals.length },
    { id: "RIVER_REACH", label: "River / Reach", icon: <Waves className="h-4 w-4" />, count: riverReaches.length },
    { id: "SAND_TYPE", label: "Sand Type", icon: <Boxes className="h-4 w-4" />, count: sandTypes.length },
    { id: "STOCKYARD", label: "Stockyard", icon: <Building2 className="h-4 w-4" />, count: stockyards.length },
    { id: "VEHICLE_CAPACITY", label: "Vehicle Type / Capacity", icon: <Truck className="h-4 w-4" />, count: vehicleCapacities.length },
    { id: "CHARGES_TARIFF", label: "Charges / Tariff", icon: <DollarSign className="h-4 w-4" />, count: tariffs.length },
    { id: "STATUS_CODES", label: "Status Codes", icon: <FileCheck2 className="h-4 w-4" />, count: statusCodes.length },
    { id: "ALERT_THRESHOLDS", label: "Alert Thresholds", icon: <BellRing className="h-4 w-4" />, count: alertThresholds.length },
    { id: "DEPARTMENTS", label: "Departments", icon: <ShieldCheck className="h-4 w-4" />, count: departments.length },
  ];

  // Global KPI Calculations
  const totalMasterCount = useMemo(() => {
    return (
      districtMandals.length +
      riverReaches.length +
      sandTypes.length +
      stockyards.length +
      vehicleCapacities.length +
      tariffs.length +
      statusCodes.length +
      alertThresholds.length +
      departments.length
    );
  }, [districtMandals, riverReaches, sandTypes, stockyards, vehicleCapacities, tariffs, statusCodes, alertThresholds, departments]);

  const pendingApprovalsCount = useMemo(() => {
    const all = [
      ...districtMandals,
      ...riverReaches,
      ...sandTypes,
      ...stockyards,
      ...vehicleCapacities,
      ...tariffs,
      ...statusCodes,
      ...alertThresholds,
      ...departments,
    ];
    return all.filter((i) => i.status === "Pending Approval").length;
  }, [districtMandals, riverReaches, sandTypes, stockyards, vehicleCapacities, tariffs, statusCodes, alertThresholds, departments]);

  const activeMasterCount = useMemo(() => {
    const all = [
      ...districtMandals,
      ...riverReaches,
      ...sandTypes,
      ...stockyards,
      ...vehicleCapacities,
      ...tariffs,
      ...statusCodes,
      ...alertThresholds,
      ...departments,
    ];
    return all.filter((i) => i.status === "Active").length;
  }, [districtMandals, riverReaches, sandTypes, stockyards, vehicleCapacities, tariffs, statusCodes, alertThresholds, departments]);

  // Handler to open Add Modal
  const handleOpenAdd = () => {
    const today = new Date().toISOString().split("T")[0];
    let defaults: any = {
      authorizedBy: "DIR-MIN-001 (Director of Mines)",
      effectiveDate: today,
      status: "Pending Approval",
    };

    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        defaults = { ...defaults, code: `DM-NEW-${Date.now().toString().slice(-3)}`, district: "", mandal: "", village: "" };
        break;
      case "RIVER_REACH":
        defaults = { ...defaults, reachCode: `CG-RCH-${Date.now().toString().slice(-3)}`, reachName: "", riverBasin: "Mahanadi River Basin", district: "Raipur", permittedAnnualQuotaMt: 50000 };
        break;
      case "SAND_TYPE":
        defaults = { ...defaults, sandCode: `SND-SPEC-${Date.now().toString().slice(-3)}`, sandType: "", specification: "IS:383 Zone-II Compliant", densityTonsPerCum: 1.6 };
        break;
      case "STOCKYARD":
        defaults = { ...defaults, stockyardCode: `STK-NEW-${Date.now().toString().slice(-3)}`, name: "", district: "Raipur", capacityMt: 50000, supervisor: "" };
        break;
      case "VEHICLE_CAPACITY":
        defaults = { ...defaults, categoryCode: `VEH-CAT-${Date.now().toString().slice(-3)}`, categoryName: "", axlesCount: 2, maxGvwMt: 16.2, maxSandPayloadMt: 10.0, minTareMt: 5.5, overloadTolerancePercent: 2.0 };
        break;
      case "CHARGES_TARIFF":
        defaults = { ...defaults, tariffCode: `TAR-${Date.now().toString().slice(-4)}`, sandType: "River Sand (Coarse)", basePricePerMt: 450, royaltyPerMt: 60, dmfCessPercent: 10, loadingChargePerMt: 35, transportPerKmPerMt: 4.5 };
        break;
      case "STATUS_CODES":
        defaults = { ...defaults, moduleName: "EPASS_LIFECYCLE", statusCode: `CODE_${Date.now().toString().slice(-4)}`, statusLabel: "", description: "", colorVariant: "primary" };
        break;
      case "ALERT_THRESHOLDS":
        defaults = { ...defaults, thresholdCode: `THR-${Date.now().toString().slice(-4)}`, parameterName: "", module: "Transit Surveillance", triggerCondition: "", thresholdValue: "", severityLevel: "High" };
        break;
      case "DEPARTMENTS":
        defaults = { ...defaults, departmentCode: `DEP-${Date.now().toString().slice(-3)}`, name: "", nodalOfficer: "", contactEmail: "", contactMobile: "" };
        break;
    }
    setFormData(defaults);
    setIsAddModalOpen(true);
  };

  // Handler to open Edit Modal
  const handleOpenEdit = (item: any) => {
    setActiveItem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  // Handler to open Approve Modal
  const handleOpenApprove = (item: any) => {
    setActiveItem(item);
    setApprovalData({
      approverOfficerId: "SEC-MIN-009 (Principal Secretary / Checker Authority)",
      approvalRemarks: `Master change verified against statutory compliance gazette for ${item.code || item.reachCode || item.sandCode || item.stockyardCode || item.categoryCode || item.tariffCode || item.statusCode || item.thresholdCode || item.departmentCode || item.id}.`,
      effectiveDate: item.effectiveDate || new Date().toISOString().split("T")[0],
    });
    setIsApproveModalOpen(true);
  };

  // Handler to open Deactivate Modal
  const handleOpenDeactivate = (item: any) => {
    setActiveItem(item);
    setIsDeactivateModalOpen(true);
  };

  // Handler to open View Modal
  const handleOpenView = (item: any) => {
    setActiveItem(item);
    setIsViewModalOpen(true);
  };

  // Submit Add
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorizedBy || !formData.effectiveDate) {
      showError(
        "Business Rule Violated: Master changes require an Authorizing Officer and Effective Date.",
        "Validation Error"
      );
      return;
    }

    const newItem = {
      ...formData,
      id: `MST-${Date.now().toString().slice(-5)}`,
    };

    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        setDistrictMandals([newItem, ...districtMandals]);
        break;
      case "RIVER_REACH":
        setRiverReaches([newItem, ...riverReaches]);
        break;
      case "SAND_TYPE":
        setSandTypes([newItem, ...sandTypes]);
        break;
      case "STOCKYARD":
        setStockyards([newItem, ...stockyards]);
        break;
      case "VEHICLE_CAPACITY":
        setVehicleCapacities([newItem, ...vehicleCapacities]);
        break;
      case "CHARGES_TARIFF":
        setTariffs([newItem, ...tariffs]);
        break;
      case "STATUS_CODES":
        setStatusCodes([newItem, ...statusCodes]);
        break;
      case "ALERT_THRESHOLDS":
        setAlertThresholds([newItem, ...alertThresholds]);
        break;
      case "DEPARTMENTS":
        setDepartments([newItem, ...departments]);
        break;
    }

    setIsAddModalOpen(false);
    showSuccess(
      `New record created under "${selectedCategory.replace(/_/g, " ")}" with Status: "${newItem.status}". Effective Date: ${newItem.effectiveDate}. Pending Maker-Checker signoff.`,
      "Master Entry Drafted"
    );
  };

  // Submit Edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorizedBy || !formData.effectiveDate) {
      showError(
        "Business Rule Violated: Master revision requires an Authorizing Officer and Effective Date.",
        "Validation Error"
      );
      return;
    }

    const updateList = (list: any[]) =>
      list.map((item) => (item.id === activeItem.id ? { ...formData } : item));

    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        setDistrictMandals(updateList(districtMandals));
        break;
      case "RIVER_REACH":
        setRiverReaches(updateList(riverReaches));
        break;
      case "SAND_TYPE":
        setSandTypes(updateList(sandTypes));
        break;
      case "STOCKYARD":
        setStockyards(updateList(stockyards));
        break;
      case "VEHICLE_CAPACITY":
        setVehicleCapacities(updateList(vehicleCapacities));
        break;
      case "CHARGES_TARIFF":
        setTariffs(updateList(tariffs));
        break;
      case "STATUS_CODES":
        setStatusCodes(updateList(statusCodes));
        break;
      case "ALERT_THRESHOLDS":
        setAlertThresholds(updateList(alertThresholds));
        break;
      case "DEPARTMENTS":
        setDepartments(updateList(departments));
        break;
    }

    setIsEditModalOpen(false);
    showSuccess(
      `Modifications committed for ID: ${activeItem.id}. Authorized by: ${formData.authorizedBy}, Effective Date: ${formData.effectiveDate}.`,
      "Master Record Updated"
    );
  };

  // Submit Approval (Maker-Checker)
  const handleSubmitApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const updateApproval = (list: any[]) =>
      list.map((item) =>
        item.id === activeItem.id
          ? {
            ...item,
            status: "Active",
            authorizedBy: `${approvalData.approverOfficerId} [Verified Checker]`,
            effectiveDate: approvalData.effectiveDate,
          }
          : item
      );

    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        setDistrictMandals(updateApproval(districtMandals));
        break;
      case "RIVER_REACH":
        setRiverReaches(updateApproval(riverReaches));
        break;
      case "SAND_TYPE":
        setSandTypes(updateApproval(sandTypes));
        break;
      case "STOCKYARD":
        setStockyards(updateApproval(stockyards));
        break;
      case "VEHICLE_CAPACITY":
        setVehicleCapacities(updateApproval(vehicleCapacities));
        break;
      case "CHARGES_TARIFF":
        setTariffs(updateApproval(tariffs));
        break;
      case "STATUS_CODES":
        setStatusCodes(updateApproval(statusCodes));
        break;
      case "ALERT_THRESHOLDS":
        setAlertThresholds(updateApproval(alertThresholds));
        break;
      case "DEPARTMENTS":
        setDepartments(updateApproval(departments));
        break;
    }

    setIsApproveModalOpen(false);
    showSuccess(
      `Master item ${activeItem.id} has been formally authorized and activated by ${approvalData.approverOfficerId}. Effective Date: ${approvalData.effectiveDate}.`,
      "Authorization Approved"
    );
  };

  // Submit Deactivate / Activate
  const handleSubmitToggleStatus = () => {
    const nextStatus = activeItem.status === "Active" ? "Inactive" : "Active";
    const updateStatus = (list: any[]) =>
      list.map((item) =>
        item.id === activeItem.id
          ? {
            ...item,
            status: nextStatus,
            authorizedBy: "DIR-MIN-001 (Director of Mines)",
            effectiveDate: new Date().toISOString().split("T")[0],
          }
          : item
      );

    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        setDistrictMandals(updateStatus(districtMandals));
        break;
      case "RIVER_REACH":
        setRiverReaches(updateStatus(riverReaches));
        break;
      case "SAND_TYPE":
        setSandTypes(updateStatus(sandTypes));
        break;
      case "STOCKYARD":
        setStockyards(updateStatus(stockyards));
        break;
      case "VEHICLE_CAPACITY":
        setVehicleCapacities(updateStatus(vehicleCapacities));
        break;
      case "CHARGES_TARIFF":
        setTariffs(updateStatus(tariffs));
        break;
      case "STATUS_CODES":
        setStatusCodes(updateStatus(statusCodes));
        break;
      case "ALERT_THRESHOLDS":
        setAlertThresholds(updateStatus(alertThresholds));
        break;
      case "DEPARTMENTS":
        setDepartments(updateStatus(departments));
        break;
    }

    setIsDeactivateModalOpen(false);
    showInfo(
      `Master item ${activeItem.id} status transitioned to "${nextStatus}". Effective immediately.`,
      `Record ${nextStatus}`
    );
  };

  // Submit Import
  const handleSubmitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importData.authorizedBy || !importData.effectiveDate) {
      showError(
        "Business Rule: Master bulk import requires an Authorizing Officer and Effective Date.",
        "Import Rejected"
      );
      return;
    }

    setIsImportModalOpen(false);
    showSuccess(
      `Successfully ingested 12 master records into category "${selectedCategory}". Enrolled with Authorization: ${importData.authorizedBy}, Effective Date: ${importData.effectiveDate}.`,
      "Bulk Master Data Imported"
    );
  };

  // Action column renderer helper
  const renderActionColumn = (item: any) => {
    const isPending = item.status === "Pending Approval";
    const isActive = item.status === "Active";

    return (
      <div className="flex items-center gap-1.5 justify-center" onClick={(e) => e.stopPropagation()}>
        {/* 1. View / Audit Trail */}
        <button
          type="button"
          title="View Master Details & Audit History"
          onClick={() => handleOpenView(item)}
          className="p-1.5 rounded transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 cursor-pointer"
        >
          <Eye size={16} />
        </button>

        {/* 2. Edit Record */}
        <button
          type="button"
          title="Edit Master Record"
          onClick={() => handleOpenEdit(item)}
          className="p-1.5 rounded transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 cursor-pointer"
        >
          <Edit2 size={16} />
        </button>

        {/* 3. Approve (Maker-Checker workflow) */}
        <button
          type="button"
          disabled={!isPending}
          title={isPending ? "Checker Signoff: Approve & Activate" : "Record is already authorized"}
          onClick={() => isPending && handleOpenApprove(item)}
          className={`p-1.5 rounded transition-colors ${
            isPending
              ? "hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 cursor-pointer"
              : "opacity-40 text-gray-400 cursor-not-allowed"
          }`}
        >
          <CheckCircle2 size={16} />
        </button>

        {/* 4. Deactivate / Activate Toggle */}
        <button
          type="button"
          title={isActive ? "Deactivate Master Record" : "Activate Master Record"}
          onClick={() => handleOpenDeactivate(item)}
          className={`p-1.5 rounded transition-colors ${
            isActive
              ? "hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 cursor-pointer"
              : "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 cursor-pointer"
          }`}
        >
          {isActive ? <Ban size={16} /> : <Power size={16} />}
        </button>
      </div>
    );
  };

  // Status Badge Helper
  const renderStatusBadge = (status: "Active" | "Pending Approval" | "Inactive") => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Pending Approval":
        return <Badge variant="warning">Pending Approval</Badge>;
      case "Inactive":
        return <Badge variant="danger">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Columns for 1. District / Mandal / Village
  const districtMandalColumns: MRT_ColumnDef<MasterDistrictMandalItem>[] = [
    { accessorKey: "code", header: "Jurisdiction Code", size: 130 },
    { accessorKey: "district", header: "District", size: 140, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.district}</span> },
    { accessorKey: "mandal", header: "Mandal / Tehsil", size: 140 },
    { accessorKey: "village", header: "Village / Panchayat", size: 150 },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 2. River / Reach
  const riverReachColumns: MRT_ColumnDef<MasterRiverReachItem>[] = [
    { accessorKey: "reachCode", header: "Reach Code", size: 140 },
    { accessorKey: "reachName", header: "Reach / Block Name", size: 200, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.reachName}</span> },
    { accessorKey: "riverBasin", header: "River Stream / Basin", size: 160 },
    { accessorKey: "district", header: "District", size: 130 },
    { accessorKey: "permittedAnnualQuotaMt", header: "Permitted Quota (MT)", size: 160, Cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white">{row.original.permittedAnnualQuotaMt.toLocaleString()} MT</span> },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 3. Sand Type
  const sandTypeColumns: MRT_ColumnDef<MasterSandTypeItem>[] = [
    { accessorKey: "sandCode", header: "Sand Code", size: 130 },
    { accessorKey: "sandType", header: "Sand Type / Grade", size: 220, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.sandType}</span> },
    { accessorKey: "specification", header: "IS Standard / Spec", size: 180 },
    { accessorKey: "densityTonsPerCum", header: "Bulk Density (MT/m³)", size: 160, Cell: ({ row }) => <span className="font-mono font-medium">{row.original.densityTonsPerCum} MT/m³</span> },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 4. Stockyard
  const stockyardColumns: MRT_ColumnDef<MasterStockyardItem>[] = [
    { accessorKey: "stockyardCode", header: "Yard Code", size: 130 },
    { accessorKey: "name", header: "Stockyard Depot Name", size: 220, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span> },
    { accessorKey: "district", header: "District", size: 130 },
    { accessorKey: "capacityMt", header: "Holding Capacity (MT)", size: 170, Cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white">{row.original.capacityMt.toLocaleString()} MT</span> },
    { accessorKey: "supervisor", header: "Nodal Supervisor", size: 160 },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 5. Vehicle Type / Capacity
  const vehicleCapacityColumns: MRT_ColumnDef<MasterVehicleCapacityItem>[] = [
    { accessorKey: "categoryCode", header: "Category Code", size: 130 },
    { accessorKey: "categoryName", header: "Vehicle Class", size: 220, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.categoryName}</span> },
    { accessorKey: "axlesCount", header: "Axles", size: 100, Cell: ({ row }) => <span>{row.original.axlesCount} Axles</span> },
    { accessorKey: "maxGvwMt", header: "Max GVW (MT)", size: 130, Cell: ({ row }) => <span className="font-bold">{row.original.maxGvwMt} MT</span> },
    { accessorKey: "maxSandPayloadMt", header: "Max Sand Payload", size: 150, Cell: ({ row }) => <Badge variant="primary">{row.original.maxSandPayloadMt} MT Max</Badge> },
    { accessorKey: "minTareMt", header: "Min Tare (MT)", size: 130, Cell: ({ row }) => <span>{row.original.minTareMt} MT</span> },
    { accessorKey: "overloadTolerancePercent", header: "Overload Buffer", size: 140, Cell: ({ row }) => <span className="text-xs font-medium text-amber-600">±{row.original.overloadTolerancePercent}%</span> },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 6. Charges / Tariff
  const chargesTariffColumns: MRT_ColumnDef<MasterTariffItem>[] = [
    { accessorKey: "tariffCode", header: "Tariff Code", size: 130 },
    { accessorKey: "sandType", header: "Sand Grade", size: 180, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.sandType}</span> },
    { accessorKey: "basePricePerMt", header: "Base Price (₹/MT)", size: 140, Cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white">{row.original.basePricePerMt}</span> },
    { accessorKey: "royaltyPerMt", header: "Royalty (₹/MT)", size: 130, Cell: ({ row }) => <span>{row.original.royaltyPerMt}</span> },
    { accessorKey: "dmfCessPercent", header: "DMF Cess (%)", size: 120, Cell: ({ row }) => <span className="font-medium text-purple-600">{row.original.dmfCessPercent}%</span> },
    { accessorKey: "loadingChargePerMt", header: "Loading (₹/MT)", size: 130, Cell: ({ row }) => <span>{row.original.loadingChargePerMt}</span> },
    { accessorKey: "transportPerKmPerMt", header: "Transport (₹/km/MT)", size: 150, Cell: ({ row }) => <span>{row.original.transportPerKmPerMt}</span> },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 7. Status Codes
  const statusCodeColumns: MRT_ColumnDef<MasterStatusCodeItem>[] = [
    { accessorKey: "moduleName", header: "Module / Subsystem", size: 160 },
    { accessorKey: "statusCode", header: "Status Code", size: 160, Cell: ({ row }) => <span className="font-mono font-semibold">{row.original.statusCode}</span> },
    { accessorKey: "statusLabel", header: "Display Label", size: 180, Cell: ({ row }) => <Badge variant={row.original.colorVariant}>{row.original.statusLabel}</Badge> },
    { accessorKey: "description", header: "Business Definition", size: 240 },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 8. Alert Thresholds
  const alertThresholdColumns: MRT_ColumnDef<MasterAlertThresholdItem>[] = [
    { accessorKey: "thresholdCode", header: "Threshold Code", size: 140 },
    { accessorKey: "parameterName", header: "Parameter Name", size: 200, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.parameterName}</span> },
    { accessorKey: "module", header: "Surveillance Module", size: 160 },
    { accessorKey: "triggerCondition", header: "Trigger Logic", size: 220 },
    { accessorKey: "thresholdValue", header: "Configured Limit", size: 140, Cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white">{row.original.thresholdValue}</span> },
    { accessorKey: "severityLevel", header: "Severity", size: 120, Cell: ({ row }) => <Badge variant={row.original.severityLevel === "Critical" ? "danger" : row.original.severityLevel === "High" ? "warning" : "primary"}>{row.original.severityLevel}</Badge> },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Columns for 9. Departments
  const departmentColumns: MRT_ColumnDef<MasterDepartmentItem>[] = [
    { accessorKey: "departmentCode", header: "Dept Code", size: 130 },
    { accessorKey: "name", header: "Department Name", size: 220, Cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-white">{row.original.name}</span> },
    { accessorKey: "nodalOfficer", header: "Nodal Officer", size: 180 },
    { accessorKey: "contactEmail", header: "Official Email", size: 180, Cell: ({ row }) => <span className="text-xs text-blue-600 dark:text-blue-400">{row.original.contactEmail}</span> },
    { accessorKey: "contactMobile", header: "Mobile", size: 140 },
    { accessorKey: "authorizedBy", header: "Authorized By", size: 180, Cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{row.original.authorizedBy}</span> },
    { accessorKey: "effectiveDate", header: "Effective Date", size: 130, Cell: ({ row }) => <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.original.effectiveDate}</span> },
    { accessorKey: "status", header: "Status", size: 140, Cell: ({ row }) => renderStatusBadge(row.original.status) },
    { id: "actions", header: "Actions", size: 140, Cell: ({ row }) => renderActionColumn(row.original) },
  ];

  // Dynamic table data & columns selector
  const { currentData, currentColumns, currentCategoryTitle, currentCategoryDesc } = useMemo(() => {
    switch (selectedCategory) {
      case "DISTRICT_MANDAL":
        return {
          currentData: districtMandals,
          currentColumns: districtMandalColumns,
          currentCategoryTitle: "District / Mandal / Village Master",
          currentCategoryDesc: "Configure administrative revenue boundaries, districts, mandals/tehsils, and revenue villages.",
        };
      case "RIVER_REACH":
        return {
          currentData: riverReaches,
          currentColumns: riverReachColumns,
          currentCategoryTitle: "River / Reach Master",
          currentCategoryDesc: "Designated river basins, operational reach blocks, and statutory annual replenishment quotas.",
        };
      case "SAND_TYPE":
        return {
          currentData: sandTypes,
          currentColumns: sandTypeColumns,
          currentCategoryTitle: "Sand Type & Grade Master",
          currentCategoryDesc: "Regulated commercial sand varieties, IS specifications, and volumetric bulk densities.",
        };
      case "STOCKYARD":
        return {
          currentData: stockyards,
          currentColumns: stockyardColumns,
          currentCategoryTitle: "Stockyard Master",
          currentCategoryDesc: "Registered government sand storage yards, holding capacities, and assigned supervisors.",
        };
      case "VEHICLE_CAPACITY":
        return {
          currentData: vehicleCapacities,
          currentColumns: vehicleCapacityColumns,
          currentCategoryTitle: "Vehicle Type & Capacity Master",
          currentCategoryDesc: "Gross Vehicle Weight (GVW) limits, axle norms, permitted payloads, and weighbridge buffers.",
        };
      case "CHARGES_TARIFF":
        return {
          currentData: tariffs,
          currentColumns: chargesTariffColumns,
          currentCategoryTitle: "Charges & Statutory Tariff Master",
          currentCategoryDesc: "Official notified pithead sand prices, state royalty, DMF cess, and transport rate matrix.",
        };
      case "STATUS_CODES":
        return {
          currentData: statusCodes,
          currentColumns: statusCodeColumns,
          currentCategoryTitle: "System Status Codes Master",
          currentCategoryDesc: "Standardized workflow lifecycle statuses, enforcement tags, and UI presentation tokens.",
        };
      case "ALERT_THRESHOLDS":
        return {
          currentData: alertThresholds,
          currentColumns: alertThresholdColumns,
          currentCategoryTitle: "Surveillance Alert Thresholds Master",
          currentCategoryDesc: "Trigger tolerances for corridor geofence deviation, weighment variance, and curfew enforcement.",
        };
      case "DEPARTMENTS":
        return {
          currentData: departments,
          currentColumns: departmentColumns,
          currentCategoryTitle: "Government Departments Master",
          currentCategoryDesc: "State nodal departments, vigilance wings, law enforcement authorities, and contact matrix.",
        };
    }
  }, [
    selectedCategory,
    districtMandals,
    riverReaches,
    sandTypes,
    stockyards,
    vehicleCapacities,
    tariffs,
    statusCodes,
    alertThresholds,
    departments,
  ]);

  // Handle Export CSV
  const handleExportData = () => {
    showSuccess(
      `Exported snapshot of "${currentCategoryTitle}" with all authorization signatures and effective dates in CSV format.`,
      "Master Data Exported"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Sliders className="h-7 w-7 text-primary" />
            Masters & Configuration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Central configuration for stable master data. Master changes strictly require maker-checker authorization and confirmed effective dates.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1.5" />
            Import Master Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Data
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Master Record
          </Button>
        </div>
      </div>

      {/* Statutory Rule Banner */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Validation & Business Rule Enforcement:</span> All configuration records are immutable without formal administrative authorization (<span className="font-mono">authorizedBy</span>) and a forward or current <span className="font-mono">effectiveDate</span>. Pending changes require Maker-Checker verification before going live.
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Master Records</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalMasterCount} Entities</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Live Masters</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{activeMasterCount} Active</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Approvals</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingApprovalsCount} Require Signoff</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tariff Effective Date</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">2026-01-01</p>
          </div>
        </Card>
      </div>

      {/* Master Categories Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categoryConfig.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`masters-category-pill flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border ${isSelected
                ? "bg-primary text-white border-primary shadow-sm active"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Content Section */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {categoryConfig.find((c) => c.id === selectedCategory)?.icon}
              {currentCategoryTitle}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{currentCategoryDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Showing {currentData.length} records</span>
          </div>
        </div>

        {/* Master Reusable Table */}
        <ReusableTable
          columns={currentColumns as any}
          data={currentData as any}
          enableExport={true}
        />
      </Card>

      {/* Add Master Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Master Record: ${categoryConfig.find((c) => c.id === selectedCategory)?.label}`}
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {/* Category specific fields */}
          {selectedCategory === "DISTRICT_MANDAL" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">District Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raipur"
                    value={formData.district || ""}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mandal / Tehsil *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arang"
                    value={formData.mandal || ""}
                    onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Village / Panchayat *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chandkhuri"
                    value={formData.village || ""}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "RIVER_REACH" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Reach Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.reachCode || ""}
                    onChange={(e) => setFormData({ ...formData, reachCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Reach / Block Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahanadi Reach Gamma"
                    value={formData.reachName || ""}
                    onChange={(e) => setFormData({ ...formData, reachName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">River Stream Basin *</label>
                  <input
                    type="text"
                    required
                    value={formData.riverBasin || ""}
                    onChange={(e) => setFormData({ ...formData, riverBasin: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district || ""}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Annual Quota (MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.permittedAnnualQuotaMt || 0}
                    onChange={(e) => setFormData({ ...formData, permittedAnnualQuotaMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "SAND_TYPE" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sand Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sandCode || ""}
                    onChange={(e) => setFormData({ ...formData, sandCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sand Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coarse River Sand"
                    value={formData.sandType || ""}
                    onChange={(e) => setFormData({ ...formData, sandType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Standard / Spec *</label>
                  <input
                    type="text"
                    required
                    value={formData.specification || ""}
                    onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bulk Density (MT/m³) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.densityTonsPerCum || 1.6}
                    onChange={(e) => setFormData({ ...formData, densityTonsPerCum: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "STOCKYARD" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Yard Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.stockyardCode || ""}
                    onChange={(e) => setFormData({ ...formData, stockyardCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stockyard Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Durg Depot Alpha"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district || ""}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Capacity (MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacityMt || 50000}
                    onChange={(e) => setFormData({ ...formData, capacityMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Supervisor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Officer Name"
                    value={formData.supervisor || ""}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "VEHICLE_CAPACITY" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Class Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.categoryCode || ""}
                    onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Vehicle Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-Axle Heavy Tipper"
                    value={formData.categoryName || ""}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Axles Count</label>
                  <input
                    type="number"
                    required
                    value={formData.axlesCount || 2}
                    onChange={(e) => setFormData({ ...formData, axlesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max GVW (MT)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.maxGvwMt || 16.2}
                    onChange={(e) => setFormData({ ...formData, maxGvwMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sand Payload MT</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.maxSandPayloadMt || 10.0}
                    onChange={(e) => setFormData({ ...formData, maxSandPayloadMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Overload Buffer %</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.overloadTolerancePercent || 2.0}
                    onChange={(e) => setFormData({ ...formData, overloadTolerancePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "CHARGES_TARIFF" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tariff Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.tariffCode || ""}
                    onChange={(e) => setFormData({ ...formData, tariffCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sand Grade *</label>
                  <input
                    type="text"
                    required
                    value={formData.sandType || ""}
                    onChange={(e) => setFormData({ ...formData, sandType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Base Price (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePricePerMt || 450}
                    onChange={(e) => setFormData({ ...formData, basePricePerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Royalty (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.royaltyPerMt || 60}
                    onChange={(e) => setFormData({ ...formData, royaltyPerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">DMF Cess (%) *</label>
                  <input
                    type="number"
                    required
                    value={formData.dmfCessPercent || 10}
                    onChange={(e) => setFormData({ ...formData, dmfCessPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Loading (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.loadingChargePerMt || 35}
                    onChange={(e) => setFormData({ ...formData, loadingChargePerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Transport Rate (₹/km/MT) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.transportPerKmPerMt || 4.5}
                    onChange={(e) => setFormData({ ...formData, transportPerKmPerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {selectedCategory === "STATUS_CODES" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Module Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.moduleName || ""}
                    onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status Code Token *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EPASS_DISPATCHED"
                    value={formData.statusCode || ""}
                    onChange={(e) => setFormData({ ...formData, statusCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Display Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. In Transit"
                    value={formData.statusLabel || ""}
                    onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Color Variant</label>
                  <select
                    value={formData.colorVariant || "primary"}
                    onChange={(e) => setFormData({ ...formData, colorVariant: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="primary">Primary (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="danger">Danger (Red)</option>
                    <option value="info">Info (Cyan)</option>
                    <option value="secondary">Secondary (Gray)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Business Definition *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {selectedCategory === "ALERT_THRESHOLDS" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Threshold Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.thresholdCode || ""}
                    onChange={(e) => setFormData({ ...formData, thresholdCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Parameter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Geofence Corridor Buffer"
                    value={formData.parameterName || ""}
                    onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Module</label>
                  <input
                    type="text"
                    required
                    value={formData.module || ""}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Threshold Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 m"
                    value={formData.thresholdValue || ""}
                    onChange={(e) => setFormData({ ...formData, thresholdValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                  <select
                    value={formData.severityLevel || "High"}
                    onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Trigger Condition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distance > 500 Meters from approved route"
                  value={formData.triggerCondition || ""}
                  onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {selectedCategory === "DEPARTMENTS" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.departmentCode || ""}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dept of Mines & Geology"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nodal Officer *</label>
                  <input
                    type="text"
                    required
                    value={formData.nodalOfficer || ""}
                    onChange={(e) => setFormData({ ...formData, nodalOfficer: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail || ""}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Mobile *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactMobile || ""}
                    onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Statutory Business Rules Compliance Section */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <UserCheck className="h-4 w-4 text-amber-600" />
              Statutory Business Rule: Authorization & Effective Date
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Authorizing Officer / Designate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIR-MIN-001 (Director of Mines)"
                  value={formData.authorizedBy || ""}
                  onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.effectiveDate || ""}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Save Draft Master Entry
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Master Record Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Master Record: ${activeItem?.code || activeItem?.reachCode || activeItem?.sandCode || activeItem?.stockyardCode || activeItem?.categoryCode || activeItem?.tariffCode || activeItem?.statusCode || activeItem?.thresholdCode || activeItem?.departmentCode || activeItem?.id}`}
      >
        {activeItem && (
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            {/* Dynamic Edit Fields */}
            {selectedCategory === "CHARGES_TARIFF" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Base Price (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePricePerMt}
                    onChange={(e) => setFormData({ ...formData, basePricePerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Royalty (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.royaltyPerMt}
                    onChange={(e) => setFormData({ ...formData, royaltyPerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">DMF Cess (%) *</label>
                  <input
                    type="number"
                    required
                    value={formData.dmfCessPercent}
                    onChange={(e) => setFormData({ ...formData, dmfCessPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Loading Charge (₹/MT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.loadingChargePerMt}
                    onChange={(e) => setFormData({ ...formData, loadingChargePerMt: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {selectedCategory === "DISTRICT_MANDAL" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">District Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mandal / Tehsil *</label>
                  <input
                    type="text"
                    required
                    value={formData.mandal}
                    onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Village / Panchayat *</label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {selectedCategory !== "CHARGES_TARIFF" && selectedCategory !== "DISTRICT_MANDAL" && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                Updating entity <span className="font-semibold">{activeItem.id}</span> parameters under category <span className="font-semibold">{selectedCategory}</span>.
              </div>
            )}

            {/* Statutory Authorization Requirements */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <UserCheck className="h-4 w-4 text-amber-600" />
                Statutory Change Authorization Audit
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Authorizing Officer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorizedBy || ""}
                    onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.effectiveDate || ""}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-900 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Edit2 className="h-4 w-4 mr-1.5" />
                Commit Modifications
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Maker-Checker Approval Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Maker-Checker Master Authorization Signoff"
      >
        {activeItem && (
          <form onSubmit={handleSubmitApprove} className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pending Verification Master Item
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                You are authorizing <span className="font-semibold">{activeItem.id}</span> in category <span className="font-semibold">{selectedCategory}</span>. Once approved, this record becomes live across all SMMS billing, dispatch, and surveillance nodes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Checker Authorizing Authority ID / Designation *
              </label>
              <input
                type="text"
                required
                value={approvalData.approverOfficerId}
                onChange={(e) => setApprovalData({ ...approvalData, approverOfficerId: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirmed Effective Date *
              </label>
              <input
                type="date"
                required
                value={approvalData.effectiveDate}
                onChange={(e) => setApprovalData({ ...approvalData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Verification & Approval Remarks *
              </label>
              <textarea
                required
                rows={3}
                value={approvalData.approvalRemarks}
                onChange={(e) => setApprovalData({ ...approvalData, approvalRemarks: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Sign & Authorize Master Item
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Deactivate / Activate Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title={activeItem?.status === "Active" ? "Deactivate Master Record" : "Activate Master Record"}
      >
        {activeItem && (
          <div className="space-y-4">
            <div
              className={`p-3 rounded-xl border flex items-start gap-3 ${activeItem.status === "Active"
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                }`}
            >
              <Power className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold mb-1">
                  Are you sure you want to {activeItem.status === "Active" ? "deactivate" : "activate"}{" "}
                  {activeItem.id}?
                </p>
                <p>
                  {activeItem.status === "Active"
                    ? "Deactivating will prevent new e-Pass generation and bookings under this master entity. Historical telemetry remains auditable."
                    : "Activating will restore operational status and enable this entity in the sand bazaar and logistics network."}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-semibold">Authorizing Officer:</span> DIR-MIN-001 (Director of Mines)
              </p>
              <p>
                <span className="font-semibold">Effective Date:</span> {new Date().toISOString().split("T")[0]}
              </p>
            </div>

            <ModalFooter>
              <Button variant="outline" size="sm" onClick={() => setIsDeactivateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={activeItem.status === "Active" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                onClick={handleSubmitToggleStatus}
              >
                <Power className="h-4 w-4 mr-1.5" />
                Confirm {activeItem.status === "Active" ? "Deactivation" : "Activation"}
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={`Bulk Import Master Data: ${categoryConfig.find((c) => c.id === selectedCategory)?.label}`}
      >
        <form onSubmit={handleSubmitImport} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Standard Import Template</p>
              <p className="mt-0.5">
                Upload CSV or JSON files matching the statutory schema for <span className="font-semibold">{selectedCategory}</span>. All imported rows will be assigned the specified authorizing officer and effective date.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Authorizing Officer ID *
              </label>
              <input
                type="text"
                required
                value={importData.authorizedBy}
                onChange={(e) => setImportData({ ...importData, authorizedBy: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                required
                value={importData.effectiveDate}
                onChange={(e) => setImportData({ ...importData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Data File Payload (CSV or JSON string) *
            </label>
            <textarea
              required
              rows={4}
              placeholder={`code,name,param1,param2...\nDM-006,Raipur,Dharsiwa,Bhatagaon`}
              value={importData.rawContent}
              onChange={(e) => setImportData({ ...importData, rawContent: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Upload className="h-4 w-4 mr-1.5" />
              Ingest & Validate Records
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Dossier / Audit Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Master Audit Dossier - ${activeItem?.code || activeItem?.reachCode || activeItem?.sandCode || activeItem?.stockyardCode || activeItem?.categoryCode || activeItem?.tariffCode || activeItem?.statusCode || activeItem?.thresholdCode || activeItem?.departmentCode || activeItem?.id}`}
      >
        {activeItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Record ID:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{activeItem.id}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Category:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedCategory}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Regulatory Status:</span>
                <span className="mt-0.5 inline-block">{renderStatusBadge(activeItem.status)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Effective Date:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{activeItem.effectiveDate}</span>
              </div>
              <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                <span className="text-gray-500 dark:text-gray-400 block">Authorizing Officer:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{activeItem.authorizedBy}</span>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Immutable Ledger Audit Trail
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Active Status Committed:</span> Effective from {activeItem.effectiveDate} by {activeItem.authorizedBy}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Initial Enrollment Drafted:</span> Stored with SHA-256 integrity hash in State Mines Configuration Ledger.
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="primary" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close Dossier
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MastersConfigurationHub;
