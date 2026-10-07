import React from "react";
import { ShieldCheck, MapPin, FileCheck2, FileSpreadsheet, Leaf } from "lucide-react";

export const ValueHighlights: React.FC = () => {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Legal Mining",
      description: "Manage approved mining sites with all valid permits, environment clearances and strict quota limits efficiently.",
      iconBg: "bg-amber-100 text-[#882d09]",
    },
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "Track excavation, stock movement, transit routes, and commercial vehicles with high-precision GIS & GPS.",
      iconBg: "bg-orange-100 text-orange-700",
    },
    {
      icon: FileCheck2,
      title: "Transparent Booking",
      description: "Check district-wise availability, book sand in real-time with government-notified fixed tariffs.",
      iconBg: "bg-yellow-100 text-amber-800",
    },
    {
      icon: FileSpreadsheet,
      title: "Compliant Accounting",
      description: "Monitor electronic royalty receipts, DMF cess records, automated weighment slips, and complete audit trails.",
      iconBg: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <section className="relative -mt-6 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 4 Feature Cards */}
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="smms-card rounded-xl p-5 flex flex-col justify-between border border-[#eadfce] bg-white group hover:border-amber-400"
            >
              <div>
                <div className={`w-11 h-11 rounded-lg ${item.iconBg} flex items-center justify-center mb-3.5 shadow-xs transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5 font-display">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* 5th Highlight Banner (Burgundy Theme) */}
        <div className="burgundy-card rounded-xl p-5 flex flex-col justify-between text-white shadow-lg sm:col-span-2 lg:col-span-1 border border-amber-900/40">
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-amber-300">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold tracking-wider uppercase text-amber-300 font-display leading-tight mb-2">
              Clean Rivers. <br />
              Strong Communities.
            </h4>
            <p className="text-[11px] text-neutral-200 leading-normal opacity-90">
              Conserving river ecology while ensuring fair supply for infrastructure growth.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/15 text-[10px] text-amber-200/80 font-medium">
            CMDC Ecological Initiative
          </div>
        </div>
      </div>
    </section>
  );
};
