# MatchMate 🎓🔍

> **AI-Powered Campus Lost & Found, Smart Item Matching & Student Assistant Platform**

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Server-Express%205-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![HuggingFace](https://img.shields.io/badge/AI%20Model-HuggingFace%20CLIP-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. AI-Powered Smart Matching Engine](#1-ai-powered-smart-matching-engine)
  - [2. Lost & Found Management](#2-lost--found-management)
  - [3. Campus Assistant & Help Board](#3-campus-assistant--help-board)
  - [4. Campus Location Finder & Directory](#4-campus-location-finder--directory)
  - [5. Admin Intelligence & Analytics Dashboard](#5-admin-intelligence--analytics-dashboard)
  - [6. User Authentication & Profile Management](#6-user-authentication--profile-management)
  - [7. Feedback & Communication System](#7-feedback--communication-system)
- [Smart Matching Algorithm & AI Architecture](#-smart-matching-algorithm--ai-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#-api-documentation)
  - [Smart Match Endpoints](#smart-match-endpoints-apismart-match)
  - [Lost Items Endpoints](#lost-items-endpoints-apilost)
  - [Found Items Endpoints](#found-items-endpoints-apifound)
  - [Campus Assistant Endpoints](#campus-assistant-endpoints-apihelp)
  - [Location Directory Endpoints](#location-directory-endpoints-apilocations)
  - [User & Auth Endpoints](#user--auth-endpoints-apiusers)
  - [Feedback Endpoints](#feedback-endpoints-apifeedback)
  - [Management Endpoints](#management-endpoints-apilostfound)
- [Frontend Routes & Navigation](#-frontend-routes--navigation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MatchMate** is an all-in-one smart campus web ecosystem created to resolve everyday university pain points. It bridges the gap between students who have lost their belongings and those who have found them through a cutting-edge, hybrid **AI Smart Matching System** that combines metadata analysis with multimodal Computer Vision.

Beyond item recovery, **MatchMate** serves as a centralized student portal offering:
- An academic and logistical **Campus Help Board** for rapid inquiry resolution.
- A comprehensive **Campus Location Directory** with real-time operational statuses and Google Maps navigation.
- An interactive **Admin Dashboard with Recharts Analytics** for tracking resolution trends, category breakdowns, and user activity.

---

## 🚀 Key Features

### 1. AI-Powered Smart Matching Engine
- **Automated Pairing**: Evaluates lost items against found items using a hybrid scoring formula (Metadata Score + Multimodal Image AI).
- **Computer Vision Verification**: Uses Hugging Face CLIP embeddings and Sharp pixel-grid visual similarity to assess matching likelihood.
- **Claim & Dispute Workflow**:
  - Administrators review high-probability matches and notify owners.
  - Owners can verify items via a one-click response: **"That's mine"** (claimed) or **"Not mine"** (rejected).
  - Secure exchange of verified contact details between finder, owner, and campus administration once claimed.

### 2. Lost & Found Management
- **Multi-attribute Reporting**: Capture item name, category, primary color, date/time, location on campus, in-depth descriptions, and image uploads.
- **Image Upload Support**: Built-in Multer image processing pipeline storing files securely.
- **Public & Admin Item Browsing**: Filterable item feed allowing students to search by keyword, category, status, and campus location.

### 3. Campus Assistant & Help Board
- **Categorized Inquiries**: Students submit help requests across categories:
  - `ACADEMIC`, `REGISTRATION`, `FACILITIES`, `IT_SUPPORT`, `FINANCE`, `CLUBS_EVENTS`, `OTHER`.
- **Urgency Levels**: Categorize tickets by `LOW`, `MEDIUM`, or `HIGH` priority.
- **Privacy & Anonymity**: Option to submit requests anonymously.
- **Resolution Tracking**: Status states (`OPEN`, `IN_PROGRESS`, `RESOLVED`) with admin reply capabilities and timestamps.

### 4. Campus Location Finder & Directory
- **Campus Facility Search**: Quickly locate lecture halls, laboratories, libraries, administrative offices, cafeterias, sports facilities, parking, and washrooms.
- **Spatial Details**: View building names, floor numbers, room IDs, and nearby landmarks.
- **Navigation Assistance**: Direct one-click integration with Google Maps.
- **Operational Status**: Displays real-time statuses (`Available` vs `Temporarily Closed`).

### 5. Admin Intelligence & Analytics Dashboard
- **Visual Analytics**: Dynamic interactive charts powered by **Recharts**:
  - Lost vs. Found item ratio metrics.
  - Category-based distribution bar and pie charts.
  - Resolution and claim success rate tracking.
- **Management Portals**:
  - Full CRUD control over Lost & Found records.
  - AI match review and batch execution panels.
  - Campus locations management and status toggling.
  - Help request ticket moderation and responses.

### 6. User Authentication & Profile Management
- **Secure Registration & Login**: Validates university student credentials (`itNumber`, student name, contact, faculty, year of study).
- **Security & Authorization**: Passwords encrypted with `bcryptjs` (salt rounds = 10) and session authorization handled with `jsonwebtoken` (JWT).
- **Role-Based Access Control (RBAC)**: Distinct permissions and views for `student` and `admin` roles.

### 7. Feedback & Communication System
- **Student Feedback Module**: Submit reviews, bug reports, and campus suggestions with department/section tags.
- **Administrative Feedback Feed**: Centralized dashboard to read and act upon student feedback.

---

## 🧠 Smart Matching Algorithm & AI Architecture

MatchMate employs a **two-tiered hybrid scoring model** to pair lost items with found items accurately:

$$\text{Overall Score (0--100\%)} = (\text{Input Score} \times 0.6) + (\text{Image Score} \times 0.4)$$

```
+-------------------------------------------------------------------------+
|                           MatchMate Matching Pipeline                   |
+-------------------------------------------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    [ Tier 1: Input Gate ]                      [ Tier 2: Multimodal AI ]
  - Lost Date <= Found Date                   - Hugging Face CLIP Model
  - Token / Title Overlap                     - ViT-B-32-multilingual-v1
  - Category, Color, Location                 - Sharp Pixel-Grid Layout
  - Min Input Score >= 60%                    - Blended Cosine Similarity
               |                                           |
               +---------------------+---------------------+
                                     |
                                     v
                       [ Weighted Score Calculation ]
                     Input (60%)  +  Image AI (40%)
                                     |
                                     v
                       [ Admin Notification & Claim ]
```

### 1. Input Attribute Score (Weight: 60%, Max: 100 pts)
Before scoring, candidate pairs must pass strict **validation gates**:
- **Chronological Rule**: An item cannot be found before it was lost (`lostDateTime <= foundDateTime`).
- **Name Relevance Gate**: Item titles must match exactly or share meaningful character/word tokens.

Scoring breakdown:
| Attribute | Max Points | Evaluation Criteria |
| :--- | :---: | :--- |
| **Item Name / Title** | 25 pts | Exact match (25 pts), Substring match (15 pts), Token overlap (15 pts) |
| **Category** | 15 pts | Case-insensitive exact match |
| **Color** | 10 pts | Case-insensitive exact match |
| **Location** | 15 pts | Campus zone / location match |
| **Date & Time** | 15 pts | Verified chronological validity |
| **Description** | 20 pts | Exact text match (20 pts) or keyword overlap (4 pts per keyword match) |

*Only candidate pairs achieving $\ge 60\%$ input score are recorded for AI inspection.*

### 2. Image AI Vision Score (Weight: 40%, Max: 100 pts)
For items with uploaded photos, MatchMate utilizes Hugging Face's vision transformer inference paired with pixel-level heuristics:
- **Vision Transformer**: `@huggingface/inference` running `sentence-transformers/clip-ViT-B-32-multilingual-v1` to extract semantic embeddings from images.
- **Pixel Layout Verification**: `sharp` downscales images into a normalized grayscale pixel grid (default $96\times 96$) and computes cosine similarity of pixel structures.
- **Blended Metric**: Combines CLIP embedding similarity (45% weight) with pixel structure similarity (55% weight) to eliminate false-positive 100% scores caused by uniform backgrounds.

---

## 💻 Technology Stack

### Frontend
- **Library**: React 19 (`react`, `react-dom`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Visual Analytics**: Recharts
- **HTTP Client**: Axios
- **Icons**: FontAwesome (`@fortawesome/react-fontawesome`) & React Icons (`react-icons`)
- **Styling**: Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism, Responsive Media Queries)

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js (v5)
- **Database**: MongoDB (Atlas) via Mongoose 9 ODM
- **Machine Learning**: `@huggingface/inference` (CLIP Multilingual Vision Transformer)
- **Image Processing**: Sharp
- **File Uploads**: Multer
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Email/Alerts**: Nodemailer
- **Environment**: Dotenv, CORS

---

## 📁 Project Directory Structure

```text
MatchMate/
├── README.md                      # Primary project documentation
├── package.json                   # Root configuration
│
├── Backend/                       # Express & Node.js REST API
│   ├── .env                       # Environment credentials
│   ├── server.js                  # Express application entry point & DB connection
│   ├── package.json               # Backend dependencies & npm scripts
│   ├── config/
│   │   └── db.js                  # Database connection logic
│   ├── controllers/
│   │   ├── campus_assistant/      # Help requests & Location controllers
│   │   ├── FeedbackController/    # Feedback processing controller
│   │   ├── Lost-Found_MS/         # Item CRUD & Lost/Found controllers
│   │   ├── smart_matching/        # Smart match & CLIP AI controller
│   │   └── userManagement/        # Authentication & student controller
│   ├── models/
│   │   ├── campus_assistant/      # HelpRequest & Location Mongoose schemas
│   │   ├── Feedback/              # Feedback schema
│   │   ├── Lost-Found_MS/         # LostItem, FoundItem, Item schemas
│   │   ├── smart_matching/        # Match schema (scores, claim statuses)
│   │   └── userManagement/        # User schema (roles, credentials)
│   ├── routes/
│   │   ├── campus_assistant/      # Help and location endpoints
│   │   ├── FeedbackRoutes/        # Feedback endpoints
│   │   ├── Lost-Found_MS/         # Lost, found, and management routes
│   │   ├── smart_matching/        # Match execution, claim, reject routes
│   │   └── userManagement/        # Registration & login routes
│   ├── services/
│   │   └── hfClip.js              # Hugging Face CLIP + Sharp similarity service
│   └── uploads/                   # Stored item photos and ticket attachments
│
└── frontend/                      # React 19 Single Page Application
    ├── public/                    # Static assets & index.html
    ├── package.json               # Frontend dependencies & scripts
    └── src/
        ├── App.js                 # App routing & main layout definition
        ├── App.css                # Global utility styles
        ├── index.js               # React DOM mount point
        ├── assets/                # Logos, illustrations, and media
        ├── services/              # Axios service instances (api.js, helpApi.js, locationApi.js)
        └── components/
            ├── AdminDashBoard/    # Admin portal, Recharts analysis, item management
            ├── AdminLogin/        # Admin sign-in interface
            ├── common/            # Shared Header, Navigation & Layout
            ├── FeedbackDisplay/   # Admin view for student feedback
            ├── FeedbackInsert/    # Feedback submission form
            ├── HomePage/          # Landing page with hero banner & quick access
            ├── Logout/            # Session termination component
            ├── Lost-Found_MS/     # LostForm, FoundForm, Report selection, BrowseItems
            ├── Smart_Matching/    # UserMatches (claim/reject) & AdminMatchPanel
            ├── Userlogin/         # Student login screen
            ├── UserManagement/    # Student signup & registration
            ├── campus_assistant/  # HelpBoard, LocationFinder, ManageLocation
            └── userDashboard/     # Student personal profile & dashboard
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Hugging Face Account Token](https://huggingface.co/settings/tokens) (for AI image embeddings)

---

### Environment Configuration

Create a `.env` file in the `Backend/` directory:

```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/matchmate?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Hugging Face Inference API
HF_API_TOKEN=hf_yourHuggingFaceTokenHere

# Optional AI Tuning Parameters
HF_CLIP_MODEL=sentence-transformers/clip-ViT-B-32-multilingual-v1
HF_PIXEL_GRID=96
HF_MATCH_CLIP_WEIGHT=0.45
HF_MATCH_PIXEL_WEIGHT=0.55
```

---

### Backend Setup

1. Open a terminal and navigate to `Backend`:
   ```bash
   cd Backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:5000`.*

---

### Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React application:
   ```bash
   npm start
   ```
   *The app will open automatically in your browser at `http://localhost:3000`.*

---

## 📡 API Documentation

### Smart Match Endpoints (`/api/smart-match`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/run-match` | Runs the heuristic attribute matching engine across all lost and found items. |
| `POST` | `/run-image-ai` | Executes Hugging Face CLIP & Sharp image similarity evaluation on candidates. |
| `GET` | `/all-matches` | Retrieves all identified matches with overall scores (Admin access). |
| `GET` | `/user-matches` | Retrieves matches relevant to a specific student email (`?email=user@example.com`). |
| `POST` | `/claim/:id` | Confirms item ownership (*"That's mine"*) and shares contact details. |
| `POST` | `/reject/:id` | Flags a match as incorrect (*"Not mine"*). |
| `POST` | `/notify/:id` | Sends an admin notification/email to the lost item owner regarding a match. |
| `DELETE`| `/:id` | Removes a single match record. |
| `DELETE`| `/delete/all` | Purges all match records. |

---

### Lost Items Endpoints (`/api/lost`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Report a lost item (supports multipart image upload). |
| `GET` | `/` | Fetch all registered lost items. |
| `GET` | `/:id` | Retrieve a specific lost item by ID. |
| `PUT` | `/:id` | Update lost item details or replace attached image. |
| `DELETE`| `/:id` | Delete a lost item record. |

---

### Found Items Endpoints (`/api/found`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Report a found item (supports multipart image upload). |
| `GET` | `/` | Fetch all registered found items. |
| `GET` | `/:id` | Retrieve a specific found item by ID. |
| `PUT` | `/:id` | Update found item details or replace attached image. |
| `DELETE`| `/:id` | Delete a found item record. |

---

### Campus Assistant Endpoints (`/api/help`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Submit a help request with optional document attachment (`multipart/form-data`). |
| `GET` | `/` | Retrieve all help requests (filterable by status/supportType). |
| `GET` | `/my-requests` | Retrieve help requests submitted by a specific requester key. |
| `GET` | `/:id` | Fetch single help ticket details. |
| `PATCH`| `/:id/reply` | Submit administrative response to a help request. |
| `PATCH`| `/:id/status`| Update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`). |
| `DELETE`| `/:id` | Delete a help ticket. |

---

### Location Directory Endpoints (`/api/locations`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Create a new campus location (admin). |
| `GET` | `/` | List all campus locations. |
| `GET` | `/:id` | Retrieve a specific campus location. |
| `PUT` | `/:id` | Update building, floor, landmark, or status. |
| `DELETE`| `/:id` | Remove a location record. |

---

### User & Auth Endpoints (`/api/users`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new student profile (`itNumber`, `name`, `email`, `faculty`, `year`, `password`). |
| `POST` | `/login` | Authenticate user credentials and return JWT bearer token. |

---

### Feedback Endpoints (`/api/feedback`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Submit user feedback (name, email, section, contact, message). |
| `GET` | `/` | Retrieve all submitted feedback entries. |
| `GET` | `/:id` | Fetch a single feedback entry. |
| `PUT` | `/:id` | Update feedback notes. |
| `DELETE`| `/:id` | Delete a feedback entry. |

---

### Management Endpoints (`/api/lostfound`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/items` | Administrative unified feed of all lost and found records. |
| `PUT` | `/items/:id` | Update item details. |
| `DELETE`| `/items/:id` | Delete item. |
| `PATCH`| `/items/status/:id` | Modify item status (`pending`, `claimed`, `returned`). |
| `PATCH`| `/claim/:id` | Toggle claim status. |

---

## 🗺️ Frontend Routes & Navigation

| Route Path | Associated Component | Description |
| :--- | :--- | :--- |
| `/` | `Home` | Public landing page with quick navigation & service cards. |
| `/login` | `Userlogin` | Student login portal. |
| `/signup` | `StudentSignup` | Student account registration form. |
| `/adminlogin` | `AdminLogin` | Administrative credentials portal. |
| `/dashboard` | `UserDashboard` | Student profile and personal activity overview. |
| `/report` | `ReportSelection` | Option card to select reporting a Lost or Found item. |
| `/lost` | `LostForm` | Submission form to report an item lost on campus. |
| `/found` | `FoundForm` | Submission form to report an item found on campus. |
| `/browseitems` | `BrowseItems` | Public gallery of items reported across campus. |
| `/usermatches` | `UserMatches` | Student interface to review AI matches, claim, or reject items. |
| `/campus-assistant` | `SmartAssistantHome` | Hub for student help tickets and campus directory. |
| `/help` | `HelpBoard` | Community and academic help request board. |
| `/create` | `CreateHelpRequest` | Submit new inquiry ticket with optional document attachment. |
| `/help/reply/:id` | `ReplyHelpRequest` | Staff/admin response interface for help tickets. |
| `/location-finder`| `LocationFinder` | Student searchable campus building, room & landmark guide. |
| `/manage-location`| `ManageLocation` | Administrator location CRUD and status management. |
| `/feedback` | `FeedbackInsert` | Student feedback submission page. |
| `/admin` | `AdminDashboard` | Main administrator dashboard overview. |
| `/admin/analysis` | `AdminAnalysis` | Recharts visual analytics and KPI metrics. |
| `/admin/lostfound`| `LostFoundManagement`| Administrative table to moderate lost and found entries. |
| `/adminmatches` | `AdminMatchPanel` | AI match monitoring, batch runs, and user notification panel. |
| `/admin/feedback` | `FeedbackDisplay` | Feed of all student feedback and reviews. |
| `/adminbrowse` | `AdminBrowse` | Administrative search and inspection of item catalog. |
| `/logout` | `Logout` | Clears local authentication state and redirects to login. |

---

## 🤝 Contributing

Contributions make the open-source community a great place to learn, inspire, and create:

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **ISC License**. See `package.json` for details.

---

<div align="center">
  <sub>Built with ❤️ for campus communities by the MatchMate Team.</sub>
</div>