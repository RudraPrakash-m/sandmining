import React from "react";
import { Quote, ShieldCheck, Cpu, QrCode, BarChart3, Database } from "lucide-react";

export const TestimonialCompliance: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Card: Citizen / Contractor Testimonial */}
          <div className="lg:col-span-6 bg-[#faf7f2] rounded-2xl p-8 border border-[#eadfce] flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#882d09]">
                <Quote className="w-5 h-5 fill-current" />
              </div>

              <blockquote className="text-base sm:text-lg text-neutral-800 font-medium italic leading-relaxed font-display">
                "With this system, sand is available legally, transparently and we are free of middle-men for all of us. Direct e-Pass and fixed statutory billing ensure prompt and hassle-free construction supply."
              </blockquote>
            </div>
          </div>

          {/* Right Card: Built for Compliance & Accountability */}
          <div className="lg:col-span-6 burgundy-card rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl border border-amber-950">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Governance</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                Built for Compliance & Accountability
              </h3>

              {/* 4 Pillars */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <Cpu className="w-6 h-6 text-amber-300 mb-1.5" />
                  <h5 className="text-xs font-bold text-white">VDS Telematics</h5>
                  <p className="text-[10px] text-neutral-300 mt-0.5">Automated GPS speed & route alerts</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <QrCode className="w-6 h-6 text-amber-300 mb-1.5" />
                  <h5 className="text-xs font-bold text-white">Real-Time Scanners</h5>
                  <p className="text-[10px] text-neutral-300 mt-0.5">Instant QR & FASTag verification</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <BarChart3 className="w-6 h-6 text-amber-300 mb-1.5" />
                  <h5 className="text-xs font-bold text-white">Quota Controlled</h5>
                  <p className="text-[10px] text-neutral-300 mt-0.5">Strict daily environmental quotas</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                  <Database className="w-6 h-6 text-amber-300 mb-1.5" />
                  <h5 className="text-xs font-bold text-white">Stock Reconciled</h5>
                  <p className="text-[10px] text-neutral-300 mt-0.5">Daily digital weighment ledger</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-white/15 text-[11px] text-amber-200/90 font-medium">
              Directly aligned with Ministry of Mines & SEIAA Environmental Guidelines.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
