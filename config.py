import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    VIDEODB_API_KEY = os.getenv('VIDEODB_API_KEY')
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = True
    DEFAULT_CLIP_DURATION = 30
    VERTICAL_ASPECT_RATIO = (9, 16)
