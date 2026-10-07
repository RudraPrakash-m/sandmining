import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Radio, BellRing, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";

export const FleetTelematicsSection: React.FC = () => {
  const navigate = useNavigate();

  const telematicsCards = [
    {
      icon: Truck,
      title: "Verified Vehicles",
      desc: "Only verified vehicles and drivers can be assigned",
    },
    {
      icon: Radio,
      title: "Live GPS",
      desc: "24x7 satellite tracking along pre-approved road corridors with geo-fence boundary locks.",
    },
    {
      icon: BellRing,
      title: "Smart Transit Alerts",
      desc: "Instant automated SMS alerts on speed violations, route deviations, and unscheduled night halts.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#faf7f2] border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d] mb-2">
            <span className="w-6 h-0.5 bg-[#94340d]"></span>
            Telematics & Fleet Intelligence
            <span className="w-6 h-0.5 bg-[#94340d]"></span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display leading-tight">
            Every Vehicle. Every Route. Accounted For.
          </h2>
          <p className="text-sm text-neutral-600 mt-3">
            Authorized transport vehicles are dynamically monitored across every kilometer to eliminate illegal diversions.
          </p>
        </div>

        {/* 3 Telematics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {telematicsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-[#eadfce] shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#882d09]">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 mb-1">{card.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fleet Banner Graphic Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-neutral-700">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Diversion Protocol Enabled</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              Real-time Toll & Highway Gate Integration
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              Checkpoints and mobile flying squads verify valid e-Pass credentials in under 5 seconds using QR scanners.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="bg-neutral-800/90 border border-neutral-600 px-4 py-3 rounded-xl text-center">
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Live Active Fleet</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">1,482 Tippers</p>
            </div>

            <button
              onClick={() => navigate(routes.vehicles.path)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#94340d] hover:bg-[#7e2c0b] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <span>Track Vehicles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
