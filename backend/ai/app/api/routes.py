"""
API Routes
Handles all HTTP endpoints for the application
"""
import os
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import shutil

from app.services.prediction_service import get_prediction_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["api"])

# Setup directories
BASE_DIR = Path(__file__).parent.parent.parent
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
OUTPUT_DIR = BASE_DIR / "data" / "output"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Generate green visualization prediction from uploaded image
    
    Args:
        file: Uploaded image file
        
    Returns:
        JSON with prediction results and green scores
    """
    logger.info("=" * 60)
    logger.info("📥 Received prediction request")
    logger.info("=" * 60)
    logger.info(f"   Filename: {file.filename}")
    logger.info(f"   Content type: {file.content_type}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Get file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ['.png', '.jpg', '.jpeg', '.bmp']:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use PNG, JPG, JPEG, or BMP"
        )
    
    logger.info(f"   File extension: {file_extension}")
    
    # Save uploaded file
    upload_path = UPLOAD_DIR / file.filename
    logger.info(f"   Upload directory: {UPLOAD_DIR}")
    logger.info(f"   Saving to: {upload_path}")
    
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"   ✅ File saved successfully")
        logger.info(f"   File size: {upload_path.stat().st_size} bytes")
        
    except Exception as e:
        logger.error(f"   ❌ Failed to save file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Get prediction service (singleton)
    logger.info("   Getting prediction service...")
    try:
        prediction_service = get_prediction_service()
        logger.info("   ✅ Prediction Service initialized successfully!")
    except Exception as e:
        logger.error(f"   ❌ Failed to initialize prediction service: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize prediction service: {str(e)}"
        )
    
    # Generate prediction
    logger.info("   Generating prediction...")
    try:
        result = prediction_service.generate_prediction(str(upload_path))
        logger.info("   ✅ Prediction completed successfully!")
        
    except Exception as e:
        logger.error(f"   ❌ Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    # Clean up uploaded file
    try:
        upload_path.unlink()
        logger.info("   🗑️ Temporary file deleted")
    except Exception as e:
        logger.warning(f"   ⚠️  Could not delete temporary file: {e}")
    
    logger.info("✅ Prediction completed successfully!")
    logger.info("=" * 60)
    
    return JSONResponse(content=result)


@router.get("/download/{filename}")
async def download_image(filename: str):
    """
    Download generated image
    
    Args:
        filename: Name of the file to download
        
    Returns:
        File download response
    """
    logger.info(f"📥 Download request for: {filename}")
    
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        logger.error(f"❌ File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    logger.info(f"✅ Sending file: {file_path}")
    
    return FileResponse(
        path=str(file_path),
        media_type="image/png",
        filename=filename
    )


@router.get("/output/{filename}")
async def get_output_image(filename: str):
    """
    Get generated output image
    
    Args:
        filename: Name of the output file
        
    Returns:
        Image file
    """
    logger.info(f"📥 Output image request: {filename}")
    
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        logger.error(f"❌ File not found: {file_path}")
        raise HTTPException(status_code=404, detail="Output file not found")
    
    logger.info(f"✅ Serving file: {file_path}")
    
    return FileResponse(
        path=str(file_path),
        media_type="image/png"
    )


@router.delete("/cleanup")
async def cleanup_files():
    """
    Clean up old generated files (optional maintenance endpoint)
    
    Returns:
        Cleanup status
    """
    logger.info("🗑️ Cleanup request received")
    
    try:
        # Clean upload directory
        upload_files = list(UPLOAD_DIR.glob("*"))
        for f in upload_files:
            if f.is_file():
                f.unlink()
        
        # Clean output directory (keep only recent files)
        output_files = sorted(OUTPUT_DIR.glob("*.png"), key=lambda x: x.stat().st_mtime)
        
        # Keep last 10 files, delete older ones
        if len(output_files) > 10:
            for f in output_files[:-10]:
                f.unlink()
        
        logger.info(f"✅ Cleanup completed")
        logger.info(f"   Uploads cleaned: {len(upload_files)}")
        logger.info(f"   Outputs cleaned: {max(0, len(output_files) - 10)}")
        
        return {
            "status": "success",
            "uploads_cleaned": len(upload_files),
            "outputs_cleaned": max(0, len(output_files) - 10)
        }
        
    except Exception as e:
        logger.error(f"❌ Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")