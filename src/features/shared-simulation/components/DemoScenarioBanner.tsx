import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useSandMining } from "../context/SandMiningContext";
import Button from "@/shared/components/ui/Button";

interface DemoStepInfo {
  step: number;
  title: string;
  description: string;
  targetPath: string;
  actionLabel: string;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 1,
    title: "1. Mining Reach Approved",
    description: "Check approved quota of 1,00,000 MT at Mahanadi Basin Reach Alpha.",
    targetPath: "/mining-reach",
    actionLabel: "Verify Reach Master",
  },
  {
    step: 2,
    title: "2. Excavation Logged (500 MT)",
    description: "Source extraction of 500 MT river sand recorded with machinery log.",
    targetPath: "/excavation",
    actionLabel: "Log 500 MT Excavation",
  },
  {
    step: 3,
    title: "3. Stockyard Inward Receipt",
    description: "Stockyard receives +500 MT; live ledger entry automatically created.",
    targetPath: "/stockyard",
    actionLabel: "Inspect Stock Ledger",
  },
  {
    step: 4,
    title: "4. Citizen Books 10 MT",
    description: "Citizen orders 10 MT coarse river sand via transparent booking engine.",
    targetPath: "/sand-booking",
    actionLabel: "View Sand Booking",
  },
  {
    step: 5,
    title: "5. Online Payment Success",
    description: "Customer completes payment; Royalty, DMF cess, GST & transport reconciled.",
    targetPath: "/payment-settlement",
    actionLabel: "Verify Payment Receipt",
  },
  {
    step: 6,
    title: "6. Weighbridge Measurement",
    description: "Vehicle CG-04-TX-2341 weighed: Tare 8.4 MT, Gross 18.4 MT, Net 10.0 MT.",
    targetPath: "/weighbridge",
    actionLabel: "Check Weighbridge Slip",
  },
  {
    step: 7,
    title: "7. QR e-Pass Issued",
    description: "High-security tamper-proof digital e-Pass generated with 8-hour validity.",
    targetPath: "/dispatch-management",
    actionLabel: "Inspect QR e-Pass",
  },
  {
    step: 8,
    title: "8. Live GPS Transit Tracking",
    description: "Vehicle en route along approved river corridor; geofence monitored in real time.",
    targetPath: "/gps-tracking",
    actionLabel: "Open GPS Telematics",
  },
  {
    step: 9,
    title: "9. Delivery OTP Verification (7834)",
    description: "Customer provides OTP 7834 to driver; proof of delivery digitally closed.",
    targetPath: "/delivery-confirmation",
    actionLabel: "Submit Delivery OTP",
  },
  {
    step: 10,
    title: "10. Stock Deduction & MIS Update",
    description: "Stockyard inventory automatically deducted by 10 MT; revenue reports finalized.",
    targetPath: "/reports-mis",
    actionLabel: "Review Final MIS",
  },
];

export const DemoScenarioBanner: React.FC = () => {
  const { demoStep, setDemoStep, runDemoStep, resetSimulationData } = useSandMining();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const navigate = useNavigate();

  const currentInfo = DEMO_STEPS.find((s) => s.step === demoStep) || DEMO_STEPS[0];

  const handleNext = () => {
    runDemoStep(demoStep);
    navigate(currentInfo.targetPath);
    if (demoStep < 10) {
      setDemoStep(demoStep + 1);
    }
  };

  const handleStepClick = (s: number) => {
    setDemoStep(s);
    runDemoStep(s);
    const target = DEMO_STEPS.find((item) => item.step === s);
    if (target) navigate(target.targetPath);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-4 py-2.5 shadow-md shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                End-to-End Demo Simulation
              </span>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                Step {demoStep} of 10
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 mt-0.5">
              {currentInfo.title}: <span className="text-slate-400">{currentInfo.description}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-indigo-400/40 text-indigo-200 hover:bg-indigo-900/40"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide Steps" : "Show All Steps"}
            {isExpanded ? <ChevronDown size={14} className="ml-1" /> : <ChevronRight size={14} className="ml-1" />}
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs"
            onClick={handleNext}
          >
            <Play size={13} className="mr-1.5 fill-current" />
            {demoStep === 10 ? "Finish & Review" : `Next: ${DEMO_STEPS[Math.min(9, demoStep)].title.split(" ")[1]}`}
            <ArrowRight size={14} className="ml-1.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-slate-400 hover:text-white"
            onClick={resetSimulationData}
            title="Reset simulation data to initial state"
          >
            <RotateCcw size={14} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto pt-3 pb-1 border-t border-indigo-500/20 mt-2.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-[980px]">
            {DEMO_STEPS.map((s) => {
              const isPast = s.step < demoStep;
              const isCurrent = s.step === demoStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => handleStepClick(s.step)}
                  className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all border ${
                    isCurrent
                      ? "bg-orange-500/20 border-orange-500/50 text-white font-semibold shadow-xs"
                      : isPast
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isPast ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="size-2.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
                    ) : (
                      <span className="size-3 rounded-full bg-slate-700 text-[9px] text-center leading-3 shrink-0">
                        {s.step}
                      </span>
                    )}
                    <span className="truncate font-semibold">{s.title.split(". ")[1]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default DemoScenarioBanner;
