from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class StudentProfile(BaseModel):
    weak_topics: List[str]
    strong_topics: List[str]
    interest: str
    level: str
    learning_pace: str

@app.get("/")
def root():
    return {"message": "PLeCS API running"}

@app.post("/recommend")
def recommend(profile: StudentProfile):
    path = []

    for topic in profile.weak_topics:
        path.append({
            "topic": topic,
            "difficulty": "Easy"
        })

    if profile.interest.lower() == "artificial intelligence":
        path.append({
            "topic": "Introduction to AI",
            "difficulty": "Medium"
        })

    if profile.strong_topics:
        path.append({
            "topic": "Algorithms",
            "difficulty": "Hard"
        })

    return {
        "status": "success",
        "learning_path": path
    }