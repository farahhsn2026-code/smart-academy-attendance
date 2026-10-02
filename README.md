# 🎓 Smart Academy — Secure Multi-Teacher Student Attendance Management System

**Smart Academy Student Attendance Management System** is a secure, full-stack **MERN (MongoDB Atlas, Express.js, React, Node.js)** platform engineered for schools, academies, and bootcamps with complete **role-based multi-teacher authentication**.

---

## 🌟 Key Architecture & Multi-Teacher Capabilities

### 🛡️ Role-Based Access Control (RBAC)
- **Administrator (`admin`)**:
  - Full institutional authority.
  - **Faculty Management**: Create, edit, activate/deactivate teachers, reset passwords, and assign classes.
  - **Class Management**: Create grade cohorts and sections, allocate instructors, and monitor rosters.
  - **Student Directory**: Full CRUD across all academic classes.
  - **Attendance & Analytics**: View and audit attendance across all teachers, classes, and date ranges.
  - **System Settings**: Control attendance policies, academic term definitions, and institution parameters.

- **Teacher (`teacher`)**:
  - **Isolated Workspaces**: Teachers can log in securely to access **only their assigned classes**.
  - **Student Roster**: View and add/edit students enrolled strictly in their classes (student deletion restricted to Admin).
  - **Daily Attendance**: Select an assigned class, review live presence metrics, and mark **Present**, **Late**, or **Absent** with duplicate-prevention.
  - **Class Reports**: Access attendance histories and 7-day volume trends scoped exclusively to their students.
  - **Access Security**: Backend enforces class ownership checks on all endpoints (`403 Forbidden` if attempting to query or mark another teacher's class).
  - **Staff Profile**: Update personal password securely.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens), bcryptjs |
| **Database** | MongoDB Atlas (Cloud Database) + Mongoose ODM |
| **Deployment** | Render Web Service (Backend) & Render Static Site (Frontend) |

---

## 🔑 Default Credentials (Development & Testing)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `hasanfaarah07@gmail.com` | `Admin@123456` | Full institutional control |
| **Teacher 1** | `ahmed.hassan@smartacademy.edu` | `Teacher@123456` | Grade 8A & Web Dev Cohort |
| **Teacher 2** | `fatima.ali@smartacademy.edu` | `Teacher@123456` | Grade 9B |

*(Note: These sample accounts are populated idempotently via `npm run seed` in the backend).*

---

## 📂 Project Architecture

```
smart-academy-attendance/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js       # Login, profile, password changes
│   │   ├── teacherController.js    # Admin faculty management
│   │   ├── classController.js      # Class cohorts & teacher allocations
│   │   ├── studentController.js    # Scoped student CRUD with class checks
│   │   ├── attendanceController.js # Scoped attendance marking & bulk logs
│   │   └── dashboardController.js  # Role-specific analytics aggregations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role guards (requireAuth, requireAdmin)
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Admin & Teacher schema with bcrypt hashing & JWT methods
│   │   ├── Class.js              # Class cohort schema with teacher references
│   │   ├── Student.js            # Student schema with classId reference
│   │   └── Attendance.js         # Daily attendance with classId & teacherId references
│   ├── routes/
│   │   ├── auth.js               # /api/auth
│   │   ├── teachers.js           # /api/teachers (Admin guarded)
│   │   ├── classes.js            # /api/classes (Role guarded)
│   │   ├── students.js           # /api/students (Role guarded)
│   │   ├── attendance.js         # /api/attendance (Ownership validated)
│   │   └── dashboard.js          # /api/dashboard (Role guarded)
│   ├── .env                      # Environment config (MongoDB Atlas, JWT_SECRET)
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                   # Safe idempotent seeder for Admin, Teachers, and Classes
│   └── server.js                 # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx # Reusable destructive confirmation modal
│   │   │   ├── EmptyState.jsx    # Zero-data feedback screens
│   │   │   ├── Header.jsx        # Dynamic header with staff role badge & logout
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx         # Accessible overlay dialog
│   │   │   ├── ProtectedRoute.jsx# Auth & role-based route guard
│   │   │   ├── Sidebar.jsx       # Dynamic role-based navigation sidebar
│   │   │   ├── StatCard.jsx      # Summary KPI cards
│   │   │   ├── StudentForm.jsx   # Form with class allocation
│   │   │   └── Toast.jsx         # Toast notification provider
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user state & token manager
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx    # Responsive layout shell
│   │   ├── pages/
│   │   │   ├── Attendance.jsx    # Daily roster marking with class selector
│   │   │   ├── Classes.jsx       # Academic class cohorts & assignments
│   │   │   ├── Dashboard.jsx     # Role-aware dashboard (System vs Teacher metrics)
│   │   │   ├── Login.jsx         # Smart Academy login with quick-fill demo buttons
│   │   │   ├── Profile.jsx       # Staff profile view & password update
│   │   │   ├── Reports.jsx       # Scoped attendance logs & 7-day distribution
│   │   │   ├── Settings.jsx      # Admin system configuration
│   │   │   └── Teachers.jsx      # Admin teacher management
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT Bearer interceptor
│   │   ├── App.jsx               # Protected client-side routing
│   │   ├── index.css             # Tailwind base & utilities
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Running the System Locally

### Step 1: Backend Setup
```bash
cd backend
npm install

# Run database seed (Creates Admin, sample Teachers, Classes & links legacy students)
npm run seed

# Start server
npm run dev
```
Backend runs at `http://localhost:5000`.

### Step 2: Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Multi-Teacher Verification Workflow

### Test 1: Administrator Full Access
1. Open `http://localhost:5173/login`.
2. Click **Admin Portal** demo quick-fill button (`hasanfaarah07@gmail.com` / `Admin@123456`) and click **Log In**.
3. Verify you can access **Dashboard**, **Teachers**, **Classes**, **Students**, **Attendance**, **Reports**, and **Settings**.
4. Create a new teacher and assign them to a class.

### Test 2: Teacher A Isolation
1. Sign out and log in with Teacher A (`ahmed.hassan@smartacademy.edu` / `Teacher@123456`).
2. Notice the navigation changes to **Dashboard**, **My Classes**, **My Students**, **Attendance**, **Reports**, **My Profile**.
3. Admin-only links (**Teachers**, **Settings**) are hidden.
4. On **Attendance**, verify only Teacher A's assigned classes appear in the selector.
5. Save attendance for a class.
6. Open **Reports** and verify only records for Teacher A's students are visible.

### Test 3: Teacher B Isolation
1. Sign out and log in with Teacher B (`fatima.ali@smartacademy.edu` / `Teacher@123456`).
2. Verify Teacher B cannot see Teacher A's students or classes.
3. Attempting to manually navigate to `http://localhost:5173/teachers` will automatically redirect to `/dashboard`.

---

## 🌐 Render Deployment Configuration

### Frontend (Render Static Site)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://YOUR_BACKEND_SERVICE.onrender.com/api`
- **Rewrite Rule**:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

### Backend (Render Web Service)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `MONGODB_URI`: `mongodb+srv://...`
  - `JWT_SECRET`: `smart_academy_super_secret_jwt_key_2026_secure`
  - `JWT_EXPIRES_IN`: `7d`
  - `PORT`: `10000` (Render default)

---

## 📄 License
This project is licensed under the MIT License for Smart Academy.
