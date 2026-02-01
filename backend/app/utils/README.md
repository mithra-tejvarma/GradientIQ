# Demo Utilities

This directory contains utilities for demo and hackathon presentations.

## Files

### seed_data.py
Demo data seeder that creates sample data for presentations.

**Usage:**
```bash
# Seed demo data
python -m app.utils.seed_data

# Clear demo data
python -m app.utils.seed_data clear
```

**Creates:**
- 1 faculty user (demo.faculty@gradientiq.com / password: demo123)
- 3 student users (alice.demo@gradientiq.com, bob.demo@gradientiq.com, charlie.demo@gradientiq.com / password: demo123)
- 3 subjects: Coding, Physics, Cryptography
- 4 topics per subject (12 total)
- 5 questions per topic (60 total)
- Capability scores for each student-topic combination

**Features:**
- Idempotent (safe to run multiple times)
- Easy to delete with `clear` command
- Uses existing models (no schema changes)

### health_check.py
Health check endpoint for monitoring system status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "auth": "ready",
  "assessment_engine": "ready",
  "nlp_layer": "ready"
}
```

## Environment Variables

### DEMO_MODE
Enable demo mode for faster assessment flow.

**Usage:**
```bash
DEMO_MODE=true python -m uvicorn app.main:app
```

**Default:** `false` (production-safe)

**Effect:** When enabled, can skip heavy validations and allow fast assessment flow for demos.

## Notes

- All utilities are optional and safe to use
- No core logic is modified
- Production-safe defaults
- No hardcoded secrets
- Clean logging throughout
