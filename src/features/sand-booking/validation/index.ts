import { z } from "zod";

export const sandBookingSchema = z.object({
  customerName: z
    .string()
    .min(3, "Customer name must have at least 3 characters")
    .max(100, "Customer name is too long"),
  customerMobile: z
    .string()
    .min(10, "Valid 10-digit mobile number is required")
    .regex(/^(\+91[-\s]?)?[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
  customerType: z.enum([
    "Individual Citizen (Home Construction)",
    "Govt Contractor / PWD",
    "Commercial Builder / Developer",
    "Infrastructure Entity",
  ]),
  sandType: z.enum([
    "Coarse River Sand",
    "Medium Concrete Sand",
    "Fine Plastering Sand",
    "Gravel Mix Sand",
  ]),
  deliveryType: z.enum(["Regular Delivery", "Bulk Order", "Doorstep Express"]).default("Regular Delivery"),
  quantityMt: z
    .number()
    .positive("Quantity must be greater than 0")
    .min(1, "Minimum booking is 1 MT")
    .max(150, "Single order cannot exceed 150 MT without Special Mining Approval"),
  sourceStockyardId: z.string().min(1, "Please select an origin sand stockyard"),
  destinationAddress: z.string().min(10, "Please provide complete delivery site address"),
  destinationDistrict: z.string().min(2, "Destination district is required"),
  preferredDeliveryDate: z.string().min(1, "Preferred delivery date is required"),
  transportOption: z.string().min(1, "Transport logistics option is required"),
});

export type SandBookingSchemaType = z.infer<typeof sandBookingSchema>;
