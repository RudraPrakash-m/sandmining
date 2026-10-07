import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Eye,
  UserCheck,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  User,
  Phone,
  MapPin,
  Tag,
  ShieldAlert,
  Paperclip,
  ExternalLink,
  RefreshCw,
  Download,
  Printer,
  Headphones,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  Star,
  KeyRound,
  AlertCircle,
  HelpCircle,
  Truck,
  Scale,
  CreditCard,
  Building,
} from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { GrievanceTicket, GrievanceCategory, GrievancePriority, GrievanceStatus } from "@/features/shared-simulation/types";
import ReusableTable from "@/shared/components/ui/Table/ReusableTable/ReusableTable";
import type { MRT_ColumnDef } from "material-react-table";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import Card from "@/shared/components/layout/Card/Card";
import Modal, { ModalFooter } from "@/shared/components/ui/Modal/Modal";
import Tabs from "@/shared/components/ui/Tabs";
import type { TabItem } from "@/shared/components/ui/Tabs/tab.types";
import { useStatusModal } from "@/config/theme/StatusModalContext";
import { exportToExcel, exportToPDF } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";
import { inputBase, inputNormal } from "@/shared/components/ui/Forms/inputStyles";
import { COMPLAINT_CATEGORIES, COMPLAINT_STAGES } from "../types";
import "../styles/grievance.css";

export const GrievanceTicketList: React.FC = () => {
  const {
    grievances,
    raiseGrievance,
    reviewGrievanceByCallCentre,
    assignGrievanceOfficer,
    recordGrievanceActionTaken,
    resolveGrievance,
    confirmGrievanceByCustomer,
    addGrievanceCommunication,
    escalateGrievance,
    reopenGrievance,
  } = useSandMining();

  const { showSuccess, showError } = useStatusModal();
  const navigate = useNavigate();

  // Active Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedStageFilter, setSelectedStageFilter] = useState<number | "All">("All");
  const [activeTab, setActiveTab] = useState<string>("registry");

  // Active Modals state
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [callCentreModalTicket, setCallCentreModalTicket] = useState<GrievanceTicket | null>(null);
  const [assignModalTicket, setAssignModalTicket] = useState<GrievanceTicket | null>(null);
  const [actionTakenModalTicket, setActionTakenModalTicket] = useState<GrievanceTicket | null>(null);
  const [resolveModalTicket, setResolveModalTicket] = useState<GrievanceTicket | null>(null);
  const [confirmModalTicket, setConfirmModalTicket] = useState<GrievanceTicket | null>(null);
  const [respondModalTicket, setRespondModalTicket] = useState<GrievanceTicket | null>(null);
  const [escalateModalTicket, setEscalateModalTicket] = useState<GrievanceTicket | null>(null);
  const [reopenModalTicket, setReopenModalTicket] = useState<GrievanceTicket | null>(null);

  // Form states inside modals
  const [callCentreNotes, setCallCentreNotes] = useState("");
  const [callCentreAgent, setCallCentreAgent] = useState("Helpdesk Agent #104");

  const [assignedOfficerName, setAssignedOfficerName] = useState("");
  const [officerDepartment, setOfficerDepartment] = useState("District Sand Grievance Cell");
  const [assignRemarks, setAssignRemarks] = useState("");

  const [actionDetails, setActionDetails] = useState("");
  const [actionOfficer, setActionOfficer] = useState("Enforcement Inspector");
  const [remedyType, setRemedyType] = useState("Field Remediation & Fleet Coordination");

  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [resolveRemedy, setResolveRemedy] = useState("Resolution Executed");

  const [customerOtpInput, setCustomerOtpInput] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState("Issue resolved satisfactorily.");
  const [isCustomerSatisfied, setIsCustomerSatisfied] = useState<boolean>(true);

  const [responseMessage, setResponseMessage] = useState("");
  const [responseAuthor, setResponseAuthor] = useState("Desk Officer");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const [escalationLevel, setEscalationLevel] = useState("District Collector Office (Level 2 SLA Breach)");
  const [escalationReason, setEscalationReason] = useState("");

  const [reopenReasonText, setReopenReasonText] = useState("");

  // Filtered grievances
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchCat =
        selectedCategoryFilter === "All" ||
        g.category === selectedCategoryFilter ||
        (selectedCategoryFilter === "Delivery Delay" && g.category === "Delayed Delivery") ||
        (selectedCategoryFilter === "Vehicle/Driver Issue" && g.category === "Driver Behavior");

      const matchStage = selectedStageFilter === "All" || g.stage === selectedStageFilter;
      return matchCat && matchStage;
    });
  }, [grievances, selectedCategoryFilter, selectedStageFilter]);

  // Stage metrics
  const stageCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    grievances.forEach((g) => {
      const stg = g.stage || 2;
      counts[stg] = (counts[stg] || 0) + 1;
    });
    return counts;
  }, [grievances]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    COMPLAINT_CATEGORIES.forEach((cat) => (counts[cat] = 0));
    grievances.forEach((g) => {
      let key = g.category;
      if (key === "Delayed Delivery") key = "Delivery Delay";
      if (key === "Driver Behavior") key = "Vehicle/Driver Issue";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [grievances]);

  // Overall metrics
  const totalCount = grievances.length;
  const activeCount = grievances.filter(
    (g) => g.status === "Complaint Registered" || g.status === "Call Centre Review" || g.status === "Assigned" || g.status === "In Progress" || g.status === "Action Taken" || g.status === "Reopened" || g.status === "Open"
  ).length;
  const escalatedCount = grievances.filter(
    (g) => g.status === "Escalated to District Collector" || g.slaRemainingHours <= 4
  ).length;
  const resolvedCount = grievances.filter((g) => g.status === "Resolved" || g.status === "Customer Confirmed" || g.status === "Closed").length;

  const statusVariant: Record<string, "warning" | "info" | "primary" | "danger" | "success" | "secondary"> = {
    "Complaint Registered": "warning",
    Open: "warning",
    "Call Centre Review": "info",
    Assigned: "primary",
    "In Progress": "primary",
    "Action Taken": "warning",
    "Escalated to District Collector": "danger",
    Resolved: "success",
    "Customer Confirmed": "success",
    Closed: "secondary",
    Reopened: "danger",
  };

  const priorityVariant: Record<string, "danger" | "warning" | "info" | "secondary"> = {
    Urgent: "danger",
    Critical: "danger",
    High: "warning",
    Medium: "info",
    Low: "secondary",
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Delivery Delay":
      case "Delayed Delivery":
        return <Clock size={13} className="text-amber-500" />;
      case "Vehicle Not Arrived":
        return <Truck size={13} className="text-orange-500" />;
      case "Wrong Quantity":
      case "Weighbridge Discrepancy":
        return <Scale size={13} className="text-purple-500" />;
      case "Payment Issue":
      case "Pricing / Tariff Dispute":
        return <CreditCard size={13} className="text-emerald-500" />;
      case "Vehicle/Driver Issue":
      case "Driver Behavior":
        return <User size={13} className="text-rose-500" />;
      case "Sand Quality Issue":
        return <AlertTriangle size={13} className="text-yellow-500" />;
      case "Booking Issue":
        return <FileText size={13} className="text-sky-500" />;
      case "OTP Issue":
        return <KeyRound size={13} className="text-indigo-500" />;
      default:
        return <Tag size={13} className="text-slate-400" />;
    }
  };

  const columns: MRT_ColumnDef<GrievanceTicket>[] = [
    {
      accessorKey: "ticketId",
      header: "Ticket ID & Stage",
      size: 160,
      Cell: ({ row }) => {
        const stageNum = row.original.stage || 2;
        const stageCfg = COMPLAINT_STAGES[stageNum] || COMPLAINT_STAGES[2];
        return (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setSelectedTicket(row.original)}
              className="text-left font-mono text-xs font-black text-primary hover:underline flex items-center gap-1.5"
              title="Click to view 7-Stage Case Dossier"
            >
              <span>{row.original.ticketId}</span>
              <Eye size={12} className="text-gray-400 hover:text-primary shrink-0" />
            </button>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Stage {stageNum}/7
              </span>
              <span className="text-[10px] text-gray-500 font-mono truncate">{row.original.bookingOrderId}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Citizen / Complainant",
      size: 180,
      Cell: ({ row }) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white block text-xs">
            {row.original.customerName}
          </span>
          <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-mono">
            <Phone size={10} /> {row.original.customerMobile}
          </span>
          {row.original.intakeChannel && (
            <span className="text-[10px] text-slate-400 block mt-0.5 italic">
              Via: {row.original.intakeChannel}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Complaint Category & Details",
      size: 240,
      Cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            {getCategoryIcon(row.original.category)}
            <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
              {row.original.category}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight" title={row.original.description}>
            {row.original.description}
          </p>
          {row.original.location && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
              <MapPin size={10} /> {row.original.location}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority / SLA",
      size: 130,
      Cell: ({ row }) => {
        const isClosed = row.original.status === "Closed" || row.original.status === "Customer Confirmed" || row.original.status === "Resolved";
        const hours = row.original.slaRemainingHours;
        const isCritical = hours <= 4 && !isClosed;
        const isWarning = hours <= 12 && !isClosed;

        return (
          <div className="space-y-1">
            <Badge variant={priorityVariant[row.original.priority] || "secondary"} className="text-[10px] font-bold">
              {row.original.priority}
            </Badge>
            {isClosed ? (
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={11} /> SLA Satisfied
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px]">
                <Clock size={11} className={isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-amber-500" : "text-emerald-500"} />
                <span className={`font-mono font-bold ${isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-slate-600 dark:text-slate-300"}`}>
                  {hours}h remaining
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedOfficer",
      header: "Assigned Officer / Cell",
      size: 180,
      Cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-gray-900 dark:text-white block truncate">
            {row.original.assignedOfficer || "Unassigned"}
          </span>
          {row.original.actionTakenBy && (
            <span className="text-[10px] text-primary block truncate">
              Action by: {row.original.actionTakenBy}
            </span>
          )}
          {row.original.customerConfirmationStatus && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
              ● {row.original.customerConfirmationStatus}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status & Action Step",
      size: 180,
      Cell: ({ row }) => {
        const stageNum = row.original.stage || 2;
        const stageCfg = COMPLAINT_STAGES[stageNum] || COMPLAINT_STAGES[2];
        return (
          <div className="space-y-1.5">
            <Badge variant={statusVariant[row.original.status] || "secondary"} className="text-[11px] font-bold">
              {row.original.status}
            </Badge>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {stageCfg.shortDesc}
            </div>
          </div>
        );
      },
    },
  ];

  const exportCols = columns.map((c) => ({
    accessorKey: c.accessorKey as string,
    header: c.header as string,
  }));

  // Handle Stage Action Transitions
  const handleOpenCallCentreModal = (t: GrievanceTicket) => {
    setCallCentreModalTicket(t);
    setCallCentreNotes(t.callCentreNotes || `Complaint verified with citizen ${t.customerName}. Order ${t.bookingOrderId} verified on live tracking.`);
    setCallCentreAgent("Helpdesk Agent #104");
  };

  const handleSubmitCallCentreReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callCentreModalTicket) return;
    reviewGrievanceByCallCentre(callCentreModalTicket.id, callCentreNotes, callCentreAgent);
    showSuccess(`Ticket ${callCentreModalTicket.ticketId} escalated to Stage 3 (Call Centre/Officer Review).`);
    setCallCentreModalTicket(null);
  };

  const handleOpenAssignModal = (t: GrievanceTicket) => {
    setAssignModalTicket(t);
    setAssignedOfficerName(t.assignedOfficer || "G. Vijay");
    setOfficerDepartment("District Sand Grievance Cell");
    setAssignRemarks("Immediate site inspection and transport verification assigned.");
  };

  const handleSubmitAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTicket || !assignedOfficerName.trim()) {
      showError("Please specify officer name.");
      return;
    }
    assignGrievanceOfficer(assignModalTicket.id, assignedOfficerName, officerDepartment, assignRemarks);
    showSuccess(`Ticket ${assignModalTicket.ticketId} delegated to ${assignedOfficerName} (Stage 4).`);
    setAssignModalTicket(null);
  };

  const handleOpenActionTakenModal = (t: GrievanceTicket) => {
    setActionTakenModalTicket(t);
    setActionDetails(
      t.actionTakenDetails ||
        `Inspected weighbridge log & GPS telematics. Coordinated with transporter to rectify delivery issue.`
    );
    setActionOfficer(t.assignedOfficer || "Field Enforcement Officer");
    setRemedyType("Field Remediation & Correction");
  };

  const handleSubmitActionTaken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTakenModalTicket || !actionDetails.trim()) {
      showError("Please enter action taken details.");
      return;
    }
    recordGrievanceActionTaken(actionTakenModalTicket.id, actionDetails, actionOfficer, remedyType);
    showSuccess(`Action Taken recorded for Ticket ${actionTakenModalTicket.ticketId} (Stage 5).`);
    setActionTakenModalTicket(null);
  };

  const handleOpenResolveModal = (t: GrievanceTicket) => {
    setResolveModalTicket(t);
    setResolutionRemarks(
      t.resolutionRemarks ||
        `Investigation completed. Remedial dispatch/refund executed. Generated customer confirmation OTP.`
    );
    setResolveRemedy("Resolution Executed");
  };

  const handleSubmitResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalTicket || !resolutionRemarks.trim()) {
      showError("Please enter resolution remarks.");
      return;
    }
    resolveGrievance(resolveModalTicket.id, resolutionRemarks, resolveRemedy);
    showSuccess(
      `Ticket ${resolveModalTicket.ticketId} marked Resolved (Stage 6). Confirmation OTP sent to citizen mobile!`
    );
    setResolveModalTicket(null);
  };

  const handleOpenConfirmModal = (t: GrievanceTicket) => {
    setConfirmModalTicket(t);
    setCustomerOtpInput(t.customerOtp || "1234");
    setFeedbackRating(5);
    setFeedbackNotes("Complaint resolved satisfactorily. Sand consignment received with verified weighment.");
    setIsCustomerSatisfied(true);
  };

  const handleSubmitCustomerConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModalTicket) return;
    const result = confirmGrievanceByCustomer(
      confirmModalTicket.id,
      customerOtpInput,
      feedbackRating,
      feedbackNotes,
      isCustomerSatisfied
    );
    if (result.success) {
      showSuccess(result.message);
      setConfirmModalTicket(null);
    } else {
      showError(result.message);
    }
  };

  const handleOpenRespondModal = (t: GrievanceTicket) => {
    setRespondModalTicket(t);
    setResponseMessage("");
    setResponseAuthor("Desk Officer");
    setIsInternalNote(false);
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondModalTicket || !responseMessage.trim()) {
      showError("Please enter response message.");
      return;
    }
    addGrievanceCommunication(respondModalTicket.id, responseMessage, responseAuthor, "Desk Officer", isInternalNote);
    showSuccess(`Message appended to communication log of Ticket ${respondModalTicket.ticketId}`);
    setRespondModalTicket(null);
  };

  const handleOpenEscalateModal = (t: GrievanceTicket) => {
    setEscalateModalTicket(t);
    setEscalationLevel("District Collector Office (Level 2 SLA Breach)");
    setEscalationReason("Resolution exceeded SLA timeline or involve high-value mineral diversion dispute.");
  };

  const handleSubmitEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateModalTicket || !escalationReason.trim()) {
      showError("Please state escalation reason.");
      return;
    }
    escalateGrievance(escalateModalTicket.id, escalationLevel, escalationReason);
    showSuccess(`Ticket ${escalateModalTicket.ticketId} escalated to ${escalationLevel}.`);
    setEscalateModalTicket(null);
  };

  const handleOpenReopenModal = (t: GrievanceTicket) => {
    setReopenModalTicket(t);
    setReopenReasonText("Customer reported recurring issue / insufficient resolution.");
  };

  const handleSubmitReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenModalTicket || !reopenReasonText.trim()) {
      showError("Please enter reason for reopening.");
      return;
    }
    reopenGrievance(reopenModalTicket.id, reopenReasonText);
    showSuccess(`Ticket ${reopenModalTicket.ticketId} reopened with fresh 24h SLA.`);
    setReopenModalTicket(null);
  };

  // Tabs for the view
  const tabsList: TabItem[] = [
    {
      key: "registry",
      label: `Grievance Registry (${filteredGrievances.length})`,
      icon: LifeBuoy,
    },
    {
      key: "stages",
      label: `7-Stage Lifecycle Board (${totalCount})`,
      icon: SlidersHorizontal,
    },
    {
      key: "escalated",
      label: `SLA Critical & Escalated (${escalatedCount})`,
      icon: AlertTriangle,
    },
    {
      key: "closed",
      label: `Citizen Confirmed & Archive (${resolvedCount})`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="text-primary" size={26} />
            Citizen Grievance & Complaint Redressal Module
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            End-to-End 7-Stage Redressal Guarantee: Customer → Complaint Registration → Call Centre/Officer → Assigned → Action Taken → Resolved → Customer Confirmation
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportToExcel(exportCols, filteredGrievances, "SMMS_Grievance_Registry")}
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => exportToPDF(exportCols, filteredGrievances, "SMMS_Grievance_Registry", "Grievance / Helpdesk")}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate(routes.raiseGrievance.path)}
          >
            Register Complaint
          </Button>
        </div>
      </div>

      {/* ── 7-Stage Visual Interactive Pipeline Banner ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Statutory 7-Stage Complaint Flow Pipeline
            </span>
            <span className="text-[11px] text-slate-500">
              (Click any stage to filter active cases)
            </span>
          </div>
          {selectedStageFilter !== "All" && (
            <button
              onClick={() => setSelectedStageFilter("All")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Reset Stage Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.values(COMPLAINT_STAGES).map((stg) => {
            const count = stageCounts[stg.stageNumber] || 0;
            const isSelected = selectedStageFilter === stg.stageNumber;
            return (
              <button
                key={stg.stageNumber}
                type="button"
                onClick={() =>
                  setSelectedStageFilter(isSelected ? "All" : stg.stageNumber)
                }
                className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary"
                    : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    STAGE {stg.stageNumber}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      count > 0
                        ? "bg-primary text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {stg.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {stg.actorRole}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 9 Statutory Categories Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-primary" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Statutory Complaint Categories (9 Areas)
            </span>
          </div>
          {selectedCategoryFilter !== "All" && (
            <button
              onClick={() => setSelectedCategoryFilter("All")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter("All")}
            className={`px-3 py-1.5 rounded-lg border font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedCategoryFilter === "All"
                ? "bg-primary text-white border-primary"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            All Categories ({totalCount})
          </button>
          {COMPLAINT_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg border font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Grievances</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Across all 9 statutory categories</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Triage & Action</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{activeCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Stages 1 to 5 in progress</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">SLA Critical / Escalated</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{escalatedCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Escalated to District Collector</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved & Confirmed</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100}% customer closure rate
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* ── Main Tabbed View ── */}
      <Tabs
        tabs={tabsList}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {/* ── Tab Content: Grievance Registry ── */}
      {activeTab === "registry" && (
        <Card
          title="Citizen Complaint & 7-Stage Redressal Registry"
          subtitle={`Showing ${filteredGrievances.length} tickets matching filters with full multi-tier lifecycle actions`}
          icon={LifeBuoy}
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={13} />}
              onClick={() => showSuccess("Grievance registry updated.")}
            >
              Sync
            </Button>
          }
        >
          <ReusableTable
            columns={columns}
            data={filteredGrievances}
            enableRowActions
            renderRowActions={({ row }) => {
              const t = row.original;
              const stageNum = t.stage || 2;
              return (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Eye size={12} />}
                    onClick={() => setSelectedTicket(t)}
                    title="View 7-Stage Case Dossier"
                  >
                    Dossier
                  </Button>

                  {/* Stage 3: Call Centre Review */}
                  {stageNum <= 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-sky-500 text-sky-600 dark:text-sky-400 font-bold"
                      icon={<Headphones size={12} />}
                      onClick={() => handleOpenCallCentreModal(t)}
                      title="Stage 3: Review & Triage by Call Centre / Officer"
                    >
                      Review
                    </Button>
                  )}

                  {/* Stage 4: Assign Officer */}
                  {stageNum >= 2 && stageNum <= 3 && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<UserCheck size={12} />}
                      onClick={() => handleOpenAssignModal(t)}
                      title="Stage 4: Assign District / Stockyard Officer"
                    >
                      Assign
                    </Button>
                  )}

                  {/* Stage 5: Record Action Taken */}
                  {stageNum >= 4 && stageNum <= 5 && (
                    <Button
                      size="sm"
                      variant="warning"
                      icon={<ShieldCheck size={12} />}
                      onClick={() => handleOpenActionTakenModal(t)}
                      title="Stage 5: Record Action Taken / Investigation"
                    >
                      Action
                    </Button>
                  )}

                  {/* Stage 6: Resolve & Send OTP */}
                  {stageNum >= 5 && stageNum <= 6 && t.status !== "Resolved" && (
                    <Button
                      size="sm"
                      variant="success"
                      icon={<Check size={12} />}
                      onClick={() => handleOpenResolveModal(t)}
                      title="Stage 6: Resolve & Send Customer Confirmation OTP"
                    >
                      Resolve
                    </Button>
                  )}

                  {/* Stage 7: Customer Confirmation */}
                  {stageNum >= 6 && t.status !== "Customer Confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 font-bold"
                      icon={<Star size={12} />}
                      onClick={() => handleOpenConfirmModal(t)}
                      title="Stage 7: Customer Confirmation & OTP Verification"
                    >
                      Confirm OTP
                    </Button>
                  )}

                  {/* Communication & Escalation */}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<MessageSquare size={12} />}
                    onClick={() => handleOpenRespondModal(t)}
                    title="Append Communication / Note"
                  />

                  {t.status !== "Escalated to District Collector" && t.status !== "Closed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<AlertTriangle size={12} className="text-red-500" />}
                      onClick={() => handleOpenEscalateModal(t)}
                      title="Escalate to District Collector"
                    />
                  )}

                  {(t.status === "Resolved" || t.status === "Customer Confirmed" || t.status === "Closed") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<RotateCcw size={12} className="text-amber-500" />}
                      onClick={() => handleOpenReopenModal(t)}
                      title="Reopen Grievance"
                    />
                  )}
                </div>
              );
            }}
          />
        </Card>
      )}

      {/* ── Tab Content: 7-Stage Lifecycle Board ── */}
      {activeTab === "stages" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(COMPLAINT_STAGES).map((stg) => {
              const ticketsInStage = grievances.filter((g) => (g.stage || 2) === stg.stageNumber);
              return (
                <div
                  key={stg.stageNumber}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 block">
                        STAGE {stg.stageNumber}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {stg.name}
                      </h3>
                    </div>
                    <Badge variant={stg.badgeVariant} className="font-bold">
                      {ticketsInStage.length} Tickets
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stg.shortDesc}
                  </p>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {ticketsInStage.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                        No pending tickets in this stage
                      </div>
                    ) : (
                      ticketsInStage.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-primary">{t.ticketId}</span>
                            <Badge variant={priorityVariant[t.priority] || "secondary"} className="text-[9px]">
                              {t.priority}
                            </Badge>
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-white truncate">{t.customerName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            {getCategoryIcon(t.category)} {t.category}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Actor: {stg.actorRole}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Content: SLA Critical & Escalated ── */}
      {activeTab === "escalated" && (
        <Card
          title="District Collector SLA Escalation Matrix"
          subtitle="Complaints where SLA countdown is under 4 hours or where statutory regulatory escalation has triggered"
          icon={AlertTriangle}
        >
          <ReusableTable
            columns={columns}
            data={grievances.filter(
              (g) => g.status === "Escalated to District Collector" || g.slaRemainingHours <= 4
            )}
            enableRowActions
            renderRowActions={({ row }) => (
              <Button
                size="sm"
                variant="danger"
                icon={<Eye size={12} />}
                onClick={() => setSelectedTicket(row.original)}
              >
                Inspect Escalation
              </Button>
            )}
          />
        </Card>
      )}

      {/* ── Tab Content: Closed & Confirmed ── */}
      {activeTab === "closed" && (
        <Card
          title="Citizen-Confirmed Resolution Archive"
          subtitle="Closed complaints with citizen OTP verification, satisfaction ratings, and complete audit trail"
          icon={CheckCircle2}
        >
          <ReusableTable
            columns={columns}
            data={grievances.filter(
              (g) => g.status === "Resolved" || g.status === "Customer Confirmed" || g.status === "Closed"
            )}
            enableRowActions
            renderRowActions={({ row }) => (
              <Button
                size="sm"
                variant="outline"
                icon={<Eye size={12} />}
                onClick={() => setSelectedTicket(row.original)}
              >
                View Sign-off
              </Button>
            )}
          />
        </Card>
      )}

      {/* ── MODAL 1: Complete 7-Stage Case Dossier ── */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={`Grievance Case Dossier: ${selectedTicket.ticketId}`}
          subtitle={`Statutory 7-Stage Redressal File • Linked Order ${selectedTicket.bookingOrderId}`}
          size="lg"
          footer={
            <ModalFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close Dossier
              </Button>
              <Button
                variant="primary"
                icon={<MessageSquare size={14} />}
                onClick={() => {
                  const t = selectedTicket;
                  setSelectedTicket(null);
                  handleOpenRespondModal(t);
                }}
              >
                Add Communication
              </Button>
            </ModalFooter>
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* 7-Stage Stepper */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>7-Stage Redressal Progress</span>
                <span className="font-mono text-primary font-black">
                  Stage {selectedTicket.stage || 2} of 7: {selectedTicket.stageName || "Complaint Registration"}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const currStage = selectedTicket.stage || 2;
                  const isCompleted = num < currStage;
                  const isCurrent = num === currStage;
                  const stg = COMPLAINT_STAGES[num];
                  return (
                    <div
                      key={num}
                      className={`p-1.5 rounded text-center text-[10px] font-bold border transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : isCurrent
                          ? "bg-primary text-white border-primary ring-2 ring-primary/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="truncate">{stg.name}</div>
                      <div className="text-[8px] opacity-80 mt-0.5">{isCompleted ? "✓ Done" : isCurrent ? "● Active" : `Step ${num}`}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Complainant</span>
                <span className="font-bold text-slate-900 dark:text-white block">{selectedTicket.customerName}</span>
                <span className="font-mono text-[11px] text-slate-500">{selectedTicket.customerMobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-primary block flex items-center gap-1">
                  {getCategoryIcon(selectedTicket.category)} {selectedTicket.category}
                </span>
                <span className="text-[10px] text-slate-500">Via {selectedTicket.intakeChannel || "Portal"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority & SLA</span>
                <Badge variant={priorityVariant[selectedTicket.priority] || "secondary"} className="text-[10px] mt-0.5">
                  {selectedTicket.priority}
                </Badge>
                <span className="block font-mono text-[10px] text-slate-500 mt-0.5">{selectedTicket.slaRemainingHours}h left</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <Badge variant={statusVariant[selectedTicket.status] || "secondary"} className="text-[10px] mt-0.5">
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                Citizen Statement & Factual Allegation
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                {selectedTicket.description}
              </p>
            </div>

            {/* Stage Specific Evidence Boxes */}
            {selectedTicket.callCentreNotes && (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl">
                <span className="text-sky-900 dark:text-sky-300 font-bold text-xs block mb-1 flex items-center gap-1">
                  <Headphones size={13} /> Stage 3 Call Centre Triage Notes ({selectedTicket.callCentreAgent || "Helpdesk"})
                </span>
                <p className="text-sky-950 dark:text-sky-200 text-xs">{selectedTicket.callCentreNotes}</p>
              </div>
            )}

            {selectedTicket.actionTakenDetails && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                <span className="text-amber-900 dark:text-amber-300 font-bold text-xs block mb-1 flex items-center gap-1">
                  <ShieldCheck size={13} /> Stage 5 Action Taken & Remediation ({selectedTicket.actionTakenBy})
                </span>
                <p className="text-amber-950 dark:text-amber-200 text-xs">{selectedTicket.actionTakenDetails}</p>
                {selectedTicket.actionTakenAt && (
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-1">
                    Recorded at: {selectedTicket.actionTakenAt} • Remedy: {selectedTicket.remedyType}
                  </span>
                )}
              </div>
            )}

            {selectedTicket.resolutionRemarks && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <span className="text-emerald-900 dark:text-emerald-300 font-bold text-xs block mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Stage 6 Official Case Resolution Summary
                </span>
                <p className="text-emerald-950 dark:text-emerald-200 text-xs">{selectedTicket.resolutionRemarks}</p>
                {selectedTicket.customerOtp && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono block mt-1">
                    Customer Verification OTP: <strong>{selectedTicket.customerOtp}</strong>
                  </span>
                )}
              </div>
            )}

            {selectedTicket.customerConfirmationStatus && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <span className="text-indigo-900 dark:text-indigo-300 font-bold text-xs block mb-1 flex items-center gap-1">
                  <Star size={13} /> Stage 7 Citizen Confirmation Sign-Off
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">
                    Status: {selectedTicket.customerConfirmationStatus}
                  </span>
                  {selectedTicket.customerFeedbackScore && (
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[10px]">
                      ★ {selectedTicket.customerFeedbackScore} / 5 Stars
                    </span>
                  )}
                </div>
                {selectedTicket.customerFeedbackComments && (
                  <p className="text-indigo-900 dark:text-indigo-200 text-xs italic">
                    "{selectedTicket.customerFeedbackComments}"
                  </p>
                )}
              </div>
            )}

            {/* Communication History Audit Log */}
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-2">
                Official Communication & Redressal Audit Trail ({selectedTicket.communicationHistory?.length || 0} entries)
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedTicket.communicationHistory?.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      c.isInternal
                        ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span className="text-primary">{c.author} ({c.role})</span>
                      <span className="font-mono text-slate-400 text-[10px]">{c.timestamp}</span>
                    </div>
                    <p className="leading-snug">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 2: Stage 3 Call Centre Review ── */}
      {callCentreModalTicket && (
        <Modal
          isOpen={Boolean(callCentreModalTicket)}
          onClose={() => setCallCentreModalTicket(null)}
          title="Stage 3: Call Centre / Officer Review & Inbound Triage"
          subtitle={`Reviewing complaint fact sheet for Ticket ${callCentreModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitCallCentreReview} className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl space-y-1">
              <span className="font-bold text-sky-900 dark:text-sky-300 block">
                Complainant: {callCentreModalTicket.customerName} ({callCentreModalTicket.customerMobile})
              </span>
              <p className="text-sky-800 dark:text-sky-200 text-[11px]">
                {callCentreModalTicket.description}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Call Centre Agent / Officer ID *
              </label>
              <input
                type="text"
                value={callCentreAgent}
                onChange={(e) => setCallCentreAgent(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Triage & Verification Notes *
              </label>
              <textarea
                rows={3}
                value={callCentreNotes}
                onChange={(e) => setCallCentreNotes(e.target.value)}
                placeholder="Record citizen confirmation, live vehicle tracking verification, stockyard check..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setCallCentreModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<Check size={14} />}>
                Submit Triage & Escalate to Stage 3
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 3: Stage 4 Assign Officer ── */}
      {assignModalTicket && (
        <Modal
          isOpen={Boolean(assignModalTicket)}
          onClose={() => setAssignModalTicket(null)}
          title="Stage 4: Delegate Officer & Field Department"
          subtitle={`Assigning investigation officer for Ticket ${assignModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitAssign} className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsible Officer Name *
                </label>
                <input
                  type="text"
                  value={assignedOfficerName}
                  onChange={(e) => setAssignedOfficerName(e.target.value)}
                  placeholder="e.g. G. Vijaya Kumar"
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Cell *
                </label>
                <select
                  value={officerDepartment}
                  onChange={(e) => setOfficerDepartment(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="District Sand Grievance Cell">District Sand Grievance Cell</option>
                  <option value="Mines Transport & GPS Cell">Mines Transport & GPS Cell</option>
                  <option value="Weighbridge Audit Squad">Weighbridge Audit Squad</option>
                  <option value="Quality Inspection Wing">Quality Inspection Wing</option>
                  <option value="Cyber Treasury & Accounts">Cyber Treasury & Accounts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assignment Directives & Instructions
              </label>
              <textarea
                rows={3}
                value={assignRemarks}
                onChange={(e) => setAssignRemarks(e.target.value)}
                placeholder="Enter specific field directives, weighbridge re-calibration or telematics audit instructions..."
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setAssignModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<UserCheck size={14} />}>
                Confirm Stage 4 Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 4: Stage 5 Action Taken ── */}
      {actionTakenModalTicket && (
        <Modal
          isOpen={Boolean(actionTakenModalTicket)}
          onClose={() => setActionTakenModalTicket(null)}
          title="Stage 5: Record Action Taken & Remedial Measures"
          subtitle={`Logging field investigation findings for Ticket ${actionTakenModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitActionTaken} className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Action Taken By (Officer / Inspector) *
                </label>
                <input
                  type="text"
                  value={actionOfficer}
                  onChange={(e) => setActionOfficer(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remedy Category *
                </label>
                <select
                  value={remedyType}
                  onChange={(e) => setRemedyType(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="Field Remediation & Fleet Coordination">Field Remediation & Fleet Coordination</option>
                  <option value="Weighbridge Shortage Compensation">Weighbridge Shortage Compensation</option>
                  <option value="Driver Disciplinary Penalty">Driver Disciplinary Penalty</option>
                  <option value="Consignment Replacement">Consignment Replacement (Quality Issue)</option>
                  <option value="Treasury Refund Execution">Treasury Refund Execution</option>
                  <option value="OTP Re-trigger via DLT Route">OTP Re-trigger via DLT Route</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Action Taken Details & Investigation Report *
              </label>
              <textarea
                rows={4}
                value={actionDetails}
                onChange={(e) => setActionDetails(e.target.value)}
                placeholder="Document step-by-step resolution findings: GPS route logs, re-weighment slip numbers, driver counseling..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setActionTakenModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="warning" type="submit" icon={<ShieldCheck size={14} />}>
                Record Action (Stage 5)
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 5: Stage 6 Resolve Grievance & Send OTP ── */}
      {resolveModalTicket && (
        <Modal
          isOpen={Boolean(resolveModalTicket)}
          onClose={() => setResolveModalTicket(null)}
          title="Stage 6: Resolve Complaint & Trigger Customer OTP"
          subtitle={`Finalizing resolution for Ticket ${resolveModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitResolve} className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Statutory Citizen Confirmation Security:
              </span>
              <p className="text-emerald-800 dark:text-emerald-200 text-[11px]">
                Upon resolving, a 4-digit confirmation token will be sent via SMS to {resolveModalTicket.customerMobile}. The ticket enters Stage 7 awaiting citizen OTP sign-off.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Summary Remarks *
              </label>
              <textarea
                rows={4}
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                placeholder="State the final closure decision, compensation provided, or grievance outcome..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setResolveModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="success" type="submit" icon={<Check size={14} />}>
                Mark Resolved & Dispatch OTP (Stage 6)
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 6: Stage 7 Customer Confirmation & OTP ── */}
      {confirmModalTicket && (
        <Modal
          isOpen={Boolean(confirmModalTicket)}
          onClose={() => setConfirmModalTicket(null)}
          title="Stage 7: Customer Confirmation & OTP Sign-off"
          subtitle={`Verifying citizen satisfaction for Ticket ${confirmModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitCustomerConfirmation} className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 dark:text-indigo-300">
                  Citizen Mobile: {confirmModalTicket.customerMobile}
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black text-xs">
                  Expected OTP: {confirmModalTicket.customerOtp || "1234"}
                </span>
              </div>
              <p className="text-indigo-800 dark:text-indigo-200 text-[11px]">
                Enter the 4-digit SMS OTP provided by the complainant to certify satisfactory closure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer 4-Digit OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={customerOtpInput}
                  onChange={(e) => setCustomerOtpInput(e.target.value)}
                  placeholder="e.g. 7841"
                  className={`${inputBase} ${inputNormal} font-mono font-bold text-sm tracking-widest text-center`}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Satisfaction Rating (1 to 5 Stars) *
                </label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className={`${inputBase} ${inputNormal} font-bold`}
                >
                  <option value={5}>★★★★★ 5 Stars (Extremely Satisfied)</option>
                  <option value={4}>★★★★☆ 4 Stars (Satisfied)</option>
                  <option value={3}>★★★☆☆ 3 Stars (Neutral)</option>
                  <option value={2}>★★☆☆☆ 2 Stars (Unsatisfied)</option>
                  <option value={1}>★☆☆☆☆ 1 Star (Disputed / Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Citizen Confirmation Feedback *
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                id="satisfiedCheck"
                checked={isCustomerSatisfied}
                onChange={(e) => setIsCustomerSatisfied(e.target.checked)}
                className="rounded text-primary"
              />
              <label htmlFor="satisfiedCheck" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                Citizen accepts resolution and approves final ticket closure (Stage 7)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setConfirmModalTicket(null)}>
                Cancel
              </Button>
              <Button
                variant={isCustomerSatisfied ? "success" : "danger"}
                type="submit"
                icon={<Check size={14} />}
                className="font-bold"
              >
                {isCustomerSatisfied ? "Confirm & Close Ticket (Stage 7)" : "Mark Disputed & Return"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 7: Communication Note ── */}
      {respondModalTicket && (
        <Modal
          isOpen={Boolean(respondModalTicket)}
          onClose={() => setRespondModalTicket(null)}
          title="Append Communication Message"
          subtitle={`Adding entry to audit timeline of ${respondModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitResponse} className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Author Name / ID *
                </label>
                <input
                  type="text"
                  value={responseAuthor}
                  onChange={(e) => setResponseAuthor(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                  required
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Internal Department Note (Invisible to Citizen)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Communication Message *
              </label>
              <textarea
                rows={4}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type communication message or field update..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setRespondModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<Send size={14} />}>
                Post Communication
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 8: Escalate to District Collector ── */}
      {escalateModalTicket && (
        <Modal
          isOpen={Boolean(escalateModalTicket)}
          onClose={() => setEscalateModalTicket(null)}
          title="Escalate Grievance to District Collector"
          subtitle={`High-Level Statutory Escalation for Ticket ${escalateModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitEscalate} className="space-y-4 pt-1 text-xs">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-1">
              <span className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Statutory Governance Escalation:
              </span>
              <p className="text-red-800 dark:text-red-200 text-[11px]">
                This ticket will be marked on the District Collector's Executive Monitoring Dashboard with mandatory 24-hour compliance response.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Escalation Authority Level *
              </label>
              <select
                value={escalationLevel}
                onChange={(e) => setEscalationLevel(e.target.value)}
                className={`${inputBase} ${inputNormal} font-semibold`}
              >
                <option value="District Collector Office (Level 2 SLA Breach)">District Collector Office (Level 2 SLA Breach)</option>
                <option value="Directorate of Geology & Mining (State Head Office)">Directorate of Geology & Mining (State Head Office)</option>
                <option value="Mineral Police Enforcement Taskforce">Mineral Police Enforcement Taskforce</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Escalation Ground & Facts *
              </label>
              <textarea
                rows={4}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="State the reasons: unresolved delay, weighbridge fraud, illegal surcharge..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setEscalateModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" icon={<AlertTriangle size={14} />}>
                Execute Regulatory Escalation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 9: Reopen Grievance ── */}
      {reopenModalTicket && (
        <Modal
          isOpen={Boolean(reopenModalTicket)}
          onClose={() => setReopenModalTicket(null)}
          title="Reopen Grievance Ticket"
          subtitle={`Reactivating investigation for Ticket ${reopenModalTicket.ticketId}`}
          size="md"
          footer={null}
        >
          <form onSubmit={handleSubmitReopen} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Reopening *
              </label>
              <textarea
                rows={4}
                value={reopenReasonText}
                onChange={(e) => setReopenReasonText(e.target.value)}
                placeholder="Describe citizen feedback or why initial resolution was deficient..."
                className={`${inputBase} ${inputNormal}`}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setReopenModalTicket(null)}>
                Cancel
              </Button>
              <Button variant="warning" type="submit" icon={<RotateCcw size={14} />}>
                Reopen Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GrievanceTicketList;
