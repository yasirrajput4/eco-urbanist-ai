from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Eco-Urbanist AI",
    description="AI-powered urban greening visualization using Pix2Pix GAN",
    version="1.0.0"
)

# IMPORTANT: Add CORS middleware BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Import router from routes.py (not endpoints.py)
try:
    from app.api.routes import router
    app.include_router(router)
    logger.info("✅ API routes loaded successfully")
except ImportError as e:
    logger.error(f"❌ Failed to load API routes: {e}")
    raise

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - Returns API information"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Eco-Urbanist AI API",
        "status": "operational",
        "version": "1.0.0",
        "description": "AI-powered urban greening visualization using Pix2Pix GAN"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint - Returns system status"""
    try:
        import tensorflow as tf
        import cv2
        import numpy as np

        logger.info("Health check endpoint accessed")

        return {
            "status": "healthy",
            "api_version": "1.0.0",
            "dependencies": {
                "tensorflow": tf.__version__,
                "opencv": cv2.__version__,
                "numpy": np.__version__
            },
            "message": "All systems operational"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Runs when the application starts"""
    logger.info("=" * 60)
    logger.info("🚀 Eco-Urbanist AI Backend Starting...")
    logger.info("=" * 60)
    logger.info("📚 API Documentation: http://localhost:8000/docs")
    logger.info("💚 Health Check: http://localhost:8000/health")
    logger.info("🌐 CORS enabled for frontend: http://localhost:5173")
    logger.info("=" * 60)

    # Initialize Pix2Pix model at startup
    try:
        logger.info("🎨 Loading Pix2Pix model...")
        from app.models.pix2pix import get_pix2pix_model
        model = get_pix2pix_model()
        logger.info("✅ Pix2Pix model loaded and ready!")
        logger.info("=" * 60)
    except Exception as e:
        logger.error(f"❌ Failed to load Pix2Pix model: {e}")
        logger.warning("⚠️  Continuing without model (will use fallback)")
        logger.info("=" * 60)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Runs when the application shuts down"""
    logger.info("🛑 Shutting down Eco-Urbanist AI Backend...")


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)