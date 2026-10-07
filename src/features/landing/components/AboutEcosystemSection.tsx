import React, { useState } from "react";
import { ArrowRight, Play, X } from "lucide-react";

export const AboutEcosystemSection: React.FC = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section id="about-system" className="py-16 sm:py-20 bg-[#faf7f2] border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Statistics */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d]">
              <span className="w-6 h-0.5 bg-[#94340d]"></span>
              About Our System
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display leading-tight">
              A Complete Digital Ecosystem for Sand Mining
            </h2>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Connecting government administration, mining reach operators, stockyard managers, transport fleets, and citizens for an entirely transparent, legally regulated, and eco-sustainable sand supply chain across Chhattisgarh.
            </p>

            {/* Learn More Action Button */}
            <div className="pt-2">
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#882d09] hover:bg-[#6e2406] px-5 py-2.5 rounded-md shadow-xs transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#eadfce]">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#94340d] font-display">
                  100%
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 font-medium mt-0.5">
                  Trackable Operations
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#c97a2b] font-display">
                  26+
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 font-medium mt-0.5">
                  Functional Modules
                </p>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#5c1d1d] font-display">
                  Real-time
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 font-medium mt-0.5">
                  GIS & GPS Monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Video & Media Showcase Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
                alt="Chhattisgarh River Basin and Ecological Sand Mining Corridor"
                className="w-full aspect-16/10 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col items-center justify-center p-6 text-center text-white">
                
                {/* Play Button */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="w-16 h-16 rounded-full bg-[#c97a2b] hover:bg-[#ad651e] text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer mb-3 border-2 border-white/80"
                  aria-label="Play Ecosystem Overview Video"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>

                <p className="text-xs sm:text-sm font-semibold text-amber-200 tracking-wider uppercase mb-1">
                  See How It Works
                </p>
                <h4 className="text-lg sm:text-xl font-bold font-display">
                  The Journey of Regulated Sand Mining
                </h4>

                {/* Cursive Tagline */}
                <span className="text-amber-300 font-serif italic text-base sm:text-lg mt-3 opacity-90">
                  "From Source to Society"
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Video Modal Simulation */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl overflow-hidden max-w-2xl w-full border border-neutral-700 shadow-2xl relative">
            <div className="flex items-center justify-between p-3 bg-neutral-800 text-white text-xs font-semibold">
              <span>Overview: Sand Mining Management System</span>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center text-white space-y-4">
              <div className="aspect-16/9 bg-neutral-800 rounded-lg flex flex-col items-center justify-center border border-neutral-700">
                <Play className="w-12 h-12 text-amber-500 mb-2" />
                <p className="text-sm font-semibold">Video Presentation: Sustainable Sand Mining in CG</p>
                <p className="text-xs text-neutral-400">Illustrating GIS boundary fencing, e-Pass generation, and citizen delivery.</p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 bg-[#94340d] hover:bg-[#7a2807] rounded text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
