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

### External API Integration

These endpoints handle question seeding from external free APIs and provide transparency about external integrations.

#### Seed Questions (Faculty Only)
- **POST /external/seed/questions** - Seed questions from Open Trivia DB and local JSON files
  
  **Authentication Required**: Faculty role only
  
  **Purpose**: Populate the database with educational questions from external sources. Once seeded, questions are served from the database during assessments WITHOUT any live API dependency.
  
  Request body:
  ```json
  {
    "subjects": ["Physics", "Chemistry", "Math"],
    "amount_per_subject": 10,
    "include_coding": true
  }
  ```
  
  Response:
  ```json
  {
    "status": "success",
    "message": "Seeding operation completed for 3 subjects and coding questions",
    "results": [
      {
        "status": "success",
        "message": "Successfully seeded 10 questions for Physics",
        "questions_created": 10,
        "subject": "Physics",
        "topic": "Physics - General"
      }
    ]
  }
  ```
  
  **Supported Subjects for Trivia DB**:
  - Physics
  - Chemistry
  - Math
  - Social Studies
  - General Science
  
  **Coding Questions** (from local JSON):
  - DSA (Data Structures & Algorithms)
  - Algorithms
  - Crypto (Cryptography)

#### Get External Integration Status
- **GET /external/status** - Get transparency information about external API usage
  
  **Purpose**: Provides clear documentation of all external dependencies and their limited scope.
  
  Response:
  ```json
  {
    "trivia_db": {
      "status": "enabled",
      "source": "Open Trivia DB (https://opentdb.com)",
      "purpose": "Question seeding ONLY - not used during assessments",
      "subjects_supported": ["Physics", "Chemistry", "Math", "Social Studies", "General Science"],
      "authentication": "None required (free public API)",
      "note": "All questions are cached in database. Assessments are NOT dependent on external API availability."
    },
    "coding_questions": {
      "status": "local",
      "source": "Predefined JSON files",
      "purpose": "Seeded once into database",
      "subjects_supported": ["Coding"],
      "topics": ["DSA", "Algorithms", "Crypto"],
      "note": "No external API dependency. All coding questions are stored locally."
    },
    "nlp": {
      "status": "local",
      "source": "Local Python libraries (rapidfuzz, basic NLP)",
      "purpose": "Text analysis for originality and pattern detection",
      "capabilities": [
        "Similarity detection (rapidfuzz)",
        "Repetition detection (local)",
        "Writing flow analysis (sentence variance)",
        "Originality scoring (cosine similarity)"
      ],
      "note": "NO paid AI APIs. NO OpenAI. Everything is explainable and local."
    }
  }
  ```

### Judge-Safe Implementation

This system is designed to be transparent and judge-safe:

✅ **External APIs used ONLY for seeding** - Never during live assessments  
✅ **All data cached in database** - No live API dependencies  
✅ **No black-box AI** - No OpenAI, no paid AI services  
✅ **Local NLP analysis** - Using open-source libraries (rapidfuzz)  
✅ **Everything explainable** - All algorithms are transparent and documented  
✅ **Faculty-controlled seeding** - Only faculty can seed new questions

### External API Integration (Faculty Only)

#### Seed Questions from External APIs
- **POST /external/seed/questions** - Seed questions from Open Trivia DB
  
  **Authentication Required**: Faculty role
  
  Request body:
  ```json
  {
    "subjects": ["Physics", "Chemistry", "Math"],
    "amount_per_subject": 10,
    "include_coding": true
  }
  ```
  
  Response:
  ```json
  {
    "status": "success",
    "message": "Seeding operation completed for 3 subjects and coding questions",
    "results": [...]
  }
  ```
  
  **Important**: This endpoint is used ONLY for seeding questions into the database.
  Assessments do NOT depend on external API availability.

#### Get External API Status
- **GET /external/status** - Get transparency info about external integrations
  
  Response:
  ```json
  {
    "trivia_db": {
      "status": "enabled",
      "purpose": "Question seeding ONLY - not used during assessments",
      "subjects_supported": ["Physics", "Chemistry", "Math", "Social Studies", "General Science"]
    },
    "coding_questions": {
      "status": "local",
      "source": "Predefined JSON files"
    },
    "nlp": {
      "status": "local",
      "source": "Local Python libraries (rapidfuzz, basic NLP)",
      "note": "NO paid AI APIs. NO OpenAI. Everything is explainable and local."
    }
  }
  ```

## External API Integration

### Philosophy

This system uses external APIs **ONLY** for data seeding and enrichment, **NEVER** during live assessments:

1. **Open Trivia DB** - Free public API for educational questions
   - Used to populate database with Physics, Chemistry, Math, etc. questions
   - Questions are cached in PostgreSQL
   - Assessments serve questions from database, not from live API

2. **Coding Questions** - Local JSON files
   - No external API dependency
   - Predefined questions for DSA, Algorithms, and Cryptography
   - Loaded once into database

3. **NLP Analysis** - Local libraries only
   - rapidfuzz for text similarity
   - Basic algorithms for pattern detection
   - NO OpenAI or paid AI services
   - Everything is explainable and judge-safe

### Judge-Safe Guarantees

✓ External APIs used ONLY for seeding, not during assessments  
✓ All data cached in database  
✓ No black-box AI  
✓ No live API dependencies during student assessments  
✓ Everything is transparent and explainable
