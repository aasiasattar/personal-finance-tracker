"""
Backend tests for the Personal Finance Tracker API.
Uses an in-memory SQLite database — no Neon connection required.
"""

import pytest
from httpx import AsyncClient

# ── Shared test payload ────────────────────────────────────────────────────────

INCOME_PAYLOAD = {
    "description": "Monthly salary",
    "amount": 5000.00,
    "type": "income",
    "category": "Salary",
    "date": "2026-01-15",
}

EXPENSE_PAYLOAD = {
    "description": "Grocery shopping",
    "amount": 120.50,
    "type": "expense",
    "category": "Food",
    "date": "2026-01-20",
}


# ── Helper ─────────────────────────────────────────────────────────────────────

async def create_tx(client: AsyncClient, payload: dict) -> dict:
    res = await client.post("/transactions", json=payload)
    assert res.status_code == 201
    return res.json()


# ── Tests ──────────────────────────────────────────────────────────────────────

async def test_create_transaction_success(client: AsyncClient):
    """POST /transactions creates a transaction and returns correct fields."""
    res = await client.post("/transactions", json=INCOME_PAYLOAD)

    assert res.status_code == 201
    data = res.json()
    assert data["description"] == "Monthly salary"
    assert data["amount"] == 5000.00
    assert data["type"] == "income"
    assert data["category"] == "Salary"
    assert data["date"] == "2026-01-15"
    assert "id" in data
    assert "created_at" in data


async def test_get_all_transactions(client: AsyncClient):
    """GET /transactions returns all created transactions."""
    await create_tx(client, INCOME_PAYLOAD)
    await create_tx(client, EXPENSE_PAYLOAD)

    res = await client.get("/transactions")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2


async def test_get_all_transactions_type_filter(client: AsyncClient):
    """GET /transactions?type=income returns only income transactions."""
    await create_tx(client, INCOME_PAYLOAD)
    await create_tx(client, EXPENSE_PAYLOAD)

    res = await client.get("/transactions?type=income")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["type"] == "income"


async def test_get_transaction_by_id(client: AsyncClient):
    """GET /transactions/{id} returns the correct transaction."""
    created = await create_tx(client, INCOME_PAYLOAD)
    tx_id = created["id"]

    res = await client.get(f"/transactions/{tx_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == tx_id
    assert data["description"] == "Monthly salary"


async def test_get_transaction_by_id_not_found(client: AsyncClient):
    """GET /transactions/9999 returns 404 for a non-existent transaction."""
    res = await client.get("/transactions/9999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Transaction not found"


async def test_update_transaction(client: AsyncClient):
    """PUT /transactions/{id} updates specified fields."""
    created = await create_tx(client, EXPENSE_PAYLOAD)
    tx_id = created["id"]

    res = await client.put(
        f"/transactions/{tx_id}",
        json={"description": "Updated grocery run", "amount": 95.00},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["description"] == "Updated grocery run"
    assert data["amount"] == 95.00
    # Unchanged fields stay the same
    assert data["category"] == "Food"
    assert data["type"] == "expense"


async def test_delete_transaction(client: AsyncClient):
    """DELETE /transactions/{id} removes the transaction."""
    created = await create_tx(client, EXPENSE_PAYLOAD)
    tx_id = created["id"]

    del_res = await client.delete(f"/transactions/{tx_id}")
    assert del_res.status_code == 204

    # Confirm it's gone
    get_res = await client.get(f"/transactions/{tx_id}")
    assert get_res.status_code == 404


async def test_get_summary_calculations(client: AsyncClient):
    """GET /summary returns correct totals and expense breakdown."""
    await create_tx(client, INCOME_PAYLOAD)           # +5000 income
    await create_tx(client, EXPENSE_PAYLOAD)          # -120.50 food
    await create_tx(client, {
        "description": "Electric bill",
        "amount": 80.00,
        "type": "expense",
        "category": "Housing",
        "date": "2026-01-22",
    })  # -80.00 housing

    res = await client.get("/summary")
    assert res.status_code == 200
    data = res.json()

    assert data["total_income"] == pytest.approx(5000.00)
    assert data["total_expenses"] == pytest.approx(200.50)
    assert data["net_balance"] == pytest.approx(4799.50)

    categories = {b["category"]: b["total"] for b in data["breakdown"]}
    assert categories["Food"] == pytest.approx(120.50)
    assert categories["Housing"] == pytest.approx(80.00)


async def test_create_transaction_invalid_negative_amount(client: AsyncClient):
    """POST /transactions rejects a negative amount with 422."""
    res = await client.post("/transactions", json={**INCOME_PAYLOAD, "amount": -50})
    assert res.status_code == 422


async def test_create_transaction_invalid_type(client: AsyncClient):
    """POST /transactions rejects an unknown type with 422."""
    res = await client.post("/transactions", json={**INCOME_PAYLOAD, "type": "transfer"})
    assert res.status_code == 422


async def test_summary_empty_database(client: AsyncClient):
    """GET /summary on empty DB returns all zeros and empty breakdown."""
    res = await client.get("/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_income"] == 0
    assert data["total_expenses"] == 0
    assert data["net_balance"] == 0
    assert data["breakdown"] == []
