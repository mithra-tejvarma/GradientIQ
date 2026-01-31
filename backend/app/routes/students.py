from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app.models.student import Student
from app.schemas.student import StudentSchema

router = APIRouter()


@router.get("/", response_model=List[StudentSchema])
def list_students(db: Session = Depends(get_db)):
    """Get all students."""
    students = db.query(Student).all()
    return students
