from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from database import Base, engine, get_db
from models import Transaction
from schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    SummaryResponse,
    CategoryBreakdown,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(
    type: Optional[str] = Query(None, description="Filter by 'income' or 'expense'"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)
    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    return query.order_by(Transaction.date.desc()).all()


@app.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    tx = Transaction(**payload.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@app.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(tx, field, value)

    db.commit()
    db.refresh(tx)
    return tx


@app.delete("/transactions/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()


@app.get("/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    net_balance = total_income - total_expenses

    category_totals: dict[str, float] = {}
    for t in transactions:
        if t.type == "expense":
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount

    breakdown = [
        CategoryBreakdown(category=cat, total=total)
        for cat, total in sorted(category_totals.items())
    ]

    return SummaryResponse(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        breakdown=breakdown,
    )
