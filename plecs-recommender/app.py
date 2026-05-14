from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

app = FastAPI()

DIFFICULTY_ORDER = {
    "beginner": 0,
    "easy": 0,
    "intermediate": 1,
    "medium": 1,
    "advanced": 2,
    "hard": 2,
}

INTEREST_KEYWORDS = {
    "programming": ["programming", "coding", "python", "development"],
    "networking": ["network", "internet", "web"],
    "cybersecurity": ["security", "cyber", "privacy"],
    "databases": ["database", "sql", "data"],
    "algorithms": ["algorithm", "logic", "problem solving"],
    "digitaltools": ["digital", "tools", "productivity"],
    "ai": ["ai", "artificial intelligence", "machine learning"],
}


class CatalogSubject(BaseModel):
    course_id: int
    course_title: str
    description: str = ""
    difficulty: str = "Beginner"
    topics: List[str] = Field(default_factory=list)


class StudentProfile(BaseModel):
    weak_topics: List[str] = Field(default_factory=list)
    strong_topics: List[str] = Field(default_factory=list)
    interest: str = ""
    level: str = "beginner"
    learning_pace: str = "moderate"
    survey: Optional[Dict[str, Any]] = None
    catalog_subjects: List[CatalogSubject] = Field(default_factory=list)


@app.get("/")
def root():
    return {"message": "PLeCS API running"}


def _normalize_text(value: str) -> str:
    return (value or "").strip().lower()


def _difficulty_score(level: str, course_difficulty: str, pace: str) -> int:
    student_level = DIFFICULTY_ORDER.get(_normalize_text(level), 0)
    course_level = DIFFICULTY_ORDER.get(_normalize_text(course_difficulty), 0)
    pace_value = _normalize_text(pace)

    score = 0

    if course_level <= student_level + 1:
        score += 2
    elif course_level == student_level + 2:
        score += 1

    if pace_value in {"light", "basic", "none"} and course_level == 0:
        score += 1
    if pace_value in {"moderate", "intermediate"} and course_level in {1, 2}:
        score += 1
    if pace_value in {"intensive", "advanced"} and course_level >= 1:
        score += 1

    return score


def _interest_score(subject: CatalogSubject, survey: Dict[str, Any], weak_topics: List[str], strong_topics: List[str]) -> tuple[int, str]:
    haystack = " ".join([
        subject.course_title,
        subject.description,
        " ".join(subject.topics),
    ]).lower()

    score = 0
    reasons: List[str] = []

    interests = survey.get("interests", []) if survey else []
    career_goal = _normalize_text(survey.get("career_goals", "")) if survey else ""

    for interest in interests:
        interest_text = _normalize_text(str(interest))
        keywords = INTEREST_KEYWORDS.get(interest_text, [interest_text])

        if any(keyword in haystack for keyword in keywords if keyword):
            score += 3
            reasons.append(f"matches interest '{interest}'")

    if career_goal in {"career_interest", "skill_development", "general_interest"}:
        if any(keyword in haystack for keyword in ["programming", "development", "technology", "skills"]):
            score += 1

    for topic in weak_topics:
        topic_text = _normalize_text(str(topic))
        if topic_text and topic_text in haystack:
            score += 2
            reasons.append(f"supports weak topic '{topic}'")

    for topic in strong_topics:
        topic_text = _normalize_text(str(topic))
        if topic_text and topic_text in haystack:
            score += 1

    if not reasons:
        reasons.append("fits the current survey profile")

    return score, "; ".join(dict.fromkeys(reasons))


def _build_learning_path(profile: StudentProfile) -> List[Dict[str, Any]]:
    survey = profile.survey or {}
    subjects = profile.catalog_subjects

    if not subjects:
        subjects = [
            CatalogSubject(
                course_id=index + 1,
                course_title=topic,
                description="",
                difficulty="Beginner",
                topics=[topic],
            )
            for index, topic in enumerate(profile.weak_topics or ["Introduction to Computing", "Basic Programming Concepts"])
        ]

    scored_subjects: List[Dict[str, Any]] = []

    for subject in subjects:
        interest_score, reason = _interest_score(subject, survey, profile.weak_topics, profile.strong_topics)
        total_score = interest_score + _difficulty_score(profile.level, subject.difficulty, profile.learning_pace)

        scored_subjects.append({
            "course_id": subject.course_id,
            "course_title": subject.course_title,
            "topic": subject.course_title,
            "difficulty": subject.difficulty,
            "topics": subject.topics,
            "reason": reason,
            "score": total_score,
        })

    scored_subjects.sort(key=lambda item: (-item["score"], _normalize_text(item["difficulty"]), _normalize_text(item["course_title"])))

    return scored_subjects[:5]


@app.post("/recommend")
def recommend(profile: StudentProfile):
    path = _build_learning_path(profile)

    weekly_schedule = []
    for index, subject in enumerate(path, start=1):
        weekly_schedule.append({
            "week": index,
            "course_id": subject["course_id"],
            "topics": subject["topics"][:2] if subject["topics"] else [subject["course_title"]],
            "hours": 2 if _normalize_text(subject["difficulty"]) in {"beginner", "easy"} else 3,
        })

    return {
        "status": "success",
        "learning_path": path,
        "recommended_courses": path,
        "weekly_schedule": weekly_schedule,
    }