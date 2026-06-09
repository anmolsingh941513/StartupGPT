# StartupGPT — AI-Powered Startup Innovation Platform

A full-stack AI web application that helps founders generate, analyze, validate, and improve startup ideas using Generative AI and intelligent prediction systems.

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Tailwind CSS, Framer Motion, Chart.js |
| Backend   | Node.js 20, Express 4                           |
| Database  | MongoDB (Mongoose)                              |
| AI        | Google Gemini API (`@google/generative-ai`)     |
| Auth      | JWT (jsonwebtoken) + bcryptjs                   |

## Features

- **AI Startup Idea Generator** — Gemini generates 3 tailored ideas with revenue models and tech stacks
- **SWOT Analysis** — Strategic strengths, weaknesses, opportunities, and threats
- **Investor Pitch Generator** — Elevator pitch, funding breakdown, milestones
- **Competitor Analysis** — Direct/indirect competitors, market gaps, uniqueness score
- **Business Name Generator** — Names, taglines, domain suggestions, brand guidelines
- **Success Predictor** — Weighted scoring model across 10 startup dimensions
- **Analytics Dashboard** — Chart.js visualisations of trends, risk distribution, industry stats

## Project Structure

```
AI Startup Generator/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── db/             # MongoDB connection
│   │   ├── middleware/     # JWT auth, error handler
│   │   ├── models/         # Mongoose models (User, StartupIdea, Prediction, Report)
│   │   ├── routes/         # Express routers (auth, ai, ml, analytics)
│   │   ├── services/       # geminiService.js, predictionService.js
│   │   ├── app.js          # Express app factory
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            # Axios client
    │   ├── components/     # Layout, UI, Auth components
    │   ├── context/        # AuthContext (JWT state)
    │   └── pages/          # 8 feature pages + Login/Register
    └── package.json
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY, MONGO_URI, JWT_SECRET
npm install
npm run dev        # nodemon — hot reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`.

## API Endpoints

| Method | Path                          | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | /api/auth/register            | Register new user            |
| POST   | /api/auth/login               | Login, returns JWT           |
| GET    | /api/auth/profile             | Get profile (JWT required)   |
| POST   | /api/ai/generate-ideas        | Generate startup ideas       |
| POST   | /api/ai/swot-analysis         | SWOT analysis                |
| POST   | /api/ai/investor-pitch        | Investor pitch deck          |
| POST   | /api/ai/competitor-analysis   | Competitor analysis          |
| POST   | /api/ai/business-names        | Business name suggestions    |
| GET    | /api/ai/history               | Recent AI generations        |
| POST   | /api/ml/predict               | Predict startup success      |
| GET    | /api/ml/model-info            | Scoring model metadata       |
| GET    | /api/ml/predictions           | Recent predictions           |
| GET    | /api/analytics/dashboard      | Aggregated dashboard stats   |
| GET    | /api/analytics/trends         | Daily activity trends        |
| GET    | /api/analytics/market-trends  | Market insights              |
| GET    | /api/health                   | Health check                 |

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/startupgpt
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=1h
CORS_ORIGINS=http://localhost:5173
```

## Docker

```bash
cp backend/.env.example backend/.env   # fill in secrets
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- MongoDB:  localhost:27017
