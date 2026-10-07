import React from "react";
import { Landmark, Pickaxe, UserCheck, HardHat, Warehouse, Scale, ShieldAlert, Users, Building2 } from "lucide-react";

export const StakeholdersSection: React.FC = () => {
  const stakeholders = [
    {
      title: "Government & State Admin",
      role: "Policy, state revenue, quota governance and inter-departmental visibility.",
      icon: Landmark,
      color: "bg-red-50 text-red-700 border-red-200",
    },
    {
      title: "Mining Department",
      role: "Reaches auction, permit issuance, environmental compliance & inspection.",
      icon: Pickaxe,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "District Officers",
      role: "District-level allocations, law enforcement oversight, and grievance resolution.",
      icon: UserCheck,
      color: "bg-orange-50 text-orange-800 border-orange-200",
    },
    {
      title: "Mining Reach Officers",
      role: "Real-time excavation entry, loading supervision, and reach-level slip generation.",
      icon: HardHat,
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    },
    {
      title: "Stockyard Managers",
      role: "Inward stock verification, depot inventory, dispatch authorization & security.",
      icon: Warehouse,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "Transport & Weighbridge",
      role: "Gross & tare weight capture, digital weigh slips, and fleet trip authorization.",
      icon: Scale,
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      title: "Enforcement Officers",
      role: "Mobile flying squads, checkpoint e-Pass QR validation & seizure management.",
      icon: ShieldAlert,
      color: "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      title: "Citizens & Customers",
      role: "Online booking, doorstep delivery tracking, e-receipts and grievance redressal.",
      icon: Users,
      color: "bg-teal-50 text-teal-800 border-teal-200",
    },
    {
      title: "Contractors & Bulk Buyers",
      role: "Bulk quota management, recurring project supply, and corporate invoicing.",
      icon: Building2,
      color: "bg-indigo-50 text-indigo-800 border-indigo-200",
    },
  ];

  return (
    <section id="stakeholders" className="py-16 sm:py-20 bg-[#faf7f2] border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d] mb-2">
          <span className="w-6 h-0.5 bg-[#94340d]"></span>
          Unified Ecosystem
          <span className="w-6 h-0.5 bg-[#94340d]"></span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display mb-4">
          One Platform. Multiple Stakeholders.
        </h2>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto mb-12">
          Role-based secure interfaces ensuring tailored workflows for every tier of mineral administration.
        </p>

        {/* 9 Stakeholder Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {stakeholders.map((stk, idx) => {
            const Icon = stk.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-[#eadfce] shadow-xs hover:shadow-md hover:border-amber-400 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={`w-11 h-11 rounded-lg ${stk.color} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#94340d] transition-colors">
                      {stk.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {stk.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
