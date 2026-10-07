import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";
import { IMAGES } from "@/assets/images";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-8 pb-20 lg:pb-32 border-b border-[#eadfce] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${IMAGES.HERO_BG})` }}
    >
      {/* Gentle readable gradient overlay on the left */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Row in Hero: Tagline */}
        <div className="mb-8 lg:mb-12">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 backdrop-blur-xs border border-emerald-300/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-[11px] sm:text-xs font-bold tracking-widest text-emerald-900 uppercase">
              Our Rivers. Our Resources. Our Responsibility.
            </span>
          </div>
        </div>

        {/* Main Hero Headline & CTAs */}
        <div className="max-w-2xl space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#7a2807] font-display leading-[1.15] tracking-tight drop-shadow-xs">
            Sustainable Sand Mining <br />
            <span className="text-[#c97a2b] relative inline-block">
              for a Brighter Tomorrow
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-amber-400 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="4" fill="transparent" />
              </svg>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#3d3228] leading-relaxed max-w-xl font-medium">
            A unified digital platform to manage legal sand mining, monitor excavation, stock, transportation, booking, payment, and delivery with real-time GIS, GPS, compliance, and revenue visibility.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate(routes.sandBazaar.path)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#882d09] to-[#ad3f12] hover:from-[#722406] hover:to-[#92340d] rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer border border-[#6b2205]"
            >
              <span>Book Sand Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#about-system"
              className="inline-flex items-center gap-2.5 px-5 py-3.5 text-sm font-bold text-[#882d09] bg-white/95 hover:bg-white border border-[#d8c7b0] rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer backdrop-blur-xs"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[#882d09]">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Explore the System</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
