import type { Metadata } from "next";
import TransactionForm from "@/app/components/TransactionForm";

export const metadata: Metadata = {
  title: "New Transaction — Finance Tracker",
};

export default function NewTransactionPage() {
  return (
    <div className="min-h-screen">
      <TransactionForm />
    </div>
  );
}
