import React from "react";
import { FileCheck, Pickaxe, Warehouse, ShoppingCart, Truck, CheckCircle2 } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: FileCheck,
      title: "Approve",
      subtitle: "Legal Reach & Permit",
      desc: "Environmental clearance, boundary geo-tagging & excavation quota allocation.",
    },
    {
      number: "02",
      icon: Pickaxe,
      title: "Excavate",
      subtitle: "Planned Excavation",
      desc: "Scientific mining under CCTV surveillance and daily extraction logs.",
    },
    {
      number: "03",
      icon: Warehouse,
      title: "Store",
      subtitle: "Manage Stock",
      desc: "Stockyard receipt, automated weighbridge integration, and stock ledger.",
    },
    {
      number: "04",
      icon: ShoppingCart,
      title: "Book",
      subtitle: "Customer Booking",
      desc: "Direct citizen & contractor online order with transparent fixed tariff.",
    },
    {
      number: "05",
      icon: Truck,
      title: "Dispatch",
      subtitle: "Verified Transportation",
      desc: "QR e-Pass issuance, RFID/FASTag validation, and corridor GPS locking.",
    },
    {
      number: "06",
      icon: CheckCircle2,
      title: "Deliver",
      subtitle: "Track & Confirm",
      desc: "Real-time transit tracking, OTP confirmation & Proof of Delivery (POD).",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-[#eadfce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94340d] mb-2">
          <span className="w-6 h-0.5 bg-[#94340d]"></span>
          How It Works
          <span className="w-6 h-0.5 bg-[#94340d]"></span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7a2807] font-display mb-4">
          From Mining Reach to Delivery — Digitally Managed
        </h2>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto mb-14">
          A seamless 6-step lifecycle ensuring complete accountability from riverbed to construction site.
        </p>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center group relative z-10">
                {/* Step Number Circle */}
                <div className="w-7 h-7 rounded-full bg-[#94340d] text-white text-xs font-bold flex items-center justify-center mb-3 shadow-xs">
                  {step.number}
                </div>

                {/* Main Icon Card */}
                <div className="w-16 h-16 rounded-2xl bg-[#faf7f2] border border-[#e4d6c3] group-hover:border-[#94340d] group-hover:bg-amber-50/50 flex items-center justify-center mb-3 transition-all duration-300 shadow-xs group-hover:shadow-md transform group-hover:-translate-y-1">
                  <Icon className="w-7 h-7 text-[#882d09] group-hover:text-[#ad3f12] transition-colors" />
                </div>

                {/* Step Titles */}
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#94340d] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs font-medium text-[#c97a2b] mt-0.5">
                  {step.subtitle}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug hidden md:block px-1">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
