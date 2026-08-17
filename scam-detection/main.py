from pathlib import Path
import sys
import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, validator
from pipeline.scam_detector.detector import ScamDetector
from utils import get_logger

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Scam Detection API",
    description="AI-powered scam detection microservice",
    version="1.0.0"
)

# Initialize ScamDetector once at startup (thread-safe)
detector = ScamDetector()

# Request/Response Models
class DetectionRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The message to analyze for scam content")
    
    @validator('message')
    def message_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

class DetectionResponse(BaseModel):
    label: str
    reasoning: str
    intent: str
    risk_factors: list[str]
    processing_time: Optional[float] = None
    model_used: str = "gemini-3.6-flash"
    strategy: str = "react"

class HealthResponse(BaseModel):
    status: str
    service: str
    model: str

class ErrorResponse(BaseModel):
    detail: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    from config import GEMINI_API_KEY
    api_key_status = "loaded" if GEMINI_API_KEY else "not_loaded"
    
    logger.info(f"Health check called - API key status: {api_key_status}")
    
    return HealthResponse(
        status="ok",
        service="scam-detection",
        model="gemini-3.6-flash"
    )

@app.post("/detect")
async def detect_scam(request: DetectionRequest) -> Dict[str, Any]:
    """
    Detect scam content in a message.
    
    Args:
        request: DetectionRequest containing the message to analyze
        
    Returns:
        Dict with success status and detection data
        
    Raises:
        HTTPException: For validation errors or processing failures
    """
    import time
    import traceback
    
    try:
        logger.info(f"Received detection request for message length: {len(request.message)}")
        logger.info(f"Message preview: {request.message[:50]}...")
        
        # Check if API key is loaded
        from config import GEMINI_API_KEY
        if not GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set in environment variables")
            return {
                "success": False,
                "error": "API key not configured"
            }
        logger.info(f"API key loaded successfully (length: {len(GEMINI_API_KEY)})")
        
        # Measure processing time
        start_time = time.time()
        
        # Run detection using existing ScamDetector
        logger.info("Starting scam detection pipeline...")
        result = detector.detect(request.message)
        
        processing_time = time.time() - start_time
        
        # Add metadata
        result['processing_time'] = processing_time
        result['model_used'] = 'gemini-3.6-flash'
        result['strategy'] = 'react'
        
        logger.info(f"Detection completed: {result.get('label', 'Unknown')}")
        logger.info(f"Processing time: {processing_time:.2f}s")
        
        # Return in format expected by Node.js backend
        return {
            "success": True,
            "data": result
        }
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Detection pipeline failed: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e)
        }

# Optional: Keep CLI functionality for local testing
def main():
    """Legacy CLI interface for local testing only."""
    detector = ScamDetector()
    
    try:
        test_msg = input("Enter your Message: ")
        logger.info("Running scam detection")
        result = detector.detect(test_msg)
        
        print(f"Test Message: {test_msg}")
        print(f"Detection Result: {result}")
        
    except Exception as e:
        logger.error(f"Detection failed: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    # Check if running in CLI mode or as module
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        main()
    else:
        # Default to FastAPI - this allows: uvicorn main:app
        import uvicorn
        port = int(os.getenv("PORT", 8000))
        logger.info(f"Starting FastAPI server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port)