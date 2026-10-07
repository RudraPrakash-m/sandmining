import { z } from "zod";

export const vehicleSchema = z.object({
  vehicleNumber: z
    .string()
    .min(5, "Registration number is required")
    .regex(/^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/i, "Format: CG-04-TX-2341"),
  ownerName: z.string().min(2, "Owner name is required").max(100),
  ownerMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  driverName: z.string().min(2, "Driver name is required").max(100),
  driverLicense: z.string().min(5, "Driver commercial license is required"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit driver mobile number"),
  vehicleType: z.enum([
    "6-Wheeler Tipper (10 MT)",
    "10-Wheeler Heavy Commercial (16 MT)",
    "12-Wheeler Multi-Axle (24 MT)",
    "14-Wheeler Heavy Carrier (30 MT)",
    "Tractor-Trailer (5 MT)",
  ]),
  capacityMt: z
    .number()
    .positive("Capacity must be positive")
    .max(50, "Capacity cannot exceed 50 MT"),
  rcNumber: z.string().min(6, "Valid RC Number is required"),
  permitNumber: z.string().optional(),
  gpsDeviceId: z.string().min(4, "AIS-140 GPS Device IMEI / ID is required"),
  fastagRfidRef: z.string().min(6, "HSRP / FASTag RFID Tag Reference is required"),
  insuranceValidityDate: z.string().min(1, "Insurance validity date is required"),
  fitnessValidityDate: z.string().min(1, "Fitness validity date is required"),
  pucValidityDate: z.string().optional(),
  status: z.enum(["Verified", "Pending Verification", "Expired Docs", "Blacklisted"]),
});

export const driverSchema = z.object({
  name: z.string().min(2, "Driver full name is required").max(100),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  licenseNumber: z
    .string()
    .min(6, "Valid commercial Driving License (DL) number is required"),
  licenseValidityDate: z.string().min(1, "License validity date is required"),
  assignedVehicleNumber: z.string().min(1, "Vehicle mapping is required"),
  address: z.string().min(5, "Full residential / KYC address is required"),
  trainingVerified: z.boolean().default(false),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be a valid 12-digit number")
    .optional()
    .or(z.literal("")),
  emergencyContact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit emergency contact")
    .optional()
    .or(z.literal("")),
  status: z.enum(["Active", "Assigned on Trip", "Pending Verification", "License Expired", "Suspended"]),
});

export const gpsAssignmentSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  gpsDeviceId: z.string().min(4, "AIS-140 GPS Device IMEI / ID is required"),
  gpsProvider: z.string().min(2, "Telematics provider name is required"),
});

export const blacklistSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle is required"),
  reason: z.string().min(10, "Mandatory reason for blacklisting / blocking vehicle (at least 10 chars)"),
  enforcementRef: z.string().min(2, "Enforcement officer or case number is required"),
});

export type VehicleSchemaType = z.infer<typeof vehicleSchema>;
export type DriverSchemaType = z.infer<typeof driverSchema>;
export type GpsAssignmentSchemaType = z.infer<typeof gpsAssignmentSchema>;
export type BlacklistSchemaType = z.infer<typeof blacklistSchema>;
