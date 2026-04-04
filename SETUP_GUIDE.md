# MANGUONMO_REPORT - Full Setup Guide

## 1) Stack

- Backend: Django + DRF + SimpleJWT + PostgreSQL
- Frontend: React (Vite) + Tailwind + Radix + Zustand + Axios interceptor

## 2) Requirements

- Python 3.12+
- Node.js LTS
- PostgreSQL

## 3) Backend setup

### 3.1 Install dependencies

```powershell
venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### 3.2 Configure env

File: `backend/.env`

```env
DEBUG=True
SECRET_KEY=change-this-to-a-long-random-string-at-least-32-chars
ALLOWED_HOSTS=127.0.0.1,localhost,testserver

DB_NAME=learn_English
DB_USER=postgres
DB_PASSWORD=123321!@
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CORS_ALLOW_CREDENTIALS=True
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3.3 Migrate + seed

```powershell
venv\Scripts\python.exe backend\manage.py migrate
venv\Scripts\python.exe backend\manage.py seed_sample_data --clear
```

Demo account:

- username: `demo_user`
- password: `Demo12345!`

### 3.4 Run backend

```powershell
venv\Scripts\python.exe backend\manage.py runserver
```

Backend URLs:

- Root: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin/`
- API root: `http://127.0.0.1:8000/api/health/`

## 4) Frontend setup

### 4.1 Install dependencies

```powershell
cd frontend
npm install
```

If `npm` is not recognized in PowerShell session:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

### 4.2 Frontend env

File: `frontend/.env`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 4.3 Run frontend

```powershell
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

## 5) Main user screens

- `/login`: login
- `/register`: register
- `/onboarding`: placement test + setup learning path
- `/dashboard`: summary + recommended lesson + tracks
- `/learn/:slug`: lessons in a track
- `/lessons/:lessonId`: lesson detail (theory + key words + quiz)
- `/quiz/:quizId`: quiz player (timer, next/back, submit, explanation)
- `/study`: word practice session (typing mode)
- `/progress`: heatmap + weak tags + recent quiz attempts
- `/favorites`: so tay tu vung yeu thich
- `/settings`: profile + daily goal + learning goal + level
- `/words`: CRUD vocabulary (chi staff/admin noi bo)

## 6) Main APIs

Auth:

- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`

Learning and onboarding:

- `GET/POST /api/onboarding/placement/`
- `POST /api/learning-path/setup/`
- `GET /api/learning-path/me/`
- `GET /api/recommendations/next/`
- `GET /api/learning/tracks/`
- `GET /api/learning/tracks/{slug}/`
- `GET /api/learning/lessons/`
- `GET /api/learning/lessons/{lesson_id}/`
- `GET /api/quizzes/{quiz_id}/`
- `POST /api/quizzes/{quiz_id}/submit/`

Practice and progress:

- `POST /api/study/start/`
- `POST /api/study/sessions/{session_id}/answer/`
- `GET /api/study/history/`
- `GET /api/dashboard/`
- `GET /api/progress/overview/`
- `GET/PATCH /api/profile/me/`
- `GET/POST /api/favorites/words/`
- `DELETE /api/favorites/words/{word_id}/`

Vocabulary CRUD:

- `GET/POST /api/words/`
- `GET/PATCH/DELETE /api/words/{id}/`
- `GET/POST /api/topics/`
- `GET/POST /api/meanings/`
- `GET/POST /api/examples/`

## 7) Quick verify flow

1. Login with `demo_user / Demo12345!`
2. Go `/onboarding` and complete placement + learning path.
3. Open `/dashboard`, click `Mo bai hoc`.
4. In lesson detail, click `Lam quiz ngay`.
5. Submit quiz and verify result + explanation.
6. Open `/progress` to see heatmap and weak tags.
