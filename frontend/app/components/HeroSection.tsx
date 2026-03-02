"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  netBalance: number;
  transactionCount: number;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function HeroSection({ netBalance, transactionCount }: Props) {
  const [greeting, setGreeting] = useState({ text: "Welcome", emoji: "✨" });

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const isPositive = netBalance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/10"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-[#0d0d1f] to-blue-950/40" />
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 p-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: text */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{greeting.emoji}</span>
            <span className="text-sm font-medium text-gray-400">
              {greeting.text}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              Financial Hub
            </span>
          </h1>

          <p className="max-w-sm text-sm leading-relaxed text-gray-400">
            Track every dollar, spot every trend, and stay in control of your
            money — all in one place.
          </p>

          {/* Badges */}
          <div className="mt-1 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: "Secure" },
              { icon: Zap, label: "Real-time" },
              { icon: Sparkles, label: "Smart insights" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
              >
                <Icon className="h-3 w-3 text-violet-400" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: stats panel */}
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          {/* Net balance card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">
              Net Balance
            </p>
            <p
              className={`text-3xl font-bold tracking-tight ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatCurrency(netBalance)}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {isPositive ? "↑ You're in the green" : "↓ Watch your spending"}
            </p>
          </div>

          {/* Transaction count */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-sm font-semibold text-white">
                {transactionCount} recorded
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
