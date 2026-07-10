# Eco-Urbanist Express Backend

Production-ready Node.js/Express middleware layer for the Eco-Urbanist AI application.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│   React     │────▶│  Express.js      │────▶│   FastAPI      │
│  (Port 5173)│     │  (Port 3000)     │     │  (Port 8000)   │
└─────────────┘     └──────────────────┘     └────────────────┘
   Frontend         Middleware + Auth        Python AI Models
                    + Rate Limiting
                    + Gallery DB
```

## Key Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **File Upload**: Multer for secure image upload validation
- **Database**: MongoDB with Mongoose for user & gallery storage
- **Rate Limiting**: IP-based and per-user prediction limits
- **Proxy Service**: Forwards images to FastAPI, returns results
- **API Documentation**: Self-documented routes with comments

## Tech Stack

- **Framework**: Express 4.19.2
- **Database**: MongoDB + Mongoose 8.5.1
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer 1.4.5
- **Rate Limiting**: express-rate-limit 7.3.1
- **HTTP Client**: axios + form-data
- **Development**: nodemon for auto-reload

## Project Structure

```
src/
├── server.js              # Entry point + middleware setup
├── config/
│   └── db.js             # MongoDB connection
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Global error catching
│   ├── rateLimiter.js    # Rate limiting logic
│   └── upload.js         # Multer file validation
├── models/
│   ├── User.js           # User schema + auth methods
│   └── Gallery.js        # Gallery item schema + indexes
└── routes/
    ├── auth.js           # /api/auth endpoints
    ├── prediction.js     # /api/predict + download
    └── gallery.js        # /api/gallery CRUD
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd express-backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Required variables**:

- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Change to a 32+ character random string (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `FASTAPI_URL`: Your FastAPI backend URL (e.g., `http://localhost:8000`)
- `FRONTEND_URL`: React frontend URL (for CORS)
- `PORT`: Express server port (default: 3000)

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Start Production Server

```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint           | Body                        | Description                  |
| ------ | ------------------ | --------------------------- | ---------------------------- |
| POST   | `/api/auth/signup` | `name`, `email`, `password` | Register new user            |
| POST   | `/api/auth/login`  | `email`, `password`         | Login & receive JWT          |
| GET    | `/api/auth/me`     | -                           | Get current user (protected) |

### Prediction

| Method | Endpoint                          | Auth | Description                                    |
| ------ | --------------------------------- | ---- | ---------------------------------------------- |
| POST   | `/api/predict`                    | JWT  | Upload image → forward to FastAPI → save to DB |
| GET    | `/api/predict/download/:filename` | JWT  | Download generated image from FastAPI          |

### Gallery

| Method | Endpoint             | Auth | Description                  |
| ------ | -------------------- | ---- | ---------------------------- |
| GET    | `/api/gallery`       | JWT  | Get all user's saved results |
| GET    | `/api/gallery/stats` | JWT  | Get aggregated stats         |
| DELETE | `/api/gallery/:id`   | JWT  | Delete specific result       |
| DELETE | `/api/gallery`       | JWT  | Clear all results for user   |

### Health Check

| Method | Endpoint      | Auth | Description   |
| ------ | ------------- | ---- | ------------- |
| GET    | `/api/health` | -    | Server status |

## Middleware Execution Order

1. **CORS** — Allow requests from frontend
2. **Body Parser** — Parse JSON requests
3. **Global Rate Limiter** — Protect from DoS
4. **Routes** → Each route has its own middleware:
   - `predictionRateLimiter` → stricter rate limit
   - `protect` → JWT auth
   - `upload.single("file")` → Multer file validation
5. **Error Handler** — Catch all errors (must be last)

## Authentication Flow

```
1. Frontend sends: POST /api/auth/signup with name, email, password
2. Express hashes password (bcryptjs) → saves to MongoDB
3. Express signs JWT token (7 day expiration)
4. Frontend stores token in localStorage
5. Frontend attaches token to every request: Authorization: Bearer <token>
6. Express verifies token in protect middleware
7. req.user is set automatically
```

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Prediction**: 10 requests per 15 minutes per IP (additional)
- **Per-User Daily**: Configurable via `PREDICTIONS_PER_DAY` env var (default: 5)

## Error Handling

All errors are caught by global error handler and returned as JSON:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:

- `400` — Bad request (validation error)
- `401` — Unauthorized (invalid token)
- `404` — Not found
- `429` — Too many requests (rate limit)
- `500` — Server error

## Database Indexes

Gallery collection has indexes for fast queries:

```javascript
{ userId: 1, createdAt: -1 }          // Get newest results
{ userId: 1, "greenScores.improvement": -1 }  // Sort by improvement
{ userId: 1, "visualization.trees_placed": -1 }  // Sort by trees
```

## Deploying to Production

### Environment Setup

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with production values:
PORT=3000
MONGO_URI=<production-mongodb-url>
JWT_SECRET=<generated-random-secret>
FASTAPI_URL=<production-fastapi-url>
FRONTEND_URL=<production-frontend-url>
NODE_ENV=production
```

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start src/server.js --name "eco-urbanist-express"
pm2 save
pm2 startup
```

### Using Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["node", "src/server.js"]
```

## Monitoring

Check server health:

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "service": "eco-urbanist-express",
  "timestamp": "2024-06-17T10:30:00.000Z"
}
```

## Troubleshooting

### MongoDB Connection Failed

- Check `MONGO_URI` in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify credentials are correct

### JWT Token Expired

- Client-side: axios interceptor automatically redirects to `/login`
- Server-side: Returns `401 Unauthorized`

### Rate Limit Exceeded

- Global: Wait 15 minutes or use different IP
- Per-user: Wait until next day or reduce `PREDICTIONS_PER_DAY`

### FastAPI Connection Refused

- Verify `FASTAPI_URL` is correct
- Ensure FastAPI server is running
- Check firewall/proxy settings

## License

MIT
