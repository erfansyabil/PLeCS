from typing import Dict, List, Tuple

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

DIFFICULTY_ORDER = {
    'beginner': 0,
    'easy': 0,
    'intermediate': 1,
    'medium': 1,
    'advanced': 2,
    'hard': 2,
}

INTEREST_KEYWORDS = {
    'programming': ['programming', 'coding', 'python', 'javascript', 'software'],
    'networking': ['network', 'networking', 'internet', 'tcp', 'ip'],
    'cybersecurity': ['security', 'cyber', 'threat', 'protection', 'privacy'],
    'databases': ['database', 'sql', 'data', 'storage', 'schema'],
    'algorithms': ['algorithm', 'data structure', 'problem solving', 'optimization'],
    'digitaltools': ['digital', 'productivity', 'tools', 'office', 'application'],
}


class CatalogTopic(BaseModel):
    name: str = ''
    description: str = ''
    difficulty: str = 'Beginner'


class CatalogSubject(BaseModel):
    course_id: int
    course_title: str
    description: str = ''
    difficulty: str = 'Beginner'
    topics: List[CatalogTopic] = Field(default_factory=list)


class StudentProfile(BaseModel):
    survey: Dict[str, object] = Field(default_factory=dict)
    weak_topics: List[str] = Field(default_factory=list)
    strong_topics: List[str] = Field(default_factory=list)
    interest: str = ''
    level: str = ''
    learning_pace: str = ''
    catalog_subjects: List[CatalogSubject] = Field(default_factory=list)


def _difficulty_score(student_level: str, course_difficulty: str, learning_pace: str) -> Tuple[int, str]:
    student_rank = DIFFICULTY_ORDER.get((student_level or '').strip().lower(), 1)
    course_rank = DIFFICULTY_ORDER.get((course_difficulty or '').strip().lower(), 1)
    pace = (learning_pace or '').strip().lower()

    score = 50
    reasons = []

    if course_rank <= student_rank:
        score += 20
        reasons.append('matches learner level')
    elif course_rank == student_rank + 1:
        score += 10
        reasons.append('slightly challenging')
    else:
        score -= 10
        reasons.append('may be too advanced')

    if pace in {'light', 'moderate'} and course_rank <= 1:
        score += 10
        reasons.append('fits available study time')
    if pace == 'intensive' and course_rank >= 1:
        score += 10
        reasons.append('supports intensive study')

    return max(0, min(100, score)), ', '.join(reasons) if reasons else 'difficulty aligned'


def _interest_score(student_profile: StudentProfile, subject: CatalogSubject) -> Tuple[int, str]:
    search_text = ' '.join([
        student_profile.interest,
        ' '.join(student_profile.weak_topics),
        subject.course_title,
        subject.description,
        ' '.join(topic.name for topic in subject.topics),
        ' '.join(topic.description for topic in subject.topics),
    ]).lower()

    score = 0
    reasons = []

    for key, keywords in INTEREST_KEYWORDS.items():
        if key in (student_profile.interest or '').lower() or any(keyword in search_text for keyword in keywords):
            for keyword in keywords:
                if keyword in search_text:
                    score += 10
                    reasons.append(f'matches {keyword}')
                    break

    for topic in subject.topics:
        topic_text = f'{topic.name} {topic.description}'.lower()
        if any(weak.lower() in topic_text for weak in student_profile.weak_topics):
            score += 5
            reasons.append('covers weak topic')
            break

    if not reasons:
        reasons.append('broad curriculum fit')

    return min(60, score), ', '.join(dict.fromkeys(reasons))


def _build_learning_path(profile: StudentProfile) -> List[Dict[str, object]]:
    recommendations: List[Dict[str, object]] = []

    for subject in profile.catalog_subjects:
        difficulty_score, difficulty_reason = _difficulty_score(profile.level, subject.difficulty, profile.learning_pace)
        interest_score, interest_reason = _interest_score(profile, subject)
        total_score = difficulty_score + interest_score

        recommendations.append({
            'course_id': subject.course_id,
            'course_title': subject.course_title,
            'difficulty': subject.difficulty,
            'topics': [topic.model_dump() for topic in subject.topics],
            'reason': '; '.join([difficulty_reason, interest_reason]),
            'score': total_score,
        })

    recommendations.sort(key=lambda item: item['score'], reverse=True)
    return recommendations[:5]


@app.get('/')
def root():
    return {'message': 'PLeCS API running'}


@app.post('/recommend')
def recommend(profile: StudentProfile):
    learning_path = _build_learning_path(profile)

    return {
        'status': 'success',
        'learning_path': learning_path,
        'recommended_courses': learning_path,
    }