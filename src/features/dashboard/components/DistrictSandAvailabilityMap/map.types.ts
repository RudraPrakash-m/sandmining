export type SandAvailabilityLevel =
  | "VERY_HIGH"
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | "VERY_LOW";

export type RiverBasin =
  | "All Basins"
  | "Mahanadi Basin"
  | "Godavari / Indravati Basin"
  | "Son / Ganga Basin"
  | "Brahmani Basin"
  | "Narmada Basin";

export interface DistrictAvailabilityData {
  id: string;                      // e.g. "dist-raipur"
  svgPathId: string;               // e.g. "path2118"
  districtName: string;            // e.g. "Raipur"
  districtCode: string;            // e.g. "RPR"
  riverBasin: string;              // e.g. "Mahanadi Basin"
  availabilityLevel: SandAvailabilityLevel;
  availableQuantityMt: number;     // Estimated available quantity in MT
  activeSources: number;           // Active sand sources / reaches
  totalReaches: number;            // Total permitted reaches
  dailyDispatchMt: number;         // MT dispatched today
  complianceRatePct: number;       // Compliance percentage
  lastUpdated?: string;            // ISO Date or friendly timestamp
}

export interface MapLevelStyle {
  level: SandAvailabilityLevel;
  label: string;
  fillColor: string;
  hoverColor: string;
  selectedColor: string;
  textColor: string;
  bgBadge: string;
  borderBadge: string;
  rangeDescription: string;
}

export interface DistrictSandAvailabilityMapProps {
  districtsData?: DistrictAvailabilityData[];
  selectedDistrictId?: string | null;
  onSelectDistrict?: (district: DistrictAvailabilityData | null) => void;
  className?: string;
  compact?: boolean;
}
