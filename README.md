# OriginLens

Lifecycle Red-Team & Provenance Firewall for Memory-Laundering Attacks.

OriginLens is a web-based AI safety demo for testing whether untrusted context can be summarized, compacted, remembered, and later reused as authorization for protected actions.

The dashboard is a Next.js app. The red-team, guard, benchmark, and report pipeline runs in a Python FastAPI engine.

## Demo Flow

1. Run the baseline coding-agent attack.
2. Replay the same trace with OriginLens Guard.
3. Show benchmark evidence and CSV export.
4. Show the physical AI extension as `simulated_only`.

## Safety Boundaries

- No real secrets are used.
- No real network exfiltration is performed.
- No real shell command is executed.
- No real robot or actuator is controlled.
- All protected actions are mock or `simulated_only`.
- Product-specific testing requires private disclosure.

## Architecture

```text
Browser
  -> Vercel Next.js UI
  -> Next.js /api proxy
  -> External FastAPI server
  -> Python OriginLens Engine
  -> SQLite run store
```

## Environment Variables

Live providers are optional. The demo works without keys through deterministic fallback traces.

```env
ORIGINLENS_API_URL=http://203.253.21.194:8000
ORIGINLENS_API_TOKEN=replace-with-random-token
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

## Commands

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements-dev.txt
npm run dev:api
npm run dev
npm test
npm run test:api
npm run build
```

## External Server

On `203.253.21.194`, create `backend/.env` from `backend/.env.example`, then run:

```bash
docker compose up -d --build
curl http://203.253.21.194:8000/health
```

Set the same `ORIGINLENS_API_TOKEN` in Vercel and on the FastAPI server.
