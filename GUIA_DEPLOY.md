# Guia Completo de Deploy - Reflex Som MVP

## Visão Geral

Este guia explica como fazer o deploy da aplicação Reflex Som MVP em diferentes ambientes de produção, incluindo opções de banco de dados e configurações de segurança.

## Opções de Banco de Dados

### 1. SQLite (Desenvolvimento/Teste)

**Vantagens:**
- ✅ Simples de configurar
- ✅ Não requer servidor de banco separado
- ✅ Bom para desenvolvimento e testes
- ✅ Zero configuração

**Desvantagens:**
- ❌ Não recomendado para produção com múltiplos usuários
- ❌ Limitações de concorrência
- ❌ Não suporta múltiplas conexões simultâneas
- ❌ Problemas de performance com muitos dados

**Quando usar SQLite:**
- Desenvolvimento local
- Testes automatizados
- Projetos pequenos com poucos usuários
- Protótipos e MVPs

### 2. PostgreSQL (Recomendado para Produção)

**Vantagens:**
- ✅ Robusto e confiável
- ✅ Excelente performance
- ✅ Suporte a múltiplas conexões
- ✅ Recursos avançados (JSON, arrays, etc.)
- ✅ Backup e recuperação robustos
- ✅ Suporte a transações complexas

**Desvantagens:**
- ❌ Requer configuração adicional
- ❌ Consome mais recursos
- ❌ Curva de aprendizado inicial

**Quando usar PostgreSQL:**
- Produção com múltiplos usuários
- Aplicações que crescerão significativamente
- Quando precisar de recursos avançados de banco

## Opções de Deploy

### Opção 1: Deploy Simples (SQLite) - Heroku/Railway

#### Pré-requisitos
- Conta no Heroku ou Railway
- Git configurado

#### Passos:

1. **Preparar o projeto:**
```bash
cd reflex-som-mvp
```

2. **Criar arquivo Procfile para o backend:**
```bash
echo "web: gunicorn backend.wsgi --log-file -" > Procfile
```

3. **Adicionar gunicorn ao requirements.txt:**
```bash
echo "gunicorn==21.2.0" >> requirements.txt
```

4. **Configurar settings para produção:**
```python
# settings.py
import os
from pathlib import Path

# Configurações de produção
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua-chave-secreta-aqui')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Configuração de arquivos estáticos
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# Configuração de mídia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

5. **Deploy no Heroku:**
```bash
# Instalar Heroku CLI
# Criar app
heroku create reflex-som-mvp

# Configurar variáveis de ambiente
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=sua-chave-secreta-muito-segura
heroku config:set ALLOWED_HOSTS=seu-app.herokuapp.com

# Deploy
git add .
git commit -m "Preparar para deploy"
git push heroku main

# Executar migrações
heroku run python manage.py migrate

# Criar superusuário
heroku run python manage.py createsuperuser
```

### Opção 2: Deploy Completo (PostgreSQL) - DigitalOcean/Railway

#### Configuração do Banco PostgreSQL

1. **Instalar PostgreSQL localmente (para desenvolvimento):**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Configurar banco de dados:**
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE reflexsom_db;
CREATE USER reflexsom_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE reflexsom_db TO reflexsom_user;
\q
```

3. **Atualizar settings.py:**
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'reflexsom_db'),
        'USER': os.environ.get('DB_USER', 'reflexsom_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'sua_senha_segura'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

4. **Executar migrações:**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Deploy no DigitalOcean

1. **Criar Droplet:**
   - Ubuntu 22.04 LTS
   - 2GB RAM mínimo
   - 50GB SSD

2. **Configurar servidor:**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3 python3-pip python3-venv nginx postgresql postgresql-contrib git

# Configurar PostgreSQL
sudo -u postgres createuser --interactive
sudo -u postgres createdb reflexsom_db
```

3. **Configurar aplicação:**
```bash
# Clonar projeto
git clone <seu-repositorio>
cd reflex-som-mvp

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
export SECRET_KEY='sua-chave-secreta'
export DEBUG=False
export DB_NAME='reflexsom_db'
export DB_USER='reflexsom_user'
export DB_PASSWORD='sua_senha'
export DB_HOST='localhost'
export DB_PORT='5432'

# Executar migrações
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

4. **Configurar Gunicorn:**
```bash
# Instalar gunicorn
pip install gunicorn

# Criar arquivo de configuração
sudo nano /etc/systemd/system/reflexsom.service
```

Conteúdo do arquivo de serviço:
```ini
[Unit]
Description=Reflex Som MVP
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/ubuntu/reflex-som-mvp
Environment="PATH=/home/ubuntu/reflex-som-mvp/venv/bin"
ExecStart=/home/ubuntu/reflex-som-mvp/venv/bin/gunicorn --workers 3 --bind unix:/home/ubuntu/reflex-som-mvp/reflexsom.sock backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

5. **Configurar Nginx:**
```bash
sudo nano /etc/nginx/sites-available/reflexsom
```

Conteúdo da configuração Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ubuntu/reflex-som-mvp;
    }

    location /media/ {
        root /home/ubuntu/reflex-som-mvp;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/reflex-som-mvp/reflexsom.sock;
    }
}
```

6. **Ativar configurações:**
```bash
# Ativar site Nginx
sudo ln -s /etc/nginx/sites-available/reflexsom /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Iniciar serviço
sudo systemctl start reflexsom
sudo systemctl enable reflexsom
```

### Opção 3: Deploy Frontend Separado

Para o frontend React, você pode usar:

1. **Vercel (Recomendado):**
```bash
cd frontend
npm install -g vercel
vercel
```

2. **Netlify:**
```bash
cd frontend
npm run build
# Fazer upload da pasta dist
```

3. **GitHub Pages:**
```bash
# Configurar no package.json
"homepage": "https://seu-usuario.github.io/seu-repo",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## Migração de SQLite para PostgreSQL

Se você já tem dados no SQLite e quer migrar para PostgreSQL:

### 1. Backup dos dados atuais:
```bash
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backup.json
```

### 2. Configurar PostgreSQL (como mostrado acima)

### 3. Restaurar dados:
```bash
python manage.py loaddata backup.json
```

### 4. Verificar integridade:
```bash
python manage.py check
python manage.py shell
```

## Configurações de Segurança para Produção

### 1. Variáveis de Ambiente:
```bash
export SECRET_KEY='chave-super-secreta-e-aleatoria'
export DEBUG=False
export ALLOWED_HOSTS='seu-dominio.com,www.seu-dominio.com'
export DATABASE_URL='postgresql://user:pass@host:port/db'
```

### 2. Configurações Django:
```python
# settings.py
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Para HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

### 3. Configuração de CORS:
```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-frontend.com",
    "https://www.seu-frontend.com",
]
```

## Monitoramento e Manutenção

### 1. Logs:
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/reflexsom/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Backup automático:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump reflexsom_db > backup_$DATE.sql
```

### 3. Monitoramento de performance:
- Usar Django Debug Toolbar (apenas desenvolvimento)
- Configurar Sentry para monitoramento de erros
- Monitorar logs do servidor

## Recomendações Finais

### Para MVP/Protótipo:
- **SQLite + Heroku/Railway** - Rápido e simples

### Para Produção com Crescimento:
- **PostgreSQL + DigitalOcean/AWS** - Escalável e robusto

### Para Alta Performance:
- **PostgreSQL + CDN + Load Balancer** - Arquitetura distribuída

## Checklist de Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Executar migrações
- [ ] Criar superusuário
- [ ] Configurar arquivos estáticos
- [ ] Configurar CORS
- [ ] Configurar SSL/HTTPS
- [ ] Configurar backup
- [ ] Testar todas as funcionalidades
- [ ] Configurar monitoramento
- [ ] Documentar procedimentos de manutenção

---

**Nota:** Este guia assume que você tem conhecimento básico de administração de sistemas. Para ambientes de produção críticos, considere contratar um DevOps ou usar serviços gerenciados. 