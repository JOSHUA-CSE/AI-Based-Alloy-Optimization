import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import mongoengine

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================
# CORE SETTINGS
# ==============================
SECRET_KEY = os.getenv('SECRET_KEY', '')
if not SECRET_KEY or 'insecure' in SECRET_KEY:
    import warnings
    warnings.warn(
        "SECRET_KEY is not set or is insecure. "
        "Set a strong SECRET_KEY in your .env before deploying to EC2.",
        stacklevel=2,
    )
    SECRET_KEY = SECRET_KEY or 'django-insecure-local-dev-only-key'

DEBUG = os.getenv('DEBUG', 'False').strip().lower() in ('true', '1', 'yes')

_raw_hosts = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'predictor',
]

# CorsMiddleware must be first.
# WhiteNoiseMiddleware must be directly after SecurityMiddleware.
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
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
# DATABASE
# MongoDB Atlas via MongoEngine — no SQLite, no Django ORM DB needed
# ==============================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

# ==============================
# MONGODB ATLAS CONNECTION
# ==============================
_MONGO_URI = os.getenv('MONGO_URI', '')
if _MONGO_URI and '<cluster>' not in _MONGO_URI and '<password>' not in _MONGO_URI:
    try:
        mongoengine.connect(host=_MONGO_URI, uuidRepresentation='standard')
        logging.getLogger(__name__).info("MongoDB Atlas connected successfully")
    except Exception as _mongo_exc:
        logging.getLogger(__name__).error("MongoDB connection failed: %s", _mongo_exc)

    if os.getenv('CREATE_TEST_DB') == 'True':
        from predictor.models import PreviousRun
        try:
            _test = PreviousRun(
                composition={'Fe': 98.5},
                strength_prediction=0.0,
                melting_temp_prediction=0.0,
                confidence=0,
                run_type='single',
                analysis_name='test'
            )
            _test.save()
            _test.delete()
            logging.getLogger(__name__).info("MongoDB Atlas database initialized")
        except Exception as _init_exc:
            logging.getLogger(__name__).warning("MongoDB init check: %s", _init_exc)
else:
    logging.getLogger(__name__).warning(
        "MONGO_URI not configured. Set MONGO_URI in backend/.env with your Atlas connection string."
    )

# ==============================
# INTERNATIONALIZATION
# ==============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==============================
# STATIC FILES (WhiteNoise)
# ==============================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================
# CORS — allow frontend origin
# ==============================
_raw_cors = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
CORS_ALLOWED_ORIGINS = [o.strip() for o in _raw_cors.split(',') if o.strip()]

# ==============================
# CSRF
# ==============================
_raw_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000')
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _raw_csrf.split(',') if o.strip()]

# ==============================
# PRODUCTION SECURITY HEADERS
# Only active when DEBUG=False (i.e. on EC2)
# ==============================
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# ==============================
# LOGGING
# ==============================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '{asctime} {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'predictor': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'alloy_backend': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
