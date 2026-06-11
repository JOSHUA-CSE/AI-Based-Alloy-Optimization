import os
from pathlib import Path
from dotenv import load_dotenv
import mongoengine

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'predictor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'alloy_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'alloy_backend.wsgi.application'

# ==============================
# DATABASE — MongoDB Atlas only
# ==============================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

# Connect MongoEngine to MongoDB Atlas (lazy — only connects when first query runs)
_MONGO_URI = os.getenv('MONGO_URI')
if _MONGO_URI and '<cluster>' not in _MONGO_URI:
    mongoengine.connect(host=_MONGO_URI, uuidRepresentation='standard')
    print("✅ MongoDB Atlas connected successfully")
    
    # Create test collection to initialize database
    if os.getenv('CREATE_TEST_DB') == 'True':
        from predictor.models import PreviousRun
        try:
            test_run = PreviousRun(
                composition={'Fe': 98.5},
                strength_prediction=0.0,
                melting_temp_prediction=0.0,
                confidence=0,
                run_type='single',
                analysis_name='test'
            )
            test_run.save()
            test_run.delete()
            print("✅ Database 'alloy_db' initialized")
        except Exception as e:
            print(f"Database init: {e}")
else:
    import logging
    logging.warning("MONGO_URI not set or still a placeholder. Update backend/.env with your Atlas connection string.")

# ==============================
# INTERNATIONALIZATION
# ==============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# ==============================
# STATIC FILES
# ==============================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================
# CORS SETTINGS
# ==============================
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
