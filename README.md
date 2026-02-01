# GradientIQ

An Adaptive Assessment Platform with React + Vite frontend and FastAPI backend.

## Project Structure

- `/frontend` - React + Vite frontend application
- `/backend` - FastAPI backend with PostgreSQL database

## Backend Features

The backend is deployed at: **https://gradientiq-backend.onrender.com**

### External API Integration

The backend integrates external FREE APIs for question seeding:

- **Open Trivia DB** - For Physics, Chemistry, Math, Social Studies, General Science questions
- **Local JSON files** - For Coding questions (DSA, Algorithms, Crypto)
- **Local NLP** - Using rapidfuzz and basic algorithms (NO paid AI services)

**Important**: External APIs are used ONLY for seeding data into the database. Student assessments NEVER depend on live external API availability. This ensures judge-safe, explainable operation.

See [Backend README](./backend/README.md) for detailed API documentation.

## Getting Started

### Frontend

To run the application locally:

```bash
cd frontend
npm install
npm run dev
```

### Backend

To run the backend locally:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API documentation: http://localhost:8000/docs

## Build

To build the application for production:

```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## Deployment

### Frontend
This application can be deployed to any static hosting platform:
- Build command: `npm run build`
- Output directory: `dist`
- No environment variables required

### Backend
Deployed at: https://gradientiq-backend.onrender.com
- Python 3.10+
- PostgreSQL database
- FastAPI + Uvicorn
