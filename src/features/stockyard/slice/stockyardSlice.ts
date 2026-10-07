import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Stockyard,
  StockLedgerEntry,
  StockyardStatus,
  SandType,
} from "../types";

interface StockyardState {
  stockyards: Stockyard[];
  ledgerEntries: StockLedgerEntry[];
  selectedStockyard: Stockyard | null;
  isDetailModalOpen: boolean;
  isReceiveModalOpen: boolean;
  isAdjustModalOpen: boolean;
  isTransferModalOpen: boolean;
  isLedgerModalOpen: boolean;
}

const initialStockyards: Stockyard[] = [
  {
    id: "STK-001",
    stockyardId: "STK-CG-001",
    name: "Raipur Central River Stockyard",
    district: "Raipur",
    location: "Arang Riverbed Sector 4, NH-53",
    sandType: "Coarse River Sand" as SandType,
    openingStockMt: 8200,
    receivedMt: 4650,
    dispatchedMt: 3200,
    closingStockMt: 9650,
    capacityMt: 15000,
    availableQuantityMt: 9650,
    linkedWeighbridgeId: "WB-CG-001",
    linkedWeighbridgeName: "Arang Digital Weighbridge WB-01",
    managerName: "Devendra Verma",
    contactNumber: "9826145520",
    status: "Active" as StockyardStatus,
  },
  {
    id: "STK-002",
    stockyardId: "STK-CG-002",
    name: "Bilaspur North Sand Depot",
    district: "Bilaspur",
    location: "Koni Bypass, Arpa River Basin",
    sandType: "Medium Concrete Sand" as SandType,
    openingStockMt: 5400,
    receivedMt: 2800,
    dispatchedMt: 2450,
    closingStockMt: 5750,
    capacityMt: 12000,
    availableQuantityMt: 5750,
    linkedWeighbridgeId: "WB-CG-002",
    linkedWeighbridgeName: "Koni Smart Weighbridge WB-02",
    managerName: "Alok Tiwari",
    contactNumber: "9425218840",
    status: "Active" as StockyardStatus,
  },
  {
    id: "STK-003",
    stockyardId: "STK-CG-003",
    name: "Durg Shivnath Stockyard Lot-2",
    district: "Durg",
    location: "Pulgaon Bridge Sand Yard, Durg",
    sandType: "Fine Plastering Sand" as SandType,
    openingStockMt: 11800,
    receivedMt: 1850,
    dispatchedMt: 800,
    closingStockMt: 12850,
    capacityMt: 13000,
    availableQuantityMt: 12850,
    linkedWeighbridgeId: "WB-CG-003",
    linkedWeighbridgeName: "Pulgaon In-Motion Scale WB-03",
    managerName: "Sanjay Agrawal",
    contactNumber: "9755104421",
    status: "At Capacity" as StockyardStatus,
  },
  {
    id: "STK-004",
    stockyardId: "STK-CG-004",
    name: "Korba Hasdeo Buffer Yard",
    district: "Korba",
    location: "Darri Barrage Road, Industrial Zone",
    sandType: "Coarse River Sand" as SandType,
    openingStockMt: 3200,
    receivedMt: 1200,
    dispatchedMt: 950,
    closingStockMt: 3450,
    capacityMt: 10000,
    availableQuantityMt: 3450,
    linkedWeighbridgeId: "WB-CG-004",
    linkedWeighbridgeName: "Darri Road Automated Scale WB-04",
    managerName: "Rajesh Soni",
    contactNumber: "9981240092",
    status: "Active" as StockyardStatus,
  },
  {
    id: "STK-005",
    stockyardId: "STK-CG-005",
    name: "Bastar Indravati Sand Terminal",
    district: "Bastar",
    location: "Jagdalpur Outskirts, Ghat-1",
    sandType: "Gravel Sand" as SandType,
    openingStockMt: 1500,
    receivedMt: 0,
    dispatchedMt: 0,
    closingStockMt: 1500,
    capacityMt: 8000,
    availableQuantityMt: 1500,
    linkedWeighbridgeId: "WB-CG-005",
    linkedWeighbridgeName: "Indravati Bridge Scale WB-05",
    managerName: "Gopal Kashyap",
    contactNumber: "9179456201",
    status: "Maintenance" as StockyardStatus,
  },
];

const initialLedger: StockLedgerEntry[] = [
  {
    id: "LED-001",
    dateTime: "2026-09-09 08:35",
    stockyardId: "STK-CG-001",
    stockyardName: "Raipur Central River Stockyard",
    transactionType: "INWARD_EXCAVATION",
    quantityMt: 450,
    previousStockMt: 9200,
    newStockMt: 9650,
    referenceId: "EXC/CG/RPR/2026/0891",
    authorizedBy: "DMO Raipur",
    remarks: "Direct source excavation receipt from Mahanadi Basin Reach Alpha",
    approvalStatus: "Approved",
  },
  {
    id: "LED-002",
    dateTime: "2026-09-09 09:10",
    stockyardId: "STK-CG-001",
    stockyardName: "Raipur Central River Stockyard",
    transactionType: "OUTWARD_DISPATCH",
    quantityMt: 40,
    previousStockMt: 9650,
    newStockMt: 9610,
    referenceId: "DSP/CG/2026/4102",
    authorizedBy: "Yard Supervisor",
    remarks: "Consumer sand dispatch via Truck CG-04-JB-2210",
    approvalStatus: "Approved",
  },
  {
    id: "LED-003",
    dateTime: "2026-09-09 10:15",
    stockyardId: "STK-CG-002",
    stockyardName: "Bilaspur North Sand Depot",
    transactionType: "INWARD_EXCAVATION",
    quantityMt: 320,
    previousStockMt: 5430,
    newStockMt: 5750,
    referenceId: "EXC/CG/BSP/2026/0542",
    authorizedBy: "DMO Bilaspur",
    remarks: "Direct source excavation receipt from Arpa River Sand Zone-2",
    approvalStatus: "Approved",
  },
];

const initialState: StockyardState = {
  stockyards: initialStockyards,
  ledgerEntries: initialLedger,
  selectedStockyard: null,
  isDetailModalOpen: false,
  isReceiveModalOpen: false,
  isAdjustModalOpen: false,
  isTransferModalOpen: false,
  isLedgerModalOpen: false,
};

export const stockyardSlice = createSlice({
  name: "stockyard",
  initialState,
  reducers: {
    setStockyards: (state, action: PayloadAction<Stockyard[]>) => {
      state.stockyards = action.payload;
    },
    addStockyard: (state, action: PayloadAction<Stockyard>) => {
      state.stockyards.unshift(action.payload);
    },
    updateStockyard: (state, action: PayloadAction<Stockyard>) => {
      const idx = state.stockyards.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.stockyards[idx] = action.payload;
      }
    },
    receiveStock: (
      state,
      action: PayloadAction<{
        stockyardId: string;
        quantityMt: number;
        referenceId: string;
        sourceReach: string;
        authorizedBy: string;
      }>
    ) => {
      const target = state.stockyards.find(
        (s) => s.id === action.payload.stockyardId || s.stockyardId === action.payload.stockyardId
      );
      if (target) {
        const prev = target.availableQuantityMt;
        target.receivedMt += action.payload.quantityMt;
        target.availableQuantityMt += action.payload.quantityMt;
        target.closingStockMt = target.availableQuantityMt;
        if (target.availableQuantityMt >= target.capacityMt) {
          target.status = "At Capacity";
        }

        state.ledgerEntries.unshift({
          id: `LED-${Date.now()}`,
          dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          stockyardId: target.stockyardId,
          stockyardName: target.name,
          transactionType: "INWARD_EXCAVATION",
          quantityMt: action.payload.quantityMt,
          previousStockMt: prev,
          newStockMt: target.availableQuantityMt,
          referenceId: action.payload.referenceId,
          authorizedBy: action.payload.authorizedBy,
          remarks: `Inward sand stock from ${action.payload.sourceReach}`,
          approvalStatus: "Approved",
        });
      }
    },
    adjustStock: (
      state,
      action: PayloadAction<{
        stockyardId: string;
        adjustmentType: "INCREASE" | "DECREASE";
        quantityMt: number;
        reason: string;
        authorizedBy: string;
      }>
    ) => {
      const target = state.stockyards.find(
        (s) => s.id === action.payload.stockyardId || s.stockyardId === action.payload.stockyardId
      );
      if (target) {
        const prev = target.availableQuantityMt;
        const change =
          action.payload.adjustmentType === "INCREASE"
            ? action.payload.quantityMt
            : -action.payload.quantityMt;
        target.availableQuantityMt = Math.max(0, target.availableQuantityMt + change);
        target.closingStockMt = target.availableQuantityMt;

        state.ledgerEntries.unshift({
          id: `LED-${Date.now()}`,
          dateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
          stockyardId: target.stockyardId,
          stockyardName: target.name,
          transactionType: "ADJUSTMENT",
          quantityMt: action.payload.quantityMt,
          previousStockMt: prev,
          newStockMt: target.availableQuantityMt,
          referenceId: `ADJ-${Date.now()}`,
          authorizedBy: action.payload.authorizedBy,
          remarks: `Audit Adjustment (${action.payload.adjustmentType}): ${action.payload.reason}`,
          approvalStatus: "Approved",
        });
      }
    },
    transferStock: (
      state,
      action: PayloadAction<{
        fromStockyardId: string;
        toStockyardId: string;
        quantityMt: number;
        vehicleNumber: string;
        driverName: string;
        remarks: string;
        authorizedBy: string;
      }>
    ) => {
      const fromYard = state.stockyards.find(
        (s) => s.id === action.payload.fromStockyardId || s.stockyardId === action.payload.fromStockyardId
      );
      const toYard = state.stockyards.find(
        (s) => s.id === action.payload.toStockyardId || s.stockyardId === action.payload.toStockyardId
      );

      if (fromYard && toYard) {
        const fromPrev = fromYard.availableQuantityMt;
        const toPrev = toYard.availableQuantityMt;

        fromYard.dispatchedMt += action.payload.quantityMt;
        fromYard.availableQuantityMt -= action.payload.quantityMt;
        fromYard.closingStockMt = fromYard.availableQuantityMt;

        toYard.receivedMt += action.payload.quantityMt;
        toYard.availableQuantityMt += action.payload.quantityMt;
        toYard.closingStockMt = toYard.availableQuantityMt;

        const refId = `TRF-${Date.now()}`;
        const dt = new Date().toISOString().replace("T", " ").substring(0, 16);

        // Double-entry ledger
        state.ledgerEntries.unshift({
          id: `LED-${Date.now()}-OUT`,
          dateTime: dt,
          stockyardId: fromYard.stockyardId,
          stockyardName: fromYard.name,
          transactionType: "TRANSFER_OUT",
          quantityMt: action.payload.quantityMt,
          previousStockMt: fromPrev,
          newStockMt: fromYard.availableQuantityMt,
          referenceId: refId,
          authorizedBy: action.payload.authorizedBy,
          remarks: `Inter-yard transfer to ${toYard.name} via ${action.payload.vehicleNumber}`,
          approvalStatus: "Approved",
        });

        state.ledgerEntries.unshift({
          id: `LED-${Date.now()}-IN`,
          dateTime: dt,
          stockyardId: toYard.stockyardId,
          stockyardName: toYard.name,
          transactionType: "TRANSFER_IN",
          quantityMt: action.payload.quantityMt,
          previousStockMt: toPrev,
          newStockMt: toYard.availableQuantityMt,
          referenceId: refId,
          authorizedBy: action.payload.authorizedBy,
          remarks: `Inter-yard transfer from ${fromYard.name} via ${action.payload.vehicleNumber}`,
          approvalStatus: "Approved",
        });
      }
    },
    setSelectedStockyard: (state, action: PayloadAction<Stockyard | null>) => {
      state.selectedStockyard = action.payload;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsReceiveModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReceiveModalOpen = action.payload;
    },
    setIsAdjustModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAdjustModalOpen = action.payload;
    },
    setIsTransferModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTransferModalOpen = action.payload;
    },
    setIsLedgerModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLedgerModalOpen = action.payload;
    },
  },
});

export const {
  setStockyards,
  addStockyard,
  updateStockyard,
  receiveStock,
  adjustStock,
  transferStock,
  setSelectedStockyard,
  setIsDetailModalOpen,
  setIsReceiveModalOpen,
  setIsAdjustModalOpen,
  setIsTransferModalOpen,
  setIsLedgerModalOpen,
} = stockyardSlice.actions;

export default stockyardSlice.reducer;
