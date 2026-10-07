import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { routes } from "./routeConfig";
import type { RootState } from "../../app/store";

const PublicRoute = () => {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && isAuthenticated) {
            const isCitizen =
                token.includes("citizen") ||
                localStorage.getItem("smms_user_role") === "Citizen";
            if (isCitizen) {
                navigate(routes.citizenMyOrders.path, { replace: true });
            } else {
                navigate(routes.dashboard.path, { replace: true });
            }
        }
    }, [token, isAuthenticated, navigate]);

    return <Outlet />;
};

export default PublicRoute;

