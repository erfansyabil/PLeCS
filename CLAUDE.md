# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is PLeCS

**P**ersonalized **Le**arning **C**ontent **S**ystem — a Laravel 12 + Inertia.js + React 18 LMS for secondary-school students. Three roles (student, teacher, administrator) share the same auth flow but see different layouts and route groups.

## Commands

```bash
# Full development stack (PHP server + queue worker + Pail log viewer + Vite HMR)
composer dev

# Lightweight dev (Vite + artisan serve only)
npm run dev

# Production build
npm run build

# Run all tests
composer test
# or
php artisan test

# Run a single test file
php artisan test tests/Feature/SomeTest.php

# Run migrations
php artisan migrate

# Laravel code style linter
./vendor/bin/pint
```

## Architecture

### Stack

- **Backend**: Laravel 12 (PHP 8.2+), Inertia.js server adapter (`inertiajs/inertia-laravel`)
- **Frontend**: React 18 via `@inertiajs/react`, Tailwind CSS v3, Vite 6
- **Auth**: Laravel Breeze (email/password) + Google OAuth via `laravel/socialite`
- **Routing helper**: Ziggy (`tightenco/ziggy`) — routes are available in React as `route('name')`
- **Rich text**: Tiptap editor in admin content pages

### Role system

Roles are stored as a plain string column on `users.role`: `student`, `teacher`, `administrator`. Route groups are guarded by `middleware('role:teacher')` / `middleware('role:administrator')`, implemented in `app/Http/Middleware/RoleMiddleware.php`. The `DashboardController` selects data and the Inertia layout (`StudentLayout`, `TeacherLayout`, `AdministratorLayout`) based on `$user->role`.

### Data model overview

```
LearningContent (courses, type='course')
  └── Topic (topics table, PK = topicID, FK courseID)
        └── Quiz (quizzes table, FK topic_id → topics.topicID)
              └── QuizAttempt
  └── CodingExercise (FK course_id)
        └── CodingExerciseAttempt
  └── LearningContentBlock  (rich content blocks)
  └── LearningContentAttachment

User
  └── Enrollment (FK studentID, courseID, pathID)
  └── LearningPath ←→ LearningContent (pivot: order)
  └── Analytic (per student/topic: avg score, risk_flag, predicted_mastery_date)
  └── Feedback (per student/topic)
  └── Guidance (teacher → student per topic)
```

**Important quirk — `Topic` model**: the primary key is `topicID`, not `id`. The model exposes `id`, `title`, `type`, `parent_id` as virtual `$appends` accessors so views that expect a standard `LearningContent` shape still work when handed a `Topic`.

### Content hierarchy

A `LearningContent` row with `type='course'` is the top-level course. Topics sit in their own `topics` table (with `courseID` FK) rather than as child `LearningContent` rows, even though the `LearningContent` model has a `children()` relationship. Always query topics via `Topic::where('courseID', ...)` — don't rely on `LearningContent::children()` for topics.

### Assessment / scoring

Both quiz and coding-exercise grading happen **server-side** in `AssessmentController`:

- **Quiz**: MCQ, answers matched by UUID option ID (`correct_option_id`). Pass threshold = 60% of max score.
- **Coding exercise**: snippet-based — checks `str_contains` of each `must_contain` string against submitted code (case-insensitive). Same 60% pass threshold.

After every attempt, `StudentProgressService::recordAttempt()` is called to update points, streak counter, and badge evaluation in a single DB transaction.

### AI learning-path recommendation

`LearningPathController` calls a Hugging Face Space (`ethe1k/plecs-recommender`) via the Python bridge at `storage/scripts/hf_recommend.py` using `shell_exec`. The script receives the student survey answers and the current course catalog as a temp JSON file, returns a JSON list of recommended courses, and the controller resolves them to DB course IDs. The HF Space uses the Gradio Client library — Python and `gradio_client` must be installed server-side for this feature to work.

### Inertia shared props

`HandleInertiaRequests::share()` always sends:
- `auth.user` — full authenticated user model (including `role`, `points`, `streak_days`, `badges`, `low_bandwidth_mode`)
- `flash.success` / `flash.error` — session flash values

### Low-bandwidth mode

Students can toggle a `low_bandwidth_mode` boolean on their user record via `PATCH /student/preferences/low-bandwidth`. `StudentLayout` reads this from `usePage().props.auth.user` and adds/removes a `low-bandwidth` CSS class on `document.body`, which can be used to conditionally hide heavy media via CSS.

### Route naming convention

| Prefix | Middleware | Named prefix |
|---|---|---|
| `/student/...` | `auth`, `verified` | `student.` |
| `/teacher/...` | `auth`, `verified`, `role:teacher` | `teacher.` |
| `/admin/...` | `auth`, `verified`, `role:administrator` | `admin.` |

Quiz routes embed the full hierarchy: `student.assessment.quiz.show` → `/student/assessment/{course}/topics/{topic}/quizzes/{quiz}`.

### Frontend page structure

Pages live in `resources/js/Pages/{Role}/{Feature}/`.  
Layouts in `resources/js/Layouts/` — the correct layout is selected by the PHP controller and passed as a prop (`layout`), not inferred by the page component itself (see `Dashboard.jsx`).  
Shared UI primitives are in `resources/js/Components/ui/`; navigation components in `Components/nav/`.
