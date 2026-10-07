export const routes = {
  landing: { path: "/", label: "Home", protected: false },
  login: { path: "/login", label: "Login", protected: false },
  dashboard: { path: "/dashboard", label: "State Dashboard", protected: true },
  gisMap: { path: "/gis-map", label: "GIS Sand Mining Map", protected: true },

  // ── Reach & Permits ─────────────────────────────────────────────────────
  miningReach: { path: "/mining-reach", label: "Mining Reach Master", protected: true },
  addMiningReach: { path: "/mining-reach/add", label: "Add Mining Reach", protected: true },
  legalPermits: { path: "/legal-permits", label: "Legal Mining & Permits", protected: true },
  createPermit: { path: "/legal-permits/create", label: "Create Permit", protected: true },
  excavation: { path: "/excavation", label: "Excavation Management", protected: true },
  addExcavation: { path: "/excavation/add", label: "Log Excavation", protected: true },

  // ── Stockyard & Weighbridge ──────────────────────────────────────────────
  stockyard: { path: "/stockyard", label: "Stockyard Management", protected: true },
  addStockyard: { path: "/stockyard/add", label: "Add Stockyard", protected: true },
  stockLedger: { path: "/stockyard/ledger", label: "Stock Ledger", protected: true },
  weighbridge: { path: "/weighbridge", label: "Weighbridge Management", protected: true },
  captureWeight: { path: "/weighbridge/capture", label: "Capture Weight Slip", protected: true },

  // ── Logistics & Vehicles ─────────────────────────────────────────────────
  vehicles: { path: "/vehicles", label: "Vehicle Fleet Management", protected: true },
  registerVehicle: { path: "/vehicles/register", label: "Register Vehicle", protected: true },
  vehicleQueue: { path: "/vehicles/queue-management", label: "Vehicle Queue Management", protected: true },
  automaticAllocation: { path: "/vehicles/allocation-queue", label: "Auto Vehicle Allocation (FIFO)", protected: true },
  driverDashboard: { path: "/driver-dashboard", label: "Driver & Transporter Portal", protected: true },
  drivers: { path: "/drivers", label: "Driver Management", protected: true },
  addDriver: { path: "/drivers/add", label: "Add Driver", protected: true },
  transportSlabs: { path: "/transport-tariff-slabs", label: "Transportation Charges Fixed KM Slabs", protected: true },

  // ── Booking & Commerce ───────────────────────────────────────────────────
  sandBazaar: { path: "/sand-bazaar", label: "Citizen Sand Bazaar", protected: false },
  citizenRegistration: { path: "/citizen-registration", label: "Citizen Registration", protected: false },
  citizenMyOrders: { path: "/citizen-my-orders", label: "My Orders & e-Pass", protected: false },
  sandBooking: { path: "/sand-booking", label: "Online Sand Booking", protected: true },
  createBooking: { path: "/sand-booking/create", label: "Book Sand", protected: true },
  paymentSettlement: { path: "/payment-settlement", label: "Payment & Invoicing", protected: true },
  revenueReconciliation: { path: "/revenue-reconciliation", label: "Revenue Reconciliation", protected: true },

  // ── Dispatch & Telematics ────────────────────────────────────────────────
  dispatchManagement: { path: "/dispatch-management", label: "Dispatch Management", protected: true },
  authorizeDispatch: { path: "/dispatch-management/authorize", label: "Authorize Dispatch", protected: true },
  epassVerification: { path: "/epass-verification", label: "e-Pass / QR Verification", protected: true },
  gpsTracking: { path: "/gps-tracking", label: "GPS Vehicle Tracking", protected: true },
  deliveryConfirmation: { path: "/delivery-confirmation", label: "Proof of Delivery (POD)", protected: true },
  callCentre: { path: "/call-centre", label: "Call Centre – Delivery Updation", protected: true },
  notificationsSms: { path: "/notifications-sms", label: "Automated SMS & Notifications (10 Stages)", protected: true },

  // ── Enforcement & Governance ─────────────────────────────────────────────
  enforcement: { path: "/enforcement", label: "Enforcement & Anti-Illegal", protected: true },
  addEnforcementAlert: { path: "/enforcement/add", label: "Create Alert", protected: true },
  grievance: { path: "/grievance", label: "Grievance / Helpdesk", protected: true },
  raiseGrievance: { path: "/grievance/raise", label: "Raise Grievance", protected: true },

  // ── Intelligence & Administration ────────────────────────────────────────
  reportsMis: { path: "/reports-mis", label: "Reports & MIS", protected: true },
  reportsDailyExcavation: { path: "/reports-mis/daily-excavation", label: "Daily Excavation Report", protected: true },
  reportsReachProduction: { path: "/reports-mis/reach-production", label: "Reach Production Report", protected: true },
  reportsStockyardStock: { path: "/reports-mis/stockyard-stock", label: "Stockyard Stock Report", protected: true },
  reportsVehicleTrips: { path: "/reports-mis/vehicle-trips", label: "Vehicle / Trips Report", protected: true },
  reportsBookings: { path: "/reports-mis/bookings", label: "Booking Registry Report", protected: true },
  reportsRevenuePayments: { path: "/reports-mis/revenue-payments", label: "Revenue & Payments Report", protected: true },
  reportsDispatchDelivery: { path: "/reports-mis/dispatch-delivery", label: "Dispatch & POD Report", protected: true },
  reportsEnforcementAlerts: { path: "/reports-mis/enforcement-alerts", label: "Illegal Mining / Alerts Report", protected: true },
  reportsPermitExpiry: { path: "/reports-mis/permit-expiry", label: "Permit Expiry Report", protected: true },
  reportsDistrictConsolidated: { path: "/reports-mis/district-consolidated", label: "District Consolidated MIS", protected: true },
  userRoles: { path: "/user-roles", label: "Users & Roles (RBAC)", protected: true },
  addUserRole: { path: "/user-roles/add", label: "Add User Account", protected: true },
  mastersConfig: { path: "/masters-config", label: "Masters & Configuration", protected: true },
  auditLog: { path: "/audit-log", label: "Audit Log & System Monitoring", protected: true },
  fieldOfficerApp: { path: "/field-officer-app", label: "Mobile Field Officer App", protected: true },
  sroPortal: { path: "/sro-portal", label: "SRO – Sand Reach Officer App", protected: true },
};

