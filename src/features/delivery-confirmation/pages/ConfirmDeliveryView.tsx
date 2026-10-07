import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Button from "@/shared/components/ui/Button";
import { routes } from "@/app/routes/routeConfig";
import { CustomerLocationDeliveryModule } from "../components/CustomerLocationDeliveryModule";

export const ConfirmDeliveryView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryIdParam = searchParams.get("deliveryId") || undefined;
  const orderIdParam = searchParams.get("orderId") || undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-16">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(routes.deliveryConfirmation.path)}
          >
            Back to Delivery Ledger
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="text-orange-500" size={22} />
              Customer Location Delivery & POD Handover Module
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 5-stage protocol: Vehicle Arrives → Customer Verification → Sand Delivered → Customer OTP → Delivery Confirmation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<FileText size={14} />}
            onClick={() => navigate(routes.deliveryConfirmation.path)}
          >
            View POD Ledger
          </Button>
        </div>
      </div>

      {/* Primary Customer Location Delivery Module */}
      <CustomerLocationDeliveryModule
        initialDeliveryId={deliveryIdParam}
        initialOrderId={orderIdParam}
        showSelector={true}
        onDeliveryCompleted={(del) => {
          console.log("Delivery completed successfully:", del);
        }}
      />
    </div>
  );
};

export default ConfirmDeliveryView;
