"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle, AlertCircle, Loader2,
  DollarSign, CalendarDays, Tag, AlignLeft, ChevronDown,
} from "lucide-react";
import {
  createTransaction,
  updateTransaction,
  type Transaction,
} from "@/app/actions/transactions";

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Other"];
const EXPENSE_CATEGORIES = [
  "Food", "Housing", "Transport", "Entertainment",
  "Healthcare", "Shopping", "Other",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  transaction?: Transaction;
}

interface FormState {
  description: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  category?: string;
  date?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0];
}

function validate(data: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!data.description.trim()) errors.description = "Description is required";
  const n = parseFloat(data.amount);
  if (!data.amount || isNaN(n) || n <= 0) errors.amount = "Enter a positive amount";
  if (!data.category) errors.category = "Select a category";
  if (!data.date) errors.date = "Date is required";
  return errors;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-xs text-red-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input base style ─────────────────────────────────────────────────────────

function inputCls(error?: string) {
  return [
    "w-full rounded-xl border bg-white/[0.04] py-2.5 text-sm text-white",
    "placeholder-gray-600 outline-none transition-all duration-200",
    "hover:bg-white/[0.06] focus:bg-white/[0.06]",
    error
      ? "border-red-500/40 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/20"
      : "border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15",
  ].join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionForm({ transaction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!transaction;

  const [form, setForm] = useState<FormState>({
    description: transaction?.description ?? "",
    amount:      transaction?.amount.toString() ?? "",
    type:        (transaction?.type as "income" | "expense") ?? "expense",
    category:    transaction?.category ?? "",
    date:        transaction?.date ?? today(),
  });

  const [errors, setErrors]       = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function switchType(t: "income" | "expense") {
    setForm((prev) => ({ ...prev, type: t, category: "" }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setServerError(null);

    startTransition(async () => {
      try {
        const payload = {
          description: form.description.trim(),
          amount:      parseFloat(form.amount),
          type:        form.type,
          category:    form.category,
          date:        form.date,
        };

        if (isEdit) {
          await updateTransaction(transaction!.id, payload);
        } else {
          await createTransaction(payload);
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/transactions");
          router.refresh();
        }, 1100);
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Something went wrong. Try again."
        );
      }
    });
  }

  return (
    /* Full-viewport overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => !isPending && router.back()}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#13131f] shadow-2xl shadow-black/60"
      >
        {/* Top gradient accent bar */}
        <div className="h-px w-full bg-gradient-to-r from-violet-500/0 via-violet-500/60 to-blue-500/0" />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Transaction" : "New Transaction"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {isEdit
                  ? "Update the details below"
                  : "Fill in the details to record a transaction"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => !isPending && router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Feedback banners */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                {isEdit ? "Transaction updated!" : "Transaction added!"} Redirecting…
              </motion.div>
            )}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-400">Type</span>
              <div className="grid grid-cols-2 gap-2">
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchType(t)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 ${
                      form.type === t
                        ? t === "income"
                          ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400 shadow-lg shadow-emerald-500/10"
                          : "border-red-500/40 bg-red-500/12 text-red-400 shadow-lg shadow-red-500/10"
                        : "border-white/8 bg-white/[0.03] text-gray-500 hover:border-white/15 hover:text-gray-300"
                    }`}
                  >
                    <span className="text-base">{t === "income" ? "↑" : "↓"}</span>
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <Field label="Description" error={errors.description}>
              <div className="relative">
                <AlignLeft className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="e.g. Monthly salary, Coffee shop…"
                  className={`${inputCls(errors.description)} pl-9 pr-4`}
                />
              </div>
            </Field>

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount" error={errors.amount}>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className={`${inputCls(errors.amount)} pl-9 pr-3`}
                  />
                </div>
              </Field>

              <Field label="Date" error={errors.date}>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className={`${inputCls(errors.date)} pl-9 pr-3 [color-scheme:dark]`}
                  />
                </div>
              </Field>
            </div>

            {/* Category */}
            <Field label="Category" error={errors.category}>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={`${inputCls(errors.category)} appearance-none pl-9 pr-8 ${
                    !form.category ? "text-gray-600" : "text-white"
                  } bg-[#13131f]`}
                >
                  <option value="" disabled>
                    Select {form.type} category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#13131f] text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || success}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{isEdit ? "Saving…" : "Adding…"}</>
              ) : success ? (
                <><CheckCircle className="h-4 w-4" />{isEdit ? "Saved!" : "Added!"}</>
              ) : (
                isEdit ? "Save Changes" : "Add Transaction"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
