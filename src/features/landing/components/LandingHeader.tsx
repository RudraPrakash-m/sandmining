import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, BookOpen } from "lucide-react";
import { routes } from "@/app/routes/routeConfig";
import { IMAGES } from "@/assets/images";

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate(routes.login.path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-[#e6dbc9]"
          : "bg-white py-3.5 border-b border-[#ebdcc8]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Emblem and Portal Branding */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center gap-2">
              <img
                src={IMAGES.CHHATTISGARH_LOGO}
                alt="Chhattisgarh State Emblem"
                className="h-12 w-auto object-contain drop-shadow-sm"
              />
              <img
                src={IMAGES.CMDC_LOGO}
                alt="CMDC Logo"
                className="h-12 w-auto object-contain hidden sm:inline-block"
              />
            </div>
            <div className="border-l border-neutral-300 pl-3.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#882d09] font-display leading-none">
                Chhattisgarh Mineral Development Corporation Ltd. (CMDC)
              </h1>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 tracking-wide mt-0.5">
                Government of Chhattisgarh
              </p>
            </div>
          </div>

          {/* Right: Actions (Login & User Manual) */}
          <div className="flex items-center gap-3">
            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              id="landing-header-login-btn"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#94340d] to-[#b84513] hover:from-[#7e2c0b] hover:to-[#9e3a10] rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-[#7a2807]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            {/* User Manual Button */}
            <button
              onClick={() => {
                const manualSection = document.getElementById("how-it-works");
                if (manualSection) {
                  manualSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-md shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-neutral-600" />
              <span>User Manual</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

