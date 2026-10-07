import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";
import { IMAGES } from "@/assets/images";

export const GisTrackingSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    "Approved mining quarry geo-fencing",
    "Restricted & ecological buffer zones",
    "Government stockyard locations",
    "Real-time vehicle GPS & route tracking",
    "Instant alerts on off-route deviations",
    "Automated e-Pass validity verification",
  ];

  return (
    <section id="gis-tracking" className="py-16 sm:py-20 bg-[#faf7f2] border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Info & Features List */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d]">
              <span className="w-6 h-0.5 bg-[#94340d]"></span>
              Real-Time GIS & Monitoring
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display leading-tight">
              See Every Reach. <br />
              Track Every Journey.
            </h2>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Monitor approved mining zones, restricted river conservation belts, stockyards, commercial tippers, and safe transit corridors from a centralized map-based command center.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 pt-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-neutral-800">{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => navigate(routes.gisMap.path)}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#882d09] hover:bg-[#6e2406] rounded-md shadow-md transition-all cursor-pointer"
              >
                <span>View Live GIS Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: GIS Map Visual Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 relative">
              <img
                src={IMAGES.DUMMY_MAP}
                alt="Chhattisgarh Sand GIS Command"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
