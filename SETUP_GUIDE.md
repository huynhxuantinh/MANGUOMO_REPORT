# MANGUONMO_REPORT - Setup Guide (Windows/PowerShell)

## 1) Stack

- Backend: Django 6 + DRF + SimpleJWT
- Frontend: React (Vite) + Tailwind + Radix
- Database hiện tại: SQLite (file `backend/db.sqlite3`)

## 2) Requirements

- Python 3.12+
- Node.js LTS + npm
- PowerShell

## 3) Cài đặt lần đầu

Chạy tại thư mục gốc project:

```powershell
python -m venv venv
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r backend\requirements.txt

cd frontend
npm install
cd ..
```

## 4) Cấu hình môi trường

### 4.1 Backend `.env`

Nếu chưa có file `backend/.env`:

```powershell
Copy-Item backend\.env.example backend\.env
```

Nội dung mẫu:

```env
DEBUG=True
SECRET_KEY=change-this-to-a-long-random-string-at-least-32-chars
ALLOWED_HOSTS=127.0.0.1,localhost,testserver

DB_NAME=learn_English
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CORS_ALLOW_CREDENTIALS=True
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Luu y: hien tai `backend/config/settings.py` dang dung SQLite mac dinh, nen `DB_*` chua duoc ap dung.

### 4.2 Frontend `.env`

Khong bat buoc cho local dev vi Vite dang proxy `/api` sang `http://localhost:8000`.

## 5) Khoi tao database va data mau

```powershell
venv\Scripts\python.exe backend\manage.py migrate
venv\Scripts\python.exe backend\manage.py seed_sample_data --clear
```

Demo account:

- username: `demo_user`
- password: `Demo12345!`

## 6) Chay du an

Mo 2 terminal rieng.

Terminal 1 (backend):

```powershell
venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```

Terminal 2 (frontend):

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

URL:

- Frontend: `http://127.0.0.1:5173/`
- Backend root: `http://127.0.0.1:8000/`
- Backend health: `http://127.0.0.1:8000/api/health/`
- Admin: `http://127.0.0.1:8000/admin/`

## 7) Verify nhanh

1. Mo `http://127.0.0.1:8000/api/health/` (phai tra ve HTTP 200).
2. Mo `http://127.0.0.1:5173/`.
3. Dang nhap bang `demo_user / Demo12345!`.
4. Vao `/onboarding` -> `/dashboard` -> lam 1 quiz.

## 8) Loi thuong gap

### 8.1 `npm` khong nhan lenh

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

### 8.2 Cong 8000 hoac 5173 da duoc dung

Kiem tra process dang chiem cong:

```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 8000,5173 } | Select-Object LocalPort,OwningProcess
```

Dung process theo PID:

```powershell
Stop-Process -Id <PID>
```

## 9) Tat server

- Cach dung terminal: `Ctrl + C`
- Hoac dung PowerShell:

```powershell
Stop-Process -Name python,node -Force
```

## 10) Main user screens

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

## 11) Main APIs

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
