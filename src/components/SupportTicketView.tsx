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
  AlertTriangle,
} from "lucide-react";

interface SupportTicketViewProps {
  adminName?: string;
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
  onReturnToDashboard,
}: SupportTicketViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof CATEGORIES)[number]
  >(CATEGORIES[0]);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collect diagnostics silently on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    let deviceType = "Desktop Computer";
    if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = "iPad / Tablet Device";
    } else if (
      /Mobile|iPhone|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ) {
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
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua))
      browser = "Apple Safari";
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

    const viewport = `${window.innerWidth} x ${window.innerHeight} (DPR: ${
      window.devicePixelRatio || 1
    })`;

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
    } catch (err: unknown) {
      console.warn(
        "Primary gateway notice, using Web3Forms direct fallback...",
        err
      );
    }

    // Gateway 2: Direct Client Fallback to Web3Forms
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
      } catch (clientErr: unknown) {
        const msg =
          clientErr instanceof Error ? clientErr.message : String(clientErr);
        setErrorMessage(
          msg ||
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

  // ─── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (successTicketId) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div
          className="glass-panel rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
          style={{ boxShadow: "0 12px 48px rgba(54,84,61,0.10)" }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(54,84,61,0.10) 0%, transparent 70%)",
            }}
          />

          {/* Checkmark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(54,84,61,0.12) 0%, rgba(212,226,212,0.3) 100%)",
              border: "1.5px solid rgba(54,84,61,0.20)",
            }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: "#36543D" }} />
          </div>

          {/* Badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest inline-block mb-3 px-3 py-1 rounded-full"
            style={{
              background: "rgba(54,84,61,0.08)",
              color: "#36543D",
              border: "1px solid rgba(54,84,61,0.15)",
            }}
          >
            Ticket Dispatched to Weblix
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#141f16" }}>
            Support Ticket Registered
          </h2>

          <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: "#6b7280" }}>
            Your incident report has been securely transmitted to{" "}
            <span className="font-semibold font-mono" style={{ color: "#36543D" }}>
              info@weblix-jo.com
            </span>
            . Our engineering team will review the attached diagnostics and
            follow up promptly.
          </p>

          {/* Ticket Reference */}
          <div
            className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-8 w-full max-w-xs justify-center"
            style={{
              background: "rgba(54,84,61,0.06)",
              border: "1.5px solid rgba(54,84,61,0.15)",
            }}
          >
            <div className="text-center">
              <span
                className="text-[10px] uppercase tracking-wider font-bold block mb-0.5"
                style={{ color: "#9ca3af" }}
              >
                Reference ID
              </span>
              <span
                className="font-mono text-xl font-bold"
                style={{ color: "#36543D" }}
              >
                {successTicketId}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: "rgba(54,84,61,0.07)",
                color: "#36543D",
                border: "1.5px solid rgba(54,84,61,0.15)",
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Ticket</span>
            </button>

            {onReturnToDashboard && (
              <button
                onClick={onReturnToDashboard}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                style={{ background: "#36543D" }}
              >
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN FORM ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #36543D 0%, #4a7253 100%)",
              boxShadow: "0 4px 16px rgba(54,84,61,0.25)",
            }}
          >
            <LifeBuoy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight leading-snug"
              style={{ color: "#141f16" }}
            >
              Technical Support &amp; Issue Tickets
            </h1>
            <p className="text-xs sm:text-sm mt-0.5 leading-normal" style={{ color: "#9ca3af" }}>
              Submit bugs, POS glitches, or technical requests directly to the
              engineering team.
            </p>
          </div>
        </div>

        {/* Direct Line Badge */}
        <div className="self-start sm:self-center shrink-0">
          <div
            className="px-3.5 py-1.5 rounded-full flex items-center gap-2"
            style={{
              background: "rgba(54,84,61,0.07)",
              border: "1px solid rgba(54,84,61,0.15)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: "#36543D",
                boxShadow: "0 0 0 3px rgba(54,84,61,0.15)",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            <span
              className="text-xs font-mono font-medium"
              style={{ color: "#36543D" }}
            >
              Direct Line: info@weblix-jo.com
            </span>
          </div>
        </div>
      </div>

      {/* ── Form Card ──────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 space-y-6"
      >
        {/* ── Field 1: ISSUE CATEGORY ─────────────────────────────────────── */}
        <div>
          <label
            className="block text-[11px] font-bold tracking-widest uppercase mb-2.5"
            style={{ color: "#6b7280" }}
          >
            Issue Category
          </label>

          <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full text-left flex items-center justify-between transition-all cursor-pointer outline-none"
              style={{
                background: isCategoryOpen
                  ? "rgba(255,255,255,0.96)"
                  : "rgba(255,255,255,0.75)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: isCategoryOpen
                  ? "1.5px solid #36543D"
                  : "1.5px solid rgba(212,226,212,0.85)",
                borderRadius: "1rem",
                padding: "0.85rem 1rem",
                boxShadow: isCategoryOpen
                  ? "0 0 0 4px rgba(54,84,61,0.10), 0 4px 16px rgba(54,84,61,0.08)"
                  : "0 2px 8px -2px rgba(54,84,61,0.05)",
              }}
            >
              <div className="flex items-baseline gap-2 truncate">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: "#141f16" }}
                >
                  {selectedCategory.title}
                </span>
                <span
                  className="text-xs font-mono hidden sm:inline truncate"
                  style={{ color: "#9ca3af" }}
                >
                  {selectedCategory.desc}
                </span>
              </div>
              <ChevronDown
                className="w-4 h-4 shrink-0 ml-2 transition-transform duration-200"
                style={{
                  color: isCategoryOpen ? "#36543D" : "#9ca3af",
                  transform: isCategoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Glass Floating Dropdown Menu */}
            {isCategoryOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 z-30 py-1.5 max-h-72 overflow-y-auto animate-in fade-in duration-150"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1.5px solid rgba(212,226,212,0.85)",
                  borderRadius: "1rem",
                  boxShadow:
                    "0 16px 48px rgba(54,84,61,0.14), 0 4px 16px rgba(0,0,0,0.05)",
                }}
              >
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
                      className="w-full px-4 py-3 text-left flex items-center justify-between transition-colors cursor-pointer"
                      style={{
                        background: isSelected
                          ? "rgba(54,84,61,0.07)"
                          : "transparent",
                        borderRadius: "0.625rem",
                        margin: "0 0.25rem",
                        width: "calc(100% - 0.5rem)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(54,84,61,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "transparent";
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: isSelected ? "#36543D" : "#141f16" }}
                        >
                          {cat.title}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{ color: "#9ca3af" }}
                        >
                          {cat.desc}
                        </span>
                      </div>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 shrink-0 ml-2"
                          style={{ color: "#36543D" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Field 2: SUBJECT / SUMMARY ───────────────────────────────────── */}
        <div>
          <label
            className="block text-[11px] font-bold tracking-widest uppercase mb-2.5"
            style={{ color: "#6b7280" }}
          >
            Subject / Summary
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of the issue or inquiry..."
            className="glass-input w-full"
            style={{ borderRadius: "1rem", padding: "0.85rem 1rem" }}
            required
          />
        </div>

        {/* ── Field 3: DETAILED DESCRIPTION ────────────────────────────────── */}
        <div>
          <label
            className="block text-[11px] font-bold tracking-widest uppercase mb-2.5"
            style={{ color: "#6b7280" }}
          >
            Detailed Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened in detail: steps to reproduce, customer PIN or reward code (if relevant), error messages, or what needs fixing..."
            className="glass-input w-full resize-y leading-relaxed"
            style={{
              borderRadius: "1rem",
              padding: "0.85rem 1rem",
              minHeight: "140px",
            }}
            required
          />
        </div>

        {/* ── Field 4: PHONE / WHATSAPP ─────────────────────────────────────── */}
        <div>
          <label
            className="block text-[11px] font-bold tracking-widest uppercase mb-2.5"
            style={{ color: "#6b7280" }}
          >
            Phone / WhatsApp{" "}
            <span className="normal-case font-normal" style={{ color: "#c4c4c4" }}>
              (Optional)
            </span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+962 7X XXX XXXX"
            className="glass-input w-full"
            style={{ borderRadius: "1rem", padding: "0.85rem 1rem" }}
          />
        </div>

        {/* ── Error Message ─────────────────────────────────────────────────── */}
        {errorMessage && (
          <div
            className="p-4 rounded-2xl flex items-center gap-2.5 text-xs leading-relaxed"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#b91c1c",
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ── Footer: Notice + Submit Button ───────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
          style={{ borderTop: "1px solid rgba(212,226,212,0.6)" }}
        >
          <span className="text-xs" style={{ color: "#c4c4c4" }}>
            Dispatched directly to engineering team via Web3Forms.
          </span>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            style={{
              background: loading
                ? "#4a7253"
                : "linear-gradient(135deg, #36543D 0%, #4a7253 100%)",
              boxShadow: loading
                ? "none"
                : "0 4px 16px rgba(54,84,61,0.30)",
              opacity: loading ? 0.85 : 1,
            }}
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
