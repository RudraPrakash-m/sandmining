export type VehicleStatus =
  | "In Transit"
  | "Near Destination"
  | "Delivered"
  | "Idle"
  | "Exception"
  | "Cancelled";

/**
 * 5-Stage Customer Tracking Pipeline:
 * Sand Reach -> Vehicle Started -> In Transit -> Near Destination -> Delivered
 */
export type TripStage =
  | "Sand Reach"
  | "Vehicle Started"
  | "In Transit"
  | "Near Destination"
  | "Delivered";

export type TripCategory = "Active" | "Completed" | "Cancelled";

export type DelayStatus = "On Schedule" | "Minor Delay" | "Critical Delay";

export interface StageTimestampRecord {
  sandReach?: string;
  vehicleStarted?: string;
  inTransit?: string;
  nearDestination?: string;
  delivered?: string;
}

export interface TelematicsVehicle {
  id: string;
  vehicleNumber: string;
  orderId?: string;
  bookingId?: string;
  ePassNumber?: string;
  driverName: string;
  driverPhone: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
    svgX: number;
    svgY: number;
  };
  speedKmH: number;
  status: VehicleStatus;
  statusColor: "emerald" | "amber" | "rose" | "blue" | "purple" | "slate";
  route: string;
  destination: string;
  deliveryLocation: string;
  deliveryCoordinates?: {
    lat: number;
    lng: number;
  };
  sandReachName: string;
  sandReachId?: string;
  tripStartTime: string;
  tripStage: TripStage;
  tripCategory: TripCategory;
  delayMinutes: number;
  delayStatus: DelayStatus;
  delayReason?: string;
  completedTime?: string;
  cancellationReason?: string;
  eta: string;
  lastGpsPing: string;
  geofenceStatus: "Normal" | "Geofence Breach" | "Route Deviation" | "Stationary Exception";
  hasAlert?: boolean;
  alertType?: string;
  alertSeverity?: "critical" | "warning" | "info";
  mineralType?: string;
  netWeightTons?: number;
  customerName?: string;
  customerPhone?: string;
  deliveryOtp?: string;
  stageTimestamps?: StageTimestampRecord;
}

export interface TelematicsAlert {
  id: string;
  vehicleNumber: string;
  time: string;
  title: string;
  description: string;
  tag: string;
  severity: "critical" | "warning" | "info";
  svgX: number;
  svgY: number;
}

export interface RiverBasinOption {
  id: string;
  name: string;
  vehicleCount: number;
}

