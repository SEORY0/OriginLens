# OriginLens

Lifecycle Red-Team & Provenance Firewall for Memory-Laundering Attacks.

OriginLens tests whether untrusted context can be summarized, compacted, remembered, and later reused as authorization for protected actions. It is built as a safe, product-agnostic harness for AI safety demos and hackathon judging.

## Product Overview

OriginLens focuses on a lifecycle failure mode:

```text
Untrusted Context
  -> Agent / Sub-agent Summary
  -> Compacted Memory
  -> Future Retrieval
  -> Tool or Physical Action
```

The core invariant is:

```text
The model may summarize content, but it must not promote provenance.
```

OriginLens demonstrates this with:

- Baseline replay: untrusted context survives compaction and triggers a mock protected action.
- Guarded replay: the same claim is blocked because its origin chain is not authorized.
- Benchmark evidence: payload families are replayed and measured.
- Physical AI extension: scene text is treated as observation, not authorization.

## Architecture

```text
Browser
  -> Vercel Next.js UI
  -> Next.js /api proxy
  -> External FastAPI server
  -> Python OriginLens Engine
  -> SQLite run store
```

The Next.js app renders dashboards and reports. The Python engine owns red-team replay, provenance guard logic, benchmark metrics, report export, and run persistence.

## Demo Flow

1. Open `/demo`.
2. Click `Run Baseline Attack`.
3. Show that a PR-description claim becomes `run_build({ mock_unsandboxed: true })`.
4. Click `Replay with Guard`.
5. Show `BLOCK` with origin chain `file_read -> subagent_summary -> compacted_memory`.
6. Click `Show Bench Result`.
7. Show Survival, Laundering, Trigger, Guarded Trigger, FPR, and Provenance Integrity.
8. Click `Physical Extension`.
9. Say: `Scene text is observation, not authorization.`

## Presentation Script

```text
Prompt injection usually attacks what the model sees now.
Long-context agents also summarize, compact, and remember.
The attacker sentence may disappear, but its meaning can survive.
What disappears is provenance.

OriginLens red-teams that lifecycle and blocks protected actions
unless the approval claim came from an authorized origin.
```

Closing line:

```text
Input guardrails protect what agents see now.
OriginLens protects what agents remember later, before memory becomes action.
```

## Responsible Research

- No real secrets are used.
- No real network exfiltration is performed.
- No real shell command is executed.
- No real robot or actuator is controlled.
- All protected actions are `mock_only` or `simulated_only`.
- Product-specific testing requires private disclosure.
- Payloads focus on authorization spoofing, not destructive behavior.

## Environment Variables

Frontend:

```env
ORIGINLENS_API_URL=http://203.253.21.194:8000
ORIGINLENS_API_TOKEN=replace-with-random-token
```

Backend:

```env
ORIGINLENS_API_TOKEN=replace-with-random-token
ORIGINLENS_ENV=production
ORIGINLENS_DB_PATH=/app/data/originlens.db
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Live providers are optional. The deterministic fallback trace works without model API keys.

## Local Development

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements-dev.txt
npm run dev:api
npm run dev
```

Open:

```text
http://localhost:3000/demo
```

## Test Commands

```bash
npm test
npm run test:api
npm run lint
npm run build
```

## External Server Deployment

On `203.253.21.194`:

```bash
git clone https://github.com/SEORY0/OriginLens
cd OriginLens
cp backend/.env.example backend/.env
docker compose up -d --build
curl http://203.253.21.194:8000/health
```

Required ports:

- `22` for SSH
- `8000` for Vercel-to-FastAPI API access

Set the same `ORIGINLENS_API_TOKEN` in Vercel and on the FastAPI server.

## Vercel Deployment

Deploy the Next.js app from the repository root and set:

```env
ORIGINLENS_API_URL=http://203.253.21.194:8000
ORIGINLENS_API_TOKEN=<same-token-as-backend>
```

The browser calls Vercel only. Vercel server-side API routes proxy requests to the Python engine and attach the bearer token.

## API Examples

Run baseline and guarded comparison:

```bash
curl -X POST "$ORIGINLENS_API_URL/scenario/compare" \
  -H "authorization: Bearer $ORIGINLENS_API_TOKEN" \
  -H "content-type: application/json" \
  -d '{"payloadId":"pr_01","providerMode":"demo"}'
```

Run benchmark:

```bash
curl -X POST "$ORIGINLENS_API_URL/bench/run" \
  -H "authorization: Bearer $ORIGINLENS_API_TOKEN" \
  -H "content-type: application/json" \
  -d '{"payloadCount":50,"includeBenign":true}'
```

Export report:

```bash
curl "$ORIGINLENS_API_URL/report/export?format=csv" \
  -H "authorization: Bearer $ORIGINLENS_API_TOKEN"
```

## Integration Story

Attach OriginLens where agent runtimes transform or trust context:

1. Context ingestion hook
2. Sub-agent handoff hook
3. Memory write hook
4. Compaction hook
5. Tool call hook
6. Physical action proposal hook

Minimal integration shape:

```ts
const context = guard.captureContext({
  origin: "file_read",
  source: "PR_DESCRIPTION",
  content: prDescription
});

const memoryClaim = guard.captureMemoryClaim({
  text: compactedSummary,
  derivedFrom: [context.id]
});

const verdict = guard.verifyAction({
  actionType: "run_build",
  protectedAction: "sandbox_policy_change",
  args: { mock_unsandboxed: true },
  justificationClaimIds: [memoryClaim.id]
});
```
