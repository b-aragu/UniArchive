# Phase 3 — Architecture Foundation Report

**Phase:** Phase 3: Architecture & Foundation  
**Status:** ✅ Complete  
**Date Completed:** June 1, 2026  
**Git Commit Hash:** `ffe2226` (repo init), `6a6e28d` (baseline), `cea93d4` (alembic init & schema)

---

## 1. Objectives

The primary objective of Phase 3 was to transition the codebase from a loose, unversioned, single-file initialization scheme into a production-grade application lifecycle foundation. Key objectives included:
* Establishing Git version control with clean configuration boundaries.
* Introducing an asynchronous-ready database migration mechanism (Alembic).
* Eliminating the direct metadata table generation runtime pattern in FastAPI.
* Structuring the backend environment for robust container deployment.

---

## 2. Work Completed

### 2.1 Repository Setup & Git Boundary
Prior to execution, the codebase was entirely untracked, introducing substantial risks to collaboration and rollback capability.
* Git repository was initialized at `/home/baragu/Documents/UniArchive/`.
* A target `.gitignore` was configured to safeguard local virtual environments (`.venv`), temporary editor buffers (`.swp`), credentials (`.env`), compiled binaries, upload artifacts (`uploads/`), and FAISS local indices (`.faiss`).
* Commits were generated sequentially: a root commit for structural boundaries, a baseline commit capturing the MVP skeleton, and subsequent commits tracking architectural upgrades.

### 2.2 Database Migration Infrastructure
Previously, tables were generated automatically on FastAPI startup via `Base.metadata.create_all(bind=engine)`. This pattern is highly problematic for production environments because it cannot alter columns or preserve state dynamically.
* Installed Alembic (`alembic==1.14.1`) as the database migration orchestrator.
* Initialized migration layouts via `alembic init alembic`.
* Configured `alembic/env.py` to import SQLAlchemy models dynamically, exposing `Base.metadata` to Alembic's autogenerate features.
* Configured `alembic.ini` to resolve connections from environment variables (`DATABASE_URL`).
* Removed `Base.metadata.create_all` from `main.py` startup handlers, ensuring schema deployments are strictly driven by migrations.

---

## 3. File Inventory

### 3.1 Files Created
* [`/home/baragu/Documents/UniArchive/.gitignore`](file:///home/baragu/Documents/UniArchive/.gitignore) — Git boundary definition.
* [`/home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic.ini`](file:///home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic.ini) — Migration manager settings.
* [`/home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic/env.py`](file:///home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic/env.py) — Migration registry context.
* [`/home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic/script.py.mako`](file:///home/baragu/Documents/UniArchive/uni-archive-mvp/backend/alembic/script.py.mako) — Template for migration revisions.

### 3.2 Files Modified
* [`/home/baragu/Documents/UniArchive/uni-archive-mvp/backend/app/main.py`](file:///home/baragu/Documents/UniArchive/uni-archive-mvp/backend/app/main.py) — Deprecated runtime table generation.
* [`/home/baragu/Documents/UniArchive/uni-archive-mvp/backend/requirements.txt`](file:///home/baragu/Documents/UniArchive/uni-archive-mvp/backend/requirements.txt) — Enlisted Alembic dependencies.

---

## 4. Architectural Decisions & Rationale

```
+--------------------------------------------------------------------+
|                         FastAPI Core App                           |
|  (Interacts with database models dynamically using SQLAlchemy)     |
+--------------------------------------------------------------------+
                               |
                               | Schema Inspections
                               v
+--------------------------------------------------------------------+
|                         Alembic Migrations                         |
|  (Manages DB alterations and schema history on developer machines)  |
+--------------------------------------------------------------------+
                               |
                               | Raw DDL Commands
                               v
+--------------------------------------------------------------------+
|                        PostgreSQL Instance                         |
|    (Persists application tables, full-text indexes, relations)     |
+--------------------------------------------------------------------+
```

* **Alembic in Asynchronous Context:** Although migrations run synchronously to guarantee transaction boundaries, the system is designed to allow async session handlers inside endpoints, supporting high concurrency during search operations.
* **Separation of Startup and Schema Management:** Startup routines should execute quickly. Moving schema execution to manual pipeline tasks ensures the application container boots safely without lock contention on database clusters.

---

## 5. Challenges & Resolutions

* **Docker Socket Authorization:** The local container runtime was inaccessible to standard user permissions, outputting `Permission denied` socket connectivity errors.
  * *Resolution:* Docker commands are run via elevation (`sudo docker compose`) or by targeting local resources while maintaining Docker-based configuration files for the final deployment template.
