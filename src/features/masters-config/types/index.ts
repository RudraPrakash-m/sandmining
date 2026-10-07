export type MasterCategory =
  | "DISTRICT_MANDAL"
  | "RIVER_REACH"
  | "SAND_TYPE"
  | "STOCKYARD"
  | "VEHICLE_CAPACITY"
  | "CHARGES_TARIFF"
  | "STATUS_CODES"
  | "ALERT_THRESHOLDS"
  | "DEPARTMENTS";

export interface MasterDistrictMandalItem {
  id: string;
  code: string;
  district: string;
  mandal: string;
  village: string;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterRiverReachItem {
  id: string;
  reachCode: string;
  reachName: string;
  riverBasin: string;
  district: string;
  permittedAnnualQuotaMt: number;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterSandTypeItem {
  id: string;
  sandCode: string;
  sandType: string;
  specification: string;
  densityTonsPerCum: number;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterStockyardItem {
  id: string;
  stockyardCode: string;
  name: string;
  district: string;
  capacityMt: number;
  supervisor: string;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterVehicleCapacityItem {
  id: string;
  categoryCode: string;
  categoryName: string;
  axlesCount: number;
  maxGvwMt: number;
  maxSandPayloadMt: number;
  minTareMt: number;
  overloadTolerancePercent: number;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterTariffItem {
  id: string;
  tariffCode: string;
  sandType: string;
  basePricePerMt: number;
  royaltyPerMt: number;
  dmfCessPercent: number;
  loadingChargePerMt: number;
  transportPerKmPerMt: number;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterStatusCodeItem {
  id: string;
  moduleName: string;
  statusCode: string;
  statusLabel: string;
  description: string;
  colorVariant: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterAlertThresholdItem {
  id: string;
  thresholdCode: string;
  parameterName: string;
  module: string;
  triggerCondition: string;
  thresholdValue: string;
  severityLevel: "Critical" | "High" | "Moderate";
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}

export interface MasterDepartmentItem {
  id: string;
  departmentCode: string;
  name: string;
  nodalOfficer: string;
  contactEmail: string;
  contactMobile: string;
  authorizedBy: string;
  effectiveDate: string;
  status: "Active" | "Pending Approval" | "Inactive";
}
