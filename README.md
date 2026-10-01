# 🎓 AttendFlow — Modern Student Attendance Management System

**AttendFlow** is a modern, responsive web application designed for bootcamps, universities, and training academies to manage student cohorts and record daily attendance seamlessly.

Built as a full-stack **MERN (MongoDB, Express.js, React, Node.js)** solution with **Vite** and **Tailwind CSS**.

---

## 🌟 Key Features

- **📊 Dynamic Dashboard**: Real-time KPI summary cards (*Total Students, Present Today, Absent Today, Late Today*), 7-day attendance volume distribution chart, and cumulative engagement percentage.
- **👨‍🎓 Student Management (CRUD)**: Add new students, view full profiles, edit information, and delete students with confirmation dialogs. Includes instant live search and multi-criteria filters (course & status).
- **📋 Daily Attendance Marking**: Select any calendar date and mark students as **Present**, **Absent**, or **Late** with one-click actions. Includes bulk actions (*All Present, All Late, All Absent*) and duplicate prevention.
- **📈 Historical Reports & Logs**: Query historical attendance by date range or status, complete with pagination, search, and breakdown statistics.
- **⚙️ Settings & Configuration**: Configure institution profile, academic term, attendance grace periods, and view architecture health.
- **🎨 Modern UI/UX**: Clean SaaS-style interface, toast notifications, responsive mobile drawer, loading spinners, and friendly empty states.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, REST API Architecture |
| **Database** | MongoDB, Mongoose ODM |
| **Styling** | Tailwind CSS with custom color scheme and responsive layout |

---

## 📂 Project Architecture

```
AttendFlow/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── attendanceController.js # Attendance logic & bulk updates
│   │   ├── dashboardController.js  # Dashboard aggregations & trends
│   │   └── studentController.js   # Student CRUD operations
│   ├── middleware/
│   │   └── errorHandler.js        # Global error & duplicate key handler
│   ├── models/
│   │   ├── Attendance.js          # Attendance schema with unique index
│   │   └── Student.js             # Student schema with validation
│   ├── routes/
│   │   ├── attendance.js          # /api/attendance routes
│   │   ├── dashboard.js           # /api/dashboard routes
│   │   └── students.js            # /api/students routes
│   ├── .env.example               # Backend environment template
│   ├── .env                       # Local environment variables
│   ├── package.json
│   ├── seed.js                    # Demo dataset generator (12 students + history)
│   └── server.js                  # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx  # Reusable confirmation modal
│   │   │   ├── EmptyState.jsx     # Friendly zero-data screens
│   │   │   ├── Header.jsx         # Top application header
│   │   │   ├── LoadingSpinner.jsx # Spinners & skeleton loaders
│   │   │   ├── Modal.jsx          # Accessible dialog overlay
│   │   │   ├── Sidebar.jsx        # Navigation sidebar with responsive drawer
│   │   │   ├── StatCard.jsx       # Dashboard summary KPI cards
│   │   │   ├── StudentForm.jsx    # Form for adding/editing students
│   │   │   └── Toast.jsx          # Toast notification provider
│   │   ├── hooks/
│   │   │   ├── useAttendance.js   # Attendance data fetch hook
│   │   │   └── useStudents.js     # Student directory fetch hook
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx     # Master layout container
│   │   ├── pages/
│   │   │   ├── Attendance.jsx     # Daily marking page
│   │   │   ├── Dashboard.jsx      # Metrics & visual charts
│   │   │   ├── Reports.jsx        # Attendance history & analytics
│   │   │   ├── Settings.jsx       # Configuration & tech specs
│   │   │   └── Students.jsx       # Student directory & CRUD
│   │   ├── services/
│   │   │   └── api.js             # Axios API client & interceptors
│   │   ├── utils/
│   │   │   └── helpers.js         # Date formatting & badge helper
│   │   ├── App.jsx                # Router setup
│   │   ├── index.css              # Tailwind base & utility styling
│   │   └── main.jsx               # React DOM entry
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
Make sure you have installed on your computer:
1. **Node.js** (v16 or higher) — [Download Node.js](https://nodejs.org)
2. **MongoDB** (Local Community Server or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### Step 1: Clone or Open the Project
Open a terminal in the project directory:
```bash
cd "student attendance ms"
```

---

### Step 2: Set Up Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   The backend includes a `.env` file already pre-configured for local MongoDB:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendflow
   NODE_ENV=development
   ```
   *(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string).*

4. **Populate Demo Seed Data** (Recommended for presentation):
   Run the seed script to automatically load **12 demo students** across different cohorts and **10 days of realistic attendance history**:
   ```bash
   npm run seed
   ```

5. Start the Backend Server:
   ```bash
   npm run dev
   ```
   Your backend API will now be running at: `http://localhost:5000`

---

### Step 3: Set Up Frontend

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 📡 REST API Documentation

### Student Endpoints (`/api/students`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (supports `?search=`, `?course=`, `?status=`) |
| `GET` | `/api/students/:id` | Get details of a single student by ID |
| `POST` | `/api/students` | Add a new student record |
| `PUT` | `/api/students/:id` | Update an existing student |
| `DELETE` | `/api/students/:id` | Delete student and their attendance history |

### Attendance Endpoints (`/api/attendance`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/attendance` | Get attendance logs (supports `?date=`, `?status=`, `?page=`, `?startDate=`, `?endDate=`) |
| `POST` | `/api/attendance` | Record individual student attendance |
| `POST` | `/api/attendance/bulk` | Bulk record/update attendance roster for a date |
| `PUT` | `/api/attendance/:id` | Edit specific attendance entry |
| `DELETE` | `/api/attendance/:id` | Remove attendance record |

### Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Calculates today's attendance, 7-day trends, and totals |

---

## 💡 How to Demonstrate During Bootcamp Presentation

1. **Dashboard Walkthrough**:
   - Showcase the real-time KPI cards (*Total Students, Present, Absent, Late*).
   - Point out the 7-day attendance distribution chart and circular overall engagement gauge.
2. **Student Management**:
   - Click **Add Student** to create a student with instant validation.
   - Use the live search bar to filter by name or course.
   - Click the **View Profile** eye icon, followed by the **Edit** action.
3. **Attendance Taking**:
   - Navigate to the **Attendance** page.
   - Pick today's date (or any date).
   - Use the **All Present** quick button, toggle a couple to **Late** or **Absent**, and hit **Save Attendance**.
   - Notice the toast confirmation and automatic status recalculations.
4. **Reports & Audit Trail**:
   - Go to **Reports** to show the paginated history of past logs with date range filtering.

---

## 📦 How to Upload to GitHub

Follow these simple commands to push your project to a GitHub repository:

```bash
# 1. Initialize git from the root folder
git init

# 2. Add all project files
git add .

# 3. Commit the changes
git commit -m "feat: complete AttendFlow student attendance management system"

# 4. Create a new repository on GitHub (e.g. attendflow)
# 5. Link your local repo to GitHub
git remote add origin https://github.com/YOUR_USERNAME/attendflow.git

# 6. Push to the main branch
git branch -M main
git push -u origin main
```

---

## 📄 License
This project is licensed under the MIT License — free for educational, bootcamp, and commercial portfolio use.
