import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/slice/authSlice";
import dashboardReducer from "@/features/dashboard/slice/dashboardSlice";
import miningReachReducer from "@/features/mining-reach/slice/miningReachSlice";
import legalPermitReducer from "@/features/legal-permits/slice/legalPermitSlice";
import excavationReducer from "@/features/excavation/slice/excavationSlice";
import stockyardReducer from "@/features/stockyard/slice/stockyardSlice";
import weighbridgeReducer from "@/features/weighbridge/slice/weighbridgeSlice";
import vehicleReducer from "@/features/vehicle-management/slice/vehicleSlice";
import dispatchReducer from "@/features/dispatch-management/slice/dispatchSlice";
import { mastersConfigReducer } from "@/features/masters-config";
import { auditLogReducer, auditLogApi } from "@/features/audit-log";

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

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    miningReach: miningReachReducer,
    legalPermit: legalPermitReducer,
    excavation: excavationReducer,
    stockyard: stockyardReducer,
    weighbridge: weighbridgeReducer,
    vehicle: vehicleReducer,
    dispatch: dispatchReducer,
    mastersConfig: mastersConfigReducer,
    auditLog: auditLogReducer,
  
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [miningReachApi.reducerPath]: miningReachApi.reducer,
    [legalPermitApi.reducerPath]: legalPermitApi.reducer,
    [excavationApi.reducerPath]: excavationApi.reducer,
    [stockyardApi.reducerPath]: stockyardApi.reducer,
    [weighbridgeApi.reducerPath]: weighbridgeApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [dispatchApi.reducerPath]: dispatchApi.reducer,
    [mastersConfigApi.reducerPath]: mastersConfigApi.reducer,
    [auditLogApi.reducerPath]: auditLogApi.reducer,
});

export default rootReducer;
