"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Pencil, Trash2,
  AlertTriangle, Loader2, X, TrendingUp, TrendingDown,
  ChevronDown, Receipt,
} from "lucide-react";
import { deleteTransaction, type Transaction } from "@/app/actions/transactions";

// ─── Constants ─────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  "Salary", "Freelance", "Investment",
  "Food", "Housing", "Transport", "Entertainment",
  "Healthcare", "Shopping", "Other",
];

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  }).format(v);
}

function formatDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Delete confirmation modal ──────────────────────────────────────────────

function DeleteModal({
  transaction,
  onConfirm,
  onCancel,
  isPending,
}: {
  transaction: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#13131f] p-6 shadow-2xl"
      >
        <div className="h-px w-full bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 mb-5" />

        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Delete Transaction</h3>
            <p className="mt-1 text-sm text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">"{transaction.description}"</span>?
              This cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-1 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{transaction.category} · {formatDate(transaction.date)}</span>
            <span className={transaction.type === "income" ? "font-semibold text-emerald-400" : "font-semibold text-red-400"}>
              {transaction.type === "income" ? "+" : "−"}{formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface Props { transactions: Transaction[] }

export default function TransactionsList({ transactions }: Props) {
  const [items, setItems]         = useState<Transaction[]>(transactions);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [catFilter, setCatFilter]   = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (catFilter !== "all" && tx.category !== catFilter) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, typeFilter, catFilter, search]);

  // ── Totals ─────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    income:  filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  // ── Delete ─────────────────────────────────────────────────────────────
  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteTransaction(deleteTarget.id);
        setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } catch (err) {
        console.error(err);
        setDeleteTarget(null);
      }
    });
  }

  const typeButtons: { value: "all" | "income" | "expense"; label: string }[] = [
    { value: "all",     label: "All" },
    { value: "income",  label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  return (
    <>
      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-violet-500/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {typeButtons.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === value
                    ? "bg-violet-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-[#13131f] py-2 pl-8 pr-7 text-xs text-gray-300 outline-none focus:border-violet-500/50"
            >
              <option value="all">All categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#13131f]">{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs">
          <span className="text-gray-500">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
          <span className="text-gray-700">·</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {formatCurrency(totals.income)}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <TrendingDown className="h-3 w-3" /> {formatCurrency(totals.expense)}
          </span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <Receipt className="h-7 w-7 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            {items.length === 0 ? "No transactions yet" : "No results match your filters"}
          </p>
          {items.length === 0 && (
            <Link
              href="/transactions/new"
              className="mt-1 rounded-xl bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-500"
            >
              Add your first transaction
            </Link>
          )}
          {items.length > 0 && (
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); setCatFilter("all"); }}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table — desktop */}
      {filtered.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
            {/* Header */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              <span>Date</span>
              <span>Description</span>
              <span>Category</span>
              <span>Type</span>
              <span className="text-right">Amount</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {filtered.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.2, delay: i < 15 ? i * 0.02 : 0 }}
                    className="group grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>

                    <span className="truncate text-sm font-medium text-white">{tx.description}</span>

                    <span className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[tx.category] ?? "bg-slate-500/15 text-slate-300"}`}>
                      {tx.category}
                    </span>

                    <span className={`flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {tx.type === "income" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {tx.type}
                    </span>

                    <span className={`text-right text-sm font-semibold tabular-nums ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/transactions/${tx.id}/edit`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-violet-500/15 hover:text-violet-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(tx)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-500/15 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            <AnimatePresence initial={false}>
              {filtered.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{tx.description}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatDate(tx.date)}</p>
                    </div>
                    <span className={`shrink-0 text-base font-bold tabular-nums ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[tx.category] ?? "bg-slate-500/15 text-slate-300"}`}>
                        {tx.category}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/transactions/${tx.id}/edit`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-violet-500/15 hover:text-violet-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(tx)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/15 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            transaction={deleteTarget}
            onConfirm={confirmDelete}
            onCancel={() => !isPending && setDeleteTarget(null)}
            isPending={isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}
