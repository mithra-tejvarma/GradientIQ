from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db.base import Base
from app.routes import students_router, subjects_router, topics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup (if needed)


# Create FastAPI instance
app = FastAPI(
    title="Adaptive Assessment System",
    description="Backend API for adaptive assessment platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(students_router, prefix="/students", tags=["students"])
app.include_router(subjects_router, prefix="/subjects", tags=["subjects"])
app.include_router(topics_router, prefix="/topics", tags=["topics"])

# Root endpoint
@app.get("/")
def read_root():
    return {
        "status": "Backend running",
        "service": "Adaptive Assessment System"
    }
