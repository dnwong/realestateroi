# Unit of Work Plan

## Steps

- [x] Answer decomposition questions below
- [x] Generate unit-of-work.md
- [x] Generate unit-of-work-dependency.md
- [x] Generate unit-of-work-story-map.md
- [x] Validate unit boundaries

---

## Decomposition Questions

Please fill in the `[Answer]:` tags below. Let me know when done.

---

### Question 1: Development Unit Structure
Based on the application design, the system naturally decomposes into these units. Which structure do you prefer?

A) 3 units — `backend-api` (Express + all backend logic), `frontend` (React SPA), `infrastructure` (Docker/K8s/DB configs)
B) 4 units — `backend-api`, `data-integration` (providers + repositories as a separate package), `frontend`, `infrastructure`
C) 2 units — `server` (full-stack: Express API + React served from same Node process), `infrastructure`
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2: Monorepo vs Separate Repos
How should the units be organized in the codebase?

A) Monorepo — all units in one repository under separate top-level folders (e.g., `backend/`, `frontend/`, `infrastructure/`)
B) Separate repositories — each unit in its own repo
C) Monorepo with npm workspaces — shared types/utilities as a workspace package
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3: Shared Types
The backend and frontend share data types (PropertyListing, RentalRate, ROIConfig, etc.). How should shared types be handled?

A) Duplicate types in both backend and frontend (simple, no shared package)
B) Shared `types` package in the monorepo (imported by both backend and frontend)
C) Types defined in backend, frontend uses generated OpenAPI client
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---
