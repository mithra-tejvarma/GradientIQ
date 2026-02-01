import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.question import Question, CognitiveType
from app.models.capability import CapabilityScore
from app.auth.auth_utils import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_demo_data():
    db: Session = SessionLocal()
    try:
        logger.info("Starting demo data seeding...")
        
        # Create faculty user
        faculty_email = "demo.faculty@gradientiq.com"
        faculty = db.query(User).filter(User.email == faculty_email).first()
        if not faculty:
            faculty = User(
                name="Demo Faculty",
                email=faculty_email,
                role=UserRole.faculty,
                hashed_password=get_password_hash("demo123")
            )
            db.add(faculty)
            db.commit()
            db.refresh(faculty)
            logger.info(f"Created faculty: {faculty.name}")
        else:
            logger.info(f"Faculty already exists: {faculty.name}")
        
        # Create student users
        students = []
        student_data = [
            ("Alice Johnson", "alice.demo@gradientiq.com"),
            ("Bob Smith", "bob.demo@gradientiq.com"),
            ("Charlie Davis", "charlie.demo@gradientiq.com")
        ]
        
        for name, email in student_data:
            student = db.query(User).filter(User.email == email).first()
            if not student:
                student = User(
                    name=name,
                    email=email,
                    role=UserRole.student,
                    hashed_password=get_password_hash("demo123")
                )
                db.add(student)
                db.commit()
                db.refresh(student)
                logger.info(f"Created student: {student.name}")
            else:
                logger.info(f"Student already exists: {student.name}")
            students.append(student)
        
        # Create subjects
        subjects_data = [
            ("Coding", "Programming and software development concepts"),
            ("Physics", "Fundamental physics principles and applications"),
            ("Cryptography", "Encryption and information security")
        ]
        
        subjects = []
        for subject_name, description in subjects_data:
            subject = db.query(Subject).filter(Subject.name == subject_name).first()
            if not subject:
                subject = Subject(name=subject_name, description=description)
                db.add(subject)
                db.commit()
                db.refresh(subject)
                logger.info(f"Created subject: {subject.name}")
            else:
                logger.info(f"Subject already exists: {subject.name}")
            subjects.append(subject)
        
        # Create topics for each subject
        topics_data = {
            "Coding": [
                ("Variables and Data Types", "easy"),
                ("Control Flow", "medium"),
                ("Functions and Recursion", "hard"),
                ("Object-Oriented Programming", "hard")
            ],
            "Physics": [
                ("Newton's Laws", "easy"),
                ("Energy and Work", "medium"),
                ("Thermodynamics", "hard"),
                ("Quantum Mechanics", "hard")
            ],
            "Cryptography": [
                ("Basic Encryption", "easy"),
                ("Hash Functions", "medium"),
                ("Public Key Cryptography", "hard"),
                ("Blockchain Fundamentals", "hard")
            ]
        }
        
        topics = []
        for subject in subjects:
            if subject.name in topics_data:
                for topic_name, difficulty in topics_data[subject.name]:
                    topic = db.query(Topic).filter(
                        Topic.subject_id == subject.id,
                        Topic.name == topic_name
                    ).first()
                    if not topic:
                        topic = Topic(
                            subject_id=subject.id,
                            name=topic_name,
                            difficulty_range=difficulty
                        )
                        db.add(topic)
                        db.commit()
                        db.refresh(topic)
                        logger.info(f"Created topic: {topic.name} for {subject.name}")
                    else:
                        logger.info(f"Topic already exists: {topic.name}")
                    topics.append(topic)
        
        # Create sample questions for each topic
        cognitive_types = [CognitiveType.conceptual, CognitiveType.procedural]
        for topic in topics:
            existing_questions = db.query(Question).filter(Question.topic_id == topic.id).count()
            if existing_questions < 5:
                questions_to_create = 5 - existing_questions
                for i in range(questions_to_create):
                    difficulty_map = {"easy": (1, 3), "medium": (4, 7), "hard": (8, 10)}
                    difficulty_range = difficulty_map.get(topic.difficulty_range, (5, 5))
                    difficulty_level = (difficulty_range[0] + difficulty_range[1]) // 2
                    
                    cognitive_type = cognitive_types[i % 2]
                    question_text = f"Sample {cognitive_type.value} question for {topic.name} - Q{i+1}"
                    
                    question = Question(
                        topic_id=topic.id,
                        question_text=question_text,
                        difficulty_level=difficulty_level,
                        cognitive_type=cognitive_type,
                        expected_concepts=["concept1", "concept2"]
                    )
                    db.add(question)
                db.commit()
                logger.info(f"Created {questions_to_create} questions for topic: {topic.name}")
            else:
                logger.info(f"Questions already exist for topic: {topic.name}")
        
        # Create capability scores for students
        for student in students:
            for topic in topics:
                capability = db.query(CapabilityScore).filter(
                    CapabilityScore.user_id == student.id,
                    CapabilityScore.topic_id == topic.id
                ).first()
                if not capability:
                    initial_score = 50
                    if "easy" in topic.difficulty_range:
                        initial_score = 60
                    elif "hard" in topic.difficulty_range:
                        initial_score = 40
                    
                    capability = CapabilityScore(
                        user_id=student.id,
                        topic_id=topic.id,
                        capability_level=initial_score,
                        streak=0
                    )
                    db.add(capability)
        
        db.commit()
        logger.info("Created capability scores for students")
        
        logger.info("Demo data seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding demo data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def clear_demo_data():
    db: Session = SessionLocal()
    try:
        logger.info("Clearing demo data...")
        
        # Delete in reverse order of dependencies
        demo_emails = [
            "demo.faculty@gradientiq.com",
            "alice.demo@gradientiq.com",
            "bob.demo@gradientiq.com",
            "charlie.demo@gradientiq.com"
        ]
        
        for email in demo_emails:
            user = db.query(User).filter(User.email == email).first()
            if user:
                db.query(CapabilityScore).filter(CapabilityScore.user_id == user.id).delete()
                db.delete(user)
        
        demo_subjects = ["Coding", "Physics", "Cryptography"]
        for subject_name in demo_subjects:
            subject = db.query(Subject).filter(Subject.name == subject_name).first()
            if subject:
                topics = db.query(Topic).filter(Topic.subject_id == subject.id).all()
                for topic in topics:
                    db.query(Question).filter(Question.topic_id == topic.id).delete()
                    db.delete(topic)
                db.delete(subject)
        
        db.commit()
        logger.info("Demo data cleared successfully!")
        
    except Exception as e:
        logger.error(f"Error clearing demo data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    Base.metadata.create_all(bind=engine)
    
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        clear_demo_data()
    else:
        seed_demo_data()
