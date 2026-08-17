import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
PROJECT_ROOT = Path(__file__).parent
env_path = PROJECT_ROOT / ".env"
print(f"[CONFIG] Loading .env from: {env_path}")
print(f"[CONFIG] .env file exists: {env_path.exists()}")
load_dotenv(env_path)

# API Configuration - Support both naming conventions
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
print(f"[CONFIG] GOOGLE_API_KEY from env: {'SET' if os.getenv('GOOGLE_API_KEY') else 'NOT SET'}")
print(f"[CONFIG] GEMINI_API_KEY from env: {'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"[CONFIG] Final GEMINI_API_KEY: {'SET (length: ' + str(len(GEMINI_API_KEY)) + ')' if GEMINI_API_KEY else 'NOT SET'}")

# LLM Settings
DEFAULT_MODEL = "gemini-3.6-flash"
MAX_RETRIES = 3
RETRY_DELAY = 2

# Processing Settings
DEFAULT_BATCH_SIZE = 10
STREAMLIT_BATCH_SIZE = 5