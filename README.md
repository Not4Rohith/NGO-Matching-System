# ReliefHub: Intelligent NGO Aid Request & Matching Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-RohithSV2%2FNGO-181717?style=flat&logo=github)](https://github.com/RohithSV2/NGO)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite%208-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express%205-339933?logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?logo=mongodb)](https://mongodb.com/)
[![Python](https://img.shields.io/badge/ML%20%2F%20NLP-Python%203.12-3776AB?logo=python)](https://python.org/)

An end-to-end fullstack humanitarian aid matching platform designed to connect citizens in distress directly with specialized, verified Non-Governmental Organizations (NGOs). The system pairs natural language understanding (NLP) and multi-factor recommendation scoring to analyze crisis severity, extract critical requirements, and match relief organizations in real-time.

---

## 🌟 Key Features

1. **Smart NLP Aid Request Parser**
   - Automatically cleans raw distress text, filters stopwords, extracts key crisis tokens (e.g. `flood`, `blood`, `icu`, `ambulance`, `medicines`, `starving`, `shelter`).
   - Classifies primary humanitarian sector and urgency level (`Low`, `Medium`, `High`, `Critical`).

2. **Multi-Factor Recommendation Algorithm**
   - Ranks NGOs using a hybrid mathematical model combining:
     - **NLP Content Cosine Similarity (50%)**: TF-IDF token overlap against NGO descriptions, subcategories, and mission keywords.
     - **Sector Match (25%)**: Exact and fuzzy category correlation.
     - **Location Proximity (15%)**: City and district geographic proximity.
     - **Historical Reliability (10%)**: Verified star ratings from past community missions.
     - **Urgency Multiplier**: Capability boost for handling critical, life-threatening emergencies.

3. **Live AI Matcher Preview**
   - Real-time debounced matcher evaluates recommendations dynamically as citizens compose their crisis narrative in the form.

4. **Verified NGO Directory**
   - Interactive explorer with search, multi-sector filters (Healthcare, Disaster Relief, Hunger & Food, Child Welfare, Animal Rescue, Clean Water, Mental Health, Education, Environment), and direct contact modals.

5. **Live Mission Tracker Board**
   - Visual kanban-style tracking across stages: `Pending` &rarr; `Matched` &rarr; `In Progress` &rarr; `Resolved`.

6. **Community Ratings & Review System**
   - Transparent accountability mechanism allowing beneficiaries to leave verified 1-5 star reviews upon mission resolution.

7. **Interactive AI Playground**
   - Interactive testing lab with pre-loaded benchmark crisis queries (Assam Floods, ICU Blood Transfusion, Street Animal Rescue, etc.) displaying mathematical score breakdowns and similarity metrics.

---

## 📐 Scoring Formula

$$\text{Base Score} = (0.50 \times \text{Sim}_{\text{TF-IDF}}) + (0.25 \times \text{Score}_{\text{Category}}) + (0.15 \times \text{Score}_{\text{Location}}) + \left(0.10 \times \frac{\text{Rating}}{5.0}\right)$$

$$\text{Final Match Score} = \min\left(1.0, \, \text{Base Score} \times \text{Urgency Multiplier}\right)$$

---

## 🏗️ System Architecture

```
NGO/
├── client/                     # Frontend (React 19, Vite 8)
│   ├── public/                 # Static SVG icons and favicon
│   ├── src/
│   │   ├── assets/             # Brand logos & hero imagery
│   │   ├── components/         # Modular UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── AidRequestForm.jsx
│   │   │   ├── NGODirectory.jsx
│   │   │   ├── RequestTracker.jsx
│   │   │   ├── AIMatcherPlayground.jsx
│   │   │   ├── RatingsSection.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   └── Footer.jsx
│   │   ├── data/mockData.js    # Resilient offline fallback dataset
│   │   ├── services/api.js     # API integration client with local storage sync
│   │   ├── App.jsx             # Root view with theme switcher
│   │   ├── App.css             # Theme layout & responsive styling
│   │   ├── index.css           # Custom theme variables and font system
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Backend API (Express 5, Mongoose)
│   ├── config/db.js            # MongoDB connection with offline fallback
│   ├── controllers/            # Auth, NGO, Request, Rating controllers
│   ├── middleware/             # JWT auth & role protection
│   ├── models/                 # User, NGO, AidRequest, Rating schemas
│   ├── routes/                 # RESTful route endpoints
│   ├── services/mlService.js   # Python subprocess caller + JS fallback matcher
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
└── ml/                         # Python NLP & Recommendation Engine
    ├── dataset/ngos.csv        # Comprehensive dataset of 25+ verified NGOs
    ├── notebooks/              # Jupyter notebooks for data exploration & NLP
    └── src/
        ├── nlp/
        │   ├── text_preprocessing.py   # Stopword filtering & urgency detection
        │   ├── feature_extraction.py   # TF-IDF vectors & cosine similarity
        │   └── request_parser.py       # Entity & category classification
        ├── data_preprocessing.py       # CSV loader and document tokenizer
        ├── predict.py                  # CLI & importable recommendation runner
        ├── train.py                    # Index precomputation & cache generator
        └── evaluate.py                 # Multi-scenario benchmark test suite
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **Python** (v3.10+ recommended)
- **MongoDB** (Optional: the system features automatic in-memory fallback if MongoDB daemon is offline)

---

### 1. Setup Backend Server

```bash
cd server
npm install
npm start
```
*Server starts on `http://localhost:5000` with health check at `/api/health`.*

---

### 2. Run the Machine Learning Pipeline

```bash
cd ml/src
# Run benchmark evaluation across all sectors (100% Top-1 recall)
python evaluate.py

# Test CLI matching for a sample crisis request
python predict.py
```

---

### 3. Setup and Launch Frontend Client

```bash
cd client
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🧪 Benchmark & Evaluation Results

Tested on diverse real-world emergency scenarios:

| Test Case | Category | Input Location | Top Recommended NGO | Match Score | Result |
|---|---|---|---|---|---|
| **Medical Blood Need** | Healthcare | Mumbai | Red Cross Society Relief | 90.7% | ✅ Passed |
| **Street Animal Rescue** | Animal Welfare | New Delhi | Friendicoes SECA | 82.9% | ✅ Passed |
| **Slum Child Education** | Education | Mumbai | Pratham Education Foundation | 70.1% | ✅ Passed |
| **Cyclone & Flood Relief**| Disaster Relief | Chennai | Rapid Response India | 82.6% | ✅ Passed |
| **Mental Health Crisis** | Mental Health | Mumbai | Vandrevala Foundation | 79.2% | ✅ Passed |

**Overall Evaluation Accuracy: 100.0% Top-1 Accuracy**

---

## 🌐 Cloud Deployment (Vercel & Render)

This project is pre-configured for automated deployment on **Vercel** (Frontend) and **Render** (Backend API).

### 1. Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **"Add New..."** &rarr; **"Project"**.
2. Import the GitHub repository: `RohithSV2/NGO`.
3. In Project Settings:
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: `client` (or leave root as `vercel.json` handles monorepo build).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: Your deployed Render backend URL (e.g. `https://reliefnet-backend.onrender.com/api`).
5. Click **"Deploy"**.

---

### 2. Deploy Backend on Render
1. Log in to [Render](https://dashboard.render.com/).
2. Click **"New +"** &rarr; **"Blueprint"** and select `RohithSV2/NGO`.
   - Render will detect [`render.yaml`](render.yaml) and configure the Node.js web service automatically.
3. *(Alternative manual setup)*:
   - Click **"New +"** &rarr; **"Web Service"** &rarr; select `RohithSV2/NGO`.
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Any secure random secret key.
   - `MONGO_URI`: *(Optional)* Your MongoDB Atlas URI. If omitted, the server runs with built-in in-memory persistence.
5. Click **"Create Web Service"**.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
