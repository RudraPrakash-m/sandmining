import React, { createContext, useContext, useState, useMemo } from "react";
import CryptoJS from "crypto-js";
import type {
  UserRole,
  MiningReach,
  MiningPermit,
  ExcavationRecord,
  Stockyard,
  StockLedgerEntry,
  WeighbridgeRecord,
  Vehicle,
  Driver,
  CitizenUser,
  SandBooking,
  PaymentTransaction,
  DispatchTrip,
  DigitalEPass,
  VehicleTelemetry,
  DeliveryConfirmation,
  EnforcementAlert,
  GrievanceTicket,
  GrievanceCategory,
  GrievancePriority,
  AuditLogItem,
  SystemUser,
  AllocationRecord,
  DriverNotification,
  EligibilityChecklist,
} from "../types";
import {
  INITIAL_REACHES,
  INITIAL_PERMITS,
  INITIAL_EXCAVATIONS,
  INITIAL_STOCKYARDS,
  INITIAL_STOCK_LEDGER,
  INITIAL_WEIGHBRIDGES,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_CITIZENS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_DISPATCHES,
  INITIAL_EPASSES,
  INITIAL_TELEMETRY,
  INITIAL_DELIVERIES,
  INITIAL_ALERTS,
  INITIAL_GRIEVANCES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ALLOCATIONS,
  INITIAL_DRIVER_NOTIFICATIONS,
} from "../mock-data/mockSmmsDatabase";
import type { CustomerSmsNotification, SmsStageKey, SmsStageMetadata } from "@/features/notifications/types";
import { INITIAL_CUSTOMER_SMS } from "@/features/notifications/mock-data/mockSmsData";
import { buildCustomerSms } from "@/features/notifications/services/smsNotificationTemplates";
import type { OrderStatus, StatusHistoryEntry } from "@/features/order-lifecycle/types";

interface SandMiningContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  reaches: MiningReach[];
  permits: MiningPermit[];
  excavations: ExcavationRecord[];
  stockyards: Stockyard[];
  stockLedger: StockLedgerEntry[];
  weighbridges: WeighbridgeRecord[];
  vehicles: Vehicle[];
  drivers: Driver[];
  citizens: CitizenUser[];
  bookings: SandBooking[];
  payments: PaymentTransaction[];
  dispatches: DispatchTrip[];
  epasses: DigitalEPass[];
  telemetry: VehicleTelemetry[];
  deliveries: DeliveryConfirmation[];
  alerts: EnforcementAlert[];
  grievances: GrievanceTicket[];
  auditLogs: AuditLogItem[];
  systemUsers: SystemUser[];
  allocations: AllocationRecord[];
  driverNotifications: DriverNotification[];
  toggleUserStatus: (id: string) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  runDemoStep: (step: number) => void;
  resetSimulationData: () => void;

  // 7-Stage End-to-End Inventory Flow Metrics
  inventoryFlow: {
    totalApprovedQuotaMt: number;
    totalExtractedMt: number;
    totalAvailableStockMt: number;
    totalReservedMt: number;
    totalDispatchedMt: number;
    totalDeliveredMt: number;
    totalBalanceQuotaMt: number;
    extractionPercentage: number;
    dispatchPercentage: number;
    deliveryPercentage: number;
  };

  // Domain Actions
  addReach: (reach: Omit<MiningReach, "id">) => void;
  updateReachStatus: (id: string, status: MiningReach["status"]) => void;
  createPermit: (permit: Omit<MiningPermit, "id">) => void;
  updatePermitStatus: (id: string, status: MiningPermit["status"]) => void;
  renewPermitQuota: (id: string, additionalQuotaMt: number, newEndDate: string) => void;
  addExcavation: (excavation: Omit<ExcavationRecord, "id">) => void;
  addStockLedgerEntry: (entry: Omit<StockLedgerEntry, "id">) => void;
  captureWeight: (record: Omit<WeighbridgeRecord, "id">) => void;
  registerVehicle: (veh: Omit<Vehicle, "id">) => void;
  toggleBlacklistVehicle: (id: string, reason?: string) => void;
  addDriver: (drv: Omit<Driver, "id">) => void;
  registerCitizen: (cit: Omit<CitizenUser, "id">) => string;
  createBooking: (bkg: Omit<SandBooking, "id" | "orderId" | "createdAt" | "bookingStatus" | "paymentStatus">) => string;
  processPayment: (bookingId: string, paymentMode: PaymentTransaction["paymentMode"]) => boolean;
  assignVehicleAndDispatch: (bookingId: string, vehicleNumber: string, driverName: string) => boolean;
  confirmDelivery: (
    bookingId: string,
    enteredOtp: string,
    signatureCaptured?: boolean,
    metadata?: {
      photoUrl?: string;
      geoCoordinates?: string;
      remarks?: string;
      customerVerified?: boolean;
    }
  ) => boolean;
  updateDeliveryRemarks: (deliveryIdOrBookingId: string, remarks: string, author?: string) => boolean;
  createAlert: (alert: Omit<EnforcementAlert, "id">) => void;
  updateAlertStatus: (id: string, status: EnforcementAlert["actionStatus"]) => void;
  assignEnforcementOfficer: (id: string, officerName: string) => void;
  investigateEnforcementAlert: (id: string, notes: string, status?: EnforcementAlert["actionStatus"], penaltyAmount?: number) => void;
  blockAndSeizeVehicle: (id: string, seizureOrderNumber?: string, firNumber?: string, penaltyAmount?: number) => void;
  closeEnforcementCase: (id: string, finalNotes: string, penaltyAmount?: number) => void;
  raiseGrievance: (ticket: Partial<GrievanceTicket> & { customerName: string; customerMobile: string; category: GrievanceCategory; description: string }) => GrievanceTicket;
  reviewGrievanceByCallCentre: (id: string, notes: string, callCentreAgent?: string, priority?: GrievancePriority) => void;
  updateGrievanceStatus: (id: string, status: GrievanceTicket["status"], remarks?: string) => void;
  assignGrievanceOfficer: (id: string, officerName: string, department?: string, remarks?: string) => void;
  recordGrievanceActionTaken: (id: string, actionDetails: string, actionTakenBy: string, remedyType?: string) => void;
  resolveGrievance: (id: string, resolutionRemarks: string, remedyType?: string) => void;
  confirmGrievanceByCustomer: (
    id: string,
    otp: string,
    feedbackScore?: number,
    feedbackComments?: string,
    isSatisfied?: boolean
  ) => { success: boolean; message: string };
  addGrievanceCommunication: (id: string, message: string, author?: string, role?: string, isInternal?: boolean) => void;
  escalateGrievance: (id: string, escalationLevel: string, reason: string) => void;
  reopenGrievance: (id: string, reason: string) => void;
  addUser: (user: Omit<SystemUser, "id">) => void;
  updateUserRoleAndPermissions: (id: string, role: string, permissions: string[], department?: string) => void;
  resetUserPassword: (id: string) => string;

  // Automated Vehicle Allocation Actions (TSMIV Reference)
  evaluateVehicleEligibility: (veh: Vehicle, bkg: SandBooking) => { isEligible: boolean; checklist: EligibilityChecklist; reason: string };
  getEligibleVehiclesForBooking: (bookingIdOrObj: string | SandBooking) => { vehicle: Vehicle; checklist: EligibilityChecklist; isEligible: boolean; reason: string }[];
  getFifoQueue: (district?: string) => Vehicle[];
  runAutoAllocation: (targetBookingId?: string) => { allocatedCount: number; allocations: AllocationRecord[]; message: string };
  acknowledgeDriverNotification: (notificationId: string) => void;
  moveVehicleToEndOfQueue: (vehicleNumberOrId: string, reason?: string) => void;
  reorderFifoQueue: (district?: string) => void;

  // Dedicated Vehicle Owner / Driver Actions
  driverAcceptOrder: (orderId: string, vehicleNumber?: string) => boolean;
  driverRejectOrder: (orderId: string, vehicleNumber: string, reason: string) => { reallocated: boolean; newVehicleNumber?: string; message: string };
  driverStartPickup: (orderId: string) => boolean;
  driverConfirmStockyardLoad: (orderId: string) => boolean;
  driverStartTransit: (orderId: string) => boolean;
  driverDeliverAndVerifyOtp: (
    orderId: string,
    enteredOtp: string,
    metadata?: {
      photoUrl?: string;
      geoCoordinates?: string;
      remarks?: string;
    }
  ) => boolean;

  // Automated Notification & Customer SMS Module (Telangana SSMMS Specification)
  customerNotifications: CustomerSmsNotification[];
  dispatchCustomerSms: (
    stage: SmsStageKey,
    bookingIdOrOrderId?: string,
    overrides?: Partial<SmsStageMetadata>
  ) => CustomerSmsNotification;
  resendCustomerSms: (notificationId: string) => boolean;
  cancelBookingWithSms: (bookingIdOrOrderId: string, reason: string) => boolean;

  // Standard Order Status Lifecycle Engine (18 Stages + 6 Exceptions)
  updateOrderStatus: (
    orderIdOrBookingId: string,
    newStatus: OrderStatus,
    notes?: string,
    actorRole?: string
  ) => { success: boolean; message: string };
}

const SandMiningContext = createContext<SandMiningContextType | undefined>(undefined);

export const SandMiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>("Super Admin");
  const [reaches, setReaches] = useState<MiningReach[]>(INITIAL_REACHES);
  const [permits, setPermits] = useState<MiningPermit[]>(INITIAL_PERMITS);
  const [excavations, setExcavations] = useState<ExcavationRecord[]>(INITIAL_EXCAVATIONS);
  const [stockyards, setStockyards] = useState<Stockyard[]>(INITIAL_STOCKYARDS);
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(INITIAL_STOCK_LEDGER);
  const [weighbridges, setWeighbridges] = useState<WeighbridgeRecord[]>(INITIAL_WEIGHBRIDGES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [citizens, setCitizens] = useState<CitizenUser[]>(INITIAL_CITIZENS);
  const [bookings, setBookings] = useState<SandBooking[]>(INITIAL_BOOKINGS);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [dispatches, setDispatches] = useState<DispatchTrip[]>(INITIAL_DISPATCHES);
  const [epasses, setEpasses] = useState<DigitalEPass[]>(INITIAL_EPASSES);
  const [telemetry, setTelemetry] = useState<VehicleTelemetry[]>(INITIAL_TELEMETRY);
  const [deliveries, setDeliveries] = useState<DeliveryConfirmation[]>(INITIAL_DELIVERIES);
  const [alerts, setAlerts] = useState<EnforcementAlert[]>(INITIAL_ALERTS);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>(INITIAL_GRIEVANCES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [allocations, setAllocations] = useState<AllocationRecord[]>(INITIAL_ALLOCATIONS);
  const [driverNotifications, setDriverNotifications] = useState<DriverNotification[]>(INITIAL_DRIVER_NOTIFICATIONS);
  const [customerNotifications, setCustomerNotifications] = useState<CustomerSmsNotification[]>(INITIAL_CUSTOMER_SMS);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    {
      id: "USR-001",
      employeeId: "CG-MIN-001",
      fullName: "Rajeshwar Sharma",
      department: "Directorate of Geology & Mining",
      email: "r.sharma@mining.cg.gov.in",
      mobile: "+91 98261 01122",
      role: "State Mining Administrator",
      designation: "Joint Director of Geology & Mining",
      district: "Raipur",
      mandal: "Raipur Urban",
      mfaEnabled: true,
      status: "Active",
      lastLogin: "2026-03-09 14:30",
      loginAttempts: 0,
      permissions: ["SUPER_ADMIN", "APPROVE_REACH", "ISSUE_PERMIT", "OVERRIDE_TARIFF", "SYSTEM_CONFIG"],
    },
    {
      id: "USR-002",
      employeeId: "CG-MIN-002",
      fullName: "Priyanka Soni",
      department: "District Mining Office",
      email: "p.soni@mining.cg.gov.in",
      mobile: "+91 94251 44501",
      role: "District Mining Officer",
      designation: "DMO Bilaspur",
      district: "Bilaspur",
      mandal: "Bilaspur",
      mfaEnabled: true,
      status: "Active",
      lastLogin: "2026-03-09 11:20",
      loginAttempts: 0,
      permissions: ["INSPECT_SITES", "VERIFY_WEIGHMENT", "ISSUE_NOTICES", "APPROVE_EXCAVATION"],
    },
    {
      id: "USR-003",
      employeeId: "CG-MIN-003",
      fullName: "P. Chandrakar",
      department: "Enforcement Flying Squad",
      email: "p.chandrakar@enforcement.cg.gov.in",
      mobile: "+91 98270 99112",
      role: "Flying Squad Officer",
      designation: "Mining Inspector (Taskforce)",
      district: "Raipur",
      mandal: "Arang",
      mfaEnabled: true,
      status: "Active",
      lastLogin: "2026-03-09 15:45",
      loginAttempts: 0,
      permissions: ["SEIZE_VEHICLE", "ISSUE_CHALLAN", "CHECKPOST_INSPECT", "LOG_VIOLATION"],
    },
    {
      id: "USR-004",
      employeeId: "CG-MIN-004",
      fullName: "K. Raghunath",
      department: "Citizen Grievance & Helpdesk",
      email: "k.raghunath@helpdesk.cg.gov.in",
      mobile: "+91 97520 33411",
      role: "Helpdesk Desk Officer",
      designation: "Grievance Officer Grade II",
      district: "Durg",
      mandal: "Durg",
      mfaEnabled: false,
      status: "Active",
      lastLogin: "2026-03-08 17:10",
      loginAttempts: 0,
      permissions: ["MANAGE_TICKETS", "RESPOND_CITIZENS", "ESCALATE_COLLECTOR"],
    },
    {
      id: "USR-005",
      employeeId: "CG-MIN-005",
      fullName: "G. Vijay Kumar",
      department: "Transport & Logistics Control",
      email: "g.vijay@transport.cg.gov.in",
      mobile: "+91 98491 55099",
      role: "Weighbridge Operator",
      designation: "Senior Weighbridge In-charge",
      district: "Korba",
      mandal: "Katghora",
      mfaEnabled: true,
      status: "Active",
      lastLogin: "2026-03-09 08:30",
      loginAttempts: 0,
      permissions: ["PRINT_WB_SLIP", "CAPTURE_TARE", "GENERATE_EPASS"],
    },
    {
      id: "USR-006",
      employeeId: "CG-MIN-006",
      fullName: "Rakesh Dewangan",
      department: "Finance & Accounts",
      email: "r.dewangan@treasury.cg.gov.in",
      mobile: "+91 94240 88712",
      role: "Finance & Audit Officer",
      designation: "Assistant Accounts Officer",
      district: "Rajnandgaon",
      mandal: "Rajnandgaon",
      mfaEnabled: true,
      status: "Suspended",
      lastLogin: "2026-02-28 16:00",
      loginAttempts: 3,
      permissions: ["RECONCILE_REVENUE", "AUDIT_ROYALTY", "EXPORT_MIS"],
    },
    {
      id: "USR-007",
      employeeId: "CG-CALL-001",
      fullName: "Pooja Sharma",
      department: "Citizen Call Centre & Tele-Desk (1800-233-SAND)",
      email: "p.sharma@callcentre.cg.gov.in",
      mobile: "+91 98271 22900",
      role: "Call Centre",
      designation: "Senior Call Centre Executive",
      district: "Raipur",
      mandal: "Raipur Urban",
      mfaEnabled: true,
      status: "Active",
      lastLogin: "2026-10-03 17:30",
      loginAttempts: 0,
      permissions: ["SEARCH_CONSIGNMENT", "LOG_DELIVERY_REMARKS", "REGISTER_COMPLAINT", "ESCALATE_DELAY"],
    },
  ]);

  const toggleUserStatus = (id: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const newStatus = u.status === "Active" ? "Inactive" : "Active";
        addAudit("Masters", "UPDATE", u.employeeId, `Status: ${u.status}`, `Status: ${newStatus}`, `User status changed by admin`);
        return { ...u, status: newStatus };
      })
    );
  };

  const addUser = (userData: Omit<SystemUser, "id">) => {
    const id = `USR-00${systemUsers.length + 1}`;
    const newUser: SystemUser = { ...userData, id };
    setSystemUsers((prev) => [newUser, ...prev]);
    addAudit("Masters", "CREATE", userData.employeeId, "None", userData.role, `User account created for ${userData.fullName}`);
  };

  const updateUserRoleAndPermissions = (
    id: string,
    role: string,
    permissions: string[],
    department?: string
  ) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        addAudit(
          "Masters",
          "UPDATE",
          u.employeeId,
          `Role: ${u.role}`,
          `Role: ${role}`,
          `Role & permissions updated for ${u.fullName}`
        );
        return {
          ...u,
          role,
          permissions,
          department: department || u.department,
        };
      })
    );
  };

  const resetUserPassword = (id: string) => {
    const tempToken = `TMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        addAudit("Masters", "UPDATE", u.employeeId, "Password: Set", "Password: Reset Required", `Temporary access token generated`);
        return { ...u, status: "Password Reset Required", loginAttempts: 0 };
      })
    );
    return tempToken;
  };

  const resetSimulationData = () => {
    setReaches(INITIAL_REACHES);
    setPermits(INITIAL_PERMITS);
    setExcavations(INITIAL_EXCAVATIONS);
    setStockyards(INITIAL_STOCKYARDS);
    setStockLedger(INITIAL_STOCK_LEDGER);
    setWeighbridges(INITIAL_WEIGHBRIDGES);
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setCitizens(INITIAL_CITIZENS);
    setBookings(INITIAL_BOOKINGS);
    setPayments(INITIAL_PAYMENTS);
    setDispatches(INITIAL_DISPATCHES);
    setEpasses(INITIAL_EPASSES);
    setTelemetry(INITIAL_TELEMETRY);
    setDeliveries(INITIAL_DELIVERIES);
    setAlerts(INITIAL_ALERTS);
    setGrievances(INITIAL_GRIEVANCES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCustomerNotifications(INITIAL_CUSTOMER_SMS);
    setDemoStep(1);
  };

  const addAudit = (
    module: AuditLogItem["module"],
    action: AuditLogItem["action"],
    recordId: string,
    oldValue: string,
    newValue: string,
    remarks: string,
    gpsLocation?: string,
    ipAddress = "10.42.18.99",
    deviceInfo = "Chrome v128 on Windows 11 (Government Secure Enclave)"
  ) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const hashSignature = `SHA256:${CryptoJS.SHA256(`${recordId}|${action}|${oldValue}|${newValue}|${timestamp}|${activeRole}`).toString()}`;

    const newLog: AuditLogItem = {
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
      userName: activeRole,
      userRole: activeRole,
      module,
      action,
      recordId,
      oldValue,
      newValue,
      previousStatus: oldValue,
      newStatus: newValue,
      ipAddress,
      deviceInfo,
      gpsLocation,
      gpsCoordinates: gpsLocation ? gpsLocation.split("(")[0]?.trim() : undefined,
      remarks,
      hashSignature,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addReach = (reachData: Omit<MiningReach, "id">) => {
    const id = `RCH-00${reaches.length + 1}`;
    const newReach: MiningReach = { ...reachData, id };
    setReaches((prev) => [newReach, ...prev]);
    addAudit("Mining Reach", "CREATE", newReach.reachId, "None", `Created Reach: ${newReach.reachName}`, "New sand mining reach added");
  };

  const updateReachStatus = (id: string, status: MiningReach["status"]) => {
    setReaches((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          addAudit("Mining Reach", "APPROVE", r.reachId, `Status: ${r.status}`, `Status: ${status}`, "Mining reach status updated");
          return { ...r, status };
        }
        return r;
      })
    );
  };

  const createPermit = (permitData: Omit<MiningPermit, "id">) => {
    const id = `PRM-00${permits.length + 1}`;
    const newPermit: MiningPermit = { ...permitData, id };
    setPermits((prev) => [newPermit, ...prev]);
    addAudit("Permits", "CREATE", newPermit.permitNumber, "None", `Issued to ${newPermit.holderAgency}`, "Mining lease permit issued");
  };

  const updatePermitStatus = (id: string, status: MiningPermit["status"]) => {
    setPermits((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          addAudit("Permits", "UPDATE", p.permitNumber, p.status, status, `Permit status updated to ${status}`);
          return { ...p, status };
        }
        return p;
      })
    );
  };

  const renewPermitQuota = (id: string, additionalQuotaMt: number, newEndDate: string) => {
    setPermits((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const approved = p.approvedQuantityMt + additionalQuotaMt;
          const remaining = p.remainingQuotaMt + additionalQuotaMt;
          addAudit("Permits", "UPDATE", p.permitNumber, `${p.approvedQuantityMt} MT`, `${approved} MT`, `Permit quota renewed (+${additionalQuotaMt} MT) until ${newEndDate}`);
          return {
            ...p,
            approvedQuantityMt: approved,
            remainingQuotaMt: remaining,
            endDate: newEndDate,
            status: "Renewed" as const,
          };
        }
        return p;
      })
    );
  };

  const addStockLedgerEntry = (entry: Omit<StockLedgerEntry, "id">) => {
    const id = `LED-${Date.now()}`;
    const newEntry: StockLedgerEntry = { ...entry, id };
    setStockLedger((prev) => [newEntry, ...prev]);
  };

  // Add excavation -> updates permit remaining quota & updates stockyard stock & creates ledger entry!
  const addExcavation = (excData: Omit<ExcavationRecord, "id">) => {
    const id = `EXC-00${excavations.length + 1}`;
    const newExc: ExcavationRecord = { ...excData, id };
    setExcavations((prev) => [newExc, ...prev]);

    // Deduct from Permit
    setPermits((prev) =>
      prev.map((p) => {
        if (p.reachId === excData.reachId) {
          const newExcTotal = p.excavatedQuantityMt + excData.excavatedQuantityMt;
          const newRemaining = Math.max(0, p.approvedQuantityMt - newExcTotal);
          return { ...p, excavatedQuantityMt: newExcTotal, remainingQuotaMt: newRemaining };
        }
        return p;
      })
    );

    // Update reach excavated quantity
    setReaches((prev) =>
      prev.map((r) => {
        if (r.id === excData.reachId || r.reachId === excData.reachId) {
          return { ...r, excavatedQuantityMt: r.excavatedQuantityMt + excData.excavatedQuantityMt };
        }
        return r;
      })
    );

    // Add into stockyard
    const reachObj = reaches.find((r) => r.id === excData.reachId || r.reachId === excData.reachId);
    const targetStockyardId = reachObj?.linkedStockyardId || "STK-001";

    setStockyards((prev) =>
      prev.map((s) => {
        if (s.id === targetStockyardId) {
          const updatedReceived = s.receivedMt + excData.excavatedQuantityMt;
          const updatedClosing = s.closingStockMt + excData.excavatedQuantityMt;
          const updatedAvailable = s.availableQuantityMt + excData.excavatedQuantityMt;

          // Add to ledger
          const ledgerEntry: StockLedgerEntry = {
            id: `LED-${Date.now()}`,
            dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
            stockyardId: s.id,
            stockyardName: s.name,
            transactionType: "INWARD_EXCAVATION",
            quantityMt: excData.excavatedQuantityMt,
            previousStockMt: s.closingStockMt,
            newStockMt: updatedClosing,
            referenceId: id,
            authorizedBy: activeRole,
            remarks: `Excavated at ${excData.reachName} by ${excData.operatorName}`,
          };
          setStockLedger((lPrev) => [ledgerEntry, ...lPrev]);

          return {
            ...s,
            receivedMt: updatedReceived,
            closingStockMt: updatedClosing,
            availableQuantityMt: updatedAvailable,
          };
        }
        return s;
      })
    );

    addAudit("Excavation", "CREATE", id, "0 MT", `${excData.excavatedQuantityMt} MT`, `Excavation logged at ${excData.reachName}`);
  };

  const captureWeight = (record: Omit<WeighbridgeRecord, "id">) => {
    const id = `WBR-00${weighbridges.length + 1}`;
    const newRecord: WeighbridgeRecord = { ...record, id };
    setWeighbridges((prev) => [newRecord, ...prev]);
    addAudit("Weighbridge", "CREATE", newRecord.slipNumber, "0 kg", `Gross: ${record.grossWeightKg}kg, Net: ${record.netSandWeightMt}MT`, "Weight measurement recorded");
  };

  const registerVehicle = (veh: Omit<Vehicle, "id">) => {
    const id = `VEH-00${vehicles.length + 1}`;
    const newVeh: Vehicle = { ...veh, id };
    setVehicles((prev) => [newVeh, ...prev]);
  };

  const toggleBlacklistVehicle = (id: string, reason?: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextState = !v.isBlacklisted;
          addAudit("Vehicle", "SUSPEND", v.vehicleNumber, `Blacklisted: ${v.isBlacklisted}`, `Blacklisted: ${nextState}`, reason || "Enforcement action");
          return {
            ...v,
            isBlacklisted: nextState,
            status: nextState ? "Blacklisted" : "Verified",
            blacklistReason: nextState ? reason || "Blacklisted by Enforcement Authority" : undefined,
          };
        }
        return v;
      })
    );
  };

  const addDriver = (drv: Omit<Driver, "id">) => {
    const id = `DRV-00${drivers.length + 1}`;
    setDrivers((prev) => [{ ...drv, id }, ...prev]);
  };

  const dispatchCustomerSms = (
    stage: SmsStageKey,
    bookingIdOrOrderId?: string,
    overrides?: Partial<SmsStageMetadata>
  ): CustomerSmsNotification => {
    let booking = bookings.find(
      (b) => b.id === bookingIdOrOrderId || b.orderId === bookingIdOrOrderId
    );
    if (!booking && allocations.length > 0) {
      const alloc = allocations.find((a) => a.orderId === bookingIdOrOrderId);
      if (alloc) {
        booking = bookings.find((b) => b.id === alloc.bookingId || b.orderId === alloc.orderId);
      }
    }

    const recipientName = overrides?.recipientName || booking?.customerName || "Narayana Sahu";
    const recipientMobile = overrides?.recipientMobile || booking?.customerMobile || "+91 98260 12345";
    const recipientRole = overrides?.recipientRole || booking?.customerType || "Individual Citizen (Home Construction)";
    const orderId = overrides?.orderId || booking?.orderId || (bookingIdOrOrderId?.startsWith("SMMS-ORD") ? bookingIdOrOrderId : undefined) || "SMMS-ORD-2026-8801";
    const bookingId = overrides?.bookingId || booking?.id || (bookingIdOrOrderId?.startsWith("BKG") ? bookingIdOrOrderId : undefined) || "BKG-001";
    const quantityMt = overrides?.quantityMt || booking?.quantityMt || 10;
    const stockyardName = overrides?.stockyardName || booking?.sourceStockyardName || "Raipur Central Sand Stockyard";
    const destinationAddress = overrides?.destinationAddress || booking?.destinationAddress || "Designated Site";
    const vehicleNumber = overrides?.vehicleNumber || booking?.assignedVehicleNumber || "CG-04-TX-2341";
    const driverName = overrides?.driverName || booking?.assignedDriverName || "Venkat Sahu";
    const driverMobile = overrides?.driverMobile || "+91 98261 22341";
    const ePassNumber = overrides?.ePassNumber || booking?.ePassId || "EPASS-2026-1049";
    const otpCode = overrides?.otpCode || "7834";
    const amountRs = overrides?.amountRs || booking?.totalAmount || 7255;
    const txnId = overrides?.txnId || `TXN-UPI-${Date.now().toString().slice(-6)}`;
    const cancellationReason = overrides?.cancellationReason || "Stockyard quota unavailable / Citizen request";
    const refundAmount = overrides?.refundAmount || amountRs;
    const refundRef = overrides?.refundRef || `RFND-TG-${Math.floor(10000 + Math.random() * 90000)}`;
    const tentativeDeliveryTime = overrides?.tentativeDeliveryTime || "Today within 3-4 Hours";

    const newSms = buildCustomerSms(stage, {
      orderId,
      bookingId,
      recipientName,
      recipientMobile,
      recipientRole,
      otpCode,
      quantityMt,
      amountRs,
      txnId,
      stockyardName,
      destinationAddress,
      tentativeDeliveryTime,
      vehicleNumber,
      vehicleType: overrides?.vehicleType || "2-Axle Tipper (10 MT)",
      capacityMt: overrides?.capacityMt || 10,
      driverName,
      driverMobile,
      ePassNumber,
      trackingUrl: `https://sand.telangana.gov.in/track/${orderId.replace(/[^0-9]/g, "") || "8801"}`,
      cancellationReason,
      refundAmount,
      refundRef,
    });

    setCustomerNotifications((prev) => [newSms, ...prev]);

    addAudit(
      "Dispatch",
      "DISPATCH",
      newSms.smsRefId,
      "SMS Gateway Queue",
      `DLT Delivered (${newSms.stageName})`,
      `[Telangana SSMMS Stage ${newSms.stageNumber}: ${newSms.stageName}] SMS dispatched to ${recipientName} (${recipientMobile}) via ${newSms.carrierRoute}`
    );

    return newSms;
  };

  const resendCustomerSms = (notificationId: string): boolean => {
    const existing = customerNotifications.find((n) => n.id === notificationId || n.smsRefId === notificationId);
    if (!existing) return false;

    const resendCopy: CustomerSmsNotification = {
      ...existing,
      id: `SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      smsRefId: `SMS-TG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      dispatchedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      deliveredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Delivered",
      telecomMessageId: `MSG-RESEND-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    setCustomerNotifications((prev) => [resendCopy, ...prev]);
    addAudit(
      "Dispatch",
      "UPDATE",
      resendCopy.smsRefId,
      existing.status,
      "Delivered",
      `Re-sent Stage ${existing.stageNumber} SMS to ${existing.recipientName} (${existing.recipientMobile})`
    );
    return true;
  };

  const cancelBookingWithSms = (bookingIdOrOrderId: string, reason: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingIdOrOrderId || b.orderId === bookingIdOrOrderId);
    if (!booking) return false;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, bookingStatus: "Cancelled", cancellationReason: reason }
          : b
      )
    );

    dispatchCustomerSms("CANCELLATION_FAILURE", booking.id, {
      cancellationReason: reason,
      refundAmount: booking.totalAmount,
      refundRef: `RFND-TG-${Math.floor(10000 + Math.random() * 90000)}`,
    });

    addAudit(
      "Dispatch",
      "CANCEL",
      booking.orderId,
      booking.bookingStatus,
      "Cancelled",
      `Order ${booking.orderId} cancelled: ${reason}. Automated Stage 10 SMS dispatched with refund details.`
    );
    return true;
  };

  const updateOrderStatus = (
    orderIdOrBookingId: string,
    newStatus: OrderStatus,
    notes?: string,
    actorRole = activeRole
  ): { success: boolean; message: string } => {
    const booking = bookings.find(
      (b) => b.id === orderIdOrBookingId || b.orderId === orderIdOrBookingId
    );
    if (!booking) {
      return { success: false, message: `Order ${orderIdOrBookingId} not found.` };
    }

    const prevStatus = booking.bookingStatus;
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    const historyEntry: StatusHistoryEntry = {
      status: newStatus,
      timestamp: now,
      updatedBy: actorRole,
      notes: notes || `Order status transitioned from ${prevStatus} to ${newStatus}`,
      actorRole,
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              bookingStatus: newStatus,
              statusHistory: [...(b.statusHistory || []), historyEntry],
            }
          : b
      )
    );

    addAudit(
      "Dispatch",
      "UPDATE",
      booking.orderId,
      prevStatus,
      newStatus,
      `Standard Status Engine: ${notes || `Transitioned to ${newStatus}`}`
    );

    return {
      success: true,
      message: `Order ${booking.orderId} successfully transitioned to "${newStatus}"`,
    };
  };

  const registerCitizen = (cit: Omit<CitizenUser, "id">): string => {
    const id = `CIT-CG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCit: CitizenUser = { ...cit, id };
    setCitizens((prev) => [newCit, ...prev]);
    addAudit("Citizens", "CREATE", `${cit.name} (${cit.mobile})`, "Unregistered", `Registered (${cit.customerType})`, "Customer self-registration with OTP verification");

    // Auto-trigger Stage 1: Registration/OTP
    dispatchCustomerSms("REGISTRATION_OTP", undefined, {
      recipientName: cit.name,
      recipientMobile: cit.mobile,
      recipientRole: cit.customerType,
      otpCode: `${Math.floor(1000 + Math.random() * 9000)}`,
    });

    return id;
  };

  const createBooking = (bkgData: Omit<SandBooking, "id" | "orderId" | "createdAt" | "bookingStatus" | "paymentStatus">): string => {
    // 1. Automatic Stock Check: Block booking if sufficient stock is not available
    const targetStockyard = stockyards.find(
      (s) =>
        s.id === bkgData.sourceStockyardId ||
        s.stockyardId === bkgData.sourceStockyardId ||
        s.name.toLowerCase() === bkgData.sourceStockyardName.toLowerCase()
    );

    if (targetStockyard) {
      if (bkgData.quantityMt > targetStockyard.availableQuantityMt || targetStockyard.availableQuantityMt <= 0) {
        throw new Error(
          `Booking Blocked: Insufficient stock available at ${targetStockyard.name}. Available: ${targetStockyard.availableQuantityMt} MT, Requested: ${bkgData.quantityMt} MT.`
        );
      }

      // Automatically transition stock: reserve stock for this booking
      setStockyards((prev) =>
        prev.map((s) => {
          if (s.id === targetStockyard.id) {
            const newAvail = Math.max(0, s.availableQuantityMt - bkgData.quantityMt);
            const newRes = (s.reservedQuantityMt || 0) + bkgData.quantityMt;
            return {
              ...s,
              availableQuantityMt: newAvail,
              reservedQuantityMt: newRes,
              status: newAvail === 0 ? "Stock Depleted" : newAvail < 100 ? "Low Stock Warning" : s.status,
            };
          }
          return s;
        })
      );

      // Record reservation in stock movement ledger
      const ledgerEntry: StockLedgerEntry = {
        id: `LED-${Date.now().toString().slice(-6)}`,
        dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
        stockyardId: targetStockyard.id,
        stockyardName: targetStockyard.name,
        transactionType: "BOOKING_RESERVED",
        quantityMt: bkgData.quantityMt,
        previousStockMt: targetStockyard.availableQuantityMt,
        newStockMt: targetStockyard.availableQuantityMt - bkgData.quantityMt,
        referenceId: `BKG-${bookings.length + 1}`,
        authorizedBy: "Automated Booking Engine",
        remarks: `Inventory reserved for citizen booking (${bkgData.quantityMt} MT ${bkgData.sandType})`,
        approvalStatus: "Approved",
      };
      setStockLedger((prev) => [ledgerEntry, ...prev]);
    }

    const id = `BKG-00${bookings.length + 1}`;
    const orderId = `SMMS-ORD-2026-${8800 + bookings.length + 1}`;
    const newBooking: SandBooking = {
      ...bkgData,
      id,
      orderId,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      paymentStatus: "Payment Pending",
      bookingStatus: "Booking Submitted",
      statusHistory: [
        {
          status: "Booking Submitted",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          updatedBy: bkgData.customerName,
          notes: "Booking submitted on citizen portal",
          actorRole: "Citizen",
        },
      ],
    };
    setBookings((prev) => [newBooking, ...prev]);
    addAudit("Dispatch", "CREATE", orderId, "None", `Booked ${bkgData.quantityMt} MT by ${bkgData.customerName}`, "New sand booking created");

    // Auto-trigger Stage 2: Booking Confirmation
    dispatchCustomerSms("BOOKING_CONFIRMATION", id, {
      orderId,
      bookingId: id,
      recipientName: bkgData.customerName,
      recipientMobile: bkgData.customerMobile,
      recipientRole: bkgData.customerType,
      quantityMt: bkgData.quantityMt,
      stockyardName: bkgData.sourceStockyardName,
    });

    return id;
  };

  const processPayment = (bookingId: string, paymentMode: PaymentTransaction["paymentMode"]): boolean => {
    const booking = bookings.find((b) => b.id === bookingId || b.orderId === bookingId);
    if (!booking) return false;

    const txnId = `TXN-${paymentMode.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;
    const paymentRef = `PAY-REF-2026-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newTxn: PaymentTransaction = {
      id: `PAY-${Date.now()}`,
      transactionId: txnId,
      bookingId: booking.id,
      orderId: booking.orderId,
      customerName: booking.customerName,
      customerMobile: booking.customerMobile,
      quantityMt: booking.quantityMt,
      sandType: booking.sandType,
      deliveryLocation: booking.deliveryLocation || booking.destinationAddress,
      destinationAddress: booking.destinationAddress,
      bookingDateTime: booking.createdAt,
      sandAmount: booking.sandAmount,
      royalty: booking.royaltyAmount,
      royaltyAmount: booking.royaltyAmount,
      dmfCess: booking.dmfCess,
      envSurcharge: booking.envSurcharge || Math.round(15 * booking.quantityMt),
      gstTax: booking.gstAmount,
      gstAmount: booking.gstAmount,
      transportCharges: booking.transportCharges,
      totalAmount: booking.totalAmount,
      paymentMode,
      paymentStatus: "Success",
      transactionTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      paymentRefNumber: paymentRef,
      bankSettlementRef: `SBI-REC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      receiptNumber: `REC-SMMS-${Date.now().toString().slice(-6)}`,
      smsDispatched: true,
    };

    setPayments((prev) => [newTxn, ...prev]);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              paymentStatus: "Paid",
              bookingStatus: "Order Confirmed",
              paymentRefNumber: paymentRef,
              statusHistory: [
                ...(b.statusHistory || []),
                {
                  status: "Payment Success",
                  timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
                  notes: `Payment of ₹ ${booking.totalAmount} received via ${paymentMode}`,
                  actorRole: activeRole,
                },
                {
                  status: "Order Confirmed",
                  timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
                  notes: `Permanent Order ID ${booking.orderId} generated & confirmed`,
                  actorRole: activeRole,
                },
              ],
            }
          : b
      )
    );

    // Auto-trigger Stage 3: Payment Success & Stage 4: Order ID
    dispatchCustomerSms("PAYMENT_SUCCESS", booking.id, {
      amountRs: booking.totalAmount,
      txnId,
      recipientName: booking.customerName,
      recipientMobile: booking.customerMobile,
      bookingId: booking.id,
      orderId: booking.orderId,
    });
    dispatchCustomerSms("ORDER_ID", booking.id, {
      orderId: booking.orderId,
      bookingId: booking.id,
      recipientName: booking.customerName,
      recipientMobile: booking.customerMobile,
      destinationAddress: booking.destinationAddress,
    });

    addAudit("Payments", "CREATE", txnId, "Payment Pending", `Paid ₹ ${booking.totalAmount} via ${paymentMode}`, `Booking ${booking.orderId} Confirmed & SMS Dispatched`);
    return true;
  };

  const assignVehicleAndDispatch = (bookingId: string, vehicleNumber: string, driverName: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingId || b.orderId === bookingId);
    if (!booking) return false;

    const ePassNumber = `EPASS-2026-${1050 + epasses.length + 1}`;
    const slipNumber = `WB-SLIP-2026-${9050 + weighbridges.length + 1}`;
    const dispatchId = `DSP-2026-${1000 + dispatches.length + 1}`;

    // Create Weighbridge Record
    const tare = 8400;
    const gross = tare + booking.quantityMt * 1000;
    const newWb: WeighbridgeRecord = {
      id: `WBR-${Date.now()}`,
      weighbridgeId: "WB-001",
      weighbridgeName: "Katheru Automated Weighbridge 01",
      slipNumber,
      vehicleNumber,
      tareWeightKg: tare,
      grossWeightKg: gross,
      netSandWeightMt: booking.quantityMt,
      dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      bookingId: booking.id,
      ePassId: ePassNumber,
      stockyardId: booking.sourceStockyardId,
      operatorName: "V. Nageswara Rao",
      status: "Verified",
      photoUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
    };
    setWeighbridges((prev) => [newWb, ...prev]);

    const issueTime = new Date().toISOString().replace("T", " ").substring(0, 16);
    const validUntilDate = new Date(Date.now() + 8 * 3600 * 1000);
    const validUntil = validUntilDate.toISOString().replace("T", " ").substring(0, 16);

    const canonicalString = [
      "GOVT_CG_SMMS_TRANSIT_PASS_V1",
      ePassNumber,
      booking.orderId,
      vehicleNumber,
      driverName,
      booking.sourceStockyardId,
      booking.destinationAddress,
      booking.quantityMt.toFixed(2),
      issueTime,
      validUntil,
    ].join("::");
    const securityHash = CryptoJS.SHA256(canonicalString).toString(CryptoJS.enc.Hex);

    // Create Digital e-Pass / Transit Pass
    const newEpass: DigitalEPass = {
      id: `EP-${Date.now()}`,
      ePassNumber,
      transitPassNumber: ePassNumber,
      orderId: booking.orderId,
      bookingId: booking.id,
      vehicleNumber,
      driverName,
      driverMobile: "+91 98261 90012",
      driverLicense: "CG-04-DL-2020-001",
      sandReachId: booking.sourceStockyardId,
      sandReachName: booking.sourceStockyardName,
      quantityMt: booking.quantityMt,
      sandType: booking.sandType,
      sourceStockyard: booking.sourceStockyardName,
      destinationAddress: booking.destinationAddress,
      customerName: booking.customerName,
      customerMobile: booking.customerMobile,
      customerCategory: booking.customerType,
      issueTime,
      validityExpiryTime: "Valid for 8 Hours from issuance",
      validUntil,
      qrPayload: `CG-SMMS|TRANSIT-PASS|${ePassNumber}|ORD:${booking.orderId}|VEH:${vehicleNumber}|QTY:${booking.quantityMt}MT|EXP:${validUntil}|HASH:${securityHash.substring(0, 16)}`,
      gpsImei: `AIS140-CG-${vehicleNumber.replace(/[^A-Z0-9]/g, "").slice(-6)}`,
      weighbridgeSlipNumber: slipNumber,
      securityHash,
      isLocked: true, // Permanent lock prevents unauthorized editing after generation
      status: "Active",
    };
    setEpasses((prev) => [newEpass, ...prev]);

    // Create Dispatch Trip
    const newDispatch: DispatchTrip = {
      id: dispatchId,
      dispatchId,
      bookingId: booking.id,
      vehicleNumber,
      driverName,
      driverMobile: "+91 98480 22341",
      stockyardId: booking.sourceStockyardId,
      stockyardName: booking.sourceStockyardName,
      quantityMt: booking.quantityMt,
      weighbridgeSlipNumber: slipNumber,
      loadingTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      destination: booking.destinationAddress,
      ePassNumber,
      gpsStatus: "Signal Healthy",
      dispatchStatus: "In Transit",
    };
    setDispatches((prev) => [newDispatch, ...prev]);

    // Create Live GPS Telemetry
    const newTel: VehicleTelemetry = {
      vehicleNumber,
      driverName,
      dispatchId,
      currentLat: 17.0080,
      currentLng: 81.7910,
      speedKmH: 35,
      source: booking.sourceStockyardName,
      destination: booking.destinationAddress,
      eta: "20 Mins",
      geofenceStatus: "Inside Authorized Corridor",
      tripStatus: "In Transit",
      lastGpsPing: "Just now (Live)",
      routePath: [
        [17.0005, 81.7800],
        [17.0042, 81.7850],
        [17.0080, 81.7910],
      ],
    };
    setTelemetry((prev) => [newTel, ...prev.filter((t) => t.vehicleNumber !== vehicleNumber)]);

    // Prepare Delivery Record
    const newDel: DeliveryConfirmation = {
      id: `DEL-${Date.now()}`,
      deliveryId: `POD-2026-${7710 + deliveries.length + 1}`,
      bookingId: booking.id,
      vehicleNumber,
      quantityDeliveredMt: booking.quantityMt,
      deliveryTime: "Pending Delivery",
      deliveryLocation: booking.destinationAddress,
      customerName: booking.customerName,
      customerMobile: booking.customerMobile,
      otpCode: "7834",
      isOtpVerified: false,
      signatureCaptured: false,
      photoUrl: "",
      remarks: "Vehicle en route. Demo OTP: 7834",
      status: "Pending OTP",
    };
    setDeliveries((prev) => [newDel, ...prev]);

    // Update booking status
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
            ...b,
            bookingStatus: "In Transit",
            assignedVehicleNumber: vehicleNumber,
            assignedDriverName: driverName,
            ePassId: ePassNumber,
            statusHistory: [
              ...(b.statusHistory || []),
              {
                status: "Transit Pass Generated",
                timestamp: issueTime,
                notes: `Transit Pass ${ePassNumber} generated & digitally signed`,
                actorRole: activeRole,
              },
              {
                status: "In Transit",
                timestamp: issueTime,
                notes: `Consignment en route via ${vehicleNumber} (Driver: ${driverName})`,
                actorRole: activeRole,
              },
            ],
          }
          : b
      )
    );

    // Update vehicle status in pool
    setVehicles((prev) =>
      prev.map((v) =>
        v.vehicleNumber === vehicleNumber
          ? {
              ...v,
              queueStatus: "In Transit",
              activeTripId: dispatchId,
              currentOrderId: booking.orderId,
              queuePosition: undefined,
            }
          : v
      )
    );

    addAudit("Dispatch", "DISPATCH", dispatchId, "Vehicle Assigned", `Dispatched via ${vehicleNumber} | e-Pass: ${ePassNumber}`, "Trip gate-out authorization granted");
    addAudit("TransitPass", "GENERATE", ePassNumber, "Draft", "Locked & Sealed", `Digital Transit Pass / Waybill sealed for Order ${booking.orderId} (Vehicle: ${vehicleNumber}, Qty: ${booking.quantityMt} MT) with SHA-256 cryptographic signature`);

    // Transition stockyard inventory from Reserved to Dispatched
    setStockyards((prev) =>
      prev.map((s) => {
        if (s.id === booking.sourceStockyardId || s.name.toLowerCase() === booking.sourceStockyardName.toLowerCase()) {
          const res = Math.max(0, (s.reservedQuantityMt || 0) - booking.quantityMt);
          const disp = (s.dispatchedQuantityMt || 0) + booking.quantityMt;
          return {
            ...s,
            reservedQuantityMt: res,
            dispatchedQuantityMt: disp,
            dispatchedMt: (s.dispatchedMt || 0) + booking.quantityMt,
          };
        }
        return s;
      })
    );

    // Record Outward Dispatch in stock movement ledger
    const dispatchLedgerEntry: StockLedgerEntry = {
      id: `LED-${Date.now().toString().slice(-6)}`,
      dateTime: issueTime,
      stockyardId: booking.sourceStockyardId,
      stockyardName: booking.sourceStockyardName,
      transactionType: "OUTWARD_DISPATCH",
      quantityMt: booking.quantityMt,
      previousStockMt: 0,
      newStockMt: 0,
      referenceId: ePassNumber,
      authorizedBy: "Weighbridge Gate Controller",
      remarks: `Gate-out dispatch authorized for Order ${booking.orderId} (Vehicle: ${vehicleNumber})`,
      approvalStatus: "Approved",
    };
    setStockLedger((prev) => [dispatchLedgerEntry, ...prev]);

    // Auto-trigger Telangana SSMMS Stages 6 (Vehicle Number), 7 (Driver Details) & 8 (Delivery OTP)
    dispatchCustomerSms("VEHICLE_NUMBER", booking.id, {
      orderId: booking.orderId,
      bookingId: booking.id,
      recipientName: booking.customerName,
      recipientMobile: booking.customerMobile,
      vehicleNumber,
      vehicleType: "2-Axle Tipper (10 MT)",
      quantityMt: booking.quantityMt,
      stockyardName: booking.sourceStockyardName,
    });
    dispatchCustomerSms("DRIVER_DETAILS", booking.id, {
      orderId: booking.orderId,
      bookingId: booking.id,
      recipientName: booking.customerName,
      recipientMobile: booking.customerMobile,
      driverName,
      driverMobile: "+91 98261 22341",
      vehicleNumber,
      ePassNumber,
      trackingUrl: `https://sand.telangana.gov.in/track/${booking.orderId.replace(/[^0-9]/g, "") || "8801"}`,
    });
    dispatchCustomerSms("DELIVERY_OTP", booking.id, {
      orderId: booking.orderId,
      bookingId: booking.id,
      recipientName: booking.customerName,
      recipientMobile: booking.customerMobile,
      otpCode: "7834",
      quantityMt: booking.quantityMt,
      driverName,
    });

    return true;
  };

  const confirmDelivery = (
    bookingId: string,
    enteredOtp: string,
    signatureCaptured = true,
    metadata?: {
      photoUrl?: string;
      geoCoordinates?: string;
      remarks?: string;
      customerVerified?: boolean;
    }
  ): boolean => {
    const delivery = deliveries.find((d) => d.bookingId === bookingId);
    if (!delivery) return false;

    // Validate OTP (demo OTP is 7834 or matches delivery.otpCode)
    if (enteredOtp !== delivery.otpCode && enteredOtp !== "7834") {
      return false;
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    // Update delivery record
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === delivery.id
          ? {
            ...d,
            isOtpVerified: true,
            signatureCaptured,
            deliveryTime: now,
            status: "Delivered",
            remarks: metadata?.remarks || d.remarks || "Verified via customer OTP & geotagged signature.",
            photoUrl: metadata?.photoUrl || d.photoUrl,
            geoCoordinates: metadata?.geoCoordinates || d.geoCoordinates || "21.1610° N, 81.7870° E",
            receiptNumber: d.receiptNumber || `RCPT-CG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          }
          : d
      )
    );

    // Update booking to Delivered & Closed
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking) {
      // Transition stockyard inventory from Dispatched to Delivered
      setStockyards((prev) =>
        prev.map((s) => {
          if (s.id === targetBooking.sourceStockyardId || s.name.toLowerCase() === targetBooking.sourceStockyardName.toLowerCase()) {
            const disp = Math.max(0, (s.dispatchedQuantityMt || 0) - targetBooking.quantityMt);
            const del = (s.deliveredQuantityMt || 0) + targetBooking.quantityMt;
            return {
              ...s,
              dispatchedQuantityMt: disp,
              deliveredQuantityMt: del,
            };
          }
          return s;
        })
      );

      // Record Delivery Completion in ledger
      const deliveryLedgerEntry: StockLedgerEntry = {
        id: `LED-${Date.now().toString().slice(-6)}`,
        dateTime: now,
        stockyardId: targetBooking.sourceStockyardId,
        stockyardName: targetBooking.sourceStockyardName,
        transactionType: "DELIVERY_COMPLETED",
        quantityMt: targetBooking.quantityMt,
        previousStockMt: 0,
        newStockMt: 0,
        referenceId: targetBooking.orderId,
        authorizedBy: "Consumer OTP & POD Engine",
        remarks: `Verified delivery of ${targetBooking.quantityMt} MT to ${targetBooking.customerName}`,
        approvalStatus: "Approved",
      };
      setStockLedger((prev) => [deliveryLedgerEntry, ...prev]);
    }
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const history: StatusHistoryEntry[] = b.statusHistory ? [...b.statusHistory] : [];
        history.push({
          status: "Delivered",
          timestamp: now,
          changedBy: "Customer OTP Verification",
          notes: "Customer confirmed delivery via 6-digit OTP verification.",
          role: "customer",
        });
        history.push({
          status: "Order Closed",
          timestamp: now,
          changedBy: "System Automation",
          notes: "Consignment trip completed and order finalized automatically.",
          role: "system",
        });
        return {
          ...b,
          bookingStatus: "Order Closed",
          closedAt: now,
          deliveryTimestamp: now,
          transportEarningsRs: b.transportCharges || Math.round(b.quantityMt * 180 + 2700),
          statusHistory: history,
        };
      })
    );

    // Update dispatch status
    setDispatches((prev) =>
      prev.map((dp) => (dp.bookingId === bookingId ? { ...dp, dispatchStatus: "Delivered" } : dp))
    );

    // Release vehicle back to Available in FIFO queue with incremented trips
    // SPECIFICATION: After successful delivery: Trip Completed → Vehicle moves to end of queue
    if (delivery.vehicleNumber) {
      setVehicles((prev) => {
        const availableInQueue = prev.filter(
          (v) => v.queueStatus === "Available / In Queue" && v.vehicleNumber !== delivery.vehicleNumber
        );
        const maxPos = availableInQueue.reduce((max, v) => Math.max(max, v.queuePosition || 0), 0);
        const endPosition = Math.max(availableInQueue.length + 1, maxPos + 1);

        return prev.map((v) => {
          if (v.vehicleNumber === delivery.vehicleNumber) {
            return {
              ...v,
              queueStatus: "Available / In Queue",
              queuePosition: endPosition, // Trip Completed → Vehicle moves to end of queue!
              activeTripId: null,
              currentOrderId: null,
              lastTripCompletedAt: now,
              lastCompletedTripId: delivery.id || `TRIP-${Date.now().toString().slice(-4)}`,
              lastCompletedTripOrder: targetBooking?.orderId || null,
              lastCompletedTripDestination: targetBooking?.destinationAddress || targetBooking?.destinationDistrict || null,
              queueJoinedAt: now,
              totalTripsCompleted: (v.totalTripsCompleted || 0) + 1,
              driverStatus: "Active",
            };
          }
          return v;
        });
      });
    }

    // Deduct stockyard stock & add ledger entry
    if (targetBooking) {
      setStockyards((prev) =>
        prev.map((s) => {
          if (s.id === targetBooking.sourceStockyardId) {
            const updatedDispatched = s.dispatchedMt + targetBooking.quantityMt;
            const updatedClosing = Math.max(0, s.closingStockMt - targetBooking.quantityMt);
            const updatedAvailable = Math.max(0, s.availableQuantityMt - targetBooking.quantityMt);

            const ledgerEntry: StockLedgerEntry = {
              id: `LED-${Date.now()}`,
              dateTime: now,
              stockyardId: s.id,
              stockyardName: s.name,
              transactionType: "OUTWARD_DISPATCH",
              quantityMt: targetBooking.quantityMt,
              previousStockMt: s.closingStockMt,
              newStockMt: updatedClosing,
              referenceId: targetBooking.orderId,
              authorizedBy: activeRole,
              remarks: `Delivery POD closed. Deducted from stock for Order ${targetBooking.orderId}`,
            };
            setStockLedger((lPrev) => [ledgerEntry, ...lPrev]);

            return {
              ...s,
              dispatchedMt: updatedDispatched,
              closingStockMt: updatedClosing,
              availableQuantityMt: updatedAvailable,
            };
          }
          return s;
        })
      );
    }

    // Update telemetry status
    setTelemetry((prev) =>
      prev.map((t) =>
        t.vehicleNumber === delivery.vehicleNumber ? { ...t, tripStatus: "Delivered", speedKmH: 0 } : t
      )
    );

    addAudit("Dispatch", "UPDATE", delivery.deliveryId, "Pending Delivery", "Delivered & POD Verified", "Customer OTP confirmed, trip successfully closed");

    // Auto-trigger Stage 9: Delivery Confirmation
    dispatchCustomerSms("DELIVERY_CONFIRMATION", bookingId, {
      orderId: targetBooking?.orderId,
      bookingId,
      recipientName: targetBooking?.customerName || delivery.customerName,
      recipientMobile: targetBooking?.customerMobile || delivery.customerMobile,
      quantityMt: targetBooking?.quantityMt || delivery.quantityDeliveredMt,
      deliveryTimestamp: now,
      receiptNumber: delivery.receiptNumber || `RCPT-TG-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    return true;
  };

  const updateDeliveryRemarks = (deliveryIdOrBookingId: string, remarks: string, author = "Call Centre"): boolean => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedRemark = `[${author} ${timestamp}] ${remarks}`;

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryIdOrBookingId || d.deliveryId === deliveryIdOrBookingId || d.bookingId === deliveryIdOrBookingId) {
          const updatedRemarks = d.remarks ? `${formattedRemark} • ${d.remarks}` : formattedRemark;
          addAudit("Dispatch", "UPDATE", d.deliveryId, d.remarks || "None", updatedRemarks, `Permitted delivery remarks logged by ${author}`);
          return { ...d, remarks: updatedRemarks };
        }
        return d;
      })
    );

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === deliveryIdOrBookingId || b.orderId === deliveryIdOrBookingId) {
          return { ...b, deliveryNotes: formattedRemark };
        }
        return b;
      })
    );

    return true;
  };

  // ── Automated Vehicle Allocation Engine (Telangana TSMIV Reference) ──
  const evaluateVehicleEligibility = (
    veh: Vehicle,
    bkg: SandBooking
  ): { isEligible: boolean; checklist: EligibilityChecklist; reason: string } => {
    // 1. Registered Vehicle
    const isRegistered = !veh.isBlacklisted && Boolean(veh.rcNumber && veh.rcNumber.trim().length > 3);

    // 2. Active Vehicle Status (Verified, valid fitness & insurance)
    const isActiveStatus = veh.status === "Verified" && !veh.isBlacklisted;

    // 3. Approved Vehicle Capacity (Capacity >= order quantity)
    const hasApprovedCapacity = veh.capacityMt >= bkg.quantityMt;

    // 4. Driver/Owner Status (Driver active and licensed)
    const linkedDriver = drivers.find((d) => d.assignedVehicleNumber === veh.vehicleNumber || d.name === veh.driverName);
    const isDriverActive = (veh.driverStatus === "Active" || !veh.driverStatus) && (!linkedDriver || linkedDriver.status === "Active");

    // 5. Assigned District/Area match
    const bkgDistrict = (bkg.destinationDistrict || bkg.deliveryDistrict || "").toLowerCase();
    const vehDistrict = (veh.assignedDistrict || "").toLowerCase();
    const isAssignedDistrictMatch = !veh.assignedDistrict || vehDistrict === "all districts" || bkgDistrict.includes(vehDistrict) || vehDistrict.includes(bkgDistrict) || (bkg.sourceStockyardName || "").toLowerCase().includes(vehDistrict);

    // 6. Vehicle currently available
    const isVehicleAvailable = veh.queueStatus === "Available / In Queue" || (!veh.queueStatus && !veh.activeTripId && veh.status === "Verified");

    // 7. Previous trip completed
    const isPreviousTripCompleted = veh.queueStatus !== "In Transit" && veh.queueStatus !== "Loading at Stockyard";

    // 8. No active delivery
    const hasNoActiveDelivery = !veh.activeTripId && !dispatches.some((d) => d.vehicleNumber === veh.vehicleNumber && d.dispatchStatus === "In Transit");

    // 9. Required vehicle capacity matched / optimal
    const isCapacityOptimal = veh.capacityMt >= bkg.quantityMt && veh.capacityMt <= Math.max(bkg.quantityMt * 3.5, 30);

    const checklist: EligibilityChecklist = {
      isRegistered,
      isActiveStatus,
      hasApprovedCapacity,
      isDriverActive,
      isAssignedDistrictMatch,
      isVehicleAvailable,
      isPreviousTripCompleted,
      hasNoActiveDelivery,
      isCapacityOptimal,
    };

    const failedChecks: string[] = [];
    if (!isRegistered) failedChecks.push("Vehicle RC Not in Registered Registry or Blacklisted");
    if (!isActiveStatus) failedChecks.push("Vehicle Status Not Verified");
    if (!hasApprovedCapacity) failedChecks.push(`Approved Capacity (${veh.capacityMt} MT) < Order (${bkg.quantityMt} MT)`);
    if (!isDriverActive) failedChecks.push("Driver/Owner Status Inactive or Suspended");
    if (!isAssignedDistrictMatch) failedChecks.push(`District Mismatch (${veh.assignedDistrict} vs ${bkg.destinationDistrict || bkg.deliveryDistrict})`);
    if (!isVehicleAvailable) failedChecks.push(`Vehicle Currently Unavailable (${veh.queueStatus})`);
    if (!isPreviousTripCompleted) failedChecks.push("Previous Trip Not Yet Completed");
    if (!hasNoActiveDelivery) failedChecks.push("Active Trip Running");
    if (!isCapacityOptimal) failedChecks.push("Payload / Capacity Mismatch");

    const isEligible = failedChecks.length === 0;
    const reason = isEligible ? "All 9 Eligibility Checks Passed" : failedChecks.join("; ");

    return { isEligible, checklist, reason };
  };

  const getEligibleVehiclesForBooking = (bookingIdOrObj: string | SandBooking) => {
    const booking = typeof bookingIdOrObj === "string" 
      ? bookings.find((b) => b.id === bookingIdOrObj || b.orderId === bookingIdOrObj) 
      : bookingIdOrObj;
    if (!booking) return [];

    return vehicles.map((v) => {
      const evalResult = evaluateVehicleEligibility(v, booking);
      return {
        vehicle: v,
        checklist: evalResult.checklist,
        isEligible: evalResult.isEligible,
        reason: evalResult.reason,
      };
    });
  };

  const getFifoQueue = (district?: string): Vehicle[] => {
    let list = vehicles.filter((v) => !v.isBlacklisted && v.status === "Verified");
    if (district && district !== "All Districts") {
      list = list.filter((v) => !v.assignedDistrict || v.assignedDistrict === district);
    }
    return [...list].sort((a, b) => {
      const aAvail = a.queueStatus === "Available / In Queue" ? 0 : 1;
      const bAvail = b.queueStatus === "Available / In Queue" ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      const aPos = a.queuePosition ?? 999;
      const bPos = b.queuePosition ?? 999;
      if (aPos !== bPos) return aPos - bPos;
      return (a.queueJoinedAt || "").localeCompare(b.queueJoinedAt || "");
    });
  };

  const runAutoAllocation = (targetBookingId?: string): { allocatedCount: number; allocations: AllocationRecord[]; message: string } => {
    let candidateBookings = bookings.filter((b) => {
      if (targetBookingId) {
        return b.id === targetBookingId || b.orderId === targetBookingId;
      }
      return (
        !b.assignedVehicleNumber &&
        (b.bookingStatus === "Booking Confirmed" || b.bookingStatus === "Paid" || b.bookingStatus === "Booked") &&
        !b.transportOption?.toLowerCase().includes("own vehicle") &&
        !b.transportOption?.toLowerCase().includes("self-pickup")
      );
    });

    if (candidateBookings.length === 0) {
      return { allocatedCount: 0, allocations: [], message: "No unallocated confirmed bookings found requiring automated vehicle assignment." };
    }

    const newAllocations: AllocationRecord[] = [];
    const newNotifications: DriverNotification[] = [];
    let updatedVehicles = [...vehicles];
    let updatedBookings = [...bookings];

    for (const bkg of candidateBookings) {
      const eligiblePool = updatedVehicles
        .map((v) => ({ vehicle: v, eval: evaluateVehicleEligibility(v, bkg) }))
        .filter((item) => item.eval.isEligible);

      if (eligiblePool.length === 0) {
        continue;
      }

      // Sort by FIFO Queue: queuePosition or earliest queueJoinedAt
      eligiblePool.sort((a, b) => {
        const aPos = a.vehicle.queuePosition ?? 999;
        const bPos = b.vehicle.queuePosition ?? 999;
        if (aPos !== bPos) return aPos - bPos;
        return (a.vehicle.queueJoinedAt || "").localeCompare(b.vehicle.queueJoinedAt || "");
      });

      const chosen = eligiblePool[0];
      const allocId = `ALLOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString().replace("T", " ").substring(0, 16);
      const notifId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const smsText = `SMMS AUTO-ALLOCATION: Order ${bkg.orderId} allocated to ${chosen.vehicle.vehicleNumber} (Driver: ${chosen.vehicle.driverName}). Pickup ${bkg.quantityMt} MT ${bkg.sandType} at ${bkg.sourceStockyardName}. Destination: ${bkg.destinationAddress}. Customer: ${bkg.customerName} (${bkg.customerMobile}).`;

      const allocRecord: AllocationRecord = {
        id: allocId,
        allocationId: allocId,
        bookingId: bkg.id,
        orderId: bkg.orderId,
        vehicleId: chosen.vehicle.id,
        vehicleNumber: chosen.vehicle.vehicleNumber,
        vehicleType: chosen.vehicle.vehicleType,
        capacityMt: chosen.vehicle.capacityMt,
        driverName: chosen.vehicle.driverName,
        driverMobile: chosen.vehicle.mobile,
        customerName: bkg.customerName,
        customerMobile: bkg.customerMobile,
        quantityMt: bkg.quantityMt,
        sandType: bkg.sandType,
        sourceStockyardId: bkg.sourceStockyardId,
        sourceStockyardName: bkg.sourceStockyardName,
        deliveryDistrict: bkg.destinationDistrict || bkg.deliveryDistrict || "Raipur",
        destinationAddress: bkg.destinationAddress,
        allocationTime: now,
        fifoQueueRank: chosen.vehicle.queuePosition ?? 1,
        eligibilityChecklist: chosen.eval.checklist,
        driverNotificationSent: true,
        notificationTimestamp: now,
        notificationSmsContent: smsText,
        allocationStatus: "Allocated",
      };

      const driverNotif: DriverNotification = {
        id: notifId,
        allocationId: allocId,
        orderId: bkg.orderId,
        driverName: chosen.vehicle.driverName,
        driverMobile: chosen.vehicle.mobile,
        vehicleNumber: chosen.vehicle.vehicleNumber,
        pickupStockyard: bkg.sourceStockyardName,
        sandQuantityMt: bkg.quantityMt,
        sandType: bkg.sandType,
        destinationAddress: bkg.destinationAddress,
        customerName: bkg.customerName,
        customerMobile: bkg.customerMobile,
        dispatchedAt: now,
        message: smsText,
        status: "Delivered (SMS)",
      };

      newAllocations.push(allocRecord);
      newNotifications.push(driverNotif);

      // Auto-trigger Telangana SSMMS Stage 5: Vehicle Allocation to Customer SMS
      dispatchCustomerSms("VEHICLE_ALLOCATION", bkg.id, {
        orderId: bkg.orderId,
        bookingId: bkg.id,
        recipientName: bkg.customerName,
        recipientMobile: bkg.customerMobile,
        stockyardName: bkg.sourceStockyardName,
        tentativeDeliveryTime: "Within 3-4 Hours (FIFO Allotted)",
        vehicleNumber: chosen.vehicle.vehicleNumber,
      });

      updatedVehicles = updatedVehicles.map((v) => {
        if (v.id === chosen.vehicle.id) {
          return {
            ...v,
            queueStatus: "Assigned on Trip",
            activeTripId: allocId,
            currentOrderId: bkg.orderId,
            queuePosition: undefined,
            driverStatus: "Assigned on Trip",
          };
        }
        return v;
      });

      // Normalize remaining available vehicles in queue
      let qPos = 1;
      updatedVehicles = updatedVehicles.map((v) => {
        if (v.queueStatus === "Available / In Queue") {
          return { ...v, queuePosition: qPos++ };
        }
        return v;
      });

      updatedBookings = updatedBookings.map((b) => {
        if (b.id === bkg.id) {
          return {
            ...b,
            bookingStatus: "Vehicle Allocated",
            assignedVehicleNumber: chosen.vehicle.vehicleNumber,
            assignedDriverName: chosen.vehicle.driverName,
            statusHistory: [
              ...(b.statusHistory || []),
              {
                status: "Vehicle Allocated",
                timestamp: now,
                notes: `FIFO Allocation Engine: Assigned ${chosen.vehicle.vehicleNumber} (${chosen.vehicle.driverName})`,
                actorRole: activeRole,
              },
            ],
          };
        }
        return b;
      });

      addAudit("Vehicle", "UPDATE", chosen.vehicle.vehicleNumber, "Available in Queue", `Assigned to ${bkg.orderId}`, `FIFO Auto-Allocation Engine: Assigned ${chosen.vehicle.vehicleType} (Rank #${chosen.vehicle.queuePosition || 1}) to Order ${bkg.orderId}`);
    }

    setAllocations((prev) => [...newAllocations, ...prev]);
    setDriverNotifications((prev) => [...newNotifications, ...prev]);
    setVehicles(updatedVehicles);
    setBookings(updatedBookings);

    return {
      allocatedCount: newAllocations.length,
      allocations: newAllocations,
      message: `Successfully auto-allocated ${newAllocations.length} order(s) to eligible vehicles via FIFO queue.`,
    };
  };

  const acknowledgeDriverNotification = (notificationId: string) => {
    setDriverNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, status: "Acknowledged" } : n))
    );
  };

  const moveVehicleToEndOfQueue = (vehicleNumberOrId: string, reason?: string) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    setVehicles((prev) => {
      const target = prev.find((v) => v.id === vehicleNumberOrId || v.vehicleNumber === vehicleNumberOrId);
      if (!target) return prev;

      const availableInQueue = prev.filter(
        (v) => v.queueStatus === "Available / In Queue" && v.id !== target.id
      );
      const maxPos = availableInQueue.reduce((max, v) => Math.max(max, v.queuePosition || 0), 0);
      const endPosition = Math.max(availableInQueue.length + 1, maxPos + 1);

      addAudit(
        "VehicleQueue",
        "UPDATE",
        target.vehicleNumber,
        `Queue #${target.queuePosition || "None"}`,
        `End of Queue (#${endPosition})`,
        reason || "Vehicle moved to end of queue following FIFO rotation policy"
      );

      return prev.map((v) => {
        if (v.id === target.id) {
          return {
            ...v,
            queueStatus: "Available / In Queue",
            queuePosition: endPosition,
            activeTripId: null,
            currentOrderId: null,
            queueJoinedAt: now,
            lastTripCompletedAt: now,
            driverStatus: "Active",
          };
        }
        return v;
      });
    });
  };

  const reorderFifoQueue = (district?: string) => {
    setVehicles((prev) => {
      let filtered = prev.filter((v) => !v.isBlacklisted && v.status === "Verified" && v.queueStatus === "Available / In Queue");
      if (district && district !== "All Districts") {
        filtered = filtered.filter((v) => !v.assignedDistrict || v.assignedDistrict === district);
      }
      filtered.sort((a, b) => {
        const aPos = a.queuePosition ?? 999;
        const bPos = b.queuePosition ?? 999;
        if (aPos !== bPos) return aPos - bPos;
        return (a.queueJoinedAt || "").localeCompare(b.queueJoinedAt || "");
      });

      const positionMap = new Map<string, number>();
      filtered.forEach((v, idx) => {
        positionMap.set(v.id, idx + 1);
      });

      return prev.map((v) => {
        if (positionMap.has(v.id)) {
          return { ...v, queuePosition: positionMap.get(v.id) };
        }
        return v;
      });
    });
  };

  // ── Dedicated Vehicle Owner / Driver Module Actions ──
  const driverAcceptOrder = (orderId: string, vehicleNumber?: string): boolean => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) return false;

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== booking.id) return b;
        const history: StatusHistoryEntry[] = b.statusHistory ? [...b.statusHistory] : [];
        history.push({
          status: "Driver Accepted",
          timestamp: now,
          changedBy: booking.assignedDriverName || "Driver",
          notes: `Driver accepted trip offer for vehicle ${vehicleNumber || booking.assignedVehicleNumber || ""}.`,
          role: "driver",
        });
        return {
          ...b,
          bookingStatus: "Driver Accepted",
          driverAcceptanceStatus: "Accepted",
          statusHistory: history,
        };
      })
    );

    const vehNum = vehicleNumber || booking.assignedVehicleNumber;
    if (vehNum) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleNumber === vehNum
            ? { ...v, queueStatus: "Assigned on Trip", driverStatus: "Active" }
            : v
        )
      );
    }

    addAudit("Dispatch", "UPDATE", orderId, "Vehicle Allocated", "Driver Accepted", `Driver ${booking.assignedDriverName || "Operator"} accepted trip order ${orderId}`);
    return true;
  };

  const driverRejectOrder = (
    orderId: string,
    vehicleNumber: string,
    reason: string
  ): { reallocated: boolean; newVehicleNumber?: string; message: string } => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) {
      return { reallocated: false, message: "Order not found." };
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    // 1. Release rejecting vehicle back to available or cycle to back of queue
    const updatedVehicles = vehicles.map((v) => {
      if (v.vehicleNumber === vehicleNumber) {
        return {
          ...v,
          queueStatus: "Available / In Queue",
          activeTripId: null,
          driverStatus: "Active",
        };
      }
      return v;
    });

    // 2. Find eligible candidate vehicles excluding the rejecting vehicle
    const eligiblePool = updatedVehicles
      .filter((v) => v.vehicleNumber !== vehicleNumber)
      .map((v) => ({ vehicle: v, eval: evaluateVehicleEligibility(v, booking) }))
      .filter((item) => item.eval.isEligible);

    let reallocated = false;
    let newChosenVehicle: Vehicle | null = null;
    let newAllocRecord: AllocationRecord | null = null;
    let newDriverNotif: DriverNotification | null = null;

    if (eligiblePool.length > 0) {
      eligiblePool.sort((a, b) => {
        const aPos = a.vehicle.queuePosition ?? 999;
        const bPos = b.vehicle.queuePosition ?? 999;
        if (aPos !== bPos) return aPos - bPos;
        return (a.vehicle.queueJoinedAt || "").localeCompare(b.vehicle.queueJoinedAt || "");
      });

      newChosenVehicle = eligiblePool[0].vehicle;
      reallocated = true;

      const allocId = `ALLOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const smsText = `SMMS REALLOCATION: Order ${booking.orderId} reallocated to ${newChosenVehicle.vehicleNumber} (Driver: ${newChosenVehicle.driverName}) following driver rejection. Pickup ${booking.quantityMt} MT ${booking.sandType} at ${booking.sourceStockyardName}. Destination: ${booking.destinationAddress}. Customer: ${booking.customerName} (${booking.customerMobile}).`;

      newAllocRecord = {
        id: allocId,
        allocationId: allocId,
        bookingId: booking.id,
        orderId: booking.orderId,
        vehicleId: newChosenVehicle.id,
        vehicleNumber: newChosenVehicle.vehicleNumber,
        vehicleType: newChosenVehicle.vehicleType,
        capacityMt: newChosenVehicle.capacityMt,
        driverName: newChosenVehicle.driverName,
        driverMobile: newChosenVehicle.mobile,
        customerName: booking.customerName,
        customerMobile: booking.customerMobile,
        quantityMt: booking.quantityMt,
        sandType: booking.sandType,
        sourceStockyardId: booking.sourceStockyardId,
        sourceStockyardName: booking.sourceStockyardName,
        deliveryDistrict: booking.destinationDistrict || booking.deliveryDistrict || "Raipur",
        destinationAddress: booking.destinationAddress,
        allocationTime: now,
        fifoQueueRank: newChosenVehicle.queuePosition ?? 1,
        eligibilityChecklist: eligiblePool[0].eval.checklist,
        driverNotificationSent: true,
        notificationTimestamp: now,
        notificationSmsContent: smsText,
        allocationStatus: "Allocated",
      };

      newDriverNotif = {
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        allocationId: allocId,
        orderId: booking.orderId,
        driverName: newChosenVehicle.driverName,
        driverMobile: newChosenVehicle.mobile,
        vehicleNumber: newChosenVehicle.vehicleNumber,
        pickupStockyard: booking.sourceStockyardName,
        sandQuantityMt: booking.quantityMt,
        sandType: booking.sandType,
        destinationAddress: booking.destinationAddress,
        customerName: booking.customerName,
        customerMobile: booking.customerMobile,
        dispatchedAt: now,
        message: smsText,
        status: "Delivered (SMS)",
      };
    }

    // 3. Update bookings
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === booking.id) {
          const history: StatusHistoryEntry[] = b.statusHistory ? [...b.statusHistory] : [];
          history.push({
            status: "Vehicle Rejected",
            timestamp: now,
            changedBy: vehicleNumber,
            notes: `Order rejected by driver/transporter: ${reason}`,
            role: "driver",
          });

          if (reallocated && newChosenVehicle) {
            history.push({
              status: "Vehicle Allocated",
              timestamp: now,
              changedBy: "FIFO Reallocation Engine",
              notes: `Order automatically reallocated to ${newChosenVehicle.vehicleNumber} (${newChosenVehicle.driverName}).`,
              role: "system",
            });

            return {
              ...b,
              bookingStatus: "Vehicle Allocated",
              assignedVehicleNumber: newChosenVehicle.vehicleNumber,
              assignedDriverName: newChosenVehicle.driverName,
              driverAcceptanceStatus: "Pending Offer",
              driverRejectionReason: `Rejected by ${vehicleNumber} (${reason})`,
              driverRejectedAt: now,
              statusHistory: history,
            };
          } else {
            history.push({
              status: "Vehicle Reallocation Pending",
              timestamp: now,
              changedBy: "System Queue Monitor",
              notes: "No eligible replacement vehicle currently available in FIFO queue; awaiting next vehicle.",
              role: "system",
            });

            return {
              ...b,
              bookingStatus: "Vehicle Reallocation Pending",
              assignedVehicleNumber: undefined,
              assignedDriverName: undefined,
              driverAcceptanceStatus: "Rejected",
              driverRejectionReason: `Rejected by ${vehicleNumber} (${reason})`,
              driverRejectedAt: now,
              statusHistory: history,
            };
          }
        }
        return b;
      })
    );

    // 4. Update vehicles
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.vehicleNumber === vehicleNumber) {
          return {
            ...v,
            queueStatus: "Available / In Queue",
            activeTripId: null,
          };
        }
        if (reallocated && newChosenVehicle && v.id === newChosenVehicle.id) {
          return {
            ...v,
            queueStatus: "Assigned on Trip",
            activeTripId: newAllocRecord?.id || null,
          };
        }
        return v;
      })
    );

    if (newAllocRecord) {
      setAllocations((prev) => [newAllocRecord!, ...prev]);
    }
    if (newDriverNotif) {
      setDriverNotifications((prev) => [newDriverNotif!, ...prev]);
    }

    addAudit(
      "Vehicle",
      "UPDATE",
      orderId,
      `Assigned to ${vehicleNumber}`,
      reallocated ? `Reallocated to ${newChosenVehicle?.vehicleNumber}` : "Returned to Unallocated Pool",
      `Driver ${vehicleNumber} rejected order (${reason}). Automated FIFO reallocation triggered.`
    );

    return {
      reallocated,
      newVehicleNumber: newChosenVehicle?.vehicleNumber,
      message: reallocated
        ? `Order rejected by ${vehicleNumber}. Automatically reallocated to next eligible vehicle: ${newChosenVehicle?.vehicleNumber} (${newChosenVehicle?.driverName}) via FIFO Queue!`
        : `Order rejected by ${vehicleNumber}. No alternative eligible vehicle currently available; order returned to unallocated pool.`,
    };
  };

  const driverStartPickup = (orderId: string): boolean => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) return false;

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== booking.id) return b;
        const history: StatusHistoryEntry[] = b.statusHistory ? [...b.statusHistory] : [];
        history.push({
          status: "Pickup Pending",
          timestamp: now,
          changedBy: booking.assignedDriverName || "Driver",
          notes: `Driver navigating to ${booking.sourceStockyardName} for sand loading.`,
          role: "driver",
        });
        return { ...b, bookingStatus: "Pickup Pending", pickupStartTime: now, statusHistory: history };
      })
    );

    if (booking.assignedVehicleNumber) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleNumber === booking.assignedVehicleNumber
            ? { ...v, queueStatus: "Loading at Stockyard" }
            : v
        )
      );
    }

    addAudit("Dispatch", "UPDATE", orderId, "Driver Accepted", "Pickup Pending", `Driver navigating to ${booking.sourceStockyardName} for pickup`);
    return true;
  };

  const driverConfirmStockyardLoad = (orderId: string): boolean => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) return false;

    const now = new Date().toISOString().replace("T", " ").substring(0, 16);
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== booking.id) return b;
        const history: StatusHistoryEntry[] = b.statusHistory ? [...b.statusHistory] : [];
        history.push({
          status: "Vehicle at Sand Reach",
          timestamp: now,
          changedBy: "Sand Reach In-charge",
          notes: `Vehicle arrived at sand reach / depot: ${booking.sourceStockyardName}.`,
          role: "sand_reach",
        });
        history.push({
          status: "Loading in Progress",
          timestamp: now,
          changedBy: "Stockyard Loader",
          notes: `Excavator loaded ${booking.quantityMt} MT of ${booking.sandType}.`,
          role: "sand_reach",
        });
        history.push({
          status: "Loaded / Pickup Completed",
          timestamp: now,
          changedBy: "Weighbridge In-charge",
          notes: `Gross weighment slip captured. Loading and tare check complete.`,
          role: "sand_reach",
        });
        return {
          ...b,
          bookingStatus: "Loaded / Pickup Completed",
          pickupCompletedTime: now,
          statusHistory: history,
        };
      })
    );

    addAudit("Weighbridge", "UPDATE", orderId, "Pickup Pending", "Loaded / Pickup Completed", `Vehicle arrived at ${booking.sourceStockyardName}, gross weighment verified.`);
    return true;
  };

  const driverStartTransit = (orderId: string): boolean => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) return false;

    return assignVehicleAndDispatch(booking.id, booking.assignedVehicleNumber || "CG-04-TX-2341", booking.assignedDriverName || "Driver");
  };

  const driverDeliverAndVerifyOtp = (
    orderId: string,
    enteredOtp: string,
    metadata?: {
      photoUrl?: string;
      geoCoordinates?: string;
      remarks?: string;
    }
  ): boolean => {
    const booking = bookings.find((b) => b.orderId === orderId || b.id === orderId);
    if (!booking) return false;

    const success = confirmDelivery(booking.id, enteredOtp, true, metadata);
    return success;
  };

  const createAlert = (alertData: Omit<EnforcementAlert, "id">) => {
    const id = `ALT-00${alerts.length + 1}`;
    const newAlert: EnforcementAlert = {
      ...alertData,
      id,
      caseHistory: alertData.caseHistory || [
        {
          id: `CH-${Date.now().toString().slice(-4)}`,
          timestamp: alertData.dateTime || new Date().toISOString().replace("T", " ").substring(0, 16),
          officer: alertData.assignedOfficer || "Reporting Officer",
          action: "ALERT REGISTERED",
          notes: alertData.caseNotes,
        },
      ],
    };
    setAlerts((prev) => [newAlert, ...prev]);
    addAudit("Enforcement", "CREATE", alertData.alertId, "None", alertData.alertType, alertData.caseNotes);
  };

  const updateAlertStatus = (id: string, status: EnforcementAlert["actionStatus"]) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addAudit("Enforcement", "UPDATE", a.alertId, `Status: ${a.actionStatus}`, `Status: ${status}`, "Enforcement case status updated");
          const history = a.caseHistory ? [...a.caseHistory] : [];
          history.push({
            id: `CH-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            officer: a.assignedOfficer || "Enforcement Officer",
            action: `STATUS CHANGED: ${status.toUpperCase()}`,
            notes: `Case status updated from ${a.actionStatus} to ${status}.`,
          });
          return { ...a, actionStatus: status, caseHistory: history };
        }
        return a;
      })
    );
  };

  const assignEnforcementOfficer = (id: string, officerName: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const history = a.caseHistory ? [...a.caseHistory] : [];
        history.push({
          id: `CH-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          officer: officerName,
          action: "OFFICER ASSIGNED",
          notes: `Flying squad case assigned to officer ${officerName}. Physical inspection underway.`,
        });
        addAudit("Enforcement", "UPDATE", a.alertId, a.assignedOfficer, officerName, `Case assigned to ${officerName}`);
        return {
          ...a,
          assignedOfficer: officerName,
          actionStatus: a.actionStatus === "New Alert" ? "Squad Assigned" : a.actionStatus,
          caseHistory: history,
        };
      })
    );
  };

  const investigateEnforcementAlert = (
    id: string,
    notes: string,
    status: EnforcementAlert["actionStatus"] = "Under Investigation",
    penaltyAmount?: number
  ) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const history = a.caseHistory ? [...a.caseHistory] : [];
        history.push({
          id: `CH-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          officer: a.assignedOfficer || "Investigating Inspector",
          action: "FIELD INSPECTION LOGGED",
          notes,
          penaltyAmount,
        });
        addAudit("Enforcement", "UPDATE", a.alertId, a.actionStatus, status, notes);
        return {
          ...a,
          actionStatus: status,
          caseNotes: notes,
          penaltyAmount: penaltyAmount ?? a.penaltyAmount,
          caseHistory: history,
        };
      })
    );
  };

  const blockAndSeizeVehicle = (
    id: string,
    seizureOrderNumber = `SEIZE-CG-2026-${Math.floor(Math.random() * 9000) + 1000}`,
    firNumber = `FIR-MIN-2026-${Math.floor(Math.random() * 900) + 100}`,
    penaltyAmount = 50000
  ) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const history = a.caseHistory ? [...a.caseHistory] : [];
        history.push({
          id: `CH-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          officer: a.assignedOfficer || "District Enforcement Squad",
          action: "VEHICLE SEIZED & BLACKLISTED",
          notes: `Vehicle ${a.vehicleNumber || "Unknown"} seized under MMDR Act Sec 21(4). Seizure Order #${seizureOrderNumber}, FIR #${firNumber}.`,
          penaltyAmount,
        });

        // Also blacklist vehicle in vehicle registry if vehicleNumber matches
        if (a.vehicleNumber) {
          const veh = vehicles.find((v) => v.vehicleNumber === a.vehicleNumber);
          if (veh) {
            toggleBlacklistVehicle(veh.id, `Seized in Enforcement Alert ${a.alertId} (FIR #${firNumber})`);
          }
        }

        addAudit("Enforcement", "SEIZE", a.alertId, "Active Transit", "Vehicle Seized", `Seizure order ${seizureOrderNumber} issued`);

        return {
          ...a,
          actionStatus: "Vehicle Seized",
          seizureOrderNumber,
          firNumber,
          penaltyAmount,
          caseHistory: history,
        };
      })
    );
  };

  const closeEnforcementCase = (id: string, finalNotes: string, penaltyAmount?: number) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const history = a.caseHistory ? [...a.caseHistory] : [];
        history.push({
          id: `CH-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          officer: a.assignedOfficer || "Supervising Officer",
          action: "CASE CLOSED",
          notes: finalNotes,
          penaltyAmount,
        });
        addAudit("Enforcement", "UPDATE", a.alertId, a.actionStatus, "Closed", finalNotes);
        return {
          ...a,
          actionStatus: "Closed",
          caseNotes: finalNotes,
          penaltyAmount: penaltyAmount ?? a.penaltyAmount,
          caseHistory: history,
        };
      })
    );
  };

  const raiseGrievance = (
    ticketData: Partial<GrievanceTicket> & { customerName: string; customerMobile: string; category: GrievanceCategory; description: string }
  ): GrievanceTicket => {
    const id = `GRV-${Date.now().toString().slice(-6)}`;
    const ticketId = ticketData.ticketId || `GRV-2026-${Math.floor(5100 + Math.random() * 900)}`;
    const newTkt: GrievanceTicket = {
      id,
      ticketId,
      customerName: ticketData.customerName,
      customerMobile: ticketData.customerMobile,
      category: ticketData.category,
      bookingOrderId: ticketData.bookingOrderId || `SMMS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      description: ticketData.description,
      location: ticketData.location || "Raipur District",
      priority: ticketData.priority || "High",
      assignedOfficer: ticketData.assignedOfficer || "Call Centre Triage Cell",
      slaRemainingHours: ticketData.slaRemainingHours ?? (ticketData.priority === "Urgent" ? 12 : ticketData.priority === "High" ? 24 : 48),
      status: "Complaint Registered",
      stage: 2,
      stageName: "Complaint Registration",
      intakeChannel: ticketData.intakeChannel || "Customer Portal",
      customerOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      customerConfirmationStatus: "Pending Confirmation",
      attachmentUrl: ticketData.attachmentUrl,
      attachmentName: ticketData.attachmentName,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      communicationHistory: ticketData.communicationHistory || [
        {
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: ticketData.customerName,
          role: "Complainant Citizen",
          message: ticketData.description,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
        {
          id: `COM-${Date.now().toString().slice(-4)}-SYS`,
          author: "SMMS Helpdesk Gateway",
          role: "Automated Ingestion",
          message: `Complaint registered with Ticket ID: ${ticketId}. Statutory SLA countdown initiated.`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          isInternal: true,
        },
      ],
    };

    setGrievances((prev) => [newTkt, ...prev]);
    addAudit(
      "Grievance",
      "CREATE",
      ticketId,
      "None",
      "Complaint Registered",
      `Grievance registered for ${ticketData.customerName} (${ticketData.category})`
    );
    return newTkt;
  };

  const reviewGrievanceByCallCentre = (
    id: string,
    notes: string,
    callCentreAgent = "Helpdesk Executive #102",
    priority?: GrievancePriority
  ) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: callCentreAgent,
          role: "Call Centre Desk Officer",
          message: `[Call Centre Review Notes]: ${notes}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          isInternal: false,
        });
        return {
          ...g,
          stage: 3,
          stageName: "Call Centre/Officer",
          status: "Call Centre Review",
          callCentreNotes: notes,
          callCentreAgent,
          priority: priority || g.priority,
          communicationHistory: comms,
        };
      })
    );
    addAudit("Grievance", "UPDATE", id, "Complaint Registered", "Call Centre Review", `Triage reviewed by ${callCentreAgent}`);
  };

  const updateGrievanceStatus = (id: string, status: GrievanceTicket["status"], remarks?: string) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        if (remarks) {
          comms.push({
            id: `COM-${Date.now().toString().slice(-4)}`,
            author: "Helpdesk Officer",
            role: "Desk Officer",
            message: `[Status Updated to ${status}] ${remarks}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          });
        }
        return {
          ...g,
          status,
          resolutionRemarks: remarks || g.resolutionRemarks,
          communicationHistory: comms,
        };
      })
    );
  };

  const assignGrievanceOfficer = (
    id: string,
    officerName: string,
    department = "District Sand Grievance Cell",
    remarks?: string
  ) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: "Helpdesk Supervisor",
          role: "Supervisor",
          message: `Ticket delegated to: ${officerName} (${department}). ${remarks ? `Remarks: ${remarks}` : ""}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        });
        return {
          ...g,
          stage: 4,
          stageName: "Assigned",
          status: "Assigned",
          assignedOfficer: `${officerName} (${department})`,
          communicationHistory: comms,
        };
      })
    );
    addAudit("Grievance", "ASSIGN", id, "Open", "Assigned", `Assigned to ${officerName} (${department})`);
  };

  const recordGrievanceActionTaken = (
    id: string,
    actionDetails: string,
    actionTakenBy: string,
    remedyType = "Field Remediation & Correction"
  ) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: actionTakenBy,
          role: "Enforcement / Depot Officer",
          message: `[Action Taken - ${remedyType}]: ${actionDetails}`,
          timestamp,
          isInternal: false,
        });
        return {
          ...g,
          stage: 5,
          stageName: "Action Taken",
          status: "Action Taken",
          actionTakenDetails: actionDetails,
          actionTakenBy,
          actionTakenAt: timestamp,
          remedyType,
          communicationHistory: comms,
        };
      })
    );
    addAudit("Grievance", "UPDATE", id, "Assigned", "Action Taken", `Action taken by ${actionTakenBy}: ${actionDetails}`);
  };

  const resolveGrievance = (
    id: string,
    resolutionRemarks: string,
    remedyType = "Resolution Executed"
  ) => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: "Grievance Officer",
          role: "Desk Officer",
          message: `[Case Resolved]: ${resolutionRemarks}. Customer confirmation OTP (${otp}) dispatched via SMS.`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        });
        return {
          ...g,
          stage: 6,
          stageName: "Resolved",
          status: "Resolved",
          resolutionRemarks,
          remedyType,
          slaRemainingHours: 0,
          customerOtp: otp,
          customerConfirmationStatus: "Pending Confirmation",
          communicationHistory: comms,
        };
      })
    );
    addAudit("Grievance", "RESOLVE", id, "Action Taken", "Resolved", `Resolved: ${resolutionRemarks}`);
  };

  const confirmGrievanceByCustomer = (
    id: string,
    otp: string,
    feedbackScore = 5,
    feedbackComments = "Satisfied with resolution.",
    isSatisfied = true
  ): { success: boolean; message: string } => {
    const target = grievances.find((g) => g.id === id || g.ticketId === id);
    if (!target) return { success: false, message: "Ticket not found." };

    if (target.customerOtp && target.customerOtp !== otp.trim() && otp.trim() !== "1234") {
      return { success: false, message: "Invalid confirmation OTP. Please check SMS or enter valid code." };
    }

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    if (isSatisfied) {
      setGrievances((prev) =>
        prev.map((g) => {
          if (g.id !== id && g.ticketId !== id) return g;
          const comms = g.communicationHistory ? [...g.communicationHistory] : [];
          comms.push({
            id: `COM-${Date.now().toString().slice(-4)}`,
            author: g.customerName,
            role: "Complainant Citizen",
            message: `[Citizen Verified & Confirmed]: ${feedbackComments} (Rating: ${feedbackScore}/5 stars)`,
            timestamp,
          });
          return {
            ...g,
            stage: 7,
            stageName: "Customer Confirmation",
            status: "Customer Confirmed",
            customerConfirmationStatus: "Confirmed Satisfied",
            customerFeedbackScore: feedbackScore,
            customerFeedbackComments: feedbackComments,
            confirmedAt: timestamp,
            communicationHistory: comms,
          };
        })
      );
      addAudit("Grievance", "CLOSE", target.ticketId, "Resolved", "Customer Confirmed", `Citizen confirmed closure with score ${feedbackScore}/5`);
      return { success: true, message: `Ticket ${target.ticketId} successfully closed with citizen confirmation!` };
    } else {
      setGrievances((prev) =>
        prev.map((g) => {
          if (g.id !== id && g.ticketId !== id) return g;
          const comms = g.communicationHistory ? [...g.communicationHistory] : [];
          comms.push({
            id: `COM-${Date.now().toString().slice(-4)}`,
            author: g.customerName,
            role: "Complainant Citizen",
            message: `[Citizen Disputed Resolution]: ${feedbackComments}. Ticket returned for further review.`,
            timestamp,
          });
          return {
            ...g,
            stage: 5,
            stageName: "Action Taken",
            status: "Reopened",
            customerConfirmationStatus: "Disputed & Reopened",
            customerFeedbackComments: feedbackComments,
            slaRemainingHours: 24,
            communicationHistory: comms,
          };
        })
      );
      addAudit("Grievance", "REOPEN", target.ticketId, "Resolved", "Reopened", `Citizen disputed resolution: ${feedbackComments}`);
      return { success: true, message: `Ticket ${target.ticketId} reopened based on citizen feedback.` };
    }
  };

  const addGrievanceCommunication = (
    id: string,
    message: string,
    author = "Desk Officer",
    role = "Helpdesk Support",
    isInternal = false
  ) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author,
          role,
          message,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          isInternal,
        });
        return {
          ...g,
          communicationHistory: comms,
        };
      })
    );
  };

  const escalateGrievance = (id: string, escalationLevel: string, reason: string) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: "SLA Escalation Engine",
          role: "Automated Governance",
          message: `[ESCALATED TO ${escalationLevel.toUpperCase()}] Reason: ${reason}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        });
        return {
          ...g,
          status: "Escalated to District Collector",
          escalationLevel,
          escalationReason: reason,
          assignedOfficer: `District Collector (${escalationLevel})`,
          communicationHistory: comms,
        };
      })
    );
  };

  const reopenGrievance = (id: string, reason: string) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id && g.ticketId !== id) return g;
        const comms = g.communicationHistory ? [...g.communicationHistory] : [];
        comms.push({
          id: `COM-${Date.now().toString().slice(-4)}`,
          author: g.customerName,
          role: "Complainant (Reopened)",
          message: `[TICKET REOPENED] Reason: ${reason}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        });
        return {
          ...g,
          status: "Reopened",
          stage: 5,
          stageName: "Action Taken",
          reopenReason: reason,
          slaRemainingHours: 24,
          communicationHistory: comms,
        };
      })
    );
  };

  // Section 10 Demo Scenario Orchestrator
  const runDemoStep = (step: number) => {
    setDemoStep(step);
    switch (step) {
      case 1: // Reach approved
        updateReachStatus("RCH-001", "Approved");
        break;
      case 2: // 500 MT excavation at Reach
        addExcavation({
          dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          reachId: "RCH-001",
          reachName: "Mahanadi Basin Reach Alpha",
          excavatedQuantityMt: 500,
          machineryEquipment: "CAT 320D Excavator #EX-01",
          operatorName: "Ramesh Sahu",
          shift: "Morning (06:00 - 14:00)",
          geoLocation: "21.2514° N, 81.6296° E",
          photoEvidenceUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
          permitQuotaUsedMt: 500,
          remarks: "Demo excavation of 500 MT riverbed sand logged and verified.",
          status: "Approved",
        });
        break;
      case 3: // Stockyard receipt confirmed (already updated stockyard in step 2)
        break;
      case 4: // Citizen books 10 MT
        // BKG-001 is already present or create a fresh one if needed
        break;
      case 5: // Payment success
        processPayment("BKG-001", "UPI / QR");
        break;
      case 6: // Vehicle & Driver Assigned and Weighed
        assignVehicleAndDispatch("BKG-001", "CG-04-TX-2341", "Venkat Sahu");
        break;
      case 7: // QR e-Pass Issued (done in assignVehicleAndDispatch)
        break;
      case 8: // Live GPS Transit (done in assignVehicleAndDispatch)
        break;
      case 9: // POD Delivery with OTP 7834
        confirmDelivery("BKG-001", "7834", true);
        break;
      case 10: // Reconciliation & MIS Updated
        break;
      default:
        break;
    }
  };

  const inventoryFlow = useMemo(() => {
    const totalApprovedQuotaMt = reaches.reduce((sum, r) => sum + (r.approvedQuantityMt || 0), 0);
    const totalExtractedMt = reaches.reduce((sum, r) => sum + (r.excavatedQuantityMt || 0), 0);
    const totalAvailableStockMt = stockyards.reduce((sum, s) => sum + (s.availableQuantityMt || 0), 0);
    const totalReservedMt = stockyards.reduce((sum, s) => sum + (s.reservedQuantityMt || 0), 0);
    const totalDispatchedMt = stockyards.reduce((sum, s) => sum + (s.dispatchedQuantityMt || 0), 0);
    const totalDeliveredMt = stockyards.reduce((sum, s) => sum + (s.deliveredQuantityMt || 0), 0);
    const totalBalanceQuotaMt = Math.max(0, totalApprovedQuotaMt - totalExtractedMt);

    const extractionPercentage = totalApprovedQuotaMt > 0 ? Math.round((totalExtractedMt / totalApprovedQuotaMt) * 100) : 0;
    const dispatchPercentage = totalExtractedMt > 0 ? Math.round(((totalDispatchedMt + totalDeliveredMt) / totalExtractedMt) * 100) : 0;
    const deliveryPercentage = totalExtractedMt > 0 ? Math.round((totalDeliveredMt / totalExtractedMt) * 100) : 0;

    return {
      totalApprovedQuotaMt,
      totalExtractedMt,
      totalAvailableStockMt,
      totalReservedMt,
      totalDispatchedMt,
      totalDeliveredMt,
      totalBalanceQuotaMt,
      extractionPercentage,
      dispatchPercentage,
      deliveryPercentage,
    };
  }, [reaches, stockyards]);

  const value = useMemo(
    () => ({
      activeRole,
      setActiveRole,
      reaches,
      permits,
      excavations,
      stockyards,
      stockLedger,
      weighbridges,
      vehicles,
      drivers,
      citizens,
      bookings,
      payments,
      dispatches,
      epasses,
      telemetry,
      deliveries,
      alerts,
      grievances,
      auditLogs,
      demoStep,
      setDemoStep,
      runDemoStep,
      resetSimulationData,
      inventoryFlow,
      addReach,
      updateReachStatus,
      createPermit,
      updatePermitStatus,
      renewPermitQuota,
      addExcavation,
      addStockLedgerEntry,
      captureWeight,
      registerVehicle,
      toggleBlacklistVehicle,
      addDriver,
      registerCitizen,
      createBooking,
      processPayment,
      assignVehicleAndDispatch,
      confirmDelivery,
      updateDeliveryRemarks,
      createAlert,
      updateAlertStatus,
      assignEnforcementOfficer,
      investigateEnforcementAlert,
      blockAndSeizeVehicle,
      closeEnforcementCase,
      raiseGrievance,
      reviewGrievanceByCallCentre,
      updateGrievanceStatus,
      assignGrievanceOfficer,
      recordGrievanceActionTaken,
      resolveGrievance,
      confirmGrievanceByCustomer,
      addGrievanceCommunication,
      escalateGrievance,
      reopenGrievance,
      allocations,
      driverNotifications,
      evaluateVehicleEligibility,
      getEligibleVehiclesForBooking,
      getFifoQueue,
      runAutoAllocation,
      acknowledgeDriverNotification,
      moveVehicleToEndOfQueue,
      reorderFifoQueue,
      driverAcceptOrder,
      driverRejectOrder,
      driverStartPickup,
      driverConfirmStockyardLoad,
      driverStartTransit,
      driverDeliverAndVerifyOtp,
      customerNotifications,
      dispatchCustomerSms,
      resendCustomerSms,
      cancelBookingWithSms,
      updateOrderStatus,
      systemUsers,
      toggleUserStatus,
      addUser,
      updateUserRoleAndPermissions,
      resetUserPassword,
    }),
    [
      activeRole,
      reaches,
      permits,
      excavations,
      stockyards,
      stockLedger,
      weighbridges,
      vehicles,
      drivers,
      citizens,
      bookings,
      payments,
      dispatches,
      epasses,
      telemetry,
      deliveries,
      alerts,
      grievances,
      auditLogs,
      allocations,
      driverNotifications,
      customerNotifications,
      demoStep,
      systemUsers,
      inventoryFlow,
    ]
  );

  return <SandMiningContext.Provider value={value}>{children}</SandMiningContext.Provider>;
};

export const useSandMining = (): SandMiningContextType => {
  const context = useContext(SandMiningContext);
  if (!context) {
    throw new Error("useSandMining must be used within a SandMiningProvider");
  }
  return context;
};
