"""
Application Configuration Settings
Centralized configuration management using Pydantic
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings and configuration"""

    # API Settings
    API_TITLE: str = os.getenv("API_TITLE", "Eco-Urbanist AI API")
    API_VERSION: str = os.getenv("API_VERSION", "1.0.0")
    API_DESCRIPTION: str = os.getenv("API_DESCRIPTION", "AI-powered urban greening visualization")

    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    RELOAD: bool = os.getenv("RELOAD", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Model Settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/pix2pix_generator.h5")
    IMAGE_SIZE: int = int(os.getenv("IMAGE_SIZE", 256))
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", 1))

    # Training Settings
    EPOCHS: int = int(os.getenv("EPOCHS", 200))
    LEARNING_RATE: float = float(os.getenv("LEARNING_RATE", 0.0002))
    BETA_1: float = float(os.getenv("BETA_1", 0.5))

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()