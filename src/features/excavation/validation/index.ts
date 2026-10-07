import { z } from "zod";

export const excavationSchema = z.object({
  reachId: z.string().min(1, "Mining Reach selection is required"),
  excavatedQuantityMt: z
    .number({ message: "Excavated quantity must be a number" })
    .positive("Excavated quantity must be greater than 0")
    .max(5000, "Single extraction entry cannot exceed 5,000 MT"),
  machineryEquipment: z
    .string()
    .min(2, "Machinery/Equipment type is required"),
  equipmentRegNo: z
    .string()
    .min(3, "Equipment Registration No. is required"),
  operatorName: z
    .string()
    .min(2, "Operator Name is required")
    .max(100, "Operator name is too long"),
  operatorLicense: z.string().optional(),
  shift: z.enum([
    "Morning (06:00 - 14:00)",
    "Afternoon (14:00 - 22:00)",
    "Night (22:00 - 06:00)",
  ]),
  geoLocation: z.string().min(3, "GPS Geo-location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photoEvidenceUrl: z.string().min(1, "Site photo evidence is required"),
  remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional(),
});

export type ExcavationSchemaType = z.infer<typeof excavationSchema>;
