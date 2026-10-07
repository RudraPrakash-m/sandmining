export type SandType =
  | "Coarse River Sand"
  | "Medium Concrete Sand"
  | "Fine Plastering Sand"
  | "Gravel Sand";

export type StockyardStatus =
  | "Active"
  | "At Capacity"
  | "Maintenance"
  | "Closed"
  | "Low Stock Warning"
  | "Stock Depleted";

export interface Stockyard {
  id: string;
  stockyardId: string;
  name: string;
  district: string;
  location: string;
  sandType: SandType;
  openingStockMt: number;
  receivedMt: number;
  dispatchedMt: number;
  closingStockMt: number;
  capacityMt: number;
  totalCapacityMt?: number;
  availableQuantityMt: number;
  approvedQuantityMt?: number;
  extractedQuantityMt?: number;
  reservedQuantityMt?: number;
  dispatchedQuantityMt?: number;
  deliveredQuantityMt?: number;
  balanceQuantityMt?: number;
  linkedWeighbridgeId: string;
  linkedWeighbridgeName: string;
  managerName?: string;
  contactNumber?: string;
  status: StockyardStatus;
}

export type StockTransactionType =
  | "INWARD_EXCAVATION"
  | "OUTWARD_DISPATCH"
  | "BOOKING_RESERVED"
  | "DELIVERY_COMPLETED"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface StockLedgerEntry {
  id: string;
  dateTime: string;
  stockyardId: string;
  stockyardName: string;
  transactionType: StockTransactionType;
  quantityMt: number;
  previousStockMt: number;
  newStockMt: number;
  referenceId: string;
  authorizedBy: string;
  remarks: string;
  approvalStatus?: "Approved" | "Pending Approval" | "Rejected";
}

export interface AddStockyardFormData {
  name: string;
  district: string;
  location: string;
  sandType: SandType;
  openingStockMt: number;
  capacityMt: number;
  linkedWeighbridgeId: string;
  managerName?: string;
  contactNumber?: string;
  status: StockyardStatus;
}

export interface StockAdjustmentData {
  stockyardId: string;
  adjustmentType: "INCREASE" | "DECREASE";
  quantityMt: number;
  reason: string;
  authorizedBy: string;
}

export interface StockTransferData {
  fromStockyardId: string;
  toStockyardId: string;
  sandType: SandType;
  quantityMt: number;
  vehicleNumber: string;
  driverName: string;
  remarks: string;
}

export interface StockyardStats {
  totalStockAvailableMt: number;
  totalCapacityMt: number;
  capacityUtilizationPercent: number;
  todayInwardMt: number;
  todayOutwardMt: number;
  activeStockyards: number;
}
