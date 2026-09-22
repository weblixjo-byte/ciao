"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  LifeBuoy,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  CreditCard,
  TrendingUp,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Laptop,
  Check,
  Copy,
} from "lucide-react";

interface SupportTicketViewProps {
  adminName?: string;
  adminEmail?: string;
  onReturnToDashboard?: () => void;
}

const CATEGORIES = [
  {
    id: "Bug / System Error",
    label: "Bug / System Error",
    sub: "Software errors, crashes, or unresponsiveness",
    icon: AlertCircle,
  },
  {
    id: "POS & Cashier Flow",
    label: "POS & Cashier Flow",
    sub: "Keypad entry, bill credit, or cashier actions",
    icon: CreditCard,
  },
  {
    id: "Customer Card & PIN",
    label: "Customer Card & PIN",
    sub: "QR scanning, 6-digit PIN, or pass issues",
    icon: Smartphone,
  },
  {
    id: "Points & Calculation",
    label: "Points & Calculation",
    sub: "Point balance discrepancy or reward redemption",
    icon: TrendingUp,
  },
  {
    id: "Performance & Lag",
    label: "Performance & Lag",
    sub: "Screen loading delay or connection lag",
    icon: Clock,
  },
  {
    id: "Feature / Improvement",
    label: "Feature / Improvement",
    sub: "Requested modification, new perk, or setting",
    icon: Sparkles,
  },
] as const;

const URGENCIES = [
  {
    id: "Low",
    label: "Low",
    desc: "Cosmetic or minor suggestion",
    badgeClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
    activeClass: "border-neutral-700 bg-neutral-50 text-neutral-900 shadow-xs",
  },
  {
    id: "Medium",
    label: "Medium",
    desc: "Normal issue, non-blocking",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    activeClass: "border-blue-600 bg-blue-50 text-blue-900 shadow-xs",
  },
  {
    id: "High",
    label: "High",
    desc: "Impacting day-to-day operations",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    activeClass: "border-amber-600 bg-amber-50 text-amber-900 shadow-xs",
  },
  {
    id: "Critical",
    label: "Critical",
    desc: "Cashier or loyalty pass stopped completely",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    activeClass: "border-red-600 bg-red-50 text-red-900 shadow-xs ring-2 ring-red-500/20",
    isCritical: true,
  },
] as const;

export default function SupportTicketView({
  adminName = "Administrator",
  adminEmail = "admin@ciao.com",
  onReturnToDashboard,
}: SupportTicketViewProps) {
  const [category, setCategory] = useState<string>("Bug / System Error");
  const [urgency, setUrgency] = useState<string>("Medium");
  const [name, setName] = useState<string>(adminName);
  const [phone, setPhone] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<boolean>(false);

  // Auto-captured live client diagnostics
  const [diagnostics, setDiagnostics] = useState<{
    deviceType: string;
    os: string;
    browser: string;
    viewport: string;
    localTime: string;
    userAgent: string;
    currentUrl: string;
  } | null>(null);

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
      setErrorMessage("Please provide both a subject title and a detailed description.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const generatedId = `#TK-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      ticketId: generatedId,
      category,
      urgency,
      subject: subject.trim(),
      description: description.trim(),
      adminName: name.trim() || adminName,
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
      console.warn("Primary gateway notice, trying Web3Forms direct fallback...", err);
    }

    // Gateway 2: Direct Client Fallback to Web3Forms (Guaranteed 100% Delivery Redundancy)
    if (!submitted) {
      try {
        const directSubject = `[Ciao Support ${generatedId}] [${urgency.toUpperCase()}] ${category}: ${subject}`;
        const directMessage = `
==================================================
CIAO LOYALTY - INCIDENT / SUPPORT TICKET (FALLBACK GATEWAY)
==================================================
Ticket ID: ${generatedId}
Category: ${category}
Urgency Level: ${urgency}
Admin / Branch Name: ${name.trim() || adminName}
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
            from_name: `Ciao Support (${name || "Admin"})`,
            email: "info@weblix-jo.com",
            replyto: "info@weblix-jo.com",
            ticket_id: generatedId,
            category,
            urgency,
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
            "Unable to transmit ticket. Please verify your connection or email info@weblix-jo.com directly."
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
    setCategory("Bug / System Error");
    setUrgency("Medium");
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
        <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#36543D] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-3 border border-emerald-200/80">
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
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xs border border-[#dce5dd]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#36543D] shrink-0 shadow-2xs">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans">
                  Support & Incident Ticket
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-[#36543D] text-[11px] font-bold uppercase tracking-wider">
                  Direct Line
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed font-sans max-w-xl">
                Submit system inquiries, bugs, or feature requests directly to the engineering team
                at <span className="font-semibold text-neutral-800">info@weblix-jo.com</span>.
                Technical diagnostics will be auto-attached for instant troubleshooting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-neutral-600 font-sans">
                Web3Forms Hotline Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ticket Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Category Selection Cards */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <label className="text-sm font-bold text-neutral-900 block mb-1 font-sans">
            1. Select Issue Category
          </label>
          <span className="text-xs text-neutral-500 block mb-4 font-sans">
            Choose the area of the platform experiencing difficulty:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#36543D] bg-emerald-50/50 ring-2 ring-[#36543D]/20 shadow-xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-[#36543D] text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#36543D]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block font-sans">
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-neutral-500 block font-sans leading-tight mt-0.5">
                      {cat.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Urgency Level Chips */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <label className="text-sm font-bold text-neutral-900 block mb-1 font-sans">
            2. Urgency & Operational Impact
          </label>
          <span className="text-xs text-neutral-500 block mb-4 font-sans">
            Indicate how critically this affects store checkouts or customer flow:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {URGENCIES.map((lvl) => {
              const isSelected = urgency === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setUrgency(lvl.id)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? lvl.activeClass
                      : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {lvl.id === "Critical" && (
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    )}
                    <span className="text-xs font-bold font-sans">{lvl.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 leading-tight font-sans">
                    {lvl.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Ticket Details & Contact Info */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <label className="text-sm font-bold text-neutral-900 block font-sans">
            3. Incident Details & Contact Information
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1 font-sans">
                Admin / Branch Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ciao Store Manager"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-sans focus:bg-white focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1 font-sans">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0791234567"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-sans focus:bg-white focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1 font-sans">
              Issue Subject / Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Cashier terminal PIN input unresponsive on iPad"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-sans focus:bg-white focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1 font-sans">
              Detailed Description & Steps to Reproduce <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe exactly what occurred, any error text displayed, or what you were trying to do when the issue happened..."
              className="w-full p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm font-sans focus:bg-white focus:border-[#36543D] focus:ring-2 focus:ring-[#36543D]/20 outline-none transition-all resize-y leading-relaxed"
              required
            />
          </div>
        </div>

        {/* 4. Auto-Captured Technical Diagnostics Badge & Destination Info */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#36543D]" />
              <span className="text-xs font-bold text-neutral-900 font-sans">
                Automatic Diagnostics (Will be attached silently)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#36543D] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
              <Send className="w-3 h-3" />
              <span>Destination: info@weblix-jo.com</span>
            </div>
          </div>

          {diagnostics ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-600 font-sans">
              <div className="p-2 rounded-xl bg-white border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px]">Device Type:</span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {diagnostics.deviceType}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px]">OS & Browser:</span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {diagnostics.os} • {diagnostics.browser}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px]">Screen Viewport:</span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {diagnostics.viewport}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-neutral-200/60">
                <span className="text-neutral-400 block text-[10px]">Local Time:</span>
                <span className="font-semibold text-neutral-800 truncate block">
                  {diagnostics.localTime}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 font-sans">Collecting device profile...</span>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="font-sans leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button with Smooth Brand 3-Dots Animation */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onReturnToDashboard && (
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="px-6 py-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-[#36543D] hover:bg-[#2a4230] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 active:scale-98"
          >
            {loading ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-1 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-2 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-white animate-brand-dot-3 inline-block" />
                </div>
                <span>Transmitting Ticket to Weblix...</span>
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
