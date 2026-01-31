# GradientIQ Backend

Backend API for the Adaptive Assessment Platform built with FastAPI.

## Tech Stack

- **Python 3.10+**
- **FastAPI** - Modern web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database (with SQLite fallback)
- **Uvicorn** - ASGI server

## Getting Started

### Prerequisites

- Python 3.10 or higher
- PostgreSQL (optional, SQLite will be used as fallback)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

### Running the Server

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative API docs**: http://localhost:8000/redoc

## Project Structure

```
backend/
│── app/
│   ├── main.py          # FastAPI application entry point
│   ├── core/
│   │   └── config.py    # Configuration settings
│   ├── db/
│   │   ├── database.py  # Database connection setup
│   │   └── base.py      # Base model imports
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── routes/          # API route handlers
│   └── services/        # Business logic
│
│── requirements.txt     # Python dependencies
│── .env.example         # Example environment variables
│── README.md            # This file
```

## Database

The backend uses PostgreSQL as the primary database. If PostgreSQL is not available, it will fall back to SQLite for development purposes.

### Database URL Format

PostgreSQL:
```
DATABASE_URL=postgresql://user:password@localhost:5432/gradientiq
```

SQLite (fallback):
```
DATABASE_URL=sqlite:///./gradientiq.db
```

## API Endpoints

### Health Check
- **GET /** - Returns backend status
  ```json
  {
    "status": "Backend running",
    "service": "Adaptive Assessment System"
  }
  ```
