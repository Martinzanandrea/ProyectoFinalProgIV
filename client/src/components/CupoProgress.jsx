import React from "react";

const CupoProgress = ({ actual = 0, max }) => {
  if (!max) {
    return (
      <span className="text-sm text-slate-500 tabular-nums">
        {actual} <span className="text-slate-300">/</span> <span className="text-slate-400">∞</span>
      </span>
    );
  }

  const pct = Math.min((actual / max) * 100, 100);
  const barColor  = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";
  const textColor = pct >= 100 ? "text-red-500" : pct >= 80 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-sm font-semibold tabular-nums ${textColor}`}>{actual}</span>
      <span className="text-slate-300 text-xs">/</span>
      <span className="text-slate-400 text-sm tabular-nums">{max}</span>
      <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden">
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <span className="text-[10px] text-slate-400 tabular-nums w-7">{Math.round(pct)}%</span>
    </div>
  );
};

export default CupoProgress;