import React, { useState, useRef, useEffect } from "react";
import type { GisSearchResultItem } from "../types/gis.types";
import { GisSpatialDataService } from "../services/gisSpatialDataService";
import {
  Search,
  X,
  Pickaxe,
  Building2,
  Truck,
  AlertTriangle,
  ShieldAlert,
  MapPin,
} from "lucide-react";

export interface GisMapSearchProps {
  onSelectResult: (result: GisSearchResultItem) => void;
  placeholder?: string;
  className?: string;
}

export const GisMapSearch: React.FC<GisMapSearchProps> = ({
  onSelectResult,
  placeholder = "Search reach by name, ID, river, district...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GisSearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const searchHits = GisSpatialDataService.searchAll(query);
      setResults(searchHits);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: GisSearchResultItem) => {
    onSelectResult(item);
    setQuery(item.title);
    setIsOpen(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "REACH":
        return <Pickaxe size={14} className="text-emerald-600 shrink-0" />;
      case "STOCKYARD":
        return <Building2 size={14} className="text-amber-500 shrink-0" />;
      case "VEHICLE":
        return <Truck size={14} className="text-blue-600 shrink-0" />;
      case "ALERT":
        return <AlertTriangle size={14} className="text-rose-600 shrink-0" />;
      case "RESTRICTED":
        return <ShieldAlert size={14} className="text-amber-600 shrink-0" />;
      default:
        return <MapPin size={14} className="text-primary shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-border-color rounded-xl shadow-2xs focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white dark:bg-gray-900 border border-border-color rounded-xl shadow-xl overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar-thin">
          <div className="p-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-border-color bg-[#FAF5EE]/60 dark:bg-gray-800/40">
            Search Matches ({results.length})
          </div>
          <div className="p-1">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
              >
                <div className="p-1 rounded bg-slate-100 dark:bg-gray-800 mt-0.5">
                  {getResultIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
