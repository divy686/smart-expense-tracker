
from dotenv import load_dotenv
load_dotenv()  # .env file load karta hai

import os
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from collections import defaultdict

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from groq import Groq
import bcrypt
import jwt





# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
groq_client = Groq(api_key=os.environ['GROQ_API_KEY'])


EXPENSE_CATEGORIES = [
    "Food & Dining", "Groceries", "Transport", "Shopping",
    "Bills & Utilities", "Entertainment", "Health", "Travel",
    "Education", "Other"
]

# FastAPI app
app = FastAPI(title="Smart Expense Tracker API")
api_router = APIRouter(prefix="/api")


# ============================================
# SECTION 2: AUTH UTILITIES
# ============================================
def hash_password(password: str) -> str:
    """Password ko bcrypt se hash karta hai"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(plain: str, hashed: str) -> bool:
    """Plain password ko hashed se compare karta hai"""
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: str, email: str) -> str:
    """JWT token banata hai (7 days valid)"""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    """Har protected route me ye dependency lagti hai"""
    # Pehle cookie check karo, phir Authorization header
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one(
            {"id": payload["sub"]},
            {"_id": 0, "password_hash": 0}
        )
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


# ============================================
# SECTION 3: PYDANTIC MODELS (Data Validation)
# ============================================
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    category: str
    description: str = ""
    date: str  # "YYYY-MM-DD"

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None

class BudgetSet(BaseModel):
    category: str
    monthly_limit: float = Field(ge=0)


# ============================================
# SECTION 4: AUTH ROUTES
# ============================================
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "currency": "USD",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    
    token = create_access_token(user_id, email)
    response.set_cookie("access_token", token, httponly=True, max_age=604800)
    return {"id": user_id, "email": email, "name": req.name}


@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    
    token = create_access_token(user["id"], email)
    response.set_cookie("access_token", token, httponly=True, max_age=604800)
    return {"id": user["id"], "email": email, "name": user["name"]}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ============================================
# SECTION 5: EXPENSE ROUTES (CRUD)
# ============================================
@api_router.get("/categories")
async def get_categories():
    return {"categories": EXPENSE_CATEGORIES}


@api_router.post("/expenses")
async def create_expense(req: ExpenseCreate, user: dict = Depends(get_current_user)):
    if req.category not in EXPENSE_CATEGORIES:
        raise HTTPException(400, "Invalid category")
    
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount": req.amount,
        "category": req.category,
        "description": req.description,
        "date": req.date,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.expenses.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/expenses")
async def list_expenses(
    user: dict = Depends(get_current_user),
    category: Optional[str] = None,
    limit: int = 500,
):
    query = {"user_id": user["id"]}
    if category:
        query["category"] = category
    
    cursor = db.expenses.find(query, {"_id": 0}).sort("date", -1).limit(limit)
    return [doc async for doc in cursor]


@api_router.patch("/expenses/{expense_id}")
async def update_expense(
    expense_id: str,
    req: ExpenseUpdate,
    user: dict = Depends(get_current_user)
):
    update = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")
    
    result = await db.expenses.find_one_and_update(
        {"id": expense_id, "user_id": user["id"]},
        {"$set": update},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(404, "Expense not found")
    return result


@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: dict = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(404, "Expense not found")
    return {"ok": True}


# ============================================
# SECTION 6: BUDGET ROUTES
# ============================================
@api_router.get("/budgets")
async def list_budgets(user: dict = Depends(get_current_user)):
    cursor = db.budgets.find({"user_id": user["id"]}, {"_id": 0})
    return [doc async for doc in cursor]


@api_router.post("/budgets")
async def set_budget(req: BudgetSet, user: dict = Depends(get_current_user)):
    existing = await db.budgets.find_one(
        {"user_id": user["id"], "category": req.category}
    )
    if existing:
        await db.budgets.update_one(
            {"user_id": user["id"], "category": req.category},
            {"$set": {"monthly_limit": req.monthly_limit}}
        )
        return {"category": req.category, "monthly_limit": req.monthly_limit}
    
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "category": req.category,
        "monthly_limit": req.monthly_limit,
    }
    await db.budgets.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ============================================
# SECTION 7: STATS & AI INSIGHTS
# ============================================
@api_router.get("/stats/summary")
async def stats_summary(user: dict = Depends(get_current_user)):
    """Dashboard ke liye summary banata hai"""
    cursor = db.expenses.find({"user_id": user["id"]}, {"_id": 0})
    expenses = [doc async for doc in cursor]
    
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    current_total = 0.0
    category_totals = defaultdict(float)
    monthly_totals = defaultdict(float)
    
    for e in expenses:
        month_key = e["date"][:7]  # "YYYY-MM"
        monthly_totals[month_key] += e["amount"]
        if month_key == current_month:
            current_total += e["amount"]
            category_totals[e["category"]] += e["amount"]
    
    # Forecast: current daily avg × 30
    day = datetime.now(timezone.utc).day
    projected = (current_total / day * 30) if day > 0 else 0
    
    return {
        "current_month_total": round(current_total, 2),
        "projected_month_total": round(projected, 2),
        "category_breakdown": [
            {"category": c, "amount": round(a, 2)}
            for c, a in sorted(category_totals.items(), key=lambda x: -x[1])
        ],
        "monthly_history": [
            {"month": m, "amount": round(a, 2)}
            for m, a in sorted(monthly_totals.items())[-6:]
        ],
        "transaction_count": len(expenses),
    }


class AIRequest(BaseModel):
    question: Optional[str] = None


@api_router.post("/ai/insights")
async def ai_insights(req: AIRequest, user: dict = Depends(get_current_user)):
    cursor = db.expenses.find({"user_id": user["id"]}, {"_id": 0}).sort("date", -1).limit(100)
    expenses = [doc async for doc in cursor]
    
    if not expenses:
        return {"insights": "Add some expenses first."}
    
    cat_totals = defaultdict(float)
    for e in expenses:
        cat_totals[e["category"]] += e["amount"]
    
    summary = {"category_totals": dict(cat_totals), "recent": expenses[:20]}
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # FREE, fast
        messages=[
            {"role": "system", "content": "You are a personal finance assistant. Give 3-5 concise actionable insights with markdown bullets."},
            {"role": "user", "content": f"Analyze: {json.dumps(summary, default=str)}\n\nQuestion: {req.question or 'general insights'}"},
        ],
        max_tokens=400,
    )
    
    return {"insights": response.choices[0].message.content}
# ============================================
# FINAL: Mount router & CORS
# ============================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.expenses.create_index([("user_id", 1), ("date", -1)])
    print("✅ Server started, DB indexes created")

logging.basicConfig(level=logging.INFO)