import { useState } from "react";
import {
  ArrowLeft,
  X,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Cpu,
  Database,
  Server,
  Network,
  TrendingUp,
  GitBranch,
  Terminal,
  Eye,
  Zap,
  MoreHorizontal,
  Lock,
  Layers,
  BarChart3,
  Filter,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { RECOMMENDATIONS, AUDIT_LOG } from "./data";

type Screen = "dashboard" | "detail" | "activity-log";
type Overlay = null | "ask-why" | "alternatives";
type ConfidenceLevel = "High" | "Review" | "Low";
type StatusChip = "pending" | "approved";
type OperatorDecision = "Approved" | "Overridden" | "Escalated";

interface Recommendation {
  id: string;
  title: string;
  target: string;
  confidence: ConfidenceLevel;
  status: StatusChip;
  reasoning: string;
  category: string;
  impact: string;
  age: string;
  confidenceDriver: string;
  reasoningSteps: string[];
  dataSources: { tag: string; label: string }[];
  limitations: string[];
  factors: { name: string; value: number; level: string; color: string }[];
  alternatives: { id: string; title: string; tradeoff: string; confidence: number; risk: string }[];
}

interface AuditEntry {
  timestamp: string;
  actionSignature: string;
  inference: string;
  decision: OperatorDecision;
  operator: string;
  recId: string;
}

const MONO = "'JetBrains Mono', monospace";

function iconFor(category: string) {
  const c = category.toUpperCase();
  if (c.includes("SECURITY")) return <Shield size={14} />;
  if (c.includes("IDENTITY")) return <Lock size={14} />;
  if (c.includes("NETWORK")) return <Network size={14} />;
  if (c.includes("COMPLIANCE") || c.includes("PATCH")) return <Cpu size={14} />;
  return <Server size={14} />;
}

function confidenceConfig(level: ConfidenceLevel) {
  if (level === "High")
    return {
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
      text: "#10b981",
      glow: "0 0 12px rgba(16,185,129,0.15)",
      dot: "#10b981",
      label: "HIGH CONF",
    };
  if (level === "Review")
    return {
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.25)",
      text: "#f59e0b",
      glow: "0 0 12px rgba(245,158,11,0.12)",
      dot: "#f59e0b",
      label: "NEEDS REVIEW",
    };
  return {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    text: "#ef4444",
    glow: "0 0 12px rgba(239,68,68,0.12)",
    dot: "#ef4444",
    label: "LOW CONF",
  };
}

function impactColor(impact: string) {
  if (impact === "Critical") return { text: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
  if (impact === "High") return { text: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" };
  if (impact === "Medium") return { text: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" };
  return { text: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" };
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    COMPUTE: "#3b82f6",
    SECURITY: "#8b5cf6",
    MESSAGING: "#f59e0b",
    DATABASE: "#06b6d4",
    NETWORK: "#10b981",
  };
  return map[cat] || "#64748b";
}

function decisionStyle(d: OperatorDecision) {
  if (d === "Approved")
    return { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.25)" };
  if (d === "Overridden")
    return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" };
  return { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" };
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const c = confidenceConfig(level);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        boxShadow: c.glow,
        fontFamily: MONO,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot, boxShadow: `0 0 4px ${c.dot}` }} />
      {c.label}
    </span>
  );
}

function StatusPill({ status }: { status: StatusChip }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase"
      style={{
        background: status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
        border: `1px solid ${status === "approved" ? "rgba(16,185,129,0.25)" : "rgba(100,116,139,0.2)"}`,
        color: status === "approved" ? "#10b981" : "#64748b",
        fontFamily: MONO,
      }}
    >
      {status}
    </span>
  );
}

function NavHeader({ screen, onNav, recommendations, theme, onToggleTheme }: { screen: Screen; onNav: (s: Screen) => void; recommendations: Recommendation[]; theme: "dark" | "light"; onToggleTheme: () => void }) {
  const counts = {
    pending: recommendations.filter((r) => r.status === "pending").length,
    approved: recommendations.filter((r) => r.status === "approved").length,
  };

  return (
    <header
      className="flex items-center justify-between px-8 shrink-0"
      style={{
        height: 60,
        background: "var(--c-header)",
        borderBottom: "1px solid var(--c-1e293b)",
        backdropFilter: "blur(12px)",
        position: "relative",
      }}
    >
      {/* Left accent line */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #3b82f6, transparent)" }} />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.2))",
              border: "1px solid rgba(59,130,246,0.35)",
              boxShadow: "0 0 16px rgba(59,130,246,0.2)",
            }}
          >
            <Zap size={14} style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-widest text-white"
              style={{ fontFamily: MONO, letterSpacing: "0.1em" }}
            >
              Trust-AI <span style={{ color: "#3b82f6" }}>//</span> Fleet Command
            </div>
            <div className="text-[9px] tracking-widest" style={{ color: "var(--c-334155)", fontFamily: MONO }}>
              AI-DRIVEN INFRASTRUCTURE INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1" style={{ borderLeft: "1px solid var(--c-1e293b)", paddingLeft: 24 }}>
          {[
            { label: "PENDING", value: counts.pending, color: "#f59e0b" },
            { label: "APPROVED", value: counts.approved, color: "#10b981" },
            { label: "NODES", value: "248", color: "#3b82f6" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-4 py-1 rounded-md"
              style={{ borderRight: "1px solid var(--c-1e293b)" }}
            >
              <span className="text-base font-bold" style={{ color: stat.color, fontFamily: MONO, lineHeight: 1 }}>
                {stat.value}
              </span>
              <span className="text-[8px] tracking-widest mt-0.5" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle light or dark mode"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:brightness-110"
          style={{ color: "var(--c-94a3b8)", border: "1px solid var(--c-1e293b)", background: "var(--c-070d1c)" }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div
          className="flex items-center rounded-xl p-1 gap-1"
          style={{ background: "var(--c-070d1c)", border: "1px solid var(--c-1e293b)" }}
        >
          {(["dashboard", "activity-log"] as Screen[]).map((s, i) => {
            const active = screen === s || (screen === "detail" && s === "dashboard");
            const labels = ["Recommendations", "Audit Activity Log"];
            return (
              <button
                key={s}
                onClick={() => onNav(s)}
                className="px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200"
                style={{
                  background: active ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "transparent",
                  color: active ? "var(--c-ffffff)" : "var(--c-475569)",
                  boxShadow: active ? "0 0 16px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                }}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function DashboardScreen({ recommendations, onSelect }: { recommendations: Recommendation[]; onSelect: (r: Recommendation) => void }) {
  const pending = recommendations.filter((r) => r.status === "pending");
  const visible = pending.slice(0, 4);
  const critical = visible.filter((r) => r.impact === "Critical");
  const rest = visible.filter((r) => r.impact !== "Critical");

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-020617)" }}>
      {/* Dot grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(circle, var(--c-1e293b) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.35,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          background: "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(59,130,246,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 px-8 py-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)" }} />
              <h1 className="text-lg font-bold text-white tracking-tight">Actionable Directives</h1>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa", fontFamily: MONO }}
              >
                {pending.length} ACTIVE
              </span>
            </div>
            <p className="text-xs pl-3.5" style={{ color: "var(--c-475569)" }}>
              Last inference run{" "}
              <span style={{ fontFamily: MONO, color: "#64748b" }}>2024-08-09T14:36:00Z</span>
              {" "}· Agent v2.4.1
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ color: "#64748b", border: "1px solid var(--c-1e293b)", background: "var(--c-070d1c)" }}
            >
              <Filter size={11} />
              All Categories
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ color: "#64748b", border: "1px solid var(--c-1e293b)", background: "var(--c-070d1c)" }}
            >
              <BarChart3 size={11} />
              Priority Sort
            </button>
          </div>
        </div>

        {/* Critical banner */}
        {critical.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: "rgba(239,68,68,0.15)" }} />
              <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", fontFamily: MONO }}>
                ⚠ CRITICAL PRIORITY
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(239,68,68,0.15)" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {critical.map((rec) => <RecCard key={rec.id} rec={rec} onSelect={onSelect} featured />)}
            </div>
          </div>
        )}

        {/* Standard directives */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1" style={{ background: "var(--c-1e293b)" }} />
          <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
            STANDARD DIRECTIVES
          </span>
          <div className="h-px flex-1" style={{ background: "var(--c-1e293b)" }} />
        </div>
        <div className="flex flex-col gap-2.5">
          {rest.map((rec) => <RecCard key={rec.id} rec={rec} onSelect={onSelect} />)}
        </div>
      </div>
    </div>
  );
}

function RecCard({ rec, onSelect, featured }: { rec: Recommendation; onSelect: (r: Recommendation) => void; featured?: boolean }) {
  const cf = confidenceConfig(rec.confidence);
  const ic = impactColor(rec.impact);
  const catColor = categoryColor(rec.category);

  if (featured) {
    return (
      <button
        onClick={() => onSelect(rec)}
        className="text-left group w-full rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, var(--c-0a1020) 0%, var(--c-0f172a) 100%)",
          border: "1px solid var(--c-253047)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5" style={{ background: `linear-gradient(to right, ${catColor}, transparent)` }} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${catColor}18, ${catColor}08)`,
                  border: `1px solid ${catColor}30`,
                  color: catColor,
                }}
              >
                {iconFor(rec.category)}
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest block mb-0.5" style={{ color: catColor, fontFamily: MONO }}>
                  {rec.category}
                </span>
                <span className="text-[10px] font-bold tracking-wider" style={{ color: "#374151", fontFamily: MONO }}>
                  {rec.id}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded tracking-widest"
                style={{ background: ic.bg, border: `1px solid ${ic.border}`, color: ic.text, fontFamily: MONO }}
              >
                {rec.impact.toUpperCase()}
              </span>
              <ConfidenceBadge level={rec.confidence} />
            </div>
          </div>

          <h3 className="text-sm font-bold text-white leading-snug mb-1.5 group-hover:text-blue-300 transition-colors">
            {rec.title}
          </h3>
          <p className="text-[11px] mb-3" style={{ color: "var(--c-334155)", fontFamily: MONO }}>
            {rec.target}
          </p>

          <div className="rounded-lg p-3 mb-3" style={{ background: "var(--c-060c18)", border: "1px solid var(--c-1a2740)" }}>
            <div className="flex items-start gap-2">
              <Terminal size={10} className="mt-0.5 shrink-0" style={{ color: "var(--c-334155)" }} />
              <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--c-475569)" }}>
                {rec.reasoning}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusPill status={rec.status} />
              <span className="text-[10px]" style={{ color: "var(--c-334155)", fontFamily: MONO }}>{rec.age}</span>
            </div>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" style={{ color: "#3b82f6" }} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(rec)}
      className="text-left group w-full rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--c-0a0f1e)",
        border: "1px solid var(--c-1a2332)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Left accent */}
      <div className="flex">
        <div className="w-0.5 shrink-0" style={{ background: `linear-gradient(to bottom, ${catColor}80, transparent)` }} />
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
              style={{
                background: `${catColor}10`,
                border: `1px solid ${catColor}25`,
                color: catColor,
              }}
            >
              {iconFor(rec.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold tracking-widest" style={{ color: catColor, fontFamily: MONO }}>
                  {rec.category}
                </span>
                <span className="text-[9px] tracking-wider" style={{ color: "var(--c-253047)", fontFamily: MONO }}>·</span>
                <span className="text-[9px] font-bold tracking-wider" style={{ color: "var(--c-334155)", fontFamily: MONO }}>
                  {rec.id}
                </span>
                <span className="text-[9px] tracking-wider" style={{ color: "var(--c-253047)", fontFamily: MONO }}>·</span>
                <span className="text-[9px]" style={{ color: "var(--c-334155)", fontFamily: MONO }}>{rec.age}</span>
              </div>
              <h3 className="text-sm font-semibold leading-snug group-hover:text-blue-300 transition-colors" style={{ color: "#e2e8f0" }}>
                {rec.title}
              </h3>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--c-334155)", fontFamily: MONO }}>
                {rec.target}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
                style={{ background: ic.bg, border: `1px solid ${ic.border}`, color: ic.text, fontFamily: MONO }}
              >
                {rec.impact.toUpperCase()}
              </span>
              <ConfidenceBadge level={rec.confidence} />
              <StatusPill status={rec.status} />
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" style={{ color: "#3b82f6" }} />
            </div>
          </div>
          <div className="mt-2.5 pl-11 flex items-start gap-1.5">
            <Terminal size={9} className="mt-0.5 shrink-0" style={{ color: "var(--c-253047)" }} />
            <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--c-334155)" }}>
              {rec.reasoning}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function DetailScreen({ rec, onBack, onOverlay, onDecision }: { rec: Recommendation; onBack: () => void; onOverlay: (o: Overlay) => void; onDecision: (id: string, d: OperatorDecision) => void }) {
  const cf = confidenceConfig(rec.confidence);
  const catColor = categoryColor(rec.category);

  const tagStyles: Record<string, { bg: string; border: string; color: string }> = {
    METRICS: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", color: "#60a5fa" },
    LOGS: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "#a78bfa" },
    CONFIG: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", color: "var(--c-94a3b8)" },
    SCHEDULE: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", color: "#34d399" },
    QUOTA: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#fbbf24" },
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-020617)" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(circle, var(--c-1e293b) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.25,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 px-8 py-6 max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium mb-5 group transition-colors"
          style={{ color: "var(--c-475569)" }}
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" style={{ color: "#3b82f6" }} />
          <span className="group-hover:text-blue-400 transition-colors">Return to Fleet Command</span>
        </button>

        {/* Hero card */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{
            background: "linear-gradient(135deg, var(--c-0a1020) 0%, var(--c-0d1627) 100%)",
            border: "1px solid var(--c-1e2d45)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div className="h-0.5" style={{ background: `linear-gradient(to right, ${catColor}, #3b82f6, transparent)` }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${catColor}20, ${catColor}08)`,
                    border: `1px solid ${catColor}35`,
                    boxShadow: `0 0 20px ${catColor}15`,
                    color: catColor,
                  }}
                >
                  <div style={{ transform: "scale(1.5)" }}>{iconFor(rec.category)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: catColor, fontFamily: MONO }}>
                      {rec.category}
                    </span>
                    <span style={{ color: "var(--c-1e293b)" }}>·</span>
                    <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
                      {rec.id}
                    </span>
                    <span style={{ color: "var(--c-1e293b)" }}>·</span>
                    <StatusPill status={rec.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2 tracking-tight">
                    {rec.title}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
                    {rec.target}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <ConfidenceBadge level={rec.confidence} />
                <span className="text-[10px]" style={{ color: "var(--c-334155)", fontFamily: MONO }}>
                  Generated {rec.age}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column layout for detail sections */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {/* Logic Matrix — wider */}
          <div
            className="col-span-3 rounded-xl overflow-hidden"
            style={{ background: "var(--c-080f1e)", border: "1px solid var(--c-1a2740)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ background: "var(--c-060c18)", borderBottom: "1px solid var(--c-1a2740)" }}
            >
              <Layers size={12} style={{ color: "#3b82f6" }} />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
                1. LEGIBLE SYSTEMIC LOGIC MATRIX
              </span>
            </div>
            <div className="p-5">
              <ol className="flex flex-col gap-3">
                {rec.reasoningSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded shrink-0 mt-0.5 text-[10px] font-bold"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        border: "1px solid rgba(59,130,246,0.2)",
                        color: "#3b82f6",
                        fontFamily: MONO,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed" style={{ color: "var(--c-94a3b8)" }}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Data Sources — narrower */}
          <div
            className="col-span-2 rounded-xl overflow-hidden"
            style={{ background: "var(--c-080f1e)", border: "1px solid var(--c-1a2740)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ background: "var(--c-060c18)", borderBottom: "1px solid var(--c-1a2740)" }}
            >
              <Database size={12} style={{ color: "#06b6d4" }} />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--c-475569)", fontFamily: MONO }}>
                3. SYSTEM DATA ATTRIBUTIONS
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-2.5">
                {rec.dataSources.map((src, i) => {
                  const ts = tagStyles[src.tag] || tagStyles.CONFIG;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                        style={{
                          background: ts.bg,
                          border: `1px solid ${ts.border}`,
                          color: ts.color,
                          fontFamily: MONO,
                        }}
                      >
                        [{src.tag}]
                      </span>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>
                        {src.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Constraints box */}
        {rec.limitations.length > 0 && (
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{
            background: "rgba(245,158,11,0.04)",
            border: "1px solid rgba(245,158,11,0.18)",
          }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.12)" }}
          >
            <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: "#d97706", fontFamily: MONO }}>
              4. CONFIDENCE CONSTRAINTS & SCOPE LIMITATIONS
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {rec.limitations.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span style={{ color: "#b45309", marginTop: 2 }}>›</span>
                <p className="text-xs leading-relaxed" style={{ color: "#92400e" }}>
                  {c}
                </p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Action bar */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, var(--c-060c18), var(--c-0a0f1e))",
            border: "1px solid var(--c-1a2740)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecision(rec.id, "Approved")}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                boxShadow: "0 0 20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Approve Action
            </button>
            <button
              onClick={() => onDecision(rec.id, "Overridden")}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
              style={{
                color: "var(--c-94a3b8)",
                border: "1px solid var(--c-253047)",
                background: "var(--c-0a0f1e)",
              }}
            >
              Override Directives
            </button>
            <button
              onClick={() => onDecision(rec.id, "Escalated")}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
              style={{
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.25)",
                background: "rgba(245,158,11,0.06)",
              }}
            >
              Escalate Command
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOverlay("ask-why")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
              style={{
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.25)",
                background: "rgba(59,130,246,0.06)",
              }}
            >
              <Eye size={12} />
              Ask Why
            </button>
            <button
              onClick={() => onOverlay("alternatives")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
              style={{
                color: "var(--c-94a3b8)",
                border: "1px solid var(--c-253047)",
                background: "var(--c-0a0f1e)",
              }}
            >
              <GitBranch size={12} />
              See Alternatives
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskWhyOverlay({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  const features = rec.factors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ paddingRight: 24, paddingTop: 80, paddingBottom: 80 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-96 rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--c-0d1627), var(--c-080f1e))",
          border: "1px solid var(--c-1e2d45)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1)",
          maxHeight: "100%",
        }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }} />
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--c-1a2740)" }}
        >
          <div>
            <h3 className="text-sm font-bold text-white">Factors that mattered</h3>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--c-475569)" }}>What drove this recommendation</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={{ color: "#64748b", border: "1px solid var(--c-1e293b)", background: "var(--c-060c18)", fontFamily: MONO }}
          >
            <X size={11} />
            [Close Overlay]
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-2.5">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-xl p-3.5"
              style={{ background: "var(--c-060c18)", border: "1px solid var(--c-131e30)" }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold" style={{ color: "var(--c-94a3b8)" }}>{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold tracking-widest" style={{ color: f.color, fontFamily: MONO }}>
                    {f.level.toUpperCase()}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${f.color}15`, color: f.color, fontFamily: MONO, border: `1px solid ${f.color}25` }}
                  >
                    {f.value}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "var(--c-0f172a)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${f.value}%`,
                    background: `linear-gradient(to right, ${f.color}, ${f.color}80)`,
                    boxShadow: `0 0 8px ${f.color}40`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlternativesOverlay({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  const alternatives = rec.alternatives;

  const riskColor = (r: string) => {
    if (r === "Low") return "#10b981";
    if (r === "Medium") return "#f59e0b";
    if (r === "High") return "#ef4444";
    return "#dc2626";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ paddingRight: 24, paddingTop: 80, paddingBottom: 80 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-[480px] rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--c-0d1627), var(--c-080f1e))",
          border: "1px solid var(--c-1e2d45)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          maxHeight: "100%",
        }}
      >
        <div className="h-0.5" style={{ background: "linear-gradient(to right, #8b5cf6, #3b82f6)" }} />
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--c-1a2740)" }}
        >
          <div>
            <h3 className="text-sm font-bold text-white">Other options considered</h3>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--c-475569)" }}>
              Ranked by agent confidence score
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={{ color: "#64748b", border: "1px solid var(--c-1e293b)", background: "var(--c-060c18)", fontFamily: MONO }}
          >
            <X size={11} />
            [Close Overlay]
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-3">
          {alternatives.map((alt, i) => {
            const rc = riskColor(alt.risk);
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--c-060c18)", border: "1px solid var(--c-131e30)" }}
              >
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--c-0f1a28)" }}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", fontFamily: MONO }}
                    >
                      {alt.id}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>{alt.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold tracking-widest" style={{ color: rc, fontFamily: MONO }}>
                      {alt.risk.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: "var(--c-0f172a)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${alt.confidence}%`,
                          background: `linear-gradient(to right, #3b82f6, #60a5fa)`,
                          boxShadow: "0 0 8px rgba(59,130,246,0.3)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold shrink-0" style={{ color: "#3b82f6", fontFamily: MONO }}>
                      {alt.confidence}% conf
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                    <span className="font-bold" style={{ color: "var(--c-94a3b8)" }}>Trade-off: </span>
                    {alt.tradeoff}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityLogScreen({ audit }: { audit: AuditEntry[] }) {
  const counts = {
    Approved: audit.filter((e) => e.decision === "Approved").length,
    Overridden: audit.filter((e) => e.decision === "Overridden").length,
    Escalated: audit.filter((e) => e.decision === "Escalated").length,
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-020617)" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(circle, var(--c-1e293b) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.3,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)" }} />
              <h1 className="text-lg font-bold text-white tracking-tight">Infrastructure Audit Registry</h1>
            </div>
            <p className="text-xs pl-3.5" style={{ color: "var(--c-475569)" }}>
              {audit.length} entries · SOC2 compliant · 90-day retention policy
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(["Approved", "Overridden", "Escalated"] as OperatorDecision[]).map((d) => {
              const ds = decisionStyle(d);
              return (
                <div
                  key={d}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: ds.bg, border: `1px solid ${ds.border}` }}
                >
                  <span className="text-xl font-bold" style={{ color: ds.text, fontFamily: MONO }}>{counts[d]}</span>
                  <span className="text-[9px] font-bold tracking-widest" style={{ color: ds.text, opacity: 0.7, fontFamily: MONO }}>
                    {d.toUpperCase()}
                  </span>
                </div>
              );
            })}
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ color: "#64748b", border: "1px solid var(--c-1e293b)", background: "var(--c-070d1c)" }}
            >
              <Download size={11} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--c-1a2740)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-6 py-3"
            style={{
              background: "var(--c-060c18)",
              borderBottom: "1px solid var(--c-1a2740)",
              gridTemplateColumns: "190px 280px 1fr 130px 90px",
            }}
          >
            {["Timestamp", "Action Signature", "Agent Inference Assertion", "Operator Decision", "Operator"].map((h) => (
              <span
                key={h}
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{ color: "var(--c-334155)", fontFamily: MONO }}
              >
                {h}
              </span>
            ))}
          </div>

          <div style={{ background: "var(--c-080f1e)" }}>
            {audit.map((entry, i) => {
              const ds = decisionStyle(entry.decision);
              return (
                <div
                  key={i}
                  className="group grid items-center px-6 py-4 transition-all duration-150"
                  style={{
                    gridTemplateColumns: "190px 280px 1fr 130px 90px",
                    borderBottom: i < audit.length - 1 ? "1px solid var(--c-0f1a28)" : "none",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30,45,69,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="text-[10px] leading-relaxed"
                    style={{ color: "var(--c-334155)", fontFamily: MONO }}
                  >
                    {entry.timestamp.replace("T", "\n").replace("Z", "")}
                  </span>
                  <div className="pr-4">
                    <span
                      className="text-[10px] font-bold block mb-0.5"
                      style={{ color: "#60a5fa", fontFamily: MONO }}
                    >
                      {entry.recId}
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--c-94a3b8)", fontFamily: MONO }}
                    >
                      {entry.actionSignature}
                    </span>
                  </div>
                  <span className="text-xs italic pr-4 leading-relaxed" style={{ color: "var(--c-475569)" }}>
                    {entry.inference}
                  </span>
                  <span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                      style={{
                        background: ds.bg,
                        border: `1px solid ${ds.border}`,
                        color: ds.text,
                        fontFamily: MONO,
                      }}
                    >
                      {entry.decision}
                    </span>
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#64748b" }}>
                    {entry.operator}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [recs, setRecs] = useState<Recommendation[]>(RECOMMENDATIONS as Recommendation[]);
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT_LOG as AuditEntry[]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  function handleDecision(recId: string, decision: OperatorDecision) {
    const rec = recs.find((r) => r.id === recId);
    setRecs((prev) => prev.map((r) => (r.id === recId ? { ...r, status: "approved" } : r)));
    if (rec) {
      setAudit((prev) => [
        {
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          actionSignature: rec.title + " // " + rec.target,
          inference: rec.reasoning,
          decision,
          operator: "You",
          recId,
        },
        ...prev,
      ]);
    }
    handleBack();
  }

  function handleSelectRec(rec: Recommendation) {
    setSelectedRec(rec);
    setScreen("detail");
    setOverlay(null);
  }

  function handleBack() {
    setScreen("dashboard");
    setSelectedRec(null);
    setOverlay(null);
  }

  function handleNav(s: Screen) {
    setScreen(s);
    if (s !== "detail") {
      setSelectedRec(null);
      setOverlay(null);
    }
  }

  return (
    <div
      className={`flex flex-col w-full h-screen overflow-hidden ${theme === "light" ? "theme-light" : ""}`}
      style={{ fontFamily: "'Inter', sans-serif", background: "var(--c-020617)" }}
    >
      <style>{`
        :root { --c-020617: #020617; --c-02060f: #02060f; --c-060c18: #060c18; --c-070d1c: #070d1c; --c-080f1e: #080f1e; --c-0a0f1e: #0a0f1e; --c-0a1020: #0a1020; --c-0d1627: #0d1627; --c-0f1a28: #0f1a28; --c-1a2332: #1a2332; --c-1e293b: #1e293b; --c-1a2740: #1a2740; --c-1e2d45: #1e2d45; --c-253047: #253047; --c-131e30: #131e30; --c-0f172a: #0f172a; --c-ffffff: #ffffff; --c-94a3b8: #94a3b8; --c-475569: #475569; --c-334155: #334155; }
        .theme-light { --c-020617: #eef1f6; --c-02060f: #e7ebf1; --c-060c18: #ffffff; --c-070d1c: #f4f7fb; --c-080f1e: #ffffff; --c-0a0f1e: #f4f7fb; --c-0a1020: #ffffff; --c-0d1627: #f4f7fb; --c-0f1a28: #e6ebf1; --c-1a2332: #e6ebf1; --c-1e293b: #cbd5e1; --c-1a2740: #d4dce5; --c-1e2d45: #d4dce5; --c-253047: #aab4c2; --c-131e30: #e2e8f0; --c-0f172a: #cbd5e1; --c-ffffff: #0f172a; --c-94a3b8: #475569; --c-475569: #6b7888; --c-334155: #8a97a8; }
        :root { --c-header: rgba(2,6,23,0.95); }
        .theme-light { --c-header: rgba(255,255,255,0.92); }
        .theme-light .text-white { color: #0f172a; }
        .theme-light .text-slate-300 { color: #475569; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--c-1e293b); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--c-334155); }
      `}</style>

      <NavHeader screen={screen} onNav={handleNav} recommendations={recs} theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {screen === "dashboard" && <DashboardScreen recommendations={recs} onSelect={handleSelectRec} />}
        {screen === "detail" && selectedRec && (
          <DetailScreen rec={selectedRec} onBack={handleBack} onOverlay={setOverlay} onDecision={handleDecision} />
        )}
        {screen === "activity-log" && <ActivityLogScreen audit={audit} />}
      </div>

      {overlay === "ask-why" && selectedRec && <AskWhyOverlay rec={selectedRec} onClose={() => setOverlay(null)} />}
      {overlay === "alternatives" && selectedRec && <AlternativesOverlay rec={selectedRec} onClose={() => setOverlay(null)} />}
    </div>
  );
}
