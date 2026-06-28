# Frontend — React Application

Modern React application for Eco-Urbanist AI using Vite.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
# Runs on http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output: dist/
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── GalleryCard.jsx
│   │   ├── ImageComparisonSlider.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Upload.jsx
│   │   ├── Gallery.jsx
│   │   └── Results.jsx
│   ├── services/
│   │   └── api.js          # Express API client with JWT
│   ├── context/
│   │   └── AuthContext.jsx # Global auth state
│   ├── utils/
│   │   ├── helpers.js      # Utility functions
│   │   └── storage.js      # (Legacy - deprecated)
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── .env.local              # Dev config (git ignored)
├── .env.example            # Template
├── .env.production         # (Optional) Prod config
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── package.json
└── Dockerfile              # Docker container
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```env
# Express API backend
VITE_API_URL=http://localhost:3000
```

For production, set `VITE_API_URL` to your deployed Express backend URL.

## 🎨 Technologies

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Styling
- **Lucide Icons** — Icon library
- **Recharts** — Data visualization
- **axios** — HTTP client

## 📡 API Integration

### API Client (`services/api.js`)

The frontend uses an axios-based API client that automatically:

- Attaches JWT tokens to requests
- Handles authentication errors
- Provides methods for all endpoints

### Usage

```javascript
import api from "../services/api";

// Auth
const { token, user } = await api.login(email, password);
const { user } = await api.getCurrentUser();

// Prediction
const result = await api.generatePrediction(imageFile);

// Gallery
const gallery = await api.getGallery("newest");
const stats = await api.getGalleryStats();
await api.deleteGalleryItem(galleryId);
```

## 🔐 Authentication

JWT tokens are stored in localStorage:

```javascript
localStorage.setItem("eco_token", token);
localStorage.setItem("eco_user", JSON.stringify(user));
```

Tokens are automatically included in all API requests via axios interceptor.

When a token expires (401), the user is redirected to login.

## 🎯 Pages

### Home (`pages/Home.jsx`)

- Landing page with hero section
- Feature showcase
- Call-to-action buttons

### Auth (`pages/Login.jsx`, `pages/Signup.jsx`)

- User registration & login
- Email validation
- Password validation

### Upload (`pages/Upload.jsx`)

- Drag-and-drop file upload
- Image preview
- Progress tracking
- Real-time status updates

### Results (`pages/Results.jsx`)

- AI prediction results
- Before/after comparison slider
- Green score statistics
- Visualization metrics
- Download option

### Gallery (`pages/Gallery.jsx`)

- View all saved predictions
- Sort by date/improvement/trees
- Search by date
- Delete individual items
- Clear all results
- Statistics dashboard

## 🧩 Key Components

### ImageComparisonSlider

Interactive before/after image comparison:

```jsx
<ImageComparisonSlider beforeUrl={inputImage} afterUrl={outputImage} />
```

### GalleryCard

Single gallery item display:

```jsx
<GalleryCard item={galleryItem} onDelete={handleDelete} />
```

### ProtectedRoute

Route guard for authenticated pages:

```jsx
<ProtectedRoute>
  <Upload />
</ProtectedRoute>
```

## 🎨 Styling

- **Tailwind CSS** — Utility-first CSS framework
- **Custom CSS** — App.css for global styles
- **Responsive** — Mobile-first design
- **Dark/Light Mode** — (Optional feature)

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

Set environment variable in Vercel dashboard:

```
VITE_API_URL=https://your-express-backend.onrender.com
```

### Docker

```bash
docker build -t eco-urbanist-frontend .
docker run -p 3000:3000 eco-urbanist-frontend
```

### Traditional Hosting

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🧪 Development

### ESLint

Check code quality:

```bash
npm run lint
```

### Hot Module Replacement

Vite provides HMR for instant updates without page refresh:

```bash
npm run dev
# Edit files and see changes immediately
```

## 📦 Dependencies

### Production

- `react` — UI framework
- `react-dom` — React rendering
- `react-router-dom` — Routing
- `axios` — HTTP client
- `recharts` — Charts
- `lucide-react` — Icons
- `tailwindcss` — Styling

### Development

- `vite` — Build tool
- `@vitejs/plugin-react` — React support
- `tailwindcss` — Styling framework
- `postcss` — CSS processing
- `autoprefixer` — CSS prefixing
- `eslint` — Code linting

## 🔄 Features

### Authentication

- ✅ Signup with validation
- ✅ Login with JWT
- ✅ Logout with token clearing
- ✅ Protected routes
- ✅ Auth context for global state

### Upload

- ✅ Drag-and-drop upload
- ✅ File type validation
- ✅ File size validation
- ✅ Preview generation
- ✅ Progress tracking
- ✅ Error handling

### Results

- ✅ Before/after comparison
- ✅ Green score display
- ✅ Visualization statistics
- ✅ Auto-save to gallery
- ✅ Download option

### Gallery

- ✅ Fetch from MongoDB
- ✅ Sort by multiple criteria
- ✅ Search functionality
- ✅ Delete items
- ✅ Statistics aggregation
- ✅ Responsive grid

## 🐛 Common Issues

### "VITE_API_URL is not defined"

- Create `.env.local` with VITE_API_URL
- Restart dev server

### "CORS error in browser console"

- Check Express FRONTEND_URL matches your URL
- Restart Express backend

### "Unauthorized" after login

- Token might be expired
- Clear localStorage: `localStorage.clear()`
- Log in again

### "Images not loading"

- Check image URLs in API response
- Verify FastAPI is running
- Check browser network tab

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [Recharts Docs](https://recharts.org)
- [Express API Reference](../backend/api/API_REFERENCE.md)

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Configure `.env.local` with API URL
3. Start dev server: `npm run dev`
4. Open http://localhost:5173

---

**Happy coding!** 🎨
