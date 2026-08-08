# Enterprise Software Audit Report: E-Absensi STIKOM

**Date:** August 8, 2026
**Auditor:** Principal Software Engineer & Enterprise Architect
**Target Project:** E-Absensi STIKOM Elrahma

---

## EXECUTIVE SUMMARY

### 1. Overall Assessment
The E-Absensi project currently stands as a functional Minimum Viable Product (MVP) tailored to fulfill core academic attendance requirements. The underlying structure exhibits a rudimentary understanding of modern full-stack development (React + Node.js/Express). However, from an enterprise perspective, the system suffers from severe technical debt, critical gaps in security, virtually non-existent test coverage, and a lack of proper DevOps maturity. The architectural divergence between Knex migrations and raw `mysql2` queries creates significant maintainability risks. 

### 2. Biggest Strengths
- **Clear Architectural Separation:** The backend correctly implements a 3-tier architecture (`Controller` -> `Service` -> `Repository`), keeping business logic separated from data access.
- **Modern Frontend Stack:** Utilizes React 19, Vite, and TailwindCSS v4, establishing a solid baseline for a performant UI.
- **Basic Security Tooling:** Implementation of `helmet`, `bcrypt`, `cors`, and `express-rate-limit` demonstrates baseline security awareness.
- **Comprehensive Documentation:** The presence of a detailed `PRD.MD` and `DESIGN.md` provides excellent context for future development.

### 3. Biggest Weaknesses
- **Critical Lack of Testing:** With only three test files across the entire full-stack repository, regressions are highly likely during any refactoring.
- **Database Access Inconsistencies:** The codebase installs and configures `knex.js` for migrations but heavily utilizes raw `db.query` strings in repositories, circumventing query builders and increasing SQL syntax error risks.
- **DevOps & Secret Management:** `docker-compose.yml` hardcodes sensitive credentials (`rootpassword`, `supersecretkey_stikom`). There are no CI/CD pipelines.
- **Missing Production Observability:** Total absence of structured logging (e.g., Winston, Pino) and application performance monitoring (APM).

### 4. Top 10 Highest-Priority Improvements
1. **Implement CI/CD:** Add GitHub Actions for automated linting, testing, and Docker image builds.
2. **Standardize Data Access:** Migrate all raw `db.query()` calls in Repositories to use `knex` query builder to prevent SQL injection edge cases and maintain consistency.
3. **Secret Management:** Remove all hardcoded credentials from `docker-compose.yml` and enforce `.env` injection.
4. **Testing Infrastructure:** Mandate a minimum 70% unit test coverage using Jest for backend services and Playwright for frontend critical paths.
5. **Add Health Checks:** Implement a `/health` endpoint and configure Docker `healthcheck` in compose.
6. **Implement Structured Logging:** Replace `console.log` with a production-ready logger (e.g., Pino) and implement an audit-log table for all mutable actions.
7. **Refine API Routes:** Standardize non-RESTful routes (e.g., `/buka-sesi`) to strict REST conventions (e.g., `POST /api/sesi/:id/start`).
8. **Add DB Constraints & Indexes:** Review the database schema and add missing indexes for foreign keys (e.g., `angkatan_id`, `mk_id`) to prevent table scans.
9. **Implement Global Error Boundary in React:** Catch frontend crashes gracefully to prevent blank screens.
10. **Enable Strict CORS & CSRF:** Restrict CORS origins strictly to production domains and implement CSRF tokens for web clients.

### 5. Technical Debt Summary
**High.** The technical debt is heavily concentrated in the lack of automated tests and raw SQL usage. Scaling this team will result in immediate friction due to the lack of CI/CD and automated formatting checks. 

### 6. Production Readiness Verdict
**MVP (Not Production Ready)**
The application can handle a controlled beta test with a small subset of users, but it is entirely unfit for a live, campus-wide production rollout due to the absence of reliability patterns, missing health monitoring, and security misconfigurations.

### 7. Enterprise Readiness Verdict
**Rejected.** The system lacks SSO/SAML integration, Role-Based Access Control (RBAC) granularity, audit logging, horizontal scaling considerations, and SOC2/ISO compliance baselines.

---

## FINAL SCORECARD (0–10)

| Category | Score | Justification |
| :--- | :---: | :--- |
| Architecture | **6.5** | Standard 3-tier is present but suffers from inconsistent ORM/Query Builder usage. |
| Code Quality | **5.0** | Readable, but lacks strict linting enforcement, Typescript, and uses raw SQL strings. |
| Security | **4.5** | Hardcoded secrets, permissive CORS, no CSRF, lack of strict input sanitization validation across all endpoints. |
| Performance | **6.0** | Node/React is fast, but DB lacks indexes for scale. No caching layer (Redis) implemented. |
| Testing | **1.0** | Effectively non-existent. |
| Maintainability | **5.5** | Good folder structure, but lack of tests makes refactoring extremely dangerous. |
| Scalability | **5.0** | Stateful JWTs are good, but connection pool limit (10) and lack of read-replicas limit horizontal scale. |
| Documentation | **8.0** | Exceptional PRD and Design docs. Swagger is integrated. |
| Deployment | **4.0** | Basic Dockerfiles exist, but no orchestration manifests (K8s) or proper reverse proxy config. |
| DevOps | **2.0** | No CI/CD pipelines, no automated releases, no environment isolation. |
| Reliability | **3.5** | No retries, no circuit breakers, single points of failure. |
| API Design | **5.5** | Uses standard JSON responses but drifts from strict RESTful nouns/verbs. |
| Database Design | **5.0** | Normalization is acceptable, but foreign keys and indexing are missing in critical junctions. |
| **Overall Engineering Quality** | **4.7** | A promising prototype that requires significant hardening before enterprise deployment. |

---

## LAYER BY LAYER AUDIT

### Layer 1 — Project Structure
**Current Condition:** Monorepo-style structure with separate `frontend` and `backend` directories.
**Strengths:**
- Clean separation of client and server.
- Backend uses standard `controllers/`, `services/`, `repositories/`, `routes/` scaffolding.
**Weaknesses:**
- No monorepo tooling (e.g., Turborepo, Nx, or Lerna) to share types/schemas between frontend and backend.
**Risks:** Type and schema definitions (Zod/Interfaces) must be duplicated, risking drift between API contracts.
**Severity:** Low
**Recommendations:** Introduce shared packages for Zod schemas and constants, or migrate to a tool like Turborepo.

### Layer 2 — Architecture
**Current Condition:** 3-tier monolith (Controller -> Service -> Repository).
**Strengths:**
- High cohesion in service layers; business logic is decoupled from HTTP requests.
- Domain boundaries are somewhat clear (Auth, Mahasiswa, Sesi).
**Weaknesses:**
- Dependency Inversion Principle is violated; services tightly couple to static repository instances rather than interfaces (dependency injection).
**Risks:** Testing services requires mocking concrete modules via Jest rather than injecting mock implementations.
**Severity:** Medium
**Recommendations:** Implement a lightweight Dependency Injection (DI) container or pass repositories into service constructors.

### Layer 3 — Source Code
**Current Condition:** Javascript (ES6+) for both backend and frontend.
**Strengths:**
- Modern async/await syntax utilized uniformly.
- Code is generally readable.
**Weaknesses:**
- Lack of TypeScript.
- Raw SQL interpolation in `userRepository.js` (e.g., `WHERE id IN (?)`). While `mysql2` escapes arrays, it is an anti-pattern when a Query Builder (`knex`) is already installed.
**Risks:** High probability of runtime `undefined` errors and type mismatches.
**Severity:** High
**Recommendations:** Migrate to TypeScript incrementally. Switch entirely to `knex` for all data access.

### Layer 4 — API Design
**Current Condition:** JSON REST-like HTTP API documented with Swagger.
**Strengths:**
- Centralized `errorHandler` middleware ensures consistent error payloads (`{ success: false, message: ... }`).
**Weaknesses:**
- Violates REST verb/noun conventions. Examples: `/api/jadwal/buka-sesi` (RPC style) instead of `POST /api/sesi`.
- Pagination and filtering are heavily underspecified in list endpoints.
**Risks:** Harder for third-party consumers or new developers to predict API behavior.
**Severity:** Medium
**Recommendations:** Refactor endpoints to strict REST (e.g., `POST /api/jadwal/:id/sesi`). Enforce standardized pagination (limit, offset/cursor).

### Layer 5 — Database
**Current Condition:** MySQL database connected via `mysql2` pool.
**Strengths:**
- Basic normalization (Users, Angkatan, Mata Kuliah, Sesi, Absensi).
**Weaknesses:**
- Missing foreign key indexes. In MySQL, foreign keys do not automatically create indexes on the child table, leading to full table scans during cascading deletes or joins (e.g., `mk_id` in `absensi` if not explicitly indexed).
- Disconnect between Knex migrations (e.g., `create_kelas_table.js`) and raw SQL dumps.
**Risks:** Severe performance degradation when tables grow beyond 10,000 rows.
**Severity:** High
**Recommendations:** Audit all foreign keys and explicitly add indexes. Consolidate DB schemas entirely into Knex migrations; deprecate raw `.sql` dumps.

### Layer 6 — Security
**Current Condition:** Standard JWT authentication with basic rate limiting and Helmet.
**Strengths:**
- Passwords hashed with `bcrypt`.
- JWTs utilized for stateless sessions.
**Weaknesses:**
- JWT Secret (`supersecretkey_stikom`) and DB credentials hardcoded in `docker-compose.yml`.
- CORS configuration allows `localhost:5173` with credentials, but lacks dynamic environment-based origins for production.
- No Refresh Token rotation implemented; long-lived Access Tokens (12h) are a security risk if compromised.
**Risks:** Credential leakage via source control. Token theft leading to prolonged account takeover.
**Severity:** Critical
**Recommendations:** Implement short-lived Access Tokens (15m) + secure, HttpOnly Refresh Tokens. Move all secrets to ignored `.env` files.

### Layer 7 — Performance
**Current Condition:** Stateless API, React SPA.
**Strengths:**
- Connection pooling is enabled (`connectionLimit: 10`).
**Weaknesses:**
- N+1 query patterns in reporting/rekap endpoints.
- No caching layer for frequently accessed, rarely changing data (e.g., `mata_kuliah`, `angkatan`).
**Risks:** API latency spikes under heavy concurrent load (e.g., all students checking in simultaneously at 08:00 AM).
**Severity:** High
**Recommendations:** Implement Redis for caching master data. Use SQL `JOIN`s or `knex` eager loading to resolve N+1 queries in reports. Increase DB connection limit appropriately for production.

### Layer 8 — Reliability
**Current Condition:** Node.js server managed by basic node commands.
**Strengths:**
- Global error handler catches unhandled promise rejections in routes.
**Weaknesses:**
- No retry mechanisms for transient database connection failures.
- No graceful shutdown logic (capturing `SIGTERM` to drain DB connections before exiting).
**Risks:** In-flight requests are forcefully dropped during deployments or pod evictions.
**Severity:** Medium
**Recommendations:** Implement graceful shutdown in `server.js`. Add standard retry wrappers for critical database transactions.

### Layer 9 — DevOps
**Current Condition:** Barebones Docker configuration.
**Strengths:**
- Multi-stage build for the frontend Dockerfile (using Nginx).
**Weaknesses:**
- No GitHub Actions / GitLab CI.
- No semantic versioning or automated tagging.
- Backend Dockerfile runs as `root` (no `USER node` directive).
**Risks:** Broken code easily pushed to `main`. Security vulnerabilities running containers as root.
**Severity:** High
**Recommendations:** Add CI/CD workflows. Append `USER node` in the backend Dockerfile. 

### Layer 10 — Logging & Monitoring
**Current Condition:** Standard `console.log`.
**Strengths:**
- Basic route mounting logs on startup.
**Weaknesses:**
- No structured JSON logging.
- No request ID tracing (e.g., UUID per request for tracing logs).
- No `/health` or `/metrics` (Prometheus) endpoints.
**Risks:** Impossible to debug production incidents effectively.
**Severity:** High
**Recommendations:** Integrate `pino` or `winston` for JSON logging. Add `x-request-id` middleware. Implement a `/health` endpoint checking DB connectivity.

### Layer 11 — Testing
**Current Condition:** Jest and Playwright installed.
**Strengths:**
- Testing frameworks are technically present in `package.json`.
**Weaknesses:**
- ~0% test coverage. Only two backend test files (`haversine.test.js`, `rekap.test.js`) and one frontend spec (`login.spec.js`).
**Risks:** Any refactoring is equivalent to coding blindfolded.
**Severity:** Critical
**Recommendations:** Halt feature development and implement core unit tests for all Services and Repositories. Implement e2e tests for the critical path (Login -> Scan QR -> Logout).

### Layer 12 — Documentation
**Current Condition:** Markdown files in root.
**Strengths:**
- `PRD.MD` and `DESIGN.md` are phenomenally detailed, outlining business rules, design tokens, and future scope.
- Swagger API documentation is configured.
**Weaknesses:**
- No runbooks for operational incidents (e.g., "How to restore DB from backup").
**Risks:** Low operational readiness.
**Severity:** Low
**Recommendations:** Add an `ops/RUNBOOK.md` detailing backup/restore procedures and incident response.

### Layer 13 — Production Readiness
*(Covered in Executive Summary)*
Verdict: Prototype / MVP. Do not deploy to a live, critical academic environment without addressing the Critical and High severity findings.
