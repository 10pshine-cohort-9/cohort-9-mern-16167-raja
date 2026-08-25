# cohort-9-mern-16167-raja
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Raja Abdul Rafay

# Notes App - Enterprise Full-Stack Note-Taking System

This project aims to provide a full-stack web application that allows users to create, edit, and delete notes. It integrates user authentication to ensure privacy for each user and includes application logging, exception handling, unit testing, and MongoDB integration.

---

## 🛠️ Technology Stack
*   **Backend:** Node.js, Express, MongoDB (Mongoose)
*   **Frontend:** React.js
*   **Logging:** Pino Logger
*   **Testing:** Mocha/Chai (Backend), Jest (Frontend)
*   **Quality & Version Control:** SonarQube, Git

---

## 📋 Key Features & Requirements

### Core Application
*   **User Authentication:** Users can sign up, log in, and log out. Notes are strictly associated with individual authenticated users.
*   **Note Management:** Users can create, edit, and delete notes. Notes support rich text editing.
*   **Exception Handling:** Global middleware to gracefully handle errors, prevent crashes, and provide meaningful error messages to users. Log exceptions using Pino.
*   **Application Logging:** Pino Logger implemented throughout the application to log important events, errors, HTTP requests/responses, and user activities.
*   **Unit Testing & Code Quality:** Unit tests covering controllers, services, and data access layers. SonarQube integration to analyze code quality and typescript/javascript rules.
*   **Optional Enhancements:** Real-time updates via Socket.IO, Export/Import functionalities, and Search/Filter options.

### Application Screens
1.  **Sign Up / Log In:** User registration and authentication forms. Redirects to the dashboard upon success.
2.  **Dashboard:** Displays a list of user-specific notes fetched from the backend and a button to navigate to the note editor.
3.  **Note Editor / Modal:** Rich text editor with save and cancel operations to create or modify notes.
4.  **User Profile (Optional):** Displays user information and a logout button.

---

## ⚙️ 10P Shine - Workflow & Branching Strategy

### Main Branches
*   **`main`**: Contains Production-ready code.
*   **`develop`**: The primary integration branch containing the latest development changes. **All PRs must target this branch.**

* **Stacked Branching Note:** Because feature branches are built sequentially before integration into `develop`, unmerged upstream files can be synchronized into new feature branches using `git merge feature/backend/<previous-feature>` to maintain a continuous codebase.

### Branch Naming Conventions
*   **Features:** `feature/frontend/<feature-name>` or `feature/backend/<feature-name>`
*   **Bugfixes:** `bugfix/frontend/<bug-description>` or `bugfix/backend/<bug-description>`

### Standard Git Workflow
1. Switch to the integration branch: `git checkout develop`
2. Sync with upstream changes: `git pull origin develop`
3. Create the feature branch: `git checkout -b feature/backend/<feature-name>`
4. Commit frequently: `git commit -m "Detailed description of changes"`
5. Push changes: `git push origin feature/backend/<feature-name>`
6. Create a Pull Request (PR) to `develop` and wait for peer/mentor review.

---

## 🏗️ Enterprise Architecture Blueprint
This project strictly enforces a Layered Architecture to maintain separation of concerns and ensure enterprise-grade maintainability.

### Backend Directory Structure
*   **`/backend/server.js`**: The main entry point that starts up the server.
*   **`/backend/src/config/`**: Database connection logic (e.g., MongoDB setup).
*   **`/backend/src/controllers/`**: Core application logic (e.g., loginUser, createNote, deleteNote).
*   **`/backend/src/middlewares/`**: Pino Logger setup and Global Error Handling.
*   **`/backend/src/models/`**: Database schemas (User and Note models).
*   **`/backend/src/routes/`**: API endpoints (e.g., POST /api/auth/login).
*   **`/backend/src/utils/`**: Helper functions (e.g., JWT token generators).

---

## 🚀 Project Progress & Changelog

### 📝 Notes App Progress Report: Module 2 (Express Server & Pino Middleware)
* **Current State:** Successfully engineered the core Express server layer. Configured dynamic port binding via `dotenv`, integrated `pino-http` middleware for high-performance JSON request logging, created the `/api/health` heartbeat route, and implemented a global centralized error-handling middleware to intercept uncaught exceptions gracefully without crashing the Node runtime. Resolved 5 complex CodeRabbit architectural flags regarding middleware order, header state validation, and secure status code parsing.
* **Completed Files:**
  * `backend/.env` (NEW - Ignored)
  * `backend/server.js` (Updated)
  * `backend/package.json` (Updated with dependencies)
  * `README.md` (Cumulative Tracker)
* **Status:** PR #2 Created (`feature/backend/express-setup`), CodeRabbit Checks Passed, Pending Mentor Review.

### 📝 Notes App Progress Report: Module 1 (Backend Initialization & Git Flow)
* **Current State:** Successfully established the official 10Pearls enterprise branching workflow. Forked and cloned the repository, synchronized the hidden upstream `develop` branch, and initialized the root-level project architecture. Configured a secure `.gitignore` to protect environment variables and dependencies, and set up the foundational Node.js environment. 
* **Completed Files:**
  * `.gitignore` (NEW)
  * `backend/package.json` (NEW)
  * `backend/server.js` (NEW)
* **Status:** PR #1 Created (`feature/backend/project-setup`), CodeRabbit Checks Passed, Pending Mentor Review.

---

### 📝 Notes App Progress Report: Module 3 (Database Configuration)
* **Current State:** Designed and integrated the data persistence layer using Mongoose. Configured an asynchronous connection lifecycle that guarantees the HTTP server only binds to a port after the database is fully connected. Implemented robust crash-handling that gracefully terminates the Node process if the initial connection fails or if the MongoDB connection drops unexpectedly during runtime.
* **Completed Files:**
  * `backend/src/config/db.js` (NEW)
  * `backend/server.js` (Updated)
  * `backend/package.json` (Updated)
  * `backend/.env` (Updated)
  * `README.md` (Updated)
* **Packages Added:** `mongoose`
* **Status:** PR #3 Created (`feature/backend/database-setup`), CodeRabbit Checks Passed.

---

### 📝 Notes App Progress Report: Module 4 (Data Modeling & Schema Design)
* **Current State:** Designed and implemented strict Mongoose schemas for the `User` and `Note` entities. Configured advanced validation constraints, email regex formatting, and security exclusions (e.g., hiding password hashes from standard queries). Established relational mapping by linking Note documents to their authoring User via `ObjectId` references. 
* **Completed Files:**
  * `backend/src/models/User.js` (NEW)
  * `backend/src/models/Note.js` (NEW)
  * `README.md` (Updated)
* **Status:** PR #4 Created (`feature/backend/data-models`), Pending CodeRabbit Review.

---

### 📝 Notes App Progress Report: Module 5 (Authentication & Controllers)
* **Current State:** Engineered secure user registration and login flows. Integrated `bcryptjs` via Mongoose pre-save hooks to ensure passwords are encrypted before database persistence. Developed a custom Mongoose instance method for secure password comparison during login. Implemented `jsonwebtoken` (JWT) generation to issue stateless, expiring authentication tokens for verified sessions.
* **Completed Files:**
  * `backend/src/utils/generateToken.js` (NEW)
  * `backend/src/controllers/authController.js` (NEW)
  * `backend/src/routes/authRoutes.js` (NEW)
  * `backend/src/models/User.js` (Updated with bcrypt logic)
  * `backend/server.js` (Updated to mount auth routes)
  * `README.md` (Updated)
* **Packages Added:** `bcryptjs`, `jsonwebtoken`
* **Status:** PR #5 Created (`feature/backend/auth-controllers`), Pending CodeRabbit Review.

---

### 📝 Notes App Progress Report: Module 6 (Authentication Middleware)
* **Current State:** Implemented a zero-trust security perimeter using custom Express middleware. The `protect` middleware successfully intercepts requests, extracts the Bearer token, verifies the JWT signature against the server's secret, and attaches the authenticated user's profile to the request lifecycle. Created a protected `/profile` endpoint to validate the authorization flow.
* **Completed Files:**
  * `backend/src/middlewares/authMiddleware.js` (NEW)
  * `backend/src/controllers/authController.js` (Updated with getUserProfile)
  * `backend/src/routes/authRoutes.js` (Updated with protected route)
  * `README.md` (Updated)
* **Status:** PR #6 Created (`feature/backend/auth-middleware`), Pending CodeRabbit Review.

---

### 📝 Notes App Progress Report: Module 7 (Note Management & CRUD Operations)
* **Current State:** Implemented complete CRUD functionality for Note management. Engineered strict ownership verification checks within the controllers to ensure users can only modify or delete their own data. Applied the `protect` middleware universally across all note routes to enforce the zero-trust architecture.
* **Completed Files:**
  * `backend/src/controllers/noteController.js` (NEW)
  * `backend/src/routes/noteRoutes.js` (NEW)
  * `backend/server.js` (Updated to mount note routes)
  * `README.md` (Updated)
* **Status:** PR #7 Created (`feature/backend/note-crud`), Pending CodeRabbit Review.

---

### 📝 Notes App Progress Report: Module 8 (Frontend Initialization)
* **Current State:** Initialized a modern, high-performance React application using Vite. Configured the Vite development server to run on port 3000 and established a proxy to route `/api` requests to the Express backend (port 5000), effectively bypassing CORS restrictions during development. Stripped out default boilerplate to establish a clean enterprise architecture baseline.
* **Completed Files:**
  * `frontend/vite.config.js` (NEW)
  * `frontend/src/App.jsx` (NEW)
  * `frontend/src/index.css` (Cleaned)
  * `README.md` (Updated)
* **Status:** PR #8 Created (`feature/frontend/react-setup`), Pending CodeRabbit Review.

---

## 🔄 Up Next: Module 9 (Frontend Routing & Authentication UI)
* **Objective:** Implement `react-router-dom` for client-side navigation. Build the Login and Registration screens and connect them to the backend API. Establish global state management to track the authenticated user's session across the application.