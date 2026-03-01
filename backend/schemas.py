from pydantic import BaseModel, field_validator, model_validator
from datetime import date as DateType, datetime
from typing import Optional, Any


INCOME_CATEGORIES = {"Salary", "Freelance", "Investment", "Other"}
EXPENSE_CATEGORIES = {"Food", "Housing", "Transport", "Entertainment", "Healthcare", "Shopping", "Other"}
VALID_TYPES = {"income", "expense"}


class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    date: DateType

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v):
        v = v.lower().rstrip("s") if v.lower() in {"incomes", "expenses"} else v.lower()
        if v not in VALID_TYPES:
            raise ValueError("type must be 'income' or 'expense'")
        return v

    @field_validator("category")
    @classmethod
    def category_must_be_valid(cls, v, info):
        v = v.title()
        t = info.data.get("type")
        if t == "income" and v not in INCOME_CATEGORIES:
            raise ValueError(f"category must be one of {INCOME_CATEGORIES} for income")
        if t == "expense" and v not in EXPENSE_CATEGORIES:
            raise ValueError(f"category must be one of {EXPENSE_CATEGORIES} for expense")
        return v


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str | DateType] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_and_parse(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if isinstance(values.get("date"), str):
                values["date"] = DateType.fromisoformat(values["date"])
            if isinstance(values.get("category"), str):
                values["category"] = values["category"].title()
        return values

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v):
        if v is None:
            return v
        v = v.lower().rstrip("s") if v.lower() in {"incomes", "expenses"} else v.lower()
        if v not in VALID_TYPES:
            raise ValueError("type must be 'income' or 'expense'")
        return v

    @field_validator("category")
    @classmethod
    def category_must_be_valid(cls, v, info):
        if v is None:
            return v
        t = info.data.get("type")
        if t == "income" and v not in INCOME_CATEGORIES:
            raise ValueError(f"category must be one of {INCOME_CATEGORIES} for income")
        if t == "expense" and v not in EXPENSE_CATEGORIES:
            raise ValueError(f"category must be one of {EXPENSE_CATEGORIES} for expense")
        return v


class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    type: str
    category: str
    date: DateType
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryBreakdown(BaseModel):
    category: str
    total: float


class SummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    breakdown: list[CategoryBreakdown]
