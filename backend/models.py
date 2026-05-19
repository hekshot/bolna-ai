from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    company = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    deal_size = Column(String(100), nullable=True)

    status = Column(String(50), default="pending")
    call_status = Column(String(50), nullable=True)
    execution_id = Column(String(255), nullable=True)

    qualification_status = Column(String(50), nullable=True)
    budget_range = Column(String(100), nullable=True)
    is_decision_maker = Column(String(10), nullable=True)
    timeline = Column(String(100), nullable=True)
    follow_up_requested = Column(String(10), nullable=True)
    call_summary = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    call_duration = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    called_at = Column(DateTime(timezone=True), nullable=True)
