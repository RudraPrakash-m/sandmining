export type GisLayerKey =
  | "REACHES"
  | "RESTRICTED"
  | "RIVERS"
  | "STOCKYARDS"
  | "VEHICLES"
  | "ALERTS";

export interface GisLayerConfig {
  key: GisLayerKey;
  label: string;
  description: string;
  color: string;
  count: number;
  visible: boolean;
  iconName: string;
}

export type SelectedGisItemType =
  | "REACH"
  | "RESTRICTED"
  | "RIVER"
  | "STOCKYARD"
  | "VEHICLE"
  | "ALERT"
  | "DISTRICT";

export interface GisMiningReachPoint {
  id: string;
  reachId: string;
  reachName: string;
  district: string;
  riverStream: string;
  latitude: number;
  longitude: number;
  svgX: number;
  svgY: number;
  permittedQuantityMt: number;
  excavatedQuantityMt: number;
  status: "Approved" | "Under Verification" | "On Hold" | "Expired";
  environmentalClearanceRef: string;
  linkedStockyardName?: string;
}

export interface GisRestrictedZone {
  id: string;
  zoneName: string;
  district: string;
  reason: string;
  ruleCitation: string;
  bufferRadiusKm: number;
  svgX: number;
  svgY: number;
  radiusSvg: number;
  coordinates: string;
}

export interface GisRiverPath {
  id: string;
  riverName: string;
  basin: string;
  pathD: string;
  labelX: number;
  labelY: number;
  description: string;
}

export interface GisStockyardPoint {
  id: string;
  stockyardId: string;
  name: string;
  district: string;
  location: string;
  sandType: string;
  availableQuantityMt: number;
  capacityMt: number;
  latitude: number;
  longitude: number;
  svgX: number;
  svgY: number;
  status: "Active" | "Near Capacity" | "Low Stock";
}

export interface GisLiveVehiclePoint {
  id: string;
  vehicleNumber: string;
  driverName: string;
  speedKmH: number;
  tripStatus: string;
  geofenceStatus: "Normal Route" | "Route Deviation Detected" | "Out of Permitted Area";
  eta: string;
  sourceReachName: string;
  destinationDepot: string;
  latitude: number;
  longitude: number;
  svgX: number;
  svgY: number;
  lastUpdated: string;
}

export interface GisEnforcementAlertPoint {
  id: string;
  alertId: string;
  violationType: string;
  severity: "critical" | "high" | "medium" | "low";
  reachName: string;
  district: string;
  sensorTriggerId: string;
  coordinates: string;
  timestamp: string;
  investigationStatus: "Open" | "Under Investigation" | "Resolved";
  actionRequired: string;
  svgX: number;
  svgY: number;
}

export interface GisSearchResultItem {
  id: string;
  type: SelectedGisItemType;
  title: string;
  subtitle: string;
  district: string;
  svgX: number;
  svgY: number;
  rawItem: any;
}
