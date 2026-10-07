import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WeighbridgeRecord, WeighbridgeStatus } from "../types";

interface WeighbridgeState {
  records: WeighbridgeRecord[];
  selectedRecord: WeighbridgeRecord | null;
  isDetailModalOpen: boolean;
  isReweighModalOpen: boolean;
  isAnprModalOpen: boolean;
  isSyncModalOpen: boolean;
  isApproveModalOpen: boolean;
  isPrintModalOpen: boolean;
}

const initialRecords: WeighbridgeRecord[] = [
  {
    id: "WBR-001",
    weighbridgeId: "WB-CG-001",
    weighbridgeName: "Arang Digital Weighbridge WB-01",
    slipNumber: "WB-SLIP-2026-1042",
    vehicleNumber: "CG-04-TX-2341",
    vehicleRtoType: "10-Wheeler Heavy Commercial (GVW 28T)",
    driverName: "Dharmendra Sahu",
    driverMobile: "9826190012",
    tareWeightKg: 8400,
    grossWeightKg: 24400,
    netSandWeightMt: 16.0,
    dateTime: "2026-09-09 09:40",
    bookingId: "BKG-CG-2026-0941",
    ePassId: "EPASS-CG-2026-4401",
    stockyardId: "STK-CG-001",
    stockyardName: "Raipur Central River Stockyard",
    operatorName: "V. N. Dewangan",
    operatorId: "WB-OP-04",
    status: "Verified",
    photoUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
    anprPlateConfidence: 99.4,
    anprSnapshotUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
    isOverloaded: false,
    remarks: "Matched booking quota of 16.0 MT exactly. Load cells verified.",
  },
  {
    id: "WBR-002",
    weighbridgeId: "WB-CG-002",
    weighbridgeName: "Koni Smart Weighbridge WB-02",
    slipNumber: "WB-SLIP-2026-1043",
    vehicleNumber: "CG-10-AZ-8812",
    vehicleRtoType: "6-Wheeler Medium Tipper (GVW 16T)",
    driverName: "Gopal Ram Yadav",
    driverMobile: "9425177890",
    tareWeightKg: 6200,
    grossWeightKg: 16200,
    netSandWeightMt: 10.0,
    dateTime: "2026-09-09 10:15",
    bookingId: "BKG-CG-2026-0955",
    ePassId: "EPASS-CG-2026-4412",
    stockyardId: "STK-CG-002",
    stockyardName: "Bilaspur North Sand Depot",
    operatorName: "Rakesh Kashyap",
    operatorId: "WB-OP-10",
    status: "Captured",
    photoUrl: "https://images.unsplash.com/photo-1586191582056-a6b6833b8796?w=600&auto=format&fit=crop&q=80",
    anprPlateConfidence: 98.8,
    isOverloaded: false,
    remarks: "Gross weighment captured via automated optical plate scan.",
  },
  {
    id: "WBR-003",
    weighbridgeId: "WB-CG-003",
    weighbridgeName: "Pulgaon In-Motion Scale WB-03",
    slipNumber: "WB-SLIP-2026-1044",
    vehicleNumber: "CG-07-CA-5510",
    vehicleRtoType: "12-Wheeler Multi-Axle (GVW 35T)",
    driverName: "Sanjay Kumar Netam",
    driverMobile: "9755201144",
    tareWeightKg: 10500,
    grossWeightKg: 34500,
    netSandWeightMt: 24.0,
    dateTime: "2026-09-09 11:30",
    bookingId: "BKG-CG-2026-0970",
    ePassId: "EPASS-CG-2026-4430",
    stockyardId: "STK-CG-003",
    stockyardName: "Durg Shivnath Stockyard Lot-2",
    operatorName: "M. K. Sharma",
    operatorId: "WB-OP-07",
    status: "Flagged Overload",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?w=600&auto=format&fit=crop&q=80",
    anprPlateConfidence: 96.5,
    isOverloaded: true,
    overloadVarianceKg: 2000,
    remarks: "Overload alert: Vehicle load exceeds booked e-Pass capacity by 2.0 MT.",
  },
  {
    id: "WBR-004",
    weighbridgeId: "WB-CG-004",
    weighbridgeName: "Darri Road Automated Scale WB-04",
    slipNumber: "WB-SLIP-2026-1045",
    vehicleNumber: "CG-12-MB-9021",
    vehicleRtoType: "10-Wheeler Heavy Commercial (GVW 28T)",
    driverName: "Bhupendra Baghel",
    driverMobile: "9981432201",
    tareWeightKg: 8500,
    grossWeightKg: 22500,
    netSandWeightMt: 14.0,
    dateTime: "2026-09-09 12:05",
    bookingId: "BKG-CG-2026-0988",
    ePassId: "EPASS-CG-2026-4445",
    stockyardId: "STK-CG-004",
    stockyardName: "Korba Hasdeo Buffer Yard",
    operatorName: "Anand Rathore",
    operatorId: "WB-OP-12",
    status: "Verified",
    photoUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
    anprPlateConfidence: 99.1,
    isOverloaded: false,
    remarks: "Verified and approved for dispatch gate-out.",
  },
  {
    id: "WBR-005",
    weighbridgeId: "WB-CG-005",
    weighbridgeName: "Indravati Bridge Scale WB-05",
    slipNumber: "WB-SLIP-2026-1046",
    vehicleNumber: "CG-17-HB-3309",
    vehicleRtoType: "6-Wheeler Tipper (GVW 16T)",
    driverName: "Prakash Korram",
    driverMobile: "9179883412",
    tareWeightKg: 6100,
    grossWeightKg: 0,
    netSandWeightMt: 0,
    dateTime: "2026-09-09 13:00",
    bookingId: "BKG-CG-2026-0992",
    ePassId: "EPASS-CG-2026-4450",
    stockyardId: "STK-CG-005",
    stockyardName: "Bastar Indravati Sand Terminal",
    operatorName: "Laxman Poyam",
    operatorId: "WB-OP-17",
    status: "Tare Captured",
    photoUrl: "https://images.unsplash.com/photo-1586191582056-a6b6833b8796?w=600&auto=format&fit=crop&q=80",
    anprPlateConfidence: 97.4,
    isOverloaded: false,
    remarks: "Empty truck tare weight recorded at entry gate. Awaiting sand loading.",
  },
];

const initialState: WeighbridgeState = {
  records: initialRecords,
  selectedRecord: null,
  isDetailModalOpen: false,
  isReweighModalOpen: false,
  isAnprModalOpen: false,
  isSyncModalOpen: false,
  isApproveModalOpen: false,
  isPrintModalOpen: false,
};

export const weighbridgeSlice = createSlice({
  name: "weighbridge",
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<WeighbridgeRecord[]>) => {
      state.records = action.payload;
    },
    addRecord: (state, action: PayloadAction<WeighbridgeRecord>) => {
      state.records.unshift(action.payload);
    },
    updateRecord: (state, action: PayloadAction<WeighbridgeRecord>) => {
      const idx = state.records.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.records[idx] = action.payload;
      }
    },
    updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: WeighbridgeStatus; remarks?: string }>
    ) => {
      const target = state.records.find((r) => r.id === action.payload.id);
      if (target) {
        target.status = action.payload.status;
        if (action.payload.remarks) {
          target.remarks = action.payload.remarks;
        }
      }
    },
    reweighRecord: (
      state,
      action: PayloadAction<{ id: string; grossWeightKg: number; operatorName: string }>
    ) => {
      const target = state.records.find((r) => r.id === action.payload.id);
      if (target) {
        target.grossWeightKg = action.payload.grossWeightKg;
        target.netSandWeightMt = Number(
          ((target.grossWeightKg - target.tareWeightKg) / 1000).toFixed(2)
        );
        target.status = "Verified";
        target.operatorName = action.payload.operatorName;
        target.remarks = `Re-weighed successfully. Net sand calculated: ${target.netSandWeightMt} MT.`;
      }
    },
    setSelectedRecord: (state, action: PayloadAction<WeighbridgeRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsReweighModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReweighModalOpen = action.payload;
    },
    setIsAnprModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAnprModalOpen = action.payload;
    },
    setIsSyncModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSyncModalOpen = action.payload;
    },
    setIsApproveModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isApproveModalOpen = action.payload;
    },
    setIsPrintModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPrintModalOpen = action.payload;
    },
  },
});

export const {
  setRecords,
  addRecord,
  updateRecord,
  updateStatus,
  reweighRecord,
  setSelectedRecord,
  setIsDetailModalOpen,
  setIsReweighModalOpen,
  setIsAnprModalOpen,
  setIsSyncModalOpen,
  setIsApproveModalOpen,
  setIsPrintModalOpen,
} = weighbridgeSlice.actions;

export default weighbridgeSlice.reducer;
