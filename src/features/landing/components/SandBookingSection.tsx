import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Scale, CreditCard, PackageCheck, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";

export const SandBookingSection: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    { num: "1", title: "Check Availability", desc: "Search nearest operational stockyards & available tonnage", icon: Search },
    { num: "2", title: "Select Quantity & Delivery", desc: "Choose vehicle size, delivery location, and required tons", icon: Scale },
    { num: "3", title: "Make Digital Payment", desc: "Pay statutory government rates securely online", icon: CreditCard },
    { num: "4", title: "Track Your Delivery", desc: "Real-time GPS transit tracking, QR e-Pass & digital POD", icon: PackageCheck },
  ];

  return (
    <section id="sand-booking" className="py-16 sm:py-20 bg-white border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left / Main Column: Sand Booking Made Simple & 4 Expanded Steps */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d]">
              <span className="w-6 h-0.5 bg-[#94340d]"></span>
              Citizen Sand Bazaar
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display leading-tight">
              Sand Booking Made Simple
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
              Check real-time stock availability, select your required quantity, make secure payments at fixed government tariffs, and track your doorstep delivery with verified GPS — all from a single window.
            </p>

            {/* 4 Micro Steps in 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {steps.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.num}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf7f2] border border-[#f0e4d2] hover:border-amber-400 transition-all shadow-xs group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#882d09] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {st.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#94340d] transition-colors">
                        {st.title}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button & Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => navigate(routes.sandBazaar.path)}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#882d09] to-[#b3471c] hover:from-[#722406] hover:to-[#963812] rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer border border-[#7a2807]"
              >
                <span>Book Sand Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Middlemen • 100% Legal Supply</span>
              </div>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-72 sm:w-80 rounded-[38px] p-3.5 bg-neutral-900 shadow-2xl border-4 border-neutral-700 transform hover:rotate-0 transition-transform">
              {/* Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
              </div>

              {/* Phone Screen Mockup */}
              <div className="bg-[#faf7f2] rounded-[30px] overflow-hidden pt-7 pb-4 px-4 space-y-3 text-neutral-900 text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#882d09]" />
                    <span className="font-bold text-[#882d09] text-xs">CG Sand Bazaar</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Live Stock
                  </span>
                </div>

                {/* Form fields mockup */}
                <div className="space-y-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs">
                    <label className="text-[10px] text-neutral-500 font-medium block">Select District</label>
                    <div className="font-bold text-xs text-neutral-800 mt-0.5">Raipur District</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs">
                    <label className="text-[10px] text-neutral-500 font-medium block">Preferred Stockyard</label>
                    <div className="font-bold text-xs text-neutral-800 mt-0.5">Arang Stockyard #02</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs">
                    <label className="text-[10px] text-neutral-500 font-medium block">Quantity (Tons)</label>
                    <div className="font-bold text-xs text-neutral-800 mt-0.5">10 Metric Tonnes</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs">
                    <label className="text-[10px] text-neutral-500 font-medium block">Delivery Destination</label>
                    <div className="font-bold text-xs text-neutral-800 mt-0.5">Civil Lines, Raipur</div>
                  </div>
                </div>

                {/* Simulated App Button */}
                <button
                  onClick={() => navigate(routes.sandBazaar.path)}
                  className="w-full py-2.5 bg-[#882d09] hover:bg-[#6e2406] text-white font-bold rounded-lg text-xs shadow-xs text-center transition-colors cursor-pointer"
                >
                  View Available Stock & Price
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
