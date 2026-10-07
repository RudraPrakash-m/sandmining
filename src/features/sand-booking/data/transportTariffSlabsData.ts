export interface TransportKmSlab {
  id: string;
  slabCode: string;
  slabName: string;
  minKm: number;
  maxKm: number;
  fixedBaseRate: number; // Fixed flag-down / depot handling base
  ratePerKm: number; // Fixed Rate per KM
  ratePerMtPerKm: number; // Weight-distance factor (₹/MT/KM)
  minFixedCharge: number; // Minimum guarantee charge
  loadingUnloadingFee: number; // Statutory loading/unloading charge
  tollAllowance: number; // Toll / bridge transit allowance
  gazetteRef: string;
  effectiveFrom: string;
  status: "Active" | "Draft" | "Under Revision";
  description: string;
}

export const STATUTORY_TRANSPORT_SLABS: TransportKmSlab[] = [
  {
    id: "SLAB-01",
    slabCode: "SLAB-01",
    slabName: "Local Reach Zone (0 - 5 KM)",
    minKm: 0,
    maxKm: 5,
    fixedBaseRate: 350,
    ratePerKm: 35.0,
    ratePerMtPerKm: 7.0,
    minFixedCharge: 500,
    loadingUnloadingFee: 150,
    tollAllowance: 0,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Short haul within mining reach boundary and immediate municipality circle.",
  },
  {
    id: "SLAB-02",
    slabCode: "SLAB-02",
    slabName: "Intra-City / Mandal (6 - 10 KM)",
    minKm: 6,
    maxKm: 10,
    fixedBaseRate: 450,
    ratePerKm: 32.0,
    ratePerMtPerKm: 6.5,
    minFixedCharge: 700,
    loadingUnloadingFee: 200,
    tollAllowance: 0,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Standard municipal delivery corridor from registered central stockyard.",
  },
  {
    id: "SLAB-03",
    slabCode: "SLAB-03",
    slabName: "Sub-Urban Intermediate (11 - 20 KM)",
    minKm: 11,
    maxKm: 20,
    fixedBaseRate: 600,
    ratePerKm: 29.0,
    ratePerMtPerKm: 5.8,
    minFixedCharge: 950,
    loadingUnloadingFee: 250,
    tollAllowance: 50,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Sub-urban construction zones and secondary town corridors.",
  },
  {
    id: "SLAB-04",
    slabCode: "SLAB-04",
    slabName: "Inter-Mandal Corridor (21 - 35 KM)",
    minKm: 21,
    maxKm: 35,
    fixedBaseRate: 800,
    ratePerKm: 26.0,
    ratePerMtPerKm: 5.2,
    minFixedCharge: 1350,
    loadingUnloadingFee: 300,
    tollAllowance: 80,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Medium haul transit across district mandals and rural infrastructure projects.",
  },
  {
    id: "SLAB-05",
    slabCode: "SLAB-05",
    slabName: "District Arterial (36 - 50 KM)",
    minKm: 36,
    maxKm: 50,
    fixedBaseRate: 1100,
    ratePerKm: 23.0,
    ratePerMtPerKm: 4.6,
    minFixedCharge: 1900,
    loadingUnloadingFee: 350,
    tollAllowance: 120,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Outer district periphery and industrial growth centres.",
  },
  {
    id: "SLAB-06",
    slabCode: "SLAB-06",
    slabName: "Inter-District Regional (51 - 75 KM)",
    minKm: 51,
    maxKm: 75,
    fixedBaseRate: 1450,
    ratePerKm: 20.0,
    ratePerMtPerKm: 4.0,
    minFixedCharge: 2500,
    loadingUnloadingFee: 400,
    tollAllowance: 180,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Regional highways connecting major river basin stockyards to adjacent districts.",
  },
  {
    id: "SLAB-07",
    slabCode: "SLAB-07",
    slabName: "Extended Regional (76 - 100 KM)",
    minKm: 76,
    maxKm: 100,
    fixedBaseRate: 1850,
    ratePerKm: 18.0,
    ratePerMtPerKm: 3.6,
    minFixedCharge: 3200,
    loadingUnloadingFee: 450,
    tollAllowance: 250,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Long haul bulk transit to remote hill or tribal development blocks.",
  },
  {
    id: "SLAB-08",
    slabCode: "SLAB-08",
    slabName: "Super Long Haul (> 100 KM)",
    minKm: 101,
    maxKm: 500,
    fixedBaseRate: 2300,
    ratePerKm: 16.0,
    ratePerMtPerKm: 3.2,
    minFixedCharge: 4000,
    loadingUnloadingFee: 500,
    tollAllowance: 350,
    gazetteRef: "CG-MIN-TRF-2026/089-A",
    effectiveFrom: "2026-04-01",
    status: "Active",
    description: "Special statutory permits for interstate border and mega infrastructure corridors.",
  },
];

export interface SlabCalculationResult {
  slab: TransportKmSlab;
  actualDistanceKm: number;
  quantityMt: number;
  fixedBaseRate: number;
  distanceCharge: number;
  weightDistanceCharge: number;
  loadingUnloadingFee: number;
  tollAllowance: number;
  grossTransportCharge: number;
  finalTransportCharge: number;
  formulaDescription: string;
}

/**
 * Finds the statutory KM slab matching the actual travel distance (in KM).
 */
export function getTransportSlabForDistance(distanceKm: number): TransportKmSlab {
  const km = Math.max(0, distanceKm);
  const found = STATUTORY_TRANSPORT_SLABS.find((s) => km >= s.minKm && km <= s.maxKm);
  return found || STATUTORY_TRANSPORT_SLABS[STATUTORY_TRANSPORT_SLABS.length - 1];
}

/**
 * Calculates the exact transportation charges based on the official KM-wise fixed calculation slab.
 * Formula: Fixed Base + (Distance KM × Slab Rate/KM) + (Quantity MT × Distance KM × Slab Rate/MT/KM) + Loading/Toll
 */
export function calculateSlabTransportationCharges(
  distanceKm: number,
  quantityMt: number = 10,
  transportMode: string = "Department-arranged transport"
): SlabCalculationResult {
  const slab = getTransportSlabForDistance(distanceKm);

  if (
    transportMode.toLowerCase().includes("own vehicle") ||
    transportMode.toLowerCase().includes("self-lift") ||
    transportMode.toLowerCase().includes("self-pickup")
  ) {
    return {
      slab,
      actualDistanceKm: distanceKm,
      quantityMt,
      fixedBaseRate: 0,
      distanceCharge: 0,
      weightDistanceCharge: 0,
      loadingUnloadingFee: 0,
      tollAllowance: 0,
      grossTransportCharge: 0,
      finalTransportCharge: 0,
      formulaDescription: "Self-lift buyer vehicle arrangement (Zero Department Transport Charge)",
    };
  }

  const distanceCharge = Math.round(distanceKm * slab.ratePerKm);
  const weightDistanceCharge = Math.round(quantityMt * distanceKm * slab.ratePerMtPerKm);
  const grossTransportCharge =
    slab.fixedBaseRate +
    distanceCharge +
    weightDistanceCharge +
    slab.loadingUnloadingFee +
    slab.tollAllowance;

  const finalTransportCharge = Math.max(grossTransportCharge, slab.minFixedCharge);

  const formulaDescription = `${slab.slabCode} [${slab.minKm}-${slab.maxKm} KM]: Base ₹${slab.fixedBaseRate} + (${distanceKm} KM × ₹${slab.ratePerKm}) + (${quantityMt} MT × ${distanceKm} KM × ₹${slab.ratePerMtPerKm}) + Allowance ₹${slab.loadingUnloadingFee + slab.tollAllowance}`;

  return {
    slab,
    actualDistanceKm: distanceKm,
    quantityMt,
    fixedBaseRate: slab.fixedBaseRate,
    distanceCharge,
    weightDistanceCharge,
    loadingUnloadingFee: slab.loadingUnloadingFee,
    tollAllowance: slab.tollAllowance,
    grossTransportCharge,
    finalTransportCharge,
    formulaDescription,
  };
}
