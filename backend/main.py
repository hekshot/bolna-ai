from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import os
import json
from dotenv import load_dotenv

from database import get_db, init_db
from models import Lead
from bolna_client import trigger_call

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(title="Bolna Lead Qualifier API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()


class LeadCreate(BaseModel):
    name: str
    phone: str
    company: str
    email: Optional[str] = None
    deal_size: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    phone: str
    company: str
    email: Optional[str]
    deal_size: Optional[str]
    status: str
    call_status: Optional[str]
    execution_id: Optional[str]
    qualification_status: Optional[str]
    budget_range: Optional[str]
    is_decision_maker: Optional[str]
    timeline: Optional[str]
    follow_up_requested: Optional[str]
    call_summary: Optional[str]
    transcript: Optional[str]
    call_duration: Optional[float]
    created_at: Optional[datetime]
    called_at: Optional[datetime]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_leads: int
    pending: int
    calling: int
    qualified: int
    disqualified: int
    call_completion_rate: float
    qualification_rate: float


@app.get("/")
async def root():
    return {"message": "Bolna Lead Qualifier API", "status": "running"}


@app.post("/leads", response_model=LeadResponse)
async def create_lead(lead: LeadCreate, db: AsyncSession = Depends(get_db)):
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    await db.commit()
    await db.refresh(db_lead)
    return db_lead


@app.get("/leads", response_model=List[LeadResponse])
async def list_leads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return result.scalars().all()


@app.get("/leads/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.post("/leads/{lead_id}/call", response_model=LeadResponse)
async def call_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status in ("calling",):
        raise HTTPException(status_code=400, detail="Call already in progress for this lead")

    try:
        call_result = await trigger_call(
            recipient_phone=lead.phone,
            lead_name=lead.name,
            company_name=lead.company,
            deal_size=lead.deal_size or "",
        )
        lead.status = "calling"
        lead.call_status = call_result.get("status", "queued")
        lead.execution_id = call_result.get("execution_id")
        lead.called_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(lead)
        return lead
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger call: {str(e)}")


@app.delete("/leads/{lead_id}")
async def delete_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    await db.commit()
    return {"message": "Lead deleted"}


@app.post("/webhook/bolna")
async def bolna_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}

    execution_id = (
        body.get("execution_id")
        or body.get("call_id")
        or body.get("data", {}).get("execution_id")
    )

    if not execution_id:
        return {"status": "ignored", "reason": "no execution_id"}

    result = await db.execute(select(Lead).where(Lead.execution_id == execution_id))
    lead = result.scalar_one_or_none()

    if not lead:
        return {"status": "ignored", "reason": "lead not found"}

    call_data = body.get("data", body)

    lead.call_status = call_data.get("status", lead.call_status)
    lead.call_duration = call_data.get("duration") or call_data.get("call_duration")
    lead.transcript = call_data.get("transcript")
    lead.call_summary = call_data.get("summary") or call_data.get("call_summary")

    extractions = call_data.get("extracted_data") or call_data.get("extractions") or {}

    if isinstance(extractions, str):
        try:
            extractions = json.loads(extractions)
        except Exception:
            extractions = {}

    if extractions:
        lead.qualification_status = extractions.get("qualification_status") or extractions.get("Qualification Status")
        lead.budget_range = extractions.get("budget_range") or extractions.get("Budget Range")
        lead.is_decision_maker = extractions.get("is_decision_maker") or extractions.get("Decision Maker")
        lead.timeline = extractions.get("timeline") or extractions.get("Timeline")
        lead.follow_up_requested = extractions.get("follow_up_requested") or extractions.get("Follow Up Requested")

    if lead.qualification_status and lead.qualification_status.lower() in ("qualified", "yes", "true"):
        lead.status = "qualified"
    elif lead.qualification_status and lead.qualification_status.lower() in ("disqualified", "no", "false", "not interested"):
        lead.status = "disqualified"
    elif lead.call_status in ("completed", "ended", "done"):
        lead.status = "completed"

    await db.commit()
    return {"status": "ok"}


@app.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead))
    leads = result.scalars().all()

    total = len(leads)
    pending = sum(1 for l in leads if l.status == "pending")
    calling = sum(1 for l in leads if l.status == "calling")
    qualified = sum(1 for l in leads if l.status == "qualified")
    disqualified = sum(1 for l in leads if l.status == "disqualified")
    completed = sum(1 for l in leads if l.status in ("completed", "qualified", "disqualified"))

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0
    qualification_rate = round((qualified / completed * 100), 1) if completed > 0 else 0

    return StatsResponse(
        total_leads=total,
        pending=pending,
        calling=calling,
        qualified=qualified,
        disqualified=disqualified,
        call_completion_rate=completion_rate,
        qualification_rate=qualification_rate,
    )
