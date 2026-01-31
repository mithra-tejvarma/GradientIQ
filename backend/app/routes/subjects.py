from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.models.subject import Subject
from app.schemas.subject import SubjectSchema

router = APIRouter()


@router.get("/", response_model=List[SubjectSchema])
def list_subjects(db: Session = Depends(get_db)):
    """Get all subjects."""
    subjects = db.query(Subject).all()
    return subjects
