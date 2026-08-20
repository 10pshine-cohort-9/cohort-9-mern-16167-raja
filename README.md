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

## 🔄 Up Next: Module 3 (MongoDB & Mongoose Database Connection)
* **Objective:** Configure MongoDB connection logic using Mongoose, handle retry/connection lifecycle events, and isolate configuration into a dedicated `config/` module.