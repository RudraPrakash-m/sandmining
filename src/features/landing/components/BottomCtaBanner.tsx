import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle, ExternalLink, LogIn } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";
import { IMAGES } from "@/assets/images";

export const BottomCtaBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-16 sm:py-20 overflow-hidden bg-neutral-900 text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${IMAGES.BOTTOM_BANNER_BG})` }}
    >
      {/* Background Dark Sunset Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-900/80 to-[#4e1212]/75 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Actions */}
          <div className="lg:col-span-8 space-y-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight text-amber-100">
              Building a More Transparent <br />
              Sand Supply Chain
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              From source to stakeholder — enabling responsible extraction, fair trade, real-time public scrutiny, and a sustainable environmental future for Chhattisgarh.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => navigate(routes.login.path)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#94340d] to-[#c14d1b] hover:from-[#7e2c0b] hover:to-[#a13c12] rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer border border-[#8b2d0d]"
              >
                <LogIn className="w-4 h-4" />
                <span>Access Officer Portal</span>
              </button>

              <a
                href="#about-system"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-neutral-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Pillar Badges */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/15 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">Guaranteed Legality</h5>
                <p className="text-[10px] text-neutral-300">100% verified lease boundaries</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/15 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">Responsible Sourcing</h5>
                <p className="text-[10px] text-neutral-300">Eco-sensitive zone safeguards</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/15 flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">Accountable Governance</h5>
                <p className="text-[10px] text-neutral-300">Transparent royalty & digital passes</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
