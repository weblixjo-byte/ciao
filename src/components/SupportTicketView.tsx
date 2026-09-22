"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Check,
  Copy,
  AlertTriangle,
} from "lucide-react";

interface SupportTicketViewProps {
  adminName?: string;
  adminEmail?: string;
  onReturnToDashboard?: () => void;
}

const CATEGORIES = [
  {
    id: "Bug / System Glitch",
    title: "Bug / System Glitch",
    desc: "Software errors, crashes, or glitches",
  },
  {
    id: "POS & Cashier Flow",
    title: "POS & Cashier Flow",
    desc: "Keypad entry, bill credit, or cashier actions",
  },
  {
    id: "Customer Card & PIN",
    title: "Customer Card & PIN",
    desc: "QR scanning, 6-digit PIN, or pass issues",
  },
  {
    id: "Points & Calculation",
    title: "Points & Calculation",
    desc: "Discrepancies in points or reward redemption",
  },
  {
    id: "Performance & Lag",
    title: "Performance & Lag",
    desc: "Screen loading delays or connection issues",
  },
  {
    id: "Feature / Modification",
    title: "Feature / Modification",
    desc: "New feature request or customization",
  },
  {
    id: "General Inquiry",
    title: "General Inquiry",
    desc: "General questions or account support",
  },
] as const;

export default function SupportTicketView({
  adminName = "Administrator",
  adminEmail = "admin@ciao.com",
  onReturnToDashboard,
}: SupportTicketViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0]
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<boolean>(false);

  // Auto-captured live client diagnostics (attached silently to email)
  const [diagnostics, setDiagnostics] = useState<{
    deviceType: string;
    os: string;
    browser: string;
    viewport: string;
    localTime: string;
    userAgent: string;
    currentUrl: string;
  } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collect diagnostics on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    let deviceType = "Desktop Computer";
    if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = "iPad / Tablet Device";
    } else if (/Mobile|iPhone|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = "Mobile Device";
    }

    let os = "Unknown OS";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
    else if (/iPad|iPhone|iPod/i.test(ua)) os = "iOS / iPadOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/Linux/i.test(ua)) os = "Linux";

    let browser = "Web Browser";
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Google Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Apple Safari";
    else if (/Edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/Firefox/i.test(ua)) browser = "Mozilla Firefox";

    let jordanTime = "";
    try {
      jordanTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Amman",
        dateStyle: "full",
        timeStyle: "medium",
      }).format(new Date());
    } catch {
      jordanTime = new Date().toLocaleString();
    }

    const viewport = `${window.innerWidth} x ${window.innerHeight} (DPR: ${window.devicePixelRatio || 1})`;

    setDiagnostics({
      deviceType,
      os,
      browser,
      viewport,
      localTime: jordanTime,
      userAgent: ua,
      currentUrl: window.location.href,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setErrorMessage("Please enter both a subject and a detailed description.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const generatedId = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      ticketId: generatedId,
      category: selectedCategory.title,
      urgency: "Normal",
      subject: subject.trim(),
      description: description.trim(),
      adminName,
      contactPhone: phone.trim() || "Not provided",
      diagnostics: diagnostics || undefined,
    };

    let submitted = false;

    // Gateway 1: Secure Server-side API endpoint
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        submitted = true;
        setSuccessTicketId(data.ticketId || generatedId);
      } else if (!data.canFallbackClient) {
        throw new Error(data.error || "Server processing failed");
      }
    } catch (err: any) {
      console.warn("Primary gateway notice, using Web3Forms direct fallback...", err);
    }

    // Gateway 2: Direct Client Fallback to Web3Forms (Guaranteed 100% Delivery Redundancy)
    if (!submitted) {
      try {
        const directSubject = `[Ciao Support ${generatedId}] ${selectedCategory.title}: ${subject}`;
        const directMessage = `
==================================================
CIAO LOYALTY - INCIDENT / SUPPORT TICKET
==================================================
Ticket ID: ${generatedId}
Category: ${selectedCategory.title}
Admin / Branch Name: ${adminName}
Contact Phone / WhatsApp: ${phone.trim() || "Not provided"}
Destination Email: info@weblix-jo.com
Reported Time: ${diagnostics?.localTime || new Date().toISOString()}

--------------------------------------------------
ISSUE SUBJECT:
--------------------------------------------------
${subject}

--------------------------------------------------
DETAILED DESCRIPTION:
--------------------------------------------------
${description}

==================================================
AUTO-CAPTURED TECHNICAL DIAGNOSTICS:
==================================================
Device: ${diagnostics?.deviceType || "Unknown"}
OS: ${diagnostics?.os || "Unknown"}
Browser: ${diagnostics?.browser || "Unknown"}
Viewport: ${diagnostics?.viewport || "Unknown"}
URL: ${diagnostics?.currentUrl || window.location.href}
User Agent: ${diagnostics?.userAgent || navigator.userAgent}
Jordan Time: ${diagnostics?.localTime || "N/A"}
==================================================
`;

        const web3Res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "7f0e27f4-7df7-4105-af7a-985d05cc02d1",
            subject: directSubject,
            from_name: `Ciao Support (${adminName})`,
            email: "info@weblix-jo.com",
            replyto: "info@weblix-jo.com",
            ticket_id: generatedId,
            category: selectedCategory.title,
            contact_phone: phone,
            message: directMessage,
            device_type: diagnostics?.deviceType,
            browser: diagnostics?.browser,
            os: diagnostics?.os,
            viewport: diagnostics?.viewport,
          }),
        });

        const web3Data = await web3Res.json();
        if (web3Res.ok && web3Data.success) {
          submitted = true;
          setSuccessTicketId(generatedId);
        } else {
          throw new Error(web3Data.message || "Web3Forms submission failed");
        }
      } catch (clientErr: any) {
        setErrorMessage(
          clientErr.message ||
            "Unable to transmit ticket. Please check your network connection or email info@weblix-jo.com directly."
        );
      }
    }

    setLoading(false);

    if (submitted) {
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#36543D", "#D4E2D4", "#233728", "#10b981"],
        });
      } catch {}
    }
  };

  const handleReset = () => {
    setSuccessTicketId(null);
    setSubject("");
    setDescription("");
    setPhone("");
    setSelectedCategory(CATEGORIES[0]);
    setErrorMessage(null);
  };

  const handleCopyTicket = () => {
    if (!successTicketId) return;
    navigator.clipboard.writeText(successTicketId);
    setCopiedTicketId(true);
    setTimeout(() => setCopiedTicketId(false), 2000);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (successTicketId) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white border border-[#36543D]/20 rounded-3xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#36543D] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-[#36543D]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#36543D] bg-emerald-50 px-3 py-1 rounded-full inline-block mb-3 border border-emerald-200">
            Ticket Dispatched to Weblix
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 font-sans">
            Support Ticket Registered
          </h2>

          <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Your incident report has been securely transmitted to{" "}
            <span className="font-semibold text-neutral-900 font-mono">info@weblix-jo.com</span>.
            Our engineering team will review the attached technical diagnostics and follow up
            promptly.
          </p>

          {/* Ticket Reference Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 mb-8 max-w-xs w-full justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                Official Reference ID
              </span>
              <span className="font-mono text-lg font-bold text-[#36543D]">
                {successTicketId}
              </span>
            </div>
            <button
              onClick={handleCopyTicket}
              className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Copy Ticket ID"
            >
              {copiedTicketId ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Ticket</span>
            </button>

            {onReturnToDashboard && (
              <button
                onClick={onReturnToDashboard}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#36543D] hover:bg-[#2a4230] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header Matching Screenshot (Left: LifeBuoy + Title/Subtitle, Right: Direct Line Badge) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#36543D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans tracking-tight leading-snug">
              Technical Support & Issue Tickets
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-sans mt-0.5 leading-normal">
              Submit bugs, POS glitches, or technical requests directly to the engineering team.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-medium text-emerald-900">
              Direct Line: info@weblix-jo.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Card Matching Screenshot Exactly with Ciao Brand Color Theme */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 md:p-10 shadow-xs space-y-6">
        {/* Field 1: ISSUE CATEGORY */}
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-600 mb-2 font-sans">
            ISSUE CATEGORY
          </label>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200/90 bg-white hover:bg-neutral-50/40 text-left flex items-center justify-between transition-all focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none cursor-pointer"
            >
              <div className="truncate flex items-baseline gap-2">
                <span className="text-sm font-semibold text-neutral-900 font-sans">
                  {selectedCategory.title}
                </span>
                <span className="text-xs text-neutral-400 font-mono hidden sm:inline truncate">
                  {selectedCategory.desc}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180 text-[#36543D]" : ""
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-2xl shadow-xl z-30 py-1.5 max-h-72 overflow-y-auto animate-in fade-in duration-150">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/70 text-[#36543D]"
                          : "hover:bg-neutral-50 text-neutral-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm font-semibold font-sans">{cat.title}</span>
                        <span className="text-xs text-neutral-400 font-mono">{cat.desc}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#36543D] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Field 2: SUBJECT / SUMMARY */}
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-600 mb-2 font-sans">
            SUBJECT / SUMMARY
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the issue or inquiry..."
            className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200/90 bg-white text-sm font-sans placeholder:text-neutral-400 text-neutral-900 focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all"
            required
          />
        </div>

        {/* Field 3: DETAILED DESCRIPTION */}
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-600 mb-2 font-sans">
            DETAILED DESCRIPTION
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened in detail: steps to reproduce, customer PIN or reward code (if relevant), error messages, or what needs fixing..."
            className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200/90 bg-white text-sm font-sans placeholder:text-neutral-400 text-neutral-900 focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all min-h-[140px] resize-y leading-relaxed"
            required
          />
        </div>

        {/* Field 4: PHONE / WHATSAPP (OPTIONAL) */}
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-600 mb-2 font-sans">
            PHONE / WHATSAPP (OPTIONAL)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+962 7X XXX XXXX"
            className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200/90 bg-white text-sm font-sans placeholder:text-neutral-400 text-neutral-900 focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all"
          />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="font-sans leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Card Footer Matching Screenshot (Left: Dispatched Notice, Right: Brand Olive Button) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 font-sans">
            Dispatched directly to engineering team via Web3Forms.
          </span>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#36543D] hover:bg-[#2a4230] text-white text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 active:scale-98"
          >
            {loading ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-1 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-2 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-3 inline-block" />
                </div>
                <span>Submitting Support Ticket...</span>
              </div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Support Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
