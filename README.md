# PLeCS — Personalized Learning Content System

PLeCS is a web-based Learning Management System (LMS) built for secondary-school students. It delivers personalized course content, gamified assessments (quizzes and coding exercises), AI-assisted learning path recommendations, and progress analytics, with dedicated experiences for three roles: **Student**, **Teacher**, and **Administrator**.

Built with **Laravel 12** on the backend and **React 18 + Inertia.js** on the frontend, sharing a single codebase and auth flow across all three roles.

## Features / Modules

### Student
- **Learning Content** — browse courses and topics, with rich content blocks and attachments.
- **Enrollment** — enroll/drop courses, view enrollment history and active enrollments.
- **Learning Path** — build and reorder a personalized learning path, or generate one automatically from a survey via the AI recommender.
- **Assessments** — attempt gamified quizzes (MCQ, auto-graded) and coding exercises (snippet-based grading), earning points, streaks, and badges.
- **Progress & Analytics** — view per-course/topic performance analytics, mastery predictions, and risk flags.
- **Feedback** — submit feedback on learning modules/topics.
- **Guidance** — view guidance messages left by teachers.
- **Low-bandwidth mode** — toggle a lightweight UI mode that hides heavy media.
- **Google OAuth login** in addition to standard email/password auth.

### Teacher
- **Topics** — view course/topic structure.
- **Additional Materials** — manage supplementary learning content per topic.
- **Feedback Overview** — review aggregated student feedback.
- **Guidance** — send feedback/guidance messages to individual students.

### Administrator
- **Learning Content Management** — full CRUD over courses, topics, and content blocks (rich-text editor via Tiptap), including image uploads.
- **Quiz Management** — full CRUD over quizzes and their questions/options.
- **Coding Exercise Management** — full CRUD over coding exercises and grading criteria.
- **Feedback Overview** — review aggregated student feedback across courses.

### AI Learning Path Recommendation
Given a student's survey answers and the current course catalog, a Hugging Face Space (Gradio-backed recommender) suggests a personalized set of courses, which is resolved back to course records in the database.

## Prerequisites

- **PHP** >= 8.2 with the extensions Laravel 12 requires (mbstring, openssl, PDO, tokenizer, xml, ctype, json, bcmath, fileinfo)
- **Composer** 2.x
- **Node.js** >= 18 and npm
- **MySQL** (or another Laravel-supported database — MySQL is the default configured connection)
- **Python 3** with the [`gradio_client`](https://pypi.org/project/gradio-client/) package installed — required only for the AI learning-path recommendation feature (invoked via `storage/scripts/hf_recommend.py`)
- A **Google OAuth 2.0 Client ID/Secret** — required only for "Sign in with Google"

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PLeCS
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Then edit `.env` and set:
   - `DB_*` — your MySQL connection details (create the `plecs` database beforehand, or point `DB_DATABASE` at an existing one)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (and matching `VITE_GOOGLE_CLIENT_ID`) — for Google login
   - `HUGGINGFACE_SPACE_URL` / `HUGGINGFACE_API_TOKEN` — for the AI recommender feature

5. **Run database migrations** (and seed sample data, optional)
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Install Python dependency for the AI recommender** (optional, only needed for learning-path recommendations)
   ```bash
   pip install gradio_client
   ```

7. **Start the development environment**

   Full stack (PHP server + queue worker + log viewer + Vite HMR, all in one command):
   ```bash
   composer dev
   ```

   Or lightweight (Vite + `artisan serve` only):
   ```bash
   npm run dev
   ```

8. **Visit the app** at [http://localhost:8000](http://localhost:8000)

## Useful Commands

```bash
# Run the full test suite
composer test
# or
php artisan test

# Run a single test file
php artisan test tests/Feature/SomeTest.php

# Lint/format PHP code
./vendor/bin/pint

# Production frontend build
npm run build
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 18, Inertia.js, Tailwind CSS v3, Vite 6 |
| Auth | Laravel Breeze (email/password) + Google OAuth (Socialite) |
| Routing helper | Ziggy (Laravel routes usable in React via `route()`) |
| Rich text editor | Tiptap |
| AI recommendations | Hugging Face Space via Gradio Client (Python bridge) |
