import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTransactions } from "@/app/actions/transactions";
import TransactionsList from "@/app/components/TransactionsList";

export const metadata: Metadata = { title: "Transactions — Finance Tracker" };

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="mt-1 text-sm text-gray-400">
            {transactions.length === 0
              ? "No transactions recorded yet"
              : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/40 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Link>
      </div>

      {/* List */}
      <TransactionsList transactions={transactions} />
    </div>
  );
}
