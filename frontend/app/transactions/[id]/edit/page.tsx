import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransactionForm from "@/app/components/TransactionForm";
import { getTransactionById } from "@/app/actions/transactions";

export const metadata: Metadata = { title: "Edit Transaction — Finance Tracker" };

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return notFound();

  try {
    const transaction = await getTransactionById(numId);
    return (
      <div className="min-h-screen">
        <TransactionForm transaction={transaction} />
      </div>
    );
  } catch {
    return notFound();
  }
}
