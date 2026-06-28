# Eco-Urbanist Express API Documentation

API Reference for the Express middleware backend.

**Base URL (Development)**: `http://localhost:3000`
**Base URL (Production)**: `https://your-deployed-app.onrender.com`

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained by signing up or logging in.

---

## Endpoints

### POST /api/auth/signup

Create a new user account.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**

- `400` — Missing fields or invalid email
- `400` — Email already registered (duplicate)

---

### POST /api/auth/login

Sign in with email and password.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**

- `400` — Missing email or password
- `401` — Invalid email or password

---

### GET /api/auth/me

Get current logged-in user info. **[Protected]**

**Request:**

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "predictionsToday": 2,
    "dailyLimit": 5
  }
}
```

**Errors:**

- `401` — Missing or invalid token
- `401` — User no longer exists

---

### POST /api/predict

Upload an image for AI prediction. **[Protected] [Rate Limited]**

**Request:**

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.png" \
  -F "inputImagePreview=data:image/png;base64,iVBORw0K..."
```

**Form Fields:**

- `file` (required) — Image file (PNG or JPEG, max 10MB)
- `inputImagePreview` (optional) — Base64 thumbnail of input (small, for gallery display)

**Response (200):**

```json
{
  "success": true,
  "output_filename": "generated_20240617_120000.png",
  "green_scores": {
    "input": {
      "green_score": 15.2,
      "green_pixels": 50000,
      "total_pixels": 328000
    },
    "output": {
      "green_score": 45.8,
      "green_pixels": 150000,
      "total_pixels": 328000
    },
    "improvement": 30.6
  },
  "visualization": {
    "trees_placed": 42,
    "bushes_placed": 128,
    "grass_placed": 8500,
    "total_placed": 8670
  },
  "metadata": {
    "processing_method": "pix2pix",
    "image_type": "satellite",
    "model_trained": true
  },
  "galleryId": "507f1f77bcf86cd799439012",
  "predictionsToday": 3,
  "dailyLimit": 5
}
```

**Errors:**

- `400` — Invalid file type (must be PNG or JPEG)
- `400` — File too large (max 10MB)
- `401` — Missing or invalid token
- `429` — Daily limit exceeded
- `429` — Rate limit exceeded (too many requests)
- `502` — FastAPI service unavailable

---

### GET /api/predict/download/:filename

Download a generated image. **[Protected]**

**Request:**

```bash
curl http://localhost:3000/api/predict/download/generated_20240617_120000.png \
  -H "Authorization: Bearer <token>" \
  -o output.png
```

**Response (200):**

- Binary image file (PNG or JPEG)
- Header: `Content-Disposition: attachment; filename="..."`

**Errors:**

- `401` — Missing or invalid token
- `404` — Image not found on FastAPI server

---

### GET /api/gallery

Get user's saved predictions. **[Protected]**

**Query Parameters:**

- `sort` (optional) — `newest` | `oldest` | `improvement` | `trees` (default: `newest`)

**Request:**

```bash
curl "http://localhost:3000/api/gallery?sort=improvement" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "outputFilename": "generated_20240617_120000.png",
      "inputImagePreview": "data:image/png;base64,iVBORw0K...",
      "greenScores": {
        "input": {
          "green_score": 15.2,
          "green_pixels": 50000,
          "total_pixels": 328000
        },
        "output": {
          "green_score": 45.8,
          "green_pixels": 150000,
          "total_pixels": 328000
        },
        "improvement": 30.6
      },
      "visualization": {
        "trees_placed": 42,
        "bushes_placed": 128,
        "grass_placed": 8500,
        "total_placed": 8670
      },
      "metadata": {
        "processing_method": "pix2pix",
        "image_type": "satellite",
        "model_trained": true
      },
      "createdAt": "2024-06-17T12:00:00.000Z",
      "updatedAt": "2024-06-17T12:00:00.000Z"
    }
  ]
}
```

**Errors:**

- `401` — Missing or invalid token

---

### GET /api/gallery/stats

Get aggregated gallery statistics. **[Protected]**

**Request:**

```bash
curl http://localhost:3000/api/gallery/stats \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalImages": 15,
    "averageImprovement": 28.5,
    "totalTreesPlanted": 642
  }
}
```

**Errors:**

- `401` — Missing or invalid token

---

### DELETE /api/gallery/:id

Delete a specific gallery item. **[Protected]**

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/gallery/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Result deleted."
}
```

**Errors:**

- `401` — Missing or invalid token
- `404` — Gallery item not found

---

### DELETE /api/gallery

Clear all gallery items for user. **[Protected]**

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/gallery \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Deleted 15 results."
}
```

**Errors:**

- `401` — Missing or invalid token

---

### GET /api/health

Check server health. **[No Auth Required]**

**Request:**

```bash
curl http://localhost:3000/api/health
```

**Response (200):**

```json
{
  "status": "ok",
  "service": "eco-urbanist-express",
  "timestamp": "2024-06-17T12:00:00.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning           | Solution                               |
| ---- | ----------------- | -------------------------------------- |
| 200  | Success           | ✓ Everything is OK                     |
| 201  | Created           | ✓ Resource created successfully        |
| 400  | Bad Request       | Check your request body and parameters |
| 401  | Unauthorized      | Log in again or check your token       |
| 404  | Not Found         | Check that the resource exists         |
| 429  | Too Many Requests | Wait before retrying (rate limit)      |
| 500  | Server Error      | Try again later or contact support     |
| 502  | Bad Gateway       | FastAPI service is down                |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### Global Rate Limit

- **100 requests per 15 minutes per IP**
- Returns `429 Too Many Requests` when exceeded

### Prediction Rate Limit

- **10 prediction requests per 15 minutes per IP** (on top of global limit)
- Returns `429 Too Many Requests` when exceeded

### Per-User Daily Limit

- **5 predictions per day per user** (configurable)
- Returns `429 Too Many Requests` when exceeded
- Resets at midnight UTC

Rate limit information is returned in response headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1718628000
```

---

## Authentication

Tokens are JWT (JSON Web Tokens) that expire after 7 days.

**Token Format:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxODYyNDAwMCwiZXhwIjoxNzE5MjI4ODAwfQ.SIGNATURE
```

**Using Token in Requests:**

All protected endpoints require:

```
Authorization: Bearer <token>
```

**Token Expiration:**

When a token expires (7 days), you'll get:

```json
{
  "error": "Token expired. Please log in again."
}
```

Solution: Call `/api/auth/login` again to get a new token.

---

## Response Times

Expected response times:

| Endpoint             | Time    | Notes               |
| -------------------- | ------- | ------------------- |
| `/api/auth/signup`   | <100ms  | Database write      |
| `/api/auth/login`    | <100ms  | Database query      |
| `/api/predict`       | 30-120s | FastAPI processing  |
| `/api/gallery`       | <100ms  | Database query      |
| `/api/gallery/stats` | <100ms  | MongoDB aggregation |
| `/api/health`        | <10ms   | No database access  |

Prediction times vary based on image size and FastAPI model load.

---

## Example: Full User Journey

```bash
# 1. Sign up
SIGNUP=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@test.com","password":"test123"}')

TOKEN=$(echo $SIGNUP | jq -r '.token')
echo "Token: $TOKEN"

# 2. Get user info
curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Upload image
PREDICT=$(curl -s -X POST http://localhost:3000/api/predict \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.png")

GALLERY_ID=$(echo $PREDICT | jq -r '.galleryId')
echo "Saved to gallery: $GALLERY_ID"

# 4. View gallery
curl -s http://localhost:3000/api/gallery \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Download result
curl http://localhost:3000/api/predict/download/generated_*.png \
  -H "Authorization: Bearer $TOKEN" \
  -o result.png

# 6. Delete from gallery
curl -X DELETE http://localhost:3000/api/gallery/$GALLERY_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## FAQ

**Q: How long do tokens last?**
A: 7 days. After that, you need to log in again.

**Q: Can I use the same token on multiple clients?**
A: Yes, but if one client logs out and clears the token, other clients won't be affected (stateless JWT).

**Q: What happens if I exceed the daily prediction limit?**
A: You get a 429 error. You'll need to wait until tomorrow (midnight UTC).

**Q: Can I increase the prediction limit?**
A: Yes, change `PREDICTIONS_PER_DAY` env var and restart Express.

**Q: Is my image data stored on Express?**
A: No. Express only forwards images to FastAPI. Generated images are stored on FastAPI's server.

**Q: How do I get my data?**
A: Use `GET /api/gallery` to fetch all your results, then download with `GET /api/predict/download/:filename`.

**Q: Can I delete my account?**
A: Not via API yet. Contact support via email.

---

## Support

For API issues, check:

1. **Status** — `GET /api/health` returns OK?
2. **Token** — Is token valid and not expired?
3. **Rate Limit** — Check `RateLimit-*` headers
4. **Errors** — Read error message carefully
5. **Logs** — Check browser console (F12) and server logs

---

**Last Updated**: June 17, 2024
**Version**: 1.0.0
