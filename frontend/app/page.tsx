import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSummary, getTransactions, type Transaction } from "./actions/transactions";
import SummaryCards from "./components/SummaryCards";
import SpendingChart from "./components/SpendingChart";
import HeroSection from "./components/HeroSection";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const CATEGORY_BADGE: Record<string, string> = {
  Food:          "bg-amber-500/15 text-amber-300",
  Housing:       "bg-purple-500/15 text-purple-300",
  Transport:     "bg-blue-400/15 text-blue-300",
  Entertainment: "bg-pink-400/15 text-pink-300",
  Healthcare:    "bg-emerald-400/15 text-emerald-300",
  Shopping:      "bg-orange-400/15 text-orange-300",
  Salary:        "bg-emerald-400/15 text-emerald-300",
  Freelance:     "bg-teal-400/15 text-teal-300",
  Investment:    "bg-cyan-400/15 text-cyan-300",
  Other:         "bg-slate-400/15 text-slate-300",
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "income";
  const badge = CATEGORY_BADGE[tx.category] ?? "bg-slate-400/15 text-slate-300";

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-transform group-hover:scale-110 ${
            isIncome
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {isIncome ? "+" : "−"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {tx.description}
          </p>
          <p className="text-xs text-gray-600">{formatDate(tx.date)}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`hidden rounded-md px-2 py-0.5 text-xs font-medium sm:block ${badge}`}>
          {tx.category}
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(tx.amount)}
        </span>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const [summary, allTransactions] = await Promise.all([
    getSummary(),
    getTransactions(),
  ]);

  const recentTransactions = allTransactions.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <HeroSection
        netBalance={summary.net_balance}
        transactionCount={allTransactions.length}
      />

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={summary.total_income}
        totalExpenses={summary.total_expenses}
        netBalance={summary.net_balance}
      />

      {/* Chart + Recent Transactions */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Spending Breakdown
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">By category, this period</p>
            </div>
            <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400">
              Expenses
            </span>
          </div>
          <SpendingChart
            breakdown={summary.breakdown}
            totalExpenses={summary.total_expenses}
          />
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent Transactions
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">Last 5 entries</p>
            </div>
            <Link
              href="/transactions"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                💸
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
              <Link
                href="/transactions/new"
                className="rounded-lg bg-violet-500/15 px-4 py-2 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/25"
              >
                Add your first transaction →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {recentTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
