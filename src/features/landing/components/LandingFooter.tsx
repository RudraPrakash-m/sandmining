import React from "react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#1f1712] text-neutral-300 text-xs border-t-2 border-[#882d09]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div className="text-center sm:text-left">
            <p>© 2026 Chhattisgarh Mineral Development Corporation Ltd. (CMDC), Government of Chhattisgarh. All Rights Reserved.</p>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
           
            <span>•</span>
            <a href="#" className="hover:text-amber-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
