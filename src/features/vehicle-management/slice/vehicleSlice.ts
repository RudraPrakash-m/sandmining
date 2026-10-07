import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Vehicle, VehicleStatus, VehicleType, Driver, DriverStatus } from "../types";

interface VehicleState {
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedVehicle: Vehicle | null;
  selectedDriver: Driver | null;
  isDetailModalOpen: boolean;
  isGpsModalOpen: boolean;
  isDocsModalOpen: boolean;
  isBlacklistModalOpen: boolean;
  isVerifyModalOpen: boolean;
  isDriverDetailModalOpen: boolean;
  isDriverVerifyModalOpen: boolean;
  isDriverMapModalOpen: boolean;
  isDriverTrainingModalOpen: boolean;
  isDriverDeactivateModalOpen: boolean;
}

const initialVehicles: Vehicle[] = [
  {
    id: "VEH-001",
    vehicleNumber: "CG-04-TX-2341",
    ownerName: "Shree Ganesh Sand Logistics LLP",
    ownerMobile: "9826112233",
    driverName: "Dharmendra Sahu",
    driverLicense: "CG-04-DL-2018-0912",
    mobile: "9826190012",
    vehicleType: "10-Wheeler Heavy Commercial (16 MT)" as VehicleType,
    capacityMt: 16.0,
    rcNumber: "RC/CG04/2021/884210",
    permitNumber: "PERM/CG/RPR/COMM/990",
    gpsDeviceId: "AIS140-CG-04-8891",
    gpsProvider: "Trimble Telematics India",
    isGpsOnline: true,
    fastagRfidRef: "FASTAG-ICICI-9921448",
    insuranceValidityDate: "2027-03-15",
    fitnessValidityDate: "2026-11-30",
    pucValidityDate: "2026-12-15",
    status: "Verified" as VehicleStatus,
    isBlacklisted: false,
    registeredDate: "2026-01-10",
    documents: [
      {
        id: "DOC-1",
        name: "RC Book (Registration Certificate)",
        docNumber: "RC/CG04/2021/884210",
        validUntil: "2036-05-20",
        status: "Valid",
      },
      {
        id: "DOC-2",
        name: "Commercial Fitness Certificate",
        docNumber: "FIT/RTO/RPR/2025/1102",
        validUntil: "2026-11-30",
        status: "Valid",
      },
      {
        id: "DOC-3",
        name: "Commercial Comprehensive Insurance",
        docNumber: "INS/NEWINDIA/2026/0991",
        validUntil: "2027-03-15",
        status: "Valid",
      },
      {
        id: "DOC-4",
        name: "Pollution Under Control (PUC)",
        docNumber: "PUC/CG/2026/4401",
        validUntil: "2026-12-15",
        status: "Valid",
      },
    ],
  },
  {
    id: "VEH-002",
    vehicleNumber: "CG-10-AZ-8812",
    ownerName: "Bilaspur Sand Transporters Co.",
    ownerMobile: "9425144556",
    driverName: "Gopal Ram Yadav",
    driverLicense: "CG-10-DL-2019-3321",
    mobile: "9425177890",
    vehicleType: "6-Wheeler Tipper (10 MT)" as VehicleType,
    capacityMt: 10.0,
    rcNumber: "RC/CG10/2020/554109",
    permitNumber: "PERM/CG/BSP/COMM/412",
    gpsDeviceId: "AIS140-CG-10-4412",
    gpsProvider: "Minda iConnect",
    isGpsOnline: true,
    fastagRfidRef: "FASTAG-SBI-8812401",
    insuranceValidityDate: "2026-10-20",
    fitnessValidityDate: "2026-12-05",
    pucValidityDate: "2026-11-10",
    status: "Verified" as VehicleStatus,
    isBlacklisted: false,
    registeredDate: "2026-02-14",
    documents: [
      {
        id: "DOC-5",
        name: "RC Book (Registration Certificate)",
        docNumber: "RC/CG10/2020/554109",
        validUntil: "2035-08-10",
        status: "Valid",
      },
      {
        id: "DOC-6",
        name: "Commercial Fitness Certificate",
        docNumber: "FIT/RTO/BSP/2025/3309",
        validUntil: "2026-12-05",
        status: "Valid",
      },
    ],
  },
  {
    id: "VEH-003",
    vehicleNumber: "CG-07-CA-5510",
    ownerName: "Durg Heavy Haulers Pvt Ltd",
    ownerMobile: "9755199887",
    driverName: "Sanjay Kumar Netam",
    driverLicense: "CG-07-DL-2017-7721",
    mobile: "9755201144",
    vehicleType: "12-Wheeler Multi-Axle (24 MT)" as VehicleType,
    capacityMt: 24.0,
    rcNumber: "RC/CG07/2019/330911",
    permitNumber: "PERM/CG/DURG/COMM/881",
    gpsDeviceId: "AIS140-CG-07-9002",
    gpsProvider: "Trimble Telematics India",
    isGpsOnline: false,
    fastagRfidRef: "FASTAG-AXIS-3309812",
    insuranceValidityDate: "2026-08-15",
    fitnessValidityDate: "2026-08-20",
    pucValidityDate: "2026-08-01",
    status: "Pending Verification" as VehicleStatus,
    isBlacklisted: false,
    registeredDate: "2026-03-01",
    documents: [
      {
        id: "DOC-7",
        name: "RC Book (Registration Certificate)",
        docNumber: "RC/CG07/2019/330911",
        validUntil: "2034-03-12",
        status: "Valid",
      },
    ],
  },
  {
    id: "VEH-004",
    vehicleNumber: "CG-12-MB-9021",
    ownerName: "Hasdeo Minerals & Transport",
    ownerMobile: "9981440022",
    driverName: "Bhupendra Baghel",
    driverLicense: "CG-12-DL-2020-5512",
    mobile: "9981432201",
    vehicleType: "10-Wheeler Heavy Commercial (16 MT)" as VehicleType,
    capacityMt: 16.0,
    rcNumber: "RC/CG12/2022/441098",
    permitNumber: "PERM/CG/KRB/COMM/704",
    gpsDeviceId: "AIS140-CG-12-7719",
    gpsProvider: "Autocop TrackPro",
    isGpsOnline: true,
    fastagRfidRef: "FASTAG-HDFC-9912003",
    insuranceValidityDate: "2027-01-25",
    fitnessValidityDate: "2026-11-15",
    pucValidityDate: "2026-12-20",
    status: "Verified" as VehicleStatus,
    isBlacklisted: false,
    registeredDate: "2026-02-28",
    documents: [
      {
        id: "DOC-9",
        name: "RC Book (Registration Certificate)",
        docNumber: "RC/CG12/2022/441098",
        validUntil: "2037-01-15",
        status: "Valid",
      },
    ],
  },
  {
    id: "VEH-005",
    vehicleNumber: "CG-17-HB-3309",
    ownerName: "Bastar Tribal Transporters",
    ownerMobile: "9179811224",
    driverName: "Prakash Korram",
    driverLicense: "CG-17-DL-2016-1190",
    mobile: "9179883412",
    vehicleType: "6-Wheeler Tipper (10 MT)" as VehicleType,
    capacityMt: 10.0,
    rcNumber: "RC/CG17/2018/119044",
    permitNumber: "PERM/CG/BST/COMM/310",
    gpsDeviceId: "AIS140-CG-17-1011",
    gpsProvider: "Sensel Telematics",
    isGpsOnline: false,
    fastagRfidRef: "FASTAG-ICICI-1109441",
    insuranceValidityDate: "2026-07-10",
    fitnessValidityDate: "2026-07-01",
    pucValidityDate: "2026-06-30",
    status: "Blacklisted" as VehicleStatus,
    isBlacklisted: true,
    blacklistReason: "Enforcement squad flagged vehicle carrying unauthorized river sand without valid e-Pass.",
    registeredDate: "2026-01-05",
    documents: [
      {
        id: "DOC-10",
        name: "RC Book (Registration Certificate)",
        docNumber: "RC/CG17/2018/119044",
        validUntil: "2033-04-10",
        status: "Valid",
      },
    ],
  },
];

const initialDrivers: Driver[] = [
  {
    id: "DRV-001",
    driverId: "DRV-CG-RPR-001",
    name: "Dharmendra Sahu",
    mobile: "9826190012",
    licenseNumber: "CG-04-DL-2018-0912",
    licenseValidityDate: "2031-08-20",
    assignedVehicleNumber: "CG-04-TX-2341",
    address: "Village Mandir Hasaud, Raipur, Chhattisgarh 492101",
    status: "Active" as DriverStatus,
    trainingVerified: true,
    trainingDate: "2026-01-15",
    aadhaarNumber: "781290334120",
    emergencyContact: "9826112244",
    bloodGroup: "O+",
  },
  {
    id: "DRV-002",
    driverId: "DRV-CG-BSP-002",
    name: "Gopal Ram Yadav",
    mobile: "9425177890",
    licenseNumber: "CG-10-DL-2019-3321",
    licenseValidityDate: "2030-11-14",
    assignedVehicleNumber: "CG-10-AZ-8812",
    address: "Koni Bypass Chowk, Bilaspur, Chhattisgarh 495009",
    status: "Active" as DriverStatus,
    trainingVerified: true,
    trainingDate: "2026-02-10",
    aadhaarNumber: "554188902143",
    emergencyContact: "9425144500",
    bloodGroup: "B+",
  },
  {
    id: "DRV-003",
    driverId: "DRV-CG-DURG-003",
    name: "Sanjay Kumar Netam",
    mobile: "9755201144",
    licenseNumber: "CG-07-DL-2017-7721",
    licenseValidityDate: "2029-05-30",
    assignedVehicleNumber: "CG-07-CA-5510",
    address: "Pulgaon Ward 12, Durg, Chhattisgarh 491001",
    status: "Pending Verification" as DriverStatus,
    trainingVerified: false,
    aadhaarNumber: "901244331190",
    emergencyContact: "9755209988",
    bloodGroup: "A+",
  },
  {
    id: "DRV-004",
    driverId: "DRV-CG-KRB-004",
    name: "Bhupendra Baghel",
    mobile: "9981432201",
    licenseNumber: "CG-12-DL-2020-5512",
    licenseValidityDate: "2032-02-18",
    assignedVehicleNumber: "CG-12-MB-9021",
    address: "Darri Colony Block C, Korba, Chhattisgarh 495677",
    status: "Active" as DriverStatus,
    trainingVerified: true,
    trainingDate: "2026-03-05",
    aadhaarNumber: "667822991034",
    emergencyContact: "9981440011",
    bloodGroup: "AB+",
  },
  {
    id: "DRV-005",
    driverId: "DRV-CG-BST-005",
    name: "Prakash Korram",
    mobile: "9179883412",
    licenseNumber: "CG-17-DL-2016-1190",
    licenseValidityDate: "2026-07-01",
    assignedVehicleNumber: "CG-17-HB-3309",
    address: "Dharampura Sector 2, Jagdalpur, Bastar, CG 494001",
    status: "Suspended" as DriverStatus,
    trainingVerified: false,
    aadhaarNumber: "441299880012",
    emergencyContact: "9179811200",
    bloodGroup: "O+",
  },
];

const initialState: VehicleState = {
  vehicles: initialVehicles,
  drivers: initialDrivers,
  selectedVehicle: null,
  selectedDriver: null,
  isDetailModalOpen: false,
  isGpsModalOpen: false,
  isDocsModalOpen: false,
  isBlacklistModalOpen: false,
  isVerifyModalOpen: false,
  isDriverDetailModalOpen: false,
  isDriverVerifyModalOpen: false,
  isDriverMapModalOpen: false,
  isDriverTrainingModalOpen: false,
  isDriverDeactivateModalOpen: false,
};

export const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload;
    },
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.unshift(action.payload);
    },
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) {
        state.vehicles[idx] = action.payload;
      }
    },
    toggleBlacklist: (
      state,
      action: PayloadAction<{ id: string; reason?: string }>
    ) => {
      const target = state.vehicles.find((v) => v.id === action.payload.id);
      if (target) {
        target.isBlacklisted = !target.isBlacklisted;
        if (target.isBlacklisted) {
          target.status = "Blacklisted";
          target.blacklistReason =
            action.payload.reason || "Flagged by State Mining Enforcement Unit.";
        } else {
          target.status = "Verified";
          target.blacklistReason = undefined;
        }
      }
    },
    verifyVehicle: (state, action: PayloadAction<string>) => {
      const target = state.vehicles.find((v) => v.id === action.payload);
      if (target) {
        target.status = "Verified";
        target.isBlacklisted = false;
      }
    },
    assignGps: (
      state,
      action: PayloadAction<{ id: string; gpsDeviceId: string; gpsProvider?: string }>
    ) => {
      const target = state.vehicles.find((v) => v.id === action.payload.id);
      if (target) {
        target.gpsDeviceId = action.payload.gpsDeviceId;
        if (action.payload.gpsProvider) target.gpsProvider = action.payload.gpsProvider;
        target.isGpsOnline = true;
      }
    },
    updateVehiclePhoto: (
      state,
      action: PayloadAction<{ id: string; photoUrl: string }>
    ) => {
      const target = state.vehicles.find((v) => v.id === action.payload.id);
      if (target) {
        target.photoUrl = action.payload.photoUrl;
      }
      if (state.selectedVehicle && state.selectedVehicle.id === action.payload.id) {
        state.selectedVehicle.photoUrl = action.payload.photoUrl;
      }
    },

    // ── Driver Reducers ──
    setDrivers: (state, action: PayloadAction<Driver[]>) => {
      state.drivers = action.payload;
    },
    addDriver: (state, action: PayloadAction<Driver>) => {
      state.drivers.unshift(action.payload);
    },
    updateDriver: (state, action: PayloadAction<Driver>) => {
      const idx = state.drivers.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.drivers[idx] = action.payload;
      }
    },
    verifyDriver: (state, action: PayloadAction<string>) => {
      const target = state.drivers.find((d) => d.id === action.payload);
      if (target) {
        target.status = "Active";
        target.trainingVerified = true;
      }
    },
    mapDriverVehicle: (
      state,
      action: PayloadAction<{ driverId: string; vehicleNumber: string }>
    ) => {
      const target = state.drivers.find((d) => d.id === action.payload.driverId);
      if (target) {
        target.assignedVehicleNumber = action.payload.vehicleNumber;
      }
    },
    toggleDriverStatus: (
      state,
      action: PayloadAction<{ driverId: string; targetStatus: DriverStatus }>
    ) => {
      const target = state.drivers.find((d) => d.id === action.payload.driverId);
      if (target) {
        target.status = action.payload.targetStatus;
      }
    },
    verifyDriverTraining: (
      state,
      action: PayloadAction<{ driverId: string; trainingDate: string }>
    ) => {
      const target = state.drivers.find((d) => d.id === action.payload.driverId);
      if (target) {
        target.trainingVerified = true;
        target.trainingDate = action.payload.trainingDate;
      }
    },

    // Modal state setters
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setSelectedDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },
    setIsDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
    setIsGpsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isGpsModalOpen = action.payload;
    },
    setIsDocsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDocsModalOpen = action.payload;
    },
    setIsBlacklistModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isBlacklistModalOpen = action.payload;
    },
    setIsVerifyModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isVerifyModalOpen = action.payload;
    },
    setIsDriverDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDriverDetailModalOpen = action.payload;
    },
    setIsDriverVerifyModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDriverVerifyModalOpen = action.payload;
    },
    setIsDriverMapModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDriverMapModalOpen = action.payload;
    },
    setIsDriverTrainingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDriverTrainingModalOpen = action.payload;
    },
    setIsDriverDeactivateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDriverDeactivateModalOpen = action.payload;
    },
  },
});

export const {
  setVehicles,
  addVehicle,
  updateVehicle,
  toggleBlacklist,
  verifyVehicle,
  assignGps,
  updateVehiclePhoto,
  setDrivers,
  addDriver,
  updateDriver,
  verifyDriver,
  mapDriverVehicle,
  toggleDriverStatus,
  verifyDriverTraining,
  setSelectedVehicle,
  setSelectedDriver,
  setIsDetailModalOpen,
  setIsGpsModalOpen,
  setIsDocsModalOpen,
  setIsBlacklistModalOpen,
  setIsVerifyModalOpen,
  setIsDriverDetailModalOpen,
  setIsDriverVerifyModalOpen,
  setIsDriverMapModalOpen,
  setIsDriverTrainingModalOpen,
  setIsDriverDeactivateModalOpen,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
