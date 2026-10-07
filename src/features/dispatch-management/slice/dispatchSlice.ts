import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DispatchItem, DispatchStatus, GpsSignalStatus, TransitPassRecord } from "../types";

interface DispatchState {
  dispatches: DispatchItem[];
  selectedDispatch: DispatchItem | null;
  transitPasses: TransitPassRecord[];
  selectedTransitPass: TransitPassRecord | null;
  isDetailModalOpen: boolean;
  isAssignVehicleModalOpen: boolean;
  isLoadingModalOpen: boolean;
  isEPassModalOpen: boolean;
  isTransitPassModalOpen: boolean;
  isGateOutModalOpen: boolean;
  isCancelModalOpen: boolean;
  isQrScanModalOpen: boolean;
}

const initialDispatches: DispatchItem[] = [
  {
    id: "DISP-001",
    dispatchId: "DISP-CG-2026-0091",
    bookingId: "BKG-CG-2026-0941",
    customerName: "Raipur Infrastructures Corp",
    customerMobile: "9826011223",
    vehicleNumber: "CG-04-TX-2341",
    driverName: "Dharmendra Sahu",
    driverMobile: "9826190012",
    driverLicense: "CG-04-DL-2018-0912",
    stockyardId: "STK-CG-001",
    stockyardName: "Mandir Hasaud Central Stockyard",
    sandType: "Coarse River Sand",
    quantityMt: 16.0,
    weighbridgeSlipNumber: "WB-SLIP-2026-9041",
    tareWeightKg: 8400,
    grossWeightKg: 24400,
    loadingTime: "2026-03-09 14:15",
    dispatchTime: "2026-03-09 14:40",
    destination: "Naya Raipur Sector 24 Project Site",
    destinationCoordinates: { lat: 21.1612, lng: 81.7891 },
    ePassNumber: "EPASS-CG-2026-09144",
    gpsStatus: "Signal Healthy" as GpsSignalStatus,
    gpsImei: "AIS140-CG-04-8891",
    currentLocation: "Arang Bypass Highway NH-53 (Speed: 42 km/h)",
    dispatchStatus: "Dispatched (In Transit)" as DispatchStatus,
    isPaymentVerified: true,
    paymentRef: "PAY-ICICI-9921001",
    isStockVerified: true,
    isVehicleVerified: true,
    remarks: "Authorized for priority government housing transit.",
  },
  {
    id: "DISP-002",
    dispatchId: "DISP-CG-2026-0092",
    bookingId: "BKG-CG-2026-0942",
    customerName: "Bilaspur Urban Construction LLP",
    customerMobile: "9425033445",
    vehicleNumber: "CG-10-AZ-8812",
    driverName: "Gopal Ram Yadav",
    driverMobile: "9425177890",
    driverLicense: "CG-10-DL-2019-3321",
    stockyardId: "STK-CG-002",
    stockyardName: "Koni Bypass Stockyard",
    sandType: "Medium Concrete Sand",
    quantityMt: 10.0,
    weighbridgeSlipNumber: "WB-SLIP-2026-9042",
    tareWeightKg: 6200,
    grossWeightKg: 16200,
    loadingTime: "2026-03-09 15:10",
    dispatchTime: "2026-03-09 15:30",
    destination: "Bilaspur Smart City Ring Road Zone",
    destinationCoordinates: { lat: 22.0797, lng: 82.1409 },
    ePassNumber: "EPASS-CG-2026-09145",
    gpsStatus: "Signal Healthy" as GpsSignalStatus,
    gpsImei: "AIS140-CG-10-4412",
    currentLocation: "Near Gate Out Checkpost - Scale 1",
    dispatchStatus: "Ready for Dispatch" as DispatchStatus,
    isPaymentVerified: true,
    paymentRef: "PAY-SBI-8812401",
    isStockVerified: true,
    isVehicleVerified: true,
    remarks: "Weighment and RFID matched. Awaiting gate security scan.",
  },
  {
    id: "DISP-003",
    dispatchId: "DISP-CG-2026-0093",
    bookingId: "BKG-CG-2026-0943",
    customerName: "Durg High-Rise Towers Project",
    customerMobile: "9755011990",
    vehicleNumber: "CG-07-CA-5510",
    driverName: "Sanjay Kumar Netam",
    driverMobile: "9755201144",
    driverLicense: "CG-07-DL-2017-7721",
    stockyardId: "STK-CG-003",
    stockyardName: "Pulgaon Riverbed Depot",
    sandType: "Coarse River Sand",
    quantityMt: 24.0,
    weighbridgeSlipNumber: "WB-SLIP-2026-9043",
    tareWeightKg: 10500,
    grossWeightKg: 34500,
    loadingTime: "2026-03-09 15:45",
    destination: "Bhilai Steel Township Expansion Phase-2",
    destinationCoordinates: { lat: 21.1938, lng: 81.3509 },
    ePassNumber: "EPASS-CG-2026-09146",
    gpsStatus: "Signal Healthy" as GpsSignalStatus,
    gpsImei: "AIS140-CG-07-9002",
    currentLocation: "Stockyard Bay 3 (Excavator Loading)",
    dispatchStatus: "Loading in Progress" as DispatchStatus,
    isPaymentVerified: true,
    paymentRef: "PAY-AXIS-3309812",
    isStockVerified: true,
    isVehicleVerified: true,
    remarks: "Hydraulic loader assigned. Initial tare logged.",
  },
  {
    id: "DISP-004",
    dispatchId: "DISP-CG-2026-0094",
    bookingId: "BKG-CG-2026-0944",
    customerName: "Korba Power Plant Civil Works",
    customerMobile: "9981022448",
    vehicleNumber: "CG-12-MB-9021",
    driverName: "Bhupendra Baghel",
    driverMobile: "9981432201",
    driverLicense: "CG-12-DL-2020-5512",
    stockyardId: "STK-CG-004",
    stockyardName: "Darri Barrage River Stockyard",
    sandType: "Fine Plastering Sand",
    quantityMt: 16.0,
    weighbridgeSlipNumber: "WB-SLIP-2026-9044",
    tareWeightKg: 8500,
    grossWeightKg: 24500,
    loadingTime: "2026-03-09 15:20",
    destination: "Korba Industrial Estate Plot 44",
    destinationCoordinates: { lat: 22.3595, lng: 82.7501 },
    ePassNumber: "EPASS-CG-2026-09147",
    gpsStatus: "Signal Healthy" as GpsSignalStatus,
    gpsImei: "AIS140-CG-12-7719",
    currentLocation: "Weighbridge Outbound Bay",
    dispatchStatus: "Weighed & Cleared" as DispatchStatus,
    isPaymentVerified: true,
    paymentRef: "PAY-HDFC-9912003",
    isStockVerified: true,
    isVehicleVerified: true,
    remarks: "Net weight 16.0 MT verified against permit quota.",
  },
  {
    id: "DISP-005",
    dispatchId: "DISP-CG-2026-0095",
    bookingId: "BKG-CG-2026-0945",
    customerName: "Bastar Tribal Welfare School Complex",
    customerMobile: "9179044112",
    vehicleNumber: "CG-17-HB-3309",
    driverName: "Prakash Korram",
    driverMobile: "9179883412",
    driverLicense: "CG-17-DL-2016-1190",
    stockyardId: "STK-CG-005",
    stockyardName: "Jagdalpur South Depot",
    sandType: "Medium Concrete Sand",
    quantityMt: 10.0,
    weighbridgeSlipNumber: "PENDING-WEIGH",
    loadingTime: "Pending",
    destination: "Jagdalpur Sector 5 Educational Hub",
    destinationCoordinates: { lat: 19.0744, lng: 82.009 },
    ePassNumber: "PENDING-EPASS",
    gpsStatus: "Offline" as GpsSignalStatus,
    currentLocation: "Stockyard Entrance Waiting Queue",
    dispatchStatus: "Pending Assignment" as DispatchStatus,
    isPaymentVerified: true,
    paymentRef: "PAY-ICICI-1109441",
    isStockVerified: true,
    isVehicleVerified: false,
    remarks: "Awaiting driver verification clearance.",
  },
];

const initialState: DispatchState = {
  dispatches: initialDispatches,
  selectedDispatch: null,
  transitPasses: [],
  selectedTransitPass: null,
  isDetailModalOpen: false,
  isAssignVehicleModalOpen: false,
  isLoadingModalOpen: false,
  isEPassModalOpen: false,
  isTransitPassModalOpen: false,
  isGateOutModalOpen: false,
  isCancelModalOpen: false,
  isQrScanModalOpen: false,
};

export const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    setDispatches: (state, action: PayloadAction<DispatchItem[]>) => {
      state.dispatches = action.payload;
    },
    addDispatch: (state, action: PayloadAction<DispatchItem>) => {
      state.dispatches.unshift(action.payload);
    },
    updateDispatch: (state, action: PayloadAction<DispatchItem>) => {
      const idx = state.dispatches.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        if (state.dispatches[idx].isLocked) {
          console.warn(
            `Security Alert: Unauthorized attempt to edit locked transit pass / dispatch record ${action.payload.id}. Modifications blocked.`
          );
          return; // Strict rejection of unauthorized modification
        }
        state.dispatches[idx] = action.payload;
      }
    },
    assignVehicleAndDriver: (
      state,
      action: PayloadAction<{
        dispatchId: string;
        vehicleNumber: string;
        driverName: string;
        driverMobile: string;
      }>
    ) => {
      const item = state.dispatches.find((d) => d.id === action.payload.dispatchId);
      if (item) {
        if (item.isLocked) {
          console.warn(`Tamper Guard: Trip ${item.id} is locked with a Transit Pass and cannot reassign vehicle/driver.`);
          return;
        }
        item.vehicleNumber = action.payload.vehicleNumber;
        item.driverName = action.payload.driverName;
        item.driverMobile = action.payload.driverMobile;
        item.isVehicleVerified = true;
        item.dispatchStatus = "Vehicle Assigned";
      }
    },
    confirmLoadingAndWeighment: (
      state,
      action: PayloadAction<{
        dispatchId: string;
        weighbridgeSlipNumber: string;
        grossWeightKg: number;
        tareWeightKg: number;
      }>
    ) => {
      const item = state.dispatches.find((d) => d.id === action.payload.dispatchId);
      if (item) {
        if (item.isLocked) {
          console.warn(`Tamper Guard: Trip ${item.id} is locked with a Transit Pass and cannot alter weighbridge measurements.`);
          return;
        }
        item.weighbridgeSlipNumber = action.payload.weighbridgeSlipNumber;
        item.grossWeightKg = action.payload.grossWeightKg;
        item.tareWeightKg = action.payload.tareWeightKg;
        item.quantityMt = Number(((action.payload.grossWeightKg - action.payload.tareWeightKg) / 1000).toFixed(2));
        item.loadingTime = new Date().toISOString().replace("T", " ").substring(0, 16);
        item.dispatchStatus = "Weighed & Cleared";
      }
    },
    generateEPassForTrip: (
      state,
      action: PayloadAction<{
        dispatchId: string;
        ePassNumber: string;
      }>
    ) => {
      const item = state.dispatches.find((d) => d.id === action.payload.dispatchId);
      if (item) {
        item.ePassNumber = action.payload.ePassNumber;
        item.dispatchStatus = "Ready for Dispatch";
      }
    },
    gateOutDispatchTrip: (
      state,
      action: PayloadAction<{
        dispatchId: string;
      }>
    ) => {
      const item = state.dispatches.find((d) => d.id === action.payload.dispatchId);
      if (item) {
        item.dispatchStatus = "Dispatched (In Transit)";
        item.dispatchTime = new Date().toISOString().replace("T", " ").substring(0, 16);
        item.gpsStatus = "Signal Healthy";
      }
    },
    cancelDispatchTrip: (
      state,
      action: PayloadAction<{
        dispatchId: string;
        reason: string;
      }>
    ) => {
      const item = state.dispatches.find((d) => d.id === action.payload.dispatchId);
      if (item) {
        item.dispatchStatus = "Cancelled";
        item.cancelReason = action.payload.reason;
      }
    },

    // Modal state setters
    setSelectedDispatch: (state, action: PayloadAction<DispatchItem | null>) => {
      state.selectedDispatch = action.payload;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsAssignVehicleModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAssignVehicleModalOpen = action.payload;
    },
    setIsLoadingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoadingModalOpen = action.payload;
    },
    setIsEPassModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEPassModalOpen = action.payload;
    },
    setIsGateOutModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isGateOutModalOpen = action.payload;
    },
    setIsCancelModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCancelModalOpen = action.payload;
    },
    setIsQrScanModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isQrScanModalOpen = action.payload;
    },
    generateTransitPass: (state, action: PayloadAction<TransitPassRecord>) => {
      const pass = action.payload;
      state.transitPasses.unshift(pass);
      state.selectedTransitPass = pass;
      state.isTransitPassModalOpen = true;

      // Synchronize matching dispatch item and lock it permanently
      const item = state.dispatches.find(
        (d) => d.id === pass.id || d.bookingId === pass.orderId || d.dispatchId === pass.id || d.bookingId === pass.bookingId
      );
      if (item) {
        item.isLocked = true;
        item.transitPassNumber = pass.transitPassNumber;
        item.ePassNumber = pass.transitPassNumber;
        item.validUntil = pass.validUntil;
        item.securityHash = pass.securityHash;
        item.dispatchStatus = "Ready for Dispatch";
        item.qrCodeUrl = pass.qrPayload;
        item.sandReachName = pass.sandReach?.reachName;
        item.sandReachId = pass.sandReach?.reachId;
      }
    },
    setSelectedTransitPass: (state, action: PayloadAction<TransitPassRecord | null>) => {
      state.selectedTransitPass = action.payload;
    },
    setIsTransitPassModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTransitPassModalOpen = action.payload;
    },
  },
});

export const {
  setDispatches,
  addDispatch,
  updateDispatch,
  assignVehicleAndDriver,
  confirmLoadingAndWeighment,
  generateEPassForTrip,
  generateTransitPass,
  gateOutDispatchTrip,
  cancelDispatchTrip,
  setSelectedDispatch,
  setSelectedTransitPass,
  setIsDetailModalOpen,
  setIsAssignVehicleModalOpen,
  setIsLoadingModalOpen,
  setIsEPassModalOpen,
  setIsTransitPassModalOpen,
  setIsGateOutModalOpen,
  setIsCancelModalOpen,
  setIsQrScanModalOpen,
} = dispatchSlice.actions;

export default dispatchSlice.reducer;
