import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "@/features/auth/service/AuthService";
import { dashboardApi } from "@/features/dashboard/service/DashboardService";
import { miningReachApi } from "@/features/mining-reach/service/MiningReachService";
import { legalPermitApi } from "@/features/legal-permits/service/LegalPermitService";
import { excavationApi } from "@/features/excavation/service/ExcavationService";
import { stockyardApi } from "@/features/stockyard/service/StockyardService";
import { weighbridgeApi } from "@/features/weighbridge/service/WeighbridgeService";
import { vehicleApi } from "@/features/vehicle-management/service/VehicleService";
import { dispatchApi } from "@/features/dispatch-management/service/dispatchService";
import { mastersConfigApi } from "@/features/masters-config";
import { auditLogApi } from "@/features/audit-log";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            dashboardApi.middleware,
            miningReachApi.middleware,
            legalPermitApi.middleware,
            excavationApi.middleware,
            stockyardApi.middleware,
            weighbridgeApi.middleware,
            vehicleApi.middleware,
            dispatchApi.middleware,
            mastersConfigApi.middleware,
            auditLogApi.middleware
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
