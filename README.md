# 🛠️ Skill Swap Platform

A full-stack web application for collaborative skill exchange between users. Users can offer and request skills, manage swap sessions, give feedback, and maintain a rich social presence — all while administrators monitor and maintain the system efficiently.

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [API Specification](#-api-specification)
- [Screen Flow Diagram](#-screen-flow-diagram)
- [Setup Instructions](#-setup-instructions)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

- 🔐 JWT-based Authentication (Register, Login, Reset)
- 👤 Public and Private User Profiles
- 🎓 Skill Management (Offered & Wanted)
- 🔄 Swap Requests (Pending, Accepted, Rejected, Completed)
- 🌟 Peer Feedback & Skill Verification
- 📊 Admin Panel with User Controls & Stats
- 📢 System Announcements & Messages

---

## 🧰 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React + Next.js + Tailwind CSS |
| Backend      | Django + Django REST Framework |
| Auth         | JWT (SimpleJWT)                |
| Database     | PostgreSQL / SQLite (dev)      |
| Storage      | Cloudinary / S3 (optional)     |
| Deployment   | Vercel (Frontend) + Render / Railway / EC2 (Backend) |

---

## 🧠 System Architecture

- Modular DRF-based API
- Token-based user session management
- Role-based views for Admin & Users
- Real-time updates via polling or optional WebSocket integration

---

## 🧾 Database Schema

> For complete schema, check the `docs/schema.md` or refer to the [API section](#api-specification)

Key Tables:
- `User`
- `Skill`
- `SwapRequest`
- `Feedback`
- `SystemMessage`
- `Session`

---

## 📡 API Specification

> Refer to `docs/api_spec.json` or use Swagger/OpenAPI tool (coming soon)

Fully documented REST API including:

- `/api/auth/` → Register, Login, Password Reset
- `/api/users/` → Public profiles, self-profile
- `/api/skills/` → CRUD + proof upload
- `/api/swap-requests/` → Request management
- `/api/feedback/` → Swap feedback and skill verification
- `/api/admin/` → Admin functions

---

## 🗺️ Screen Flow Diagram

Visual diagram outlining frontend navigation and route-based logic.

🔗 **View full user/admin flow here**:  
👉 [Excalidraw Flow Diagram](https://excalidraw.com/#json=z3iFXbEi84ADwWVFpuaBl,OvZKKtaN2kAnkIfLdbBGLw)

---

## ⚙️ Setup Instructions

### 1. Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv env
source env/bin/activate  # or .\env\Scripts\activate on Windows

# Install requirements
pip install -r requirements.txt

# Migrate database
python manage.py migrate

# Run server
python manage.py runserver
