import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { useSandMining } from "@/features/shared-simulation/context/SandMiningContext";
import type { StockLedgerEntry } from "@/features/shared-simulation/types";
import AdminTable, { type ColumnDef } from "@/shared/components/ui/Table/AdminTable/AdminTable";
import Button from "@/shared/components/ui/Button";
import Badge from "@/shared/components/ui/Badge";
import { exportToExcel } from "@/shared/utils/exportUtils";
import { routes } from "@/app/routes/routeConfig";

export const StockLedgerView: React.FC = () => {
  const { stockLedger } = useSandMining();
  const navigate = useNavigate();

  const columns: ColumnDef<StockLedgerEntry>[] = [
    {
      key: "dateTime",
      header: "Timestamp & Reference",
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{item.dateTime}</span>
          <p className="text-[11px] font-mono text-gray-500">{item.referenceId}</p>
        </div>
      ),
    },
    {
      key: "stockyardName",
      header: "Depot Name",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.stockyardName}</span>
      ),
    },
    {
      key: "transactionType",
      header: "Transaction Type",
      sortable: true,
      render: (item) => {
        const isInward = item.transactionType === "INWARD_EXCAVATION" || item.transactionType === "TRANSFER_IN";
        return (
          <div className="flex items-center gap-1.5">
            {isInward ? (
              <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <ArrowUpRight size={14} className="text-sky-500 shrink-0" />
            )}
            <Badge variant={isInward ? "primary" : "outline"} className="text-xs">
              {item.transactionType.replace("_", " ")}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "quantityMt",
      header: "Quantity (MT)",
      sortable: true,
      render: (item) => {
        const isInward = item.transactionType === "INWARD_EXCAVATION" || item.transactionType === "TRANSFER_IN";
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isInward ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"
            }`}
          >
            {isInward ? `+${item.quantityMt}` : `-${item.quantityMt}`} MT
          </span>
        );
      },
    },
    {
      key: "newStockMt",
      header: "Closing Balance",
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">
          {item.newStockMt.toLocaleString()} MT
        </span>
      ),
    },
    {
      key: "remarks",
      header: "Authorized By & Remarks",
      render: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{item.authorizedBy}</p>
          <p className="text-[11px] text-gray-500 italic mt-0.5">{item.remarks}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(routes.stockyard.path)}
        >
          Back to Stockyards
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Stockyard Inventory Ledger</h1>
          <p className="text-xs text-gray-500">Immutable chronological register of all inward receipts, dispatches & audit adjustments</p>
        </div>
      </div>

      <AdminTable
        title="Chronological Stock Movement Ledger"
        subtitle="Automatic reconciliation between Reach source excavations and gate-out citizen dispatches"
        columns={columns}
        data={stockLedger}
        searchPlaceholder="Search ledger by yard, reference ID, remarks..."
        onExport={() => exportToExcel(columns, stockLedger, "SMMS_Stock_Ledger")}
      />
    </div>
  );
};

export default StockLedgerView;
