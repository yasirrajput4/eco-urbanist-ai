# Backend Services

Complete backend infrastructure with Express API and FastAPI AI services.

## Structure

```
backend/
├── api/                 # Express.js Middleware Layer
│   ├── src/
│   │   ├── server.js
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
│
└── ai/                  # FastAPI Python Service
    ├── app/
    ├── models/
    ├── main.py
    ├── requirements.txt
    ├── runtime.txt
    └── utils/
```

## Quick Start

### Express API (Node.js)

```bash
cd backend/api
npm install
npm run dev          # Development (http://localhost:3000)
npm start            # Production
```

**Environment Setup:**

```bash
cp .env.example .env
# Edit .env with your values
```

### FastAPI (Python)

```bash
cd backend/ai
pip install -r requirements.txt
python main.py       # Runs on http://localhost:8000
```

## Services

### 1. Express API (Port 3000)

**Responsibilities:**

- User authentication (signup/login with JWT)
- Rate limiting (per IP + per user)
- File upload validation
- Gallery storage (MongoDB)
- FastAPI proxy and download handler

**API Endpoints:** 13 endpoints for auth, prediction, gallery

**Documentation:**

- See `api/ARCHITECTURE.md` for detailed architecture
- See `api/API_REFERENCE.md` for complete API documentation

### 2. FastAPI AI (Port 8000)

**Responsibilities:**

- GAN model inference
- Image processing
- Green score calculation
- Result image generation and storage

## Environment Variables

### Express API (.env)

```env
PORT=3000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eco-urbanist

JWT_SECRET=your_32_char_random_secret_here
JWT_EXPIRES_IN=7d

FASTAPI_URL=http://localhost:8000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
PREDICTIONS_PER_DAY=5
```

### FastAPI (environment variables or .env)

```env
FASTAPI_URL=http://localhost:8000
MODEL_PATH=./models/pix2pix_generator.h5
```

## Running Both Services

### Local Development

**Terminal 1:**

```bash
cd backend/ai
python main.py
```

**Terminal 2:**

```bash
cd backend/api
npm run dev
```

### Using Docker Compose

From project root:

```bash
docker-compose up
```

## Deployment

### Express API

Deploy to Render, Heroku, or any Node.js hosting:

1. See `api/render.yaml` for Render deployment config
2. Set environment variables in platform
3. Point frontend to deployed URL

### FastAPI

Deploy to Render, Heroku, or any Python hosting:

1. See `ai/render.yaml` for Render deployment config
2. Ensure model files are included or downloaded on startup

## Architecture

```
Frontend (React)
    ↓ (VITE_API_URL)
Express API (Node.js)
    ├── Auth ━━ MongoDB
    ├── Rate Limiting
    ├── File Validation
    ├── Gallery ━━ MongoDB
    └── Proxy ↓
        FastAPI (Python)
            ├── GAN Model
            ├── Image Processing
            └── Storage
```

## Monitoring

### Health Checks

```bash
# Express
curl http://localhost:3000/api/health

# FastAPI
curl http://localhost:8000/docs  # Swagger UI
```

### Logs

```bash
# Express
npm run dev          # Shows logs in terminal

# FastAPI
python main.py       # Shows logs in terminal
```

## Database

MongoDB is used for:

- User authentication
- Gallery items (prediction history)

**Collections:**

- `users` — User credentials and prediction counts
- `galleries` — Saved predictions with green scores

**Indexes:** Already created for performance

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, "greenScores.improvement": -1 }`

## Support

For detailed information, see:

- **API Reference** → `api/API_REFERENCE.md`
- **Architecture** → `api/ARCHITECTURE.md`
- **Setup Guide** → Project root `PROJECT_SETUP.md`
