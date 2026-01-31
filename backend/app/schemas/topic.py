from pydantic import BaseModel


class TopicSchema(BaseModel):
    id: int
    name: str
    subject_id: int

    class Config:
        from_attributes = True
