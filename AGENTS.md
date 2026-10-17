<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Company Brain (Frontend Repo)

## Goal
Build a demo-winning AI agent frontend that shows how a company works.
It connects People, Teams, Projects, Documents, and Decisions in one knowledge graph,
so the agent can answer questions and get work done across all of it — with visible proof.

This is a 4-day hackathon. Judges care about: live chat that feels real, visual proof trail,
and graceful handling of restricted / stale data. Not backend completeness.

## Role & Scope
- **You do:** 100% Frontend UI/UX, component architecture, client-side state, mock data + mock AI responses, animations.
- **You do NOT do:** Python/FalkorDB backend, real LLM calls, auth, infra, deployment pipelines. A teammate owns the backend in a separate repo.
- **Frontend must be demo-independent:** it works fully on mock data even if backend is down.

## Tech Stack (do not change)
- Next.js 16 App Router, TypeScript, Tailwind CSS v4, Shadcn UI (base-nova), Lucide Icons, Bun, Biome.
- Prefer copy-paste blocks over custom builds: official shadcn June-2026 chat primitives (`message-scroller`, `message`, `bubble`, `marker`, `shimmer`, `scroll-fade`) + `@shadcn/helpers/ai-sdk` `createChat()` for mock streaming.
- Graph wow: `xyflow / react-flow` only if needed. No heavy canvas libs otherwise.

## What To Do
1. **Chat-first:** All effort goes to `/chat` today. Landing page is tomorrow, ignore it for now.
2. **Mock-first:** All data lives in `src/lib/mock/` (`types.ts`, `graph.ts`, `chats.ts`). Feed UI via `createChat()` so streaming/animations behave like production.
3. **Reuse components:** Use `bunx shadcn@latest add <component>` before hand-rolling. Wrap blocks in `src/components/chat/*`, don't fork them.
4. **Animate the agent:** Reflexion pills via `Marker` + `shimmer`: "Querying FalkorDB..." -> "Reflector auditing claims..." -> "Approved". Test with mock delays, no scroll jump (use `MessageScroller`).
5. **Proof always:** Every assistant answer must carry clickable citations `[1][2]` -> opens Proof Inspector Drawer (Shadcn `Sheet`) with node preview + trail `Project <-> Person <-> Document <-> Decision`.
6. **Guardrails as UI:** RBAC = soft dead-end `Card` with `Lock` icon ("Restricted — request access"), never a hard error. Temporal = banner ("Showing as of Q2 — 3 updates since").
7. **Temp backend hookup (minimal):** Header gear icon -> dialog to paste ngrok base URL (stored in `localStorage`, never committed). Default mode = `Mock`. `Live` mode proxies via `src/app/api/backend/[...path]/route.ts` to avoid CORS. `Auto` falls back to mock on failure with a toast.

## What NOT To Do
- DON'T build backend routes with real DB logic, DON'T add Python, Docker, or env secrets to this repo.
- DON'T hardcode backend URLs, DON'T commit ngrok URLs, DON'T require backend to run the demo.
- DON'T create lots of custom sections/components from scratch — reuse shadcn blocks.
- DON'T work on landing page, marketing, SEO, or auth until `/chat` demo is solid.
- DON'T add streaming (SSE), websockets, or state libs (redux/zustand) — `useChat` + local state is enough.
- DON'T over-engineer: max 5 backend endpoints matter (`POST /v1/chat`, `GET /v1/graph/node/:id`, `GET /v1/graph/neighbors`, `GET /v1/search`, `POST /v1/actions`). Frontend mocks the same JSON shapes.
- DON'T break the `nextjs-agent-rules` header at the top of this file.

## Key Demo Scenarios (mock these first)
1. `Who owns Atlas launch?` -> happy path + 2 citations + graph highlight.
2. `Why was pricing changed?` -> Decision trail + doc preview.
3. `Show Q3 salaries` -> RBAC denied card (as employee role).

## File Conventions
```
src/app/chat/page.tsx -> compose only, no logic
src/lib/mock/{types.ts,graph.ts,chats.ts} -> all mock data, NodeId like "proj:atlas"
src/lib/{backend-config.ts,api-client.ts} -> endpoint resolution + mock/live switch
src/components/chat/{ChatShell.tsx,ThreadMessage.tsx,ReflexionMarkers.tsx,Composer.tsx,BackendSettings.tsx,Inspector.tsx,GraphView.tsx,GuardCards.tsx}
src/app/api/backend/[...path]/route.ts -> thin proxy to manual ngrok URL
```

## Verification Before Done
- `bun run dev` -> `/chat` sends mock message, pills animate, no scroll jump, citations open drawer.
- Toggle Mock/Live with empty URL stays on mock, no crash.
- `bunx biome check` passes.