"use client";

import { motion } from "framer-motion";
import type { CategoryBreakdown } from "@/app/actions/transactions";

interface Props {
  breakdown: CategoryBreakdown[];
  totalExpenses: number;
}

const CATEGORY_CONFIG: Record<string, { color: string; gradient: string }> = {
  Food:          { color: "#F59E0B", gradient: "from-amber-500/20 to-amber-500" },
  Housing:       { color: "#A855F7", gradient: "from-purple-500/20 to-purple-500" },
  Transport:     { color: "#60A5FA", gradient: "from-blue-400/20 to-blue-400" },
  Entertainment: { color: "#F472B6", gradient: "from-pink-400/20 to-pink-400" },
  Healthcare:    { color: "#34D399", gradient: "from-emerald-400/20 to-emerald-400" },
  Shopping:      { color: "#FB923C", gradient: "from-orange-400/20 to-orange-400" },
  Other:         { color: "#94A3B8", gradient: "from-slate-400/20 to-slate-400" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SpendingChart({ breakdown, totalExpenses }: Props) {
  if (breakdown.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
          📊
        </div>
        <p className="text-sm text-gray-500">No expense data yet</p>
      </div>
    );
  }

  const sorted = [...breakdown].sort((a, b) => b.total - a.total);
  const max = sorted[0].total;

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((item, i) => {
        const cfg = CATEGORY_CONFIG[item.category] ?? {
          color: "#94A3B8",
          gradient: "from-slate-400/20 to-slate-400",
        };
        const pct = (item.total / max) * 100;
        const share = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0;

        return (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
            className="group"
          >
            {/* Label row */}
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-xs font-medium text-gray-300">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {share.toFixed(0)}%
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: cfg.color }}
                >
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>

            {/* Bar track */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: i * 0.06 + 0.15, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${cfg.color}33, ${cfg.color})`,
                  boxShadow: `0 0 8px ${cfg.color}66`,
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Total row */}
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs font-medium text-gray-500">Total Spent</span>
        <span className="text-sm font-bold text-white">
          {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  );
}
