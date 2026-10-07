
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { routes } from "./routeConfig";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import MainLayout from "@/shared/components/layout/MainLayout";
import PublicRoute from "./PublicRoute";

// ── Auth & Dashboard ──────────────────────────────────────────────────
const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage"));
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));

// ── GIS Map ───────────────────────────────────────────────────────────
const SandMiningGisView = lazy(() => import("@/features/gis-map/pages/SandMiningGisView"));

// ── Mining Reach & Permits ───────────────────────────────────────────
const MiningReachList = lazy(() => import("@/features/mining-reach/pages/MiningReachList"));
const AddMiningReach = lazy(() => import("@/features/mining-reach/pages/AddMiningReach"));
const PermitList = lazy(() => import("@/features/legal-permits/pages/PermitList"));
const CreatePermit = lazy(() => import("@/features/legal-permits/pages/CreatePermit"));

// ── Excavation ────────────────────────────────────────────────────────
const ExcavationList = lazy(() => import("@/features/excavation/pages/ExcavationList"));
const AddExcavation = lazy(() => import("@/features/excavation/pages/AddExcavation"));

// ── Stockyard & Weighbridge ───────────────────────────────────────────
const StockyardList = lazy(() => import("@/features/stockyard/pages/StockyardList"));
const AddStockyard = lazy(() => import("@/features/stockyard/pages/AddStockyard"));
const StockLedgerView = lazy(() => import("@/features/stockyard/pages/StockLedgerView"));
const WeighbridgeList = lazy(() => import("@/features/weighbridge/pages/WeighbridgeList"));
const CaptureWeighbridgeSlip = lazy(() => import("@/features/weighbridge/pages/CaptureWeighbridgeSlip"));

// ── Vehicles & Drivers ────────────────────────────────────────────────
const VehicleList = lazy(() => import("@/features/vehicle-management/pages/VehicleList"));
const RegisterVehicle = lazy(() => import("@/features/vehicle-management/pages/RegisterVehicle"));
const VehicleQueueManagement = lazy(() => import("@/features/vehicle-management/pages/VehicleQueueManagement"));
const AutomaticVehicleAllocation = lazy(() => import("@/features/vehicle-management/pages/AutomaticVehicleAllocation"));
const DriverDashboard = lazy(() => import("@/features/vehicle-management/pages/DriverDashboard"));
const DriverList = lazy(() => import("@/features/vehicle-management/pages/DriverList"));
const AddDriver = lazy(() => import("@/features/vehicle-management/pages/AddDriver"));
const TransportTariffSlabs = lazy(() => import("@/features/masters-config/pages/TransportTariffSlabs"));

// ── Citizen Portal (public) ───────────────────────────────────────────
const SandBazaarHome = lazy(() => import("@/features/citizen-portal/pages/SandBazaarHome"));
const CitizenRegistration = lazy(() => import("@/features/citizen-portal/pages/CitizenRegistration"));
const CitizenMyOrders = lazy(() => import("@/features/citizen-portal/pages/CitizenMyOrders"));

// ── Sand Booking & Invoicing ──────────────────────────────────────────
const SandBookingList = lazy(() => import("@/features/sand-booking/pages/SandBookingList"));
const CreateSandBooking = lazy(() => import("@/features/sand-booking/pages/CreateSandBooking"));
const PaymentTransactionList = lazy(() => import("@/features/payment-settlement/pages/PaymentTransactionList"));
const ProcessPayment = lazy(() => import("@/features/payment-settlement/pages/ProcessPayment"));
const RevenueReconciliationView = lazy(() => import("@/features/payment-settlement/pages/RevenueReconciliationView"));

// ── Dispatch & Telematics ─────────────────────────────────────────────
const DispatchList = lazy(() => import("@/features/dispatch-management/pages/DispatchList"));
const AuthorizeDispatch = lazy(() => import("@/features/dispatch-management/pages/AuthorizeDispatch"));
const EPassVerificationView = lazy(() => import("@/features/dispatch-management/pages/EPassVerificationView"));
const LiveGpsTrackingView = lazy(() => import("@/features/gps-tracking/pages/LiveGpsTrackingView"));
const DeliveryList = lazy(() => import("@/features/delivery-confirmation/pages/DeliveryList"));
const ConfirmDeliveryView = lazy(() => import("@/features/delivery-confirmation/pages/ConfirmDeliveryView"));
const CallCentreDeliveryView = lazy(() => import("@/features/call-centre/pages/CallCentreDeliveryView"));
const NotificationSmsHub = lazy(() => import("@/features/notifications/pages/NotificationSmsHub"));

// ── Enforcement & Grievances ──────────────────────────────────────────
const EnforcementAlertList = lazy(() => import("@/features/enforcement/pages/EnforcementAlertList"));
const AddEnforcementAlert = lazy(() => import("@/features/enforcement/pages/AddEnforcementAlert"));
const GrievanceTicketList = lazy(() => import("@/features/grievance/pages/GrievanceTicketList"));
const RaiseGrievanceTicket = lazy(() => import("@/features/grievance/pages/RaiseGrievanceTicket"));

// ── Administration & MIS ──────────────────────────────────────────────
const ReportsMisHub = lazy(() => import("@/features/reports-mis/pages/ReportsMisHub"));
const UserList = lazy(() => import("@/features/user-roles/pages/UserList"));
const AddUserRole = lazy(() => import("@/features/user-roles/pages/AddUserRole"));
const MastersConfigurationHub = lazy(() => import("@/features/masters-config/pages/MastersConfigurationHub"));
const AuditLogList = lazy(() => import("@/features/audit-log/pages/AuditLogList"));
const FieldOfficerAppView = lazy(() => import("@/features/field-officer-app/pages/FieldOfficerAppView"));
const SroDashboardView = lazy(() => import("@/features/sro-portal/pages/SroDashboardView"));

const AppRoutes = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthRedirect = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            navigate(customEvent.detail);
        };
        window.addEventListener("auth-redirect", handleAuthRedirect);
        return () => window.removeEventListener("auth-redirect", handleAuthRedirect);
    }, [navigate]);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="rounded-full bg-gray-300 h-16 w-16 mb-4" />
                        <div className="h-4 bg-gray-300 rounded w-48 mb-4" />
                        <div className="h-4 bg-gray-300 rounded w-64 mb-4" />
                        <div className="h-4 bg-gray-300 rounded w-40" />
                    </div>
                </div>
            }
        >
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path={routes.login.path} element={<Login />} />
                    </Route>
                </Route>

                {/* Citizen Portal – public */}
                <Route path={routes.sandBazaar.path} element={<SandBazaarHome />} />
                <Route path={routes.citizenRegistration.path} element={<CitizenRegistration />} />
                <Route path={routes.citizenMyOrders.path} element={<CitizenMyOrders />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path={routes.dashboard.path} element={<Dashboard />} />

                        {/* Mining Reach & Permits */}
                        <Route path={routes.gisMap.path} element={<SandMiningGisView />} />
                        <Route path={routes.miningReach.path} element={<MiningReachList />} />
                        <Route path={routes.addMiningReach.path} element={<AddMiningReach />} />
                        <Route path={routes.legalPermits.path} element={<PermitList />} />
                        <Route path={routes.createPermit.path} element={<CreatePermit />} />

                        {/* Excavation */}
                        <Route path={routes.excavation.path} element={<ExcavationList />} />
                        <Route path={routes.addExcavation.path} element={<AddExcavation />} />

                        {/* Stockyard & Weighbridge */}
                        <Route path={routes.stockyard.path} element={<StockyardList />} />
                        <Route path={routes.addStockyard.path} element={<AddStockyard />} />
                        <Route path={routes.stockLedger.path} element={<StockLedgerView />} />
                        <Route path={routes.weighbridge.path} element={<WeighbridgeList />} />
                        <Route path={routes.captureWeight.path} element={<CaptureWeighbridgeSlip />} />

                        {/* Fleet & Logistics */}
                        <Route path={routes.vehicles.path} element={<VehicleList />} />
                        <Route path={routes.registerVehicle.path} element={<RegisterVehicle />} />
                        <Route path={routes.vehicleQueue.path} element={<VehicleQueueManagement />} />
                        <Route path="/vehicles/queue-management" element={<VehicleQueueManagement />} />
                        <Route path="/vehicle-queue" element={<VehicleQueueManagement />} />
                        <Route path={routes.automaticAllocation.path} element={<AutomaticVehicleAllocation />} />
                        <Route path="/automatic-allocation" element={<AutomaticVehicleAllocation />} />
                        <Route path={routes.driverDashboard.path} element={<DriverDashboard />} />
                        <Route path="/driver-portal" element={<DriverDashboard />} />
                        <Route path={routes.drivers.path} element={<DriverList />} />
                        <Route path={routes.addDriver.path} element={<AddDriver />} />
                        <Route path={routes.transportSlabs.path} element={<TransportTariffSlabs />} />
                        <Route path="/transport-slabs" element={<TransportTariffSlabs />} />

                        {/* Booking & Commerce */}
                        <Route path={routes.sandBooking.path} element={<SandBookingList />} />
                        <Route path={routes.createBooking.path} element={<CreateSandBooking />} />
                        <Route path={routes.paymentSettlement.path} element={<PaymentTransactionList />} />
                        <Route path="/process-payment" element={<ProcessPayment />} />
                        <Route path={routes.revenueReconciliation.path} element={<RevenueReconciliationView />} />

                        {/* Dispatch & Telematics */}
                        <Route path={routes.dispatchManagement.path} element={<DispatchList />} />
                        <Route path={routes.authorizeDispatch.path} element={<AuthorizeDispatch />} />
                        <Route path={routes.epassVerification.path} element={<EPassVerificationView />} />
                        <Route path={routes.gpsTracking.path} element={<LiveGpsTrackingView />} />
                        <Route path={routes.deliveryConfirmation.path} element={<DeliveryList />} />
                        <Route path="/delivery-confirmation/confirm" element={<ConfirmDeliveryView />} />
                        <Route path={routes.callCentre.path} element={<CallCentreDeliveryView />} />
                        <Route path={routes.notificationsSms.path} element={<NotificationSmsHub />} />
                        <Route path="/notifications-sms" element={<NotificationSmsHub />} />

                        {/* Enforcement & Helpdesk */}
                        <Route path={routes.enforcement.path} element={<EnforcementAlertList />} />
                        <Route path={routes.addEnforcementAlert.path} element={<AddEnforcementAlert />} />
                        <Route path={routes.grievance.path} element={<GrievanceTicketList />} />
                        <Route path={routes.raiseGrievance.path} element={<RaiseGrievanceTicket />} />

                        {/* Admin & MIS */}
                        <Route path={routes.reportsMis.path} element={<ReportsMisHub />} />
                        <Route path="/reports-mis/:reportCategory" element={<ReportsMisHub />} />
                        <Route path={routes.userRoles.path} element={<UserList />} />
                        <Route path={routes.addUserRole.path} element={<AddUserRole />} />
                        <Route path={routes.mastersConfig.path} element={<MastersConfigurationHub />} />
                        <Route path={routes.auditLog.path} element={<AuditLogList />} />
                        <Route path={routes.fieldOfficerApp.path} element={<FieldOfficerAppView />} />
                        <Route path={routes.sroPortal.path} element={<SroDashboardView />} />
                        <Route path="/sro-portal" element={<SroDashboardView />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;


