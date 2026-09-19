"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, User } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
}

interface CustomGlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
}

export default function CustomGlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select a member...",
  className = "",
  searchable = false,
  disabled = false,
}: CustomGlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open if searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.subtitle && o.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (o.badge && o.badge.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full rounded-2xl bg-white/90 backdrop-blur-xl border-1.5 transition-all shadow-xs flex items-center justify-between p-3 sm:px-4 sm:py-2.5 cursor-pointer ${
          isOpen
            ? "border-[#36543D] ring-4 ring-[#36543D]/12 bg-white"
            : "border-[#D4E2D4] hover:border-[#36543D]/50 hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
          {selectedOption ? (
            <>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#36543D]/15 to-[#36543D]/5 border border-[#36543D]/20 text-[#36543D] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {selectedOption.label.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold text-neutral-900 text-xs sm:text-sm">
                    {selectedOption.label}
                  </span>
                  {selectedOption.badge && (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#36543D] border border-emerald-200/80 shrink-0">
                      {selectedOption.badge}
                    </span>
                  )}
                </div>
                {selectedOption.subtitle && (
                  <span className="truncate text-[11px] text-neutral-500 font-sans">
                    {selectedOption.subtitle}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400 text-xs sm:text-sm">
              <User className="w-4 h-4 text-neutral-400" />
              <span>{placeholder || "Select a member..."}</span>
            </div>
          )}
        </div>

        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ml-2 ${
            isOpen ? "bg-[#36543D]/10 text-[#36543D]" : "text-neutral-400"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#36543D]" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Glass Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white/95 backdrop-blur-2xl border border-neutral-200/80 shadow-[0_20px_50px_-10px_rgba(54,84,61,0.2),0_4px_16px_rgba(0,0,0,0.06)] p-2 animate-in fade-in zoom-in-95 duration-150">
          {searchable && (
            <div className="p-1 mb-1.5 border-b border-neutral-100">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#36543D] focus:bg-white focus:ring-2 focus:ring-[#36543D]/15 transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-1 p-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 font-sans">
                No matching members found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#36543D] text-white shadow-sm font-semibold"
                        : "text-neutral-800 hover:bg-[#36543D]/8 hover:text-[#36543D]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}
                      >
                        {opt.label.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold text-xs">{opt.label}</span>
                        {opt.subtitle && (
                          <span
                            className={`truncate text-[10px] ${
                              isSelected ? "text-white/80" : "text-neutral-400"
                            } font-sans`}
                          >
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-50 text-[#36543D] border border-emerald-200"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
