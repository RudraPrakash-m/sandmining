import React, { useState } from "react";
import { Phone, Globe } from "lucide-react";

export const LandingTopBar: React.FC = () => {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [lang, setLang] = useState<"en" | "hi">("en");

  return (
    <aside aria-label="Official utilities and accessibility bar" className="bg-[#1f1712] text-[#d4c6b5] text-xs border-b border-[#3b2b22] px-4 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Links */}
        <div className="flex items-center gap-4 text-[11px] font-medium tracking-wide">
          <a href="#main-content" className="hover:text-white transition-colors">
            Skip to Main Content
          </a>
        </div>

        {/* Right Accessibility & Language & Helpline */}
        <div className="flex items-center gap-4 text-[11px]">
          {/* Text Resizer */}
          <div className="hidden sm:flex items-center gap-1 border-r border-[#3b2b22] pr-3 text-neutral-300">
            <span className="text-[10px] text-neutral-400 mr-1">Text:</span>
            <button
              onClick={() => setFontSize("sm")}
              className={`px-1.5 py-0.5 rounded ${fontSize === "sm" ? "bg-amber-700 text-white font-bold" : "hover:text-white"}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-1.5 py-0.5 rounded ${fontSize === "base" ? "bg-amber-700 text-white font-bold" : "hover:text-white"}`}
              title="Default Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-1.5 py-0.5 rounded ${fontSize === "lg" ? "bg-amber-700 text-white font-bold" : "hover:text-white"}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-[#2d221a] px-2 py-0.5 rounded border border-[#48362b]">
            <Globe className="w-3 h-3 text-amber-400" />
            <button
              onClick={() => setLang("en")}
              className={`px-1 rounded ${lang === "en" ? "font-bold text-amber-300" : "text-neutral-400 hover:text-white"}`}
            >
              English
            </button>
            <span className="text-neutral-600">|</span>
            <button
              onClick={() => setLang("hi")}
              className={`px-1 rounded ${lang === "hi" ? "font-bold text-amber-300" : "text-neutral-400 hover:text-white"}`}
            >
              हिंदी
            </button>
          </div>

          {/* Toll Free Helpline */}
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold pl-1">
            <Phone className="w-3 h-3" />
            <span>Toll-Free: 1800 123 4567</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
