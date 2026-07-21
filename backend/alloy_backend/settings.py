import json
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
SECRET_KEY = 'django-insecure-change-this-key'

DEBUG = True

ALLOWED_HOSTS = []


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


# ==============================
# DEFAULT AUTO FIELD
# ==============================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==============================
# CORS SETTINGS
# ==============================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]


# ==============================
# OPC-UA SETTINGS
# ==============================
OPCUA_SERVER_URL = os.getenv(
    "OPCUA_SERVER_URL",
    "opc.tcp://DESKTOP-MRDSLQ0:53530/OPCUA/SimulationServer",
)
DEFAULT_OPCUA_SERVER_URLS = [
    OPCUA_SERVER_URL,
    "opc.tcp://localhost:53530/OPCUA/SimulationServer",
    "opc.tcp://127.0.0.1:53530/OPCUA/SimulationServer",
]
OPCUA_SERVER_URLS = json.loads(
    os.getenv("OPCUA_SERVER_URLS_JSON", json.dumps(DEFAULT_OPCUA_SERVER_URLS))
)
OPCUA_NAMESPACE = int(os.getenv("OPCUA_NAMESPACE", "3"))
OPCUA_TIMEOUT_SECONDS = float(os.getenv("OPCUA_TIMEOUT_SECONDS", "5"))

# Used when a feature does not have an explicit entry in OPCUA_NODE_MAPPING.
# Available placeholders: {namespace}, {field}, {field_upper}, {field_lower}
OPCUA_NODE_ID_TEMPLATE = os.getenv(
    "OPCUA_NODE_ID_TEMPLATE",
    "ns={namespace};s=SteelPlant.{field_upper}",
)

# Override any feature-to-node mapping here or through OPCUA_NODE_MAPPING_JSON.
# Keys may be the exact model fields (Cr, Al) or simulator browse names (CR, AL).
DEFAULT_OPCUA_NODE_MAPPING = {
    "CR": "ns=3;i=1009",
    "AL": "ns=3;i=1010",
    "AS": "ns=3;i=1011",
    "B": "ns=3;i=1012",
    "C": "ns=3;i=1013",
    "CA": "ns=3;i=1014",
    "CE": "ns=3;i=1015",
    "CO": "ns=3;i=1016",
    "CU": "ns=3;i=1017",
    "FE": "ns=3;i=1018",
    "LA": "ns=3;i=1019",
    "MG": "ns=3;i=1020",
    "MN": "ns=3;i=1021",
    "MO": "ns=3;i=1022",
    "N": "ns=3;i=1023",
    "NB": "ns=3;i=1024",
    "NI": "ns=3;i=1025",
    "O": "ns=3;i=1026",
    "P": "ns=3;i=1027",
    "PB": "ns=3;i=1028",
    "S": "ns=3;i=1029",
    "SE": "ns=3;i=1030",
    "SI": "ns=3;i=1031",
    "SN": "ns=3;i=1032",
    "TA": "ns=3;i=1033",
    "TI": "ns=3;i=1034",
    "V": "ns=3;i=1035",
    "W": "ns=3;i=1036",
    "ZN": "ns=3;i=1037",
    "ZR": "ns=3;i=1038",
}
OPCUA_NODE_MAPPING = json.loads(
    os.getenv("OPCUA_NODE_MAPPING_JSON", json.dumps(DEFAULT_OPCUA_NODE_MAPPING))
)

# Optional non-model metadata nodes returned by /api/opcua/read/.
OPCUA_METADATA_NODE_MAPPING = json.loads(
    os.getenv(
        "OPCUA_METADATA_NODE_MAPPING_JSON",
        '{"heat_number": "ns={namespace};s=SteelPlant.heat_number"}',
    )
)
