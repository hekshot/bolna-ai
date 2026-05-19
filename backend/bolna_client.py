import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BOLNA_API_KEY = os.getenv("BOLNA_API_KEY", "")
BOLNA_AGENT_ID = os.getenv("BOLNA_AGENT_ID", "")
BOLNA_FROM_PHONE = os.getenv("BOLNA_FROM_PHONE", "")
BOLNA_BASE_URL = "https://api.bolna.ai"


def normalize_phone(phone: str) -> str:
    phone = phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        if phone.startswith("91") and len(phone) == 12:
            phone = "+" + phone
        else:
            phone = "+91" + phone
    return phone


async def trigger_call(recipient_phone: str, lead_name: str, company_name: str, deal_size: str = "") -> dict:
    headers = {
        "Authorization": f"Bearer {BOLNA_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "agent_id": BOLNA_AGENT_ID,
        "recipient_phone_number": normalize_phone(recipient_phone),
        "user_data": {
            "lead_name": lead_name,
            "company_name": company_name,
            "deal_size": deal_size or "not specified",
        },
    }

    if BOLNA_FROM_PHONE:
        payload["from_phone_number"] = BOLNA_FROM_PHONE

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{BOLNA_BASE_URL}/call",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        return response.json()
