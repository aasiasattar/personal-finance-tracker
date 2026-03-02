"use client";

import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

interface Props {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SummaryCards({ totalIncome, totalExpenses, netBalance }: Props) {
  const cards = [
    {
      label: "Total Income",
      value: totalIncome,
      icon: ArrowUpCircle,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      valueColor: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: ArrowDownCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/15",
      valueColor: "text-red-400",
      border: "border-red-500/20",
      glow: "shadow-red-500/10",
    },
    {
      label: "Net Balance",
      value: netBalance,
      icon: Wallet,
      iconColor: netBalance >= 0 ? "text-violet-400" : "text-rose-400",
      iconBg: netBalance >= 0 ? "bg-violet-500/15" : "bg-rose-500/15",
      valueColor: netBalance >= 0 ? "text-violet-300" : "text-rose-400",
      border: netBalance >= 0 ? "border-violet-500/20" : "border-rose-500/20",
      glow: netBalance >= 0 ? "shadow-violet-500/10" : "shadow-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
            className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-6 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl ${card.border} ${card.glow}`}
          >
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-400">{card.label}</p>
                <div className={`rounded-xl p-2 ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${card.valueColor}`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
