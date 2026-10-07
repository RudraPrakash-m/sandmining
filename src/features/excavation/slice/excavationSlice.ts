import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExcavationRecord, ExcavationStatus, ExcavationShift } from "../types";

interface ExcavationFilterState {
  searchQuery: string;
  selectedReachId: string;
  selectedShift: string;
  selectedStatus: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ExcavationState {
  records: ExcavationRecord[];
  selectedRecord: ExcavationRecord | null;
  filters: ExcavationFilterState;
  isDetailModalOpen: boolean;
  isPhotoModalOpen: boolean;
  isAuditModalOpen: boolean;
  isConfirmModalOpen: boolean;
  pendingStatusUpdate: {
    id: string;
    targetStatus: ExcavationStatus;
    remarks?: string;
  } | null;
}

const initialRecords: ExcavationRecord[] = [
  {
    id: "EXC-2026-001",
    excavationSlipNo: "EXC/TG/RPR/2026/0891",
    reachId: "RCH-001",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    riverName: "Mahanadi River",
    extractionDate: "2026-09-09",
    dateTime: "2026-09-09 08:30",
    extractionQuantityMt: 450,
    excavatedQuantityMt: 450,
    vehicleNumber: "TG-04-TR-8812",
    equipmentRegNo: "TG-04-EX-4122",
    machineryEquipment: "CAT 320D Hydraulic Excavator",
    operatorName: "Ramesh Sahu",
    operatorLicense: "TG-HEO-2021-9981",
    sourceLocation: "Mahanadi In-stream Perennial Bed (Pillars P1-P4)",
    gpsCoordinates: "21.2514° N, 81.6296° E",
    geoLocation: "21.2514° N, 81.6296° E",
    latitude: 21.2514,
    longitude: 81.6296,
    isWithinGeofence: true,
    loadingQuantityMt: 450,
    loadingTime: "08:20 AM",
    shift: "Morning (06:00 - 14:00)" as ExcavationShift,
    photoEvidenceUrl:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80",
    photoTimestamp: "2026-09-09 08:24:12 IST",
    officerVerification: {
      verifiedBy: "Er. Rameshwar Sharma",
      designation: "Assistant Director of Mines",
      contactNumber: "+91 98261 44521",
      status: "Verified",
      verificationDate: "2026-09-09 09:15",
      verificationNotes: "Physical depth check verified (1.4m < 2.0m max permissible). Geofence verified.",
    },
    permitQuotaUsedMt: 450,
    remainingQuotaMt: 68550,
    approvedQuotaMt: 120000,
    remarks: "Standard morning extraction completed within approved river channel boundary.",
    status: "Approved",
    approvedBy: "District Mining Officer (Raipur)",
    verifiedBy: "Er. Rameshwar Sharma",
    auditTrail: [
      {
        id: "AUD-1",
        action: "Excavation Logged",
        performedBy: "Ramesh Sahu (Operator)",
        role: "Operator",
        timestamp: "2026-09-09 08:30:15",
        remarks: "Automated geofence capture & geotag photo attached.",
      },
      {
        id: "AUD-2",
        action: "Field Inspection Verified",
        performedBy: "Er. Rameshwar Sharma (Mining Officer)",
        role: "Inspector",
        timestamp: "2026-09-09 09:15:00",
        remarks: "Physical depth check verified (1.4m < 2.0m max permissible).",
      },
    ],
  },
  {
    id: "EXC-2026-002",
    excavationSlipNo: "EXC/TG/BSP/2026/0542",
    reachId: "RCH-003",
    reachName: "Bilaspur Arpa Sand Quarry Block B",
    district: "Bilaspur",
    riverName: "Arpa River",
    extractionDate: "2026-09-09",
    dateTime: "2026-09-09 11:15",
    extractionQuantityMt: 320,
    excavatedQuantityMt: 320,
    vehicleNumber: "TG-10-TR-5541",
    equipmentRegNo: "TG-10-EX-8703",
    machineryEquipment: "Komatsu PC210-10M0",
    operatorName: "Sunil Kumar Dewangan",
    operatorLicense: "TG-HEO-2019-4412",
    sourceLocation: "Arpa River Central Sandbar Block 02",
    gpsCoordinates: "22.0797° N, 82.1409° E",
    geoLocation: "22.0797° N, 82.1409° E",
    latitude: 22.0797,
    longitude: 82.1409,
    isWithinGeofence: true,
    loadingQuantityMt: 320,
    loadingTime: "11:00 AM",
    shift: "Morning (06:00 - 14:00)" as ExcavationShift,
    photoEvidenceUrl:
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&auto=format&fit=crop&q=80",
    photoTimestamp: "2026-09-09 11:10:04 IST",
    officerVerification: {
      verifiedBy: "Shri Alok Kumar Dewangan",
      designation: "District Mining Officer (DMO)",
      contactNumber: "+91 97551 12390",
      status: "Verified",
      verificationDate: "2026-09-09 11:45",
      verificationNotes: "Approved loading onto tractor carriers.",
    },
    permitQuotaUsedMt: 320,
    remainingQuotaMt: 42180,
    approvedQuotaMt: 85000,
    remarks: "Extracted medium coarse sand from designated bar. No deep digging.",
    status: "Approved",
    approvedBy: "Shri Alok Kumar Dewangan",
    verifiedBy: "Shri Alok Kumar Dewangan",
  },
  {
    id: "EXC-2026-003",
    excavationSlipNo: "EXC/TG/DRG/2026/1102",
    reachId: "RCH-002",
    reachName: "Shivnath River Reach Delta",
    district: "Durg",
    riverName: "Shivnath River",
    extractionDate: "2026-09-09",
    dateTime: "2026-09-09 14:45",
    extractionQuantityMt: 600,
    excavatedQuantityMt: 600,
    vehicleNumber: "TG-07-TR-9014",
    equipmentRegNo: "TG-07-EX-1940",
    machineryEquipment: "JCB 220LC Xtra Excavator",
    operatorName: "Mohan Lal Tandon",
    operatorLicense: "TG-HEO-2020-7731",
    sourceLocation: "Shivnath Sand Bar Sector 2B",
    gpsCoordinates: "21.1904° N, 81.2849° E",
    geoLocation: "21.1904° N, 81.2849° E",
    latitude: 21.1904,
    longitude: 81.2849,
    isWithinGeofence: true,
    loadingQuantityMt: 600,
    loadingTime: "02:30 PM",
    shift: "Afternoon (14:00 - 22:00)" as ExcavationShift,
    photoEvidenceUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    photoTimestamp: "2026-09-09 14:40:55 IST",
    officerVerification: {
      verifiedBy: "Smt. Priyanka Verma",
      designation: "Mining Inspector / Zone In-Charge",
      contactNumber: "+91 94252 88910",
      status: "Pending",
      verificationNotes: "Field inspection scheduled for shift change verification.",
    },
    permitQuotaUsedMt: 600,
    remainingQuotaMt: 98400,
    approvedQuotaMt: 150000,
    remarks: "Afternoon shift sand dredging with GPS tracking and river buffer maintenance.",
    status: "Under Verification",
    verifiedBy: "Smt. Priyanka Verma",
  },
];

const initialState: ExcavationState = {
  records: initialRecords,
  selectedRecord: null,
  filters: {
    searchQuery: "",
    selectedReachId: "ALL",
    selectedShift: "ALL",
    selectedStatus: "ALL",
    dateRange: {
      start: "",
      end: "",
    },
  },
  isDetailModalOpen: false,
  isPhotoModalOpen: false,
  isAuditModalOpen: false,
  isConfirmModalOpen: false,
  pendingStatusUpdate: null,
};

export const excavationSlice = createSlice({
  name: "excavation",
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<ExcavationRecord[]>) => {
      state.records = action.payload;
    },
    addRecord: (state, action: PayloadAction<ExcavationRecord>) => {
      state.records.unshift(action.payload);
    },
    updateRecord: (state, action: PayloadAction<ExcavationRecord>) => {
      const idx = state.records.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.records[idx] = action.payload;
      }
    },
    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: ExcavationStatus; remarks?: string; user?: string }>
    ) => {
      const target = state.records.find((r) => r.id === action.payload.id);
      if (target) {
        target.status = action.payload.status;
        if (action.payload.status === "Approved") {
          target.approvedBy = action.payload.user || "District Mining Officer";
        }
        if (!target.auditTrail) target.auditTrail = [];
        target.auditTrail.push({
          id: `AUD-${Date.now()}`,
          action: `Status Changed to ${action.payload.status}`,
          performedBy: action.payload.user || "State Admin",
          role: "Officer",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          remarks: action.payload.remarks || "Status updated via Excavation Control Desk.",
        });
      }
    },
    setSelectedRecord: (state, action: PayloadAction<ExcavationRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ExcavationFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsPhotoModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPhotoModalOpen = action.payload;
    },
    setIsAuditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuditModalOpen = action.payload;
    },
    setIsConfirmModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isConfirmModalOpen = action.payload;
    },
    setPendingStatusUpdate: (
      state,
      action: PayloadAction<{ id: string; targetStatus: ExcavationStatus; remarks?: string } | null>
    ) => {
      state.pendingStatusUpdate = action.payload;
    },
  },
});

export const {
  setRecords,
  addRecord,
  updateRecord,
  updateStatus,
  setSelectedRecord,
  setFilters,
  resetFilters,
  setIsDetailModalOpen,
  setIsPhotoModalOpen,
  setIsAuditModalOpen,
  setIsConfirmModalOpen,
  setPendingStatusUpdate,
} = excavationSlice.actions;

export default excavationSlice.reducer;
