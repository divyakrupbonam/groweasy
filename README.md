# GrowEasy CSV Importer

An AI-powered CSV importer that takes a lead export from *any* source —
Facebook Lead Ads, Google Ads, a real-estate CRM, a hand-built spreadsheet,
whatever — and intelligently maps its columns into GrowEasy's fixed CRM
schema, without the user ever telling it which column is which.

```
┌────────────┐    ┌────────────┐    ┌──────────────────┐    ┌────────────┐
│  1. Upload │ →  │ 2. Preview │ →  │ 3. Confirm & map  │ →  │ 4. Result  │
│  drag/drop │    │  raw table │    │  (AI, batched,    │    │  imported  │
│  a CSV     │    │  no AI yet │    │   streamed)       │    │  + skipped │
└────────────┘    └────────────┘    └──────────────────┘    └────────────┘
```

## Project layout

```
groweasy-csv-importer/
├── backend/     Node.js + Express API that batches rows to an LLM and
│                validates/normalizes what comes back
├── frontend/    Next.js (App Router) app: upload → preview → import → result
└── docker-compose.yml
```

Each half has its own README-level detail below; each is also independently
deployable (e.g. backend on Railway/Render, frontend on Vercel).

## Quick start (local, no Docker)

**1. Backend**

```bash
cd backend
cp .env.example .env
# edit .env: set AI_PROVIDER (openai | anthropic | gemini) and its API key
npm install
npm run dev        # http://localhost:4000
```

**2. Frontend**

```bash
cd frontend
cp .env.local.example .env.local   # defaults to http://localhost:4000
npm install
npm run dev         # http://localhost:3000
```

Open `http://localhost:3000`, drop in a CSV, confirm, and watch it map.

## Quick start (Docker)

```bash
cp backend/.env.example .env       # docker-compose reads AI keys from here
docker compose up --build
```

## How the AI extraction works

The core challenge isn't parsing CSV — it's that every source names and
arranges its columns differently. The approach here:

1. **Frontend parses the CSV client-side** (PapaParse) purely to show the
   user a preview. No AI call happens until they hit **Confirm**.
2. **On confirm**, the full set of raw rows (as JSON objects keyed by
   whatever the original header was) is POSTed to
   `POST /api/leads/import`.
3. **The backend batches rows** (default 15/batch, 3 batches in flight at
   once — both configurable) and sends each batch, plus a schema
   description, to the configured LLM. The prompt (see
   `backend/src/services/promptBuilder.js`) is built from a single schema
   definition (`backend/src/config/crmSchema.js`) shared with the
   validator, so the prompt and the validation rules can't drift apart.
4. **Every record the model returns is re-validated server-side** — enum
   fields (`crm_status`, `data_source`) are blanked if the model returns
   anything outside the allowed list, `created_at` is checked against
   `new Date()`, and the "must have an email or a mobile number" rule from
   the spec is enforced in code, not just in the prompt.
5. **Progress streams back as NDJSON** (`application/x-ndjson`) — one
   `{"type":"progress", ...}` line per completed batch, then a final
   `{"type":"done", ...}` line with the full result — so the UI can show a
   live progress bar instead of one long spinner.
6. **A failed batch doesn't fail the whole import.** Each batch is retried
   with exponential backoff (`AI_MAX_RETRIES`, default 2); if it still
   fails, only that batch's rows are marked skipped with the underlying
   error as the reason, and the rest of the import continues.

Swapping providers is a one-line env change (`AI_PROVIDER=openai
| anthropic | gemini`) — see `backend/src/services/providers/`.

## API

### `POST /api/leads/import`
Streaming (NDJSON) import endpoint used by the frontend.

Request body:
```json
{ "rows": [ { "Full Name": "...", "Email": "...", "...": "..." } ] }
```

Response is a stream of newline-delimited JSON objects:
```json
{"type":"progress","completedBatches":1,"totalBatches":4,"importedSoFar":14,"skippedSoFar":1}
{"type":"progress","completedBatches":2,"totalBatches":4,"importedSoFar":28,"skippedSoFar":2}
{"type":"done","imported":[...],"skipped":[...],"totalImported":56,"totalSkipped":4,"totalRows":60,"totalBatches":4}
```

### `POST /api/leads/import-sync`
Same pipeline, same request body, but waits for the whole import and
returns a single JSON response — convenient for `curl` or integration
tests.

### `GET /api/health`
Liveness check; also reports which AI provider is active.

## Configuration reference (backend `.env`)

| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `openai` | `openai` \| `anthropic` \| `gemini` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — / `gpt-4o-mini` | used when `AI_PROVIDER=openai` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | — / `claude-sonnet-5` | used when `AI_PROVIDER=anthropic` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | — / `gemini-2.0-flash` | used when `AI_PROVIDER=gemini` |
| `AI_BATCH_SIZE` | `15` | rows sent to the LLM per request |
| `AI_BATCH_CONCURRENCY` | `3` | batches in flight at once |
| `AI_MAX_RETRIES` | `2` | retries per batch before it's marked skipped |
| `MAX_ROWS_PER_IMPORT` | `5000` | hard cap to protect against runaway cost |
| `CORS_ORIGIN` | `*` | set to your deployed frontend origin in production |

## Design notes

- **Why send raw rows to the backend instead of the parsed preview only?**
  The preview step is UX (let the user sanity-check the file); the same
  parsed rows are reused for the real import so there's exactly one source
  of truth for "what got uploaded."
- **Why NDJSON instead of a WebSocket or polling?** It's the simplest
  transport that still gives incremental progress over a single HTTP
  request/response — no extra server, no client-side polling loop.
- **Why validate server-side even though the prompt already states the
  rules?** LLMs occasionally drift from instructions (invent an enum
  value, mis-format a date). The validator in `utils/validators.js` is the
  actual source of truth for what's allowed; the prompt is a best-effort
  first pass.

## What's implemented from the bonus list

- Drag & drop upload
- Live progress indicator during AI processing (streamed, not simulated)
- Retry mechanism for failed AI batches (exponential backoff)
- Sticky-header, scrollable preview & result tables
- Docker setup for both services + `docker-compose.yml`
- Downloadable CSV of the imported result
- Provider-agnostic AI layer (OpenAI / Anthropic / Gemini)

Not implemented (flagged rather than silently skipped): virtualized
tables for very large CSVs (rows beyond 300 are still sent to the backend,
just not all rendered in the preview DOM), dark mode, automated unit
tests.

## Submission

Position applying for: **Software Developer Intern**

Per the assignment brief, email `varun@groweasy.ai` with:
- Hosted application URL
- Public GitHub repository URL
- Position applying for

Deadline: 12 July 2026.
