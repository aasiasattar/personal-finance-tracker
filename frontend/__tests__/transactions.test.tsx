/**
 * Frontend tests for the Personal Finance Tracker.
 * Tests: SummaryCards rendering, TransactionForm validation, TransactionsList display.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Global mocks ──────────────────────────────────────────────────────────────

// Framer Motion — render children directly without animations
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag) =>
        ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) =>
          React.createElement(tag as string, props, children),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
}));

// Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Server Actions
vi.mock("@/app/actions/transactions", () => ({
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import SummaryCards from "../app/components/SummaryCards";
import TransactionForm from "../app/components/TransactionForm";
import TransactionsList from "../app/components/TransactionsList";
import type { Transaction } from "../app/actions/transactions";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "Monthly Salary",
    amount: 5000,
    type: "income",
    category: "Salary",
    date: "2026-01-15",
    created_at: "2026-01-15T10:00:00",
  },
  {
    id: 2,
    description: "Grocery Shopping",
    amount: 120.5,
    type: "expense",
    category: "Food",
    date: "2026-01-20",
    created_at: "2026-01-20T14:30:00",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. SummaryCards — renders all three cards with correct values
// ─────────────────────────────────────────────────────────────────────────────

describe("SummaryCards", () => {
  it("renders all three card labels", () => {
    render(
      <SummaryCards totalIncome={5000} totalExpenses={3000} netBalance={2000} />
    );
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Net Balance")).toBeInTheDocument();
  });

  it("displays correctly formatted currency amounts", () => {
    render(
      <SummaryCards totalIncome={5000} totalExpenses={1200.5} netBalance={3799.5} />
    );
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("$1,200.50")).toBeInTheDocument();
    expect(screen.getByText("$3,799.50")).toBeInTheDocument();
  });

  it("renders negative net balance without crashing", () => {
    render(
      <SummaryCards totalIncome={500} totalExpenses={1000} netBalance={-500} />
    );
    expect(screen.getByText("-$500.00")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TransactionForm — validation and field rendering
// ─────────────────────────────────────────────────────────────────────────────

describe("TransactionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required input fields", () => {
    render(<TransactionForm />);
    expect(screen.getByPlaceholderText(/e\.g\. Monthly salary/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(screen.getByText("↑")).toBeInTheDocument(); // income type button icon
    expect(screen.getByText("↓")).toBeInTheDocument(); // expense type button icon
  });

  it("shows validation errors when submitting with empty description", async () => {
    render(<TransactionForm />);
    const submitBtn = screen.getByRole("button", { name: /add transaction/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for zero amount", async () => {
    render(<TransactionForm />);

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Monthly salary/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a positive amount/i)).toBeInTheDocument();
    });
  });

  it("switches category options when type changes", () => {
    render(<TransactionForm />);

    // Default type is "expense" — Food should be available
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Switch to income — Salary should appear
    const incomeBtn = screen.getByText("income");
    fireEvent.click(incomeBtn);
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("renders in edit mode with pre-populated values", () => {
    render(<TransactionForm transaction={MOCK_TRANSACTIONS[0]} />);
    const descInput = screen.getByPlaceholderText(/e\.g\. Monthly salary/i) as HTMLInputElement;
    expect(descInput.value).toBe("Monthly Salary");
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. TransactionsList — display, filtering, and empty state
// ─────────────────────────────────────────────────────────────────────────────

describe("TransactionsList", () => {
  it("renders all transaction descriptions", () => {
    render(<TransactionsList transactions={MOCK_TRANSACTIONS} />);
    expect(screen.getAllByText("Monthly Salary").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Grocery Shopping").length).toBeGreaterThan(0);
  });

  it("shows empty state when transactions array is empty", () => {
    render(<TransactionsList transactions={[]} />);
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });

  it("shows transaction count and totals in summary strip", () => {
    render(<TransactionsList transactions={MOCK_TRANSACTIONS} />);
    expect(screen.getByText(/2 transactions/i)).toBeInTheDocument();
  });

  it("filters transactions by search input", () => {
    render(<TransactionsList transactions={MOCK_TRANSACTIONS} />);
    const searchInput = screen.getByPlaceholderText(/search transactions/i);

    fireEvent.change(searchInput, { target: { value: "salary" } });

    expect(screen.getAllByText("Monthly Salary").length).toBeGreaterThan(0);
    expect(screen.queryByText("Grocery Shopping")).not.toBeInTheDocument();
  });

  it("shows 'no results' empty state when search matches nothing", () => {
    render(<TransactionsList transactions={MOCK_TRANSACTIONS} />);
    const searchInput = screen.getByPlaceholderText(/search transactions/i);

    fireEvent.change(searchInput, { target: { value: "xyznotfound" } });

    expect(screen.getByText(/no results match your filters/i)).toBeInTheDocument();
  });

  it("renders edit links with correct href for each transaction", () => {
    render(<TransactionsList transactions={MOCK_TRANSACTIONS} />);
    const editLinks = screen.getAllByRole("link", { name: "" }); // pencil icon links
    const hrefs = editLinks.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/transactions/1/edit");
    expect(hrefs).toContain("/transactions/2/edit");
  });
});
