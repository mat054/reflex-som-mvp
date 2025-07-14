# Configurações específicas para deploy no Render
from .settings_docker import *
import os

# Configurações de CORS para Render
CORS_ALLOWED_ORIGINS = [
    "https://reflex-som-frontend.onrender.com",
    "http://localhost:3000",  # Para desenvolvimento local
    "http://localhost:5173",  # Para desenvolvimento local (Vite)
]

CORS_ALLOW_CREDENTIALS = True

# Hosts permitidos
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Configurações de segurança para produção
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Se usar HTTPS no Render (recomendado)
if os.environ.get('RENDER'):
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True 