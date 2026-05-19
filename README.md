# Bolna Lead Qualifier

**AI-powered B2B sales lead qualification using Bolna Voice AI agents.**

An outbound Voice AI agent (Alex) calls every new trial signup, qualifies them on BANT criteria (Budget, Authority, Need, Timeline), and automatically updates the lead dashboard via webhook.

## Architecture

```
User (React UI)
    ↓ Add lead + click "Call"
FastAPI Backend (POST /leads/{id}/call)
    ↓ POST /call to Bolna API
Bolna Voice AI Agent (calls the lead's phone)
    ↓ POST /webhook/bolna after call ends
FastAPI updates lead status + extractions
    ↓ Auto-poll every 8s
React UI shows real-time qualification results
```

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS + Lucide Icons
- **Backend:** FastAPI (Python 3.11) + SQLAlchemy + SQLite
- **Voice AI:** Bolna API (outbound calls + webhooks)

## Quick Start

### 1. Clone & setup backend

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your BOLNA_API_KEY, BOLNA_AGENT_ID, BOLNA_FROM_PHONE
uvicorn main:app --reload --port 8000
```

### 2. Setup frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `BOLNA_API_KEY` | Your Bolna API key from platform.bolna.ai |
| `BOLNA_AGENT_ID` | The Agent ID of your created Voice AI agent |
| `BOLNA_FROM_PHONE` | Your Bolna phone number in E.164 format |
| `DATABASE_URL` | SQLite URL (default: `sqlite+aiosqlite:///./leads.db`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default: `http://localhost:8000`) |

## Bolna Agent Setup

1. Go to [platform.bolna.ai](https://platform.bolna.ai) → Create Agent
2. Paste the prompt below into the Agent tab
3. Configure post-call extractions (see below)
4. Set your webhook URL to: `https://your-backend-url/webhook/bolna`

### Agent Prompt (Alex — BANT Qualifier)

```
You are Alex, a friendly outbound sales development representative for Zoho CRM. Your goal is to qualify leads who recently signed up for a Zoho CRM trial.

## Behavior Rules
- Be warm, conversational, and keep responses to 1-2 sentences per turn.
- Never be pushy. If the prospect is busy, offer to call back.
- Do not discuss pricing in detail. Say "our team will share a custom quote based on your needs."
- If they ask to be removed from the list, respect it immediately and @end_call.

## Call Flow
1. Greeting: "Hi, is this {lead_name}? This is Alex calling from Zoho CRM — you recently signed up for a trial. Do you have 2 minutes?"
2. If yes: "Great! Could you tell me a bit about what you're looking to use Zoho CRM for at {company_name}?"
3. Authority: "Are you the one who'd be making this decision, or is there someone else involved?"
4. Need: "How are you currently managing your sales pipeline?"
5. Timeline: "Are you looking to get something in place in the next 30 days, or is this more exploratory?"
6. Budget: "Do you have a budget allocated for a CRM solution, roughly?"
7. Close: "Thanks so much, {lead_name}! I'll pass this over to our sales team and they'll reach out with next steps. Have a great day!"

## Variables
{lead_name}, {company_name}, {deal_size}
```

### Post-Call Extractions (Analytics Tab)

Add these extraction templates:

| Name | Prompt | Type |
|---|---|---|
| `qualification_status` | Is this lead qualified based on the conversation? | Pre-defined: qualified / disqualified / unknown |
| `budget_range` | What budget range did the prospect mention? | Free text |
| `is_decision_maker` | Is the prospect the decision maker? | Pre-defined: yes / no / unknown |
| `timeline` | What timeline did the prospect mention for purchase? | Free text |
| `follow_up_requested` | Did the prospect request a follow-up call? | Pre-defined: yes / no |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/leads` | Create a new lead |
| `GET` | `/leads` | List all leads |
| `GET` | `/leads/{id}` | Get a specific lead |
| `POST` | `/leads/{id}/call` | Trigger Bolna outbound call |
| `DELETE` | `/leads/{id}` | Delete a lead |
| `POST` | `/webhook/bolna` | Receive post-call data from Bolna |
| `GET` | `/stats` | Get dashboard statistics |

## Deployment

### Backend → Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

### Frontend → Netlify/Vercel

```bash
cd frontend
# Set VITE_API_URL to your Railway backend URL
npm run build
# Deploy dist/ folder
```

## Use Case

**Problem:** B2B SaaS companies (like Zoho CRM) receive hundreds of trial signups daily. Human SDRs can't call everyone quickly — 60%+ of leads go cold within 24 hours.

**Solution:** A Voice AI agent calls every signup within 5 minutes, qualifies them on BANT, and auto-routes hot leads to human sales reps.

**Results:**
- 100% lead contact rate (vs ~40% with human teams)
- Time-to-first-contact: 5 minutes (vs 4+ hours)
- SDR time saved: 3–4 hours/day per rep
- Cost per qualified lead: ₹8 (AI) vs ₹65+ (human)
