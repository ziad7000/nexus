# Architecture Decision Records (ADR) — GIU Nexus

This document outlines key technical decisions, trade-offs, and design rationales implemented during the engineering overhaul of GIU Nexus.

---

## ADR-001: Framework Architecture & Server Decoupling
- **Status:** Accepted
- **Context:** The initial prototype bundled Express application middleware, routes, and socket listening inside a single `server.js` file, preventing automated HTTP integration testing without launching live network ports.
- **Decision:** Decoupled `app.js` (pure Express application declaration, middleware pipeline, and route mounts) from `server.js` (network listener, process lifecycle, and OS signal management).
- **Consequences:** Supertest can now execute integration tests in-memory with sub-second execution speeds. Graceful shutdown handlers (`SIGTERM`, `SIGINT`) allow active HTTP connections to complete before process termination.

---

## ADR-002: Document Store with Version-Controlled Migrations
- **Status:** Accepted
- **Context:** The platform requires flexible schemas for candidate profiles (varying skills, unstructured bios) and job requirements, but needs index enforcement and reproducible state across staging and production.
- **Decision:** Utilized MongoDB 7.0 with Mongoose 9, supplemented by `migrate-mongo` for version-controlled, automated schema and index migrations.
- **Consequences:** Eliminates volatile manual index creation. Migrations run deterministically in CI and cloud deployments before API initialization.

---

## ADR-003: Stateless JWT Authentication & Role-Based Access Control
- **Status:** Accepted
- **Context:** University career platforms serve three distinct personas (`jobSeeker`, `recruiter`, `admin`) and require horizontal scalability across serverless and containerized instances.
- **Decision:** Implemented stateless Bearer JSON Web Tokens (JWT) containing cryptographic user ID and role claims, signed with HMAC-SHA256. Passwords hashed using `bcryptjs` with salt work factor 10.
- **Consequences:** Eliminates session database bottlenecks. Enables zero-latency permission checks across distributed cloud nodes. Rate limiting guards authentication routes against brute-force attacks.

---

## ADR-004: Atomic Condition-Based Concurrency Control
- **Status:** Accepted
- **Context:** When high-demand job openings have limited vacancies (e.g., 5 slots), concurrent submissions by multiple applicants cause race conditions, resulting in oversubscription.
- **Decision:** Replaced naive read-then-write logic with atomic condition-based updates directly in the MongoDB storage engine using `findOneAndUpdate({ _id, remainingSlots: { $gt: 0 }, status: 'open' }, { $inc: { remainingSlots: -1 } })`. Supported by a rollback mechanism if application record creation fails.
- **Consequences:** Guaranteed ACID atomicity at document level with zero lock contention. Verified via automated multi-threaded proof test (`applicationSlotRace.test.js`) where 25 parallel requests for 5 slots yielded exactly 5 successes and 20 conflicts with 0 slots remaining.

---

## ADR-005: RFC 7807 Problem Details Error Protocol
- **Status:** Accepted
- **Context:** Generic error messages and ad-hoc status strings create friction for API consumers and client state management.
- **Decision:** Standardized all API error responses on RFC 7807 (`application/problem+json`) with structured fields: `type`, `title`, `status`, `detail`, `instance`, `code`, and `invalidParams`.
- **Consequences:** Frontends and API consumers receive standardized, actionable error diagnostics. Zod validation errors map directly to RFC 7807 invalid parameter lists.

---

## ADR-006: Multi-Stage Containerization & Least-Privilege Security
- **Status:** Accepted
- **Context:** Production containers require minimal surface area and must adhere to container security best practices.
- **Decision:** Created multi-stage Dockerfiles for both backend and frontend using Alpine Linux bases (`node:22-alpine` and `nginx:1.27-alpine`). The backend drops root privileges and executes as the unprivileged `node` user.
- **Consequences:** Container size reduced by over 60%. Production dependencies isolated from dev tooling. Build cache optimized via layer order.

---

## ADR-007: Declarative Cloud Blueprint (Render IaC)
- **Status:** Accepted
- **Context:** Deployment instructions should be reproducible, declarative, and automated on push to `main`.
- **Decision:** Authored a declarative `render.yaml` blueprint defining the backend Web Service (Node runtime, healthcheck, migration pre-hook) and frontend Static Site (Vite bundle with SPA routing rewrites).
- **Consequences:** One-click deployment from GitHub repository. Dynamic environment variable linking automatically routes frontend API requests to the backend service.
