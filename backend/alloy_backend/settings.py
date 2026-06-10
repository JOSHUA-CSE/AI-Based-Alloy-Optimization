import os
from pathlib import Path

from dotenv import load_dotenv

# Explicitly load .env from the backend root directory
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ==============================
# BASE DIR
# ==============================
BASE_DIR = Path(__file__).resolve().parent.parent


# ==============================
# SECURITY
# ==============================
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-key')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# ==============================
# INSTALLED APPS
# ==============================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local apps
    'predictor',
]


# ==============================
# MIDDLEWARE
# ==============================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST BE FIRST
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==============================
# URL CONFIG
# ==============================
ROOT_URLCONF = 'alloy_backend.urls'


# ==============================
# TEMPLATES
# ==============================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ==============================
# WSGI
# ==============================
WSGI_APPLICATION = 'alloy_backend.wsgi.application'


# ==============================
# DATABASE
# ==============================
import dj_database_url

# Use PostgreSQL in production, SQLite in development
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(default=os.getenv('DATABASE_URL'), conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
# MongoDB is handled separately via MongoEngine in predictor/mongo.py when configured.


# ==============================
# PASSWORD VALIDATION
# ==============================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


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


# ==============================
# DEFAULT AUTO FIELD
# ==============================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==============================
# CORS SETTINGS
# ==============================
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
