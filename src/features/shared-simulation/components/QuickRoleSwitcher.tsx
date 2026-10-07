import React from "react";
import { UserCheck } from "lucide-react";
import { useSandMining } from "../context/SandMiningContext";
import type { UserRole } from "../types";

const ALL_ROLES: UserRole[] = [
  "State Admin",
  "District Officer",
  "Mining Department / Monitoring Officer",
  "SRO – Sand Reach Officer",
  "Sand Reach Operator",
  "Finance / Payment Officer",
  "Call Centre Operator",
  "Vehicle Owner",
  "Driver",
  "Citizen / Customer",
];

export const QuickRoleSwitcher: React.FC = () => {
  const { activeRole, setActiveRole } = useSandMining();

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg border border-border-color dark:border-gray-700">
      <UserCheck size={15} className="text-primary shrink-0" />
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider leading-none">
          Active Role
        </span>
        <select
          value={activeRole}
          onChange={(e) => setActiveRole(e.target.value as UserRole)}
          className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer focus:outline-none pr-1"
          aria-label="Select active user role"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r} className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default QuickRoleSwitcher;
