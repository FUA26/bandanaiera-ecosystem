# Setup & Development Documentation - Design Spec

**Date:** 2026-04-23
**Status:** ✅ Implemented
**Target Audience:** Mixed (Junior & Senior Developers)

## Overview

Comprehensive documentation for Bandanaiera Admin project covering Docker setup, troubleshooting, and development workflow. Designed to be the single source of truth for onboarding new developers and serving as a reference for existing team members.

## Goals

1. **Reduce onboarding time** - New developers can be productive in under 30 minutes
2. **Self-service troubleshooting** - Reduce dependency on senior developers for common issues
3. **Consistent workflow** - Standardize GitFlow practices across the team
4. **Infrastructure as code** - Docker services for consistent development environments

## Design Decisions

### 1. Docker Strategy: Services Only

**Decision:** PostgreSQL and MinIO run in Docker; app runs on host machine.

**Rationale:**

- **Faster development** - Hot reload works better on host machine
- **Lower resource usage** - Not running Node in Docker for every developer
- **Flexibility** - Developers can choose to run app in Docker if needed
- **Consistent infrastructure** - Database and storage are always the same

**Trade-offs:**

- Requires Docker Desktop/Engine installed
- Slight complexity vs. all-in-one container
- Mitigated by providing docker-compose.dev.yml for full container option

### 2. Documentation Structure

Single comprehensive file (`docs/SETUP.md`) with clear sections:

```
1. Quick Start           - Get running in 6 commands
2. Docker Setup          - Infrastructure as code
3. Environment Config    - All variables explained
4. Database Setup        - Prisma workflows
5. Running the App       - Development & production
6. Development Workflow  - GitFlow guide
7. Troubleshooting       - Common issues & solutions
8. Useful Commands       - Cheat sheet
```

### 3. Troubleshooting by Category

Issues grouped by symptom rather than tool:

- **Database Issues** - Connection, migration, Prisma
- **Build/Dependency Issues** - Modules, TypeScript, ports
- **Environment Issues** - Secrets, endpoints, configuration

**Rationale:** Developers search by error message, not by which tool is failing.

### 4. GitFlow Documentation

**Structure:**

- **For Juniors:** Step-by-step with examples
- **For Seniors:** Quick reference commands

**Included:**

- Branch naming conventions
- Commit message format (conventional commits)
- PR checklist
- Pre-commit hooks explanation

## Implementation

### Files Created

| File                      | Purpose                      |
| ------------------------- | ---------------------------- |
| `docs/SETUP.md`           | Main documentation           |
| `docker-compose.yml`      | PostgreSQL + MinIO services  |
| `docker-compose.dev.yml`  | Optional app container       |
| `apps/support/Dockerfile` | Production build             |
| `.env.docker.example`     | Docker-specific env template |
| `.dockerignore`           | Build optimization           |

### Key Configurations

**PostgreSQL Service:**

- Port: 5432
- Credentials: bandanaiera/bandanaiera123
- Healthcheck enabled
- Persistent volume

**MinIO Service:**

- API Port: 9000
- Console Port: 9001
- Credentials: minioadmin/minioadmin123
- Healthcheck enabled
- Persistent volume

**Next.js Config:**

- Added `output: "standalone"` for production Docker builds
- Conditional (only in production)

### Default Credentials

| Service    | Username        | Password       |
| ---------- | --------------- | -------------- |
| App Admin  | admin@pisky.dev | admin123       |
| PostgreSQL | bandanaiera     | bandanaiera123 |
| MinIO      | minioadmin      | minioadmin123  |

## Success Criteria

✅ New developer can run the app in under 30 minutes
✅ Common issues have documented solutions
✅ Docker services start with single command
✅ Team follows consistent GitFlow practices
✅ Documentation is version-controlled with the codebase

## Future Enhancements

Out of scope for this implementation but worth considering:

1. **CI/CD Pipeline Documentation** - GitHub Actions or GitLab CI
2. **Production Deployment Guide** - Vercel, AWS, or self-hosted
3. **Testing Guide** - How to run and write tests
4. **Architecture Diagrams** - System design visualizations
5. **Contributing Guide** - For open source contributors

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
