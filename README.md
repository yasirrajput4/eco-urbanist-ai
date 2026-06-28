# Eco-Urbanist AI — Full Stack Application

Production-ready application for AI-powered urban green space visualization.

## 🏗️ Project Structure

```
eco-urbanist-ai-express/
├── frontend/                    # React Application (Port 5173)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js     # Express API client
│   │   ├── context/
│   │   └── utils/
│   ├── .env.local              # Dev config
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Backend Services
│   ├── api/                    # Express Middleware (Port 3000)
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── config/
│   │   ├── package.json
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── ARCHITECTURE.md
│   │   └── API_REFERENCE.md
│   │
│   └── ai/                     # FastAPI Python (Port 8000)
│       ├── app/
│       ├── models/
│       ├── main.py
│       ├── requirements.txt
│       └── utils/
│
├── docker-compose.yml          # Run all services
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Python 3.9+
- MongoDB Atlas account (free tier)

### Local Development

**Terminal 1 — FastAPI (Python)**

```bash
cd backend/ai
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

**Terminal 2 — Express API (Node.js)**

```bash
cd backend/api
npm install
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 — React Frontend**

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Using Docker Compose (All in One)

```bash
docker-compose up
```

Then visit: http://localhost:5173

## 🔌 Architecture

```
┌─────────────────────────────────────┐
│    React Frontend (Port 5173)       │
│  ├── Auth Pages (Login/Signup)      │
│  ├── Upload Component               │
│  ├── Gallery Page                   │
│  └── Results Visualization          │
└──────────────────┬──────────────────┘
                   │ VITE_API_URL
                   ↓
┌─────────────────────────────────────┐
│   Express API (Port 3000)           │
│  ├── JWT Authentication             │
│  ├── Rate Limiting                  │
│  ├── File Upload Validation         │
│  ├── Gallery Storage (MongoDB)      │
│  └── FastAPI Proxy                  │
└──────────────────┬──────────────────┘
                   │ FASTAPI_URL
                   ↓
┌─────────────────────────────────────┐
│   FastAPI Backend (Port 8000)       │
│  ├── TensorFlow/Keras GAN Model     │
│  ├── Image Processing               │
│  ├── Green Score Calculation        │
│  └── Result Generation              │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│   MongoDB Atlas                     │
│  ├── Users Collection               │
│  └── Gallery Collection             │
└─────────────────────────────────────┘
```

## 📚 Documentation

| Document       | Location                       | Purpose                     |
| -------------- | ------------------------------ | --------------------------- |
| Frontend Setup | `frontend/README.md`           | React app details           |
| Backend Setup  | `backend/README.md`            | Complete backend guide      |
| API Reference  | `backend/api/API_REFERENCE.md` | All 13 endpoints documented |
| Architecture   | `backend/api/ARCHITECTURE.md`  | System design details       |

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:3000
```

### Express API (`backend/api/.env`)

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/eco-urbanist
JWT_SECRET=<32-char-random-string>
FASTAPI_URL=http://localhost:8000
PREDICTIONS_PER_DAY=5
```

### FastAPI (`backend/ai/.env` or env vars)

```env
FASTAPI_URL=http://localhost:8000
MODEL_PATH=./models/pix2pix_generator.h5
```

## 🧪 Testing

### Health Checks

```bash
# Express health
curl http://localhost:3000/api/health

# FastAPI docs
curl http://localhost:8000/docs

# Frontend
open http://localhost:5173
```

### Full User Flow

1. **Sign Up** → `http://localhost:5173` → Create account
2. **Login** → Sign in with credentials
3. **Upload** → Select image → Watch progress
4. **Results** → View AI-generated predictions
5. **Gallery** → See all saved results

## 📦 Tech Stack

| Component   | Technology                                  |
| ----------- | ------------------------------------------- |
| Frontend    | React 18, Vite, Tailwind CSS                |
| Express API | Node.js, Express 4.19, MongoDB, JWT, Multer |
| FastAPI     | Python, FastAPI, TensorFlow/Keras           |
| Database    | MongoDB Atlas                               |
| Deployment  | Render, Vercel, Docker                      |

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel deploy
```

### Backend → Render

1. Push to GitHub
2. Create Render service
3. Set environment variables
4. Deploy

See `backend/README.md` for detailed deployment instructions.

## 📋 API Endpoints

### Auth

- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get user info

### Prediction

- `POST /api/predict` — Generate prediction
- `GET /api/predict/download/:filename` — Download result

### Gallery

- `GET /api/gallery` — Get all results
- `GET /api/gallery/stats` — Get statistics
- `DELETE /api/gallery/:id` — Delete item
- `DELETE /api/gallery` — Clear all

### Health

- `GET /api/health` — Server status

**Full API docs:** See `backend/api/API_REFERENCE.md`

## 🔐 Security

- ✅ JWT authentication (7-day expiration)
- ✅ bcrypt password hashing
- ✅ CORS protection
- ✅ Rate limiting (100/15min global + 5/day per user)
- ✅ File upload validation (PNG/JPEG, 10MB max)
- ✅ User isolation (gallery filtered by userId)

## 🎯 Features

- ✅ User authentication
- ✅ Image upload & processing
- ✅ AI-powered green space prediction
- ✅ Gallery with sorting & search
- ✅ Rate limiting & daily limits
- ✅ MongoDB storage
- ✅ Production-ready code
- ✅ Comprehensive documentation

## 🛠️ Development

### Adding New Features

**Frontend:**

```bash
cd frontend
npm run dev
# Edit src/ and see changes instantly
```

**Backend:**

```bash
# Express
cd backend/api
npm run dev

# FastAPI
cd backend/ai
python main.py
```

### Running Tests

```bash
# Frontend
cd frontend
npm run test

# Backend (if configured)
cd backend/api
npm run test
```

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  predictionsToday: Number,
  lastPredictionDate: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Gallery Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  outputFilename: String,
  greenScores: { input, output, improvement },
  visualization: { trees_placed, bushes_placed, grass_placed },
  metadata: { processing_method, image_type, model_trained },
  createdAt: Date
}
```

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

- Check MONGO_URI in `.env`
- Whitelist your IP in MongoDB Atlas
- Verify credentials

### "CORS Error"

- Check FRONTEND_URL in Express `.env`
- Should match your frontend URL exactly
- Restart Express after changing

### "FastAPI connection refused"

- Ensure FastAPI is running on port 8000
- Check FASTAPI_URL in Express `.env`
- Verify firewall settings

### "Port already in use"

```bash
# Kill process on port 3000 (Express)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9
```

## 📞 Support

For detailed information:

- **API Reference** → `backend/api/API_REFERENCE.md`
- **Architecture** → `backend/api/ARCHITECTURE.md`
- **Backend Setup** → `backend/README.md`
- **Frontend Setup** → `frontend/README.md`

## 📄 License

MIT

---

**Ready to deploy?** Follow the deployment section in `backend/README.md` 🚀
