"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

export interface TransactionUpdate {
  description?: string;
  amount?: number;
  type?: string;
  category?: string;
  date?: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
}

export interface Summary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  breakdown: CategoryBreakdown[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getTransactions(
  type?: string,
  category?: string
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (category) params.set("category", category);

  const url = `${API_URL}/transactions${params.size > 0 ? `?${params}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  return res.json();
}

export async function getTransactionById(id: number): Promise<Transaction> {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) throw new Error("Transaction not found");
  if (!res.ok) throw new Error(`Failed to fetch transaction: ${res.status}`);
  return res.json();
}

export async function createTransaction(
  data: TransactionCreate
): Promise<Transaction> {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? `Failed to create transaction: ${res.status}`);
  }
  return res.json();
}

export async function updateTransaction(
  id: number,
  data: TransactionUpdate
): Promise<Transaction> {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 404) throw new Error("Transaction not found");
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? `Failed to update transaction: ${res.status}`);
  }
  return res.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  if (res.status === 404) throw new Error("Transaction not found");
  if (!res.ok) throw new Error(`Failed to delete transaction: ${res.status}`);
}

export async function getSummary(): Promise<Summary> {
  const res = await fetch(`${API_URL}/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  return res.json();
}
