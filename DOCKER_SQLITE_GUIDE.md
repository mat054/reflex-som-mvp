# 🐳 Docker com SQLite - Reflex Som MVP

## 🎯 **Visão Geral**

Este guia explica como usar Docker com SQLite para deploy da aplicação Reflex Som MVP, mantendo a persistência dos dados através de volumes Docker.

## ✅ **Vantagens do SQLite + Docker**

- ✅ **Persistência garantida** - Volume Docker mantém dados
- ✅ **Simplicidade** - Sem necessidade de banco externo
- ✅ **Portabilidade** - Funciona em qualquer lugar
- ✅ **Backup fácil** - Volume pode ser copiado/restaurado
- ✅ **Performance** - Bom para aplicações pequenas/médias

## 🚀 **Deploy Rápido**

### **1. Pré-requisitos**
```bash
# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Faça logout e login novamente
```

### **2. Deploy com um comando**
```bash
cd reflex-som-mvp
./docker-deploy.sh up
```

### **3. Acessar a aplicação**
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin
- **Swagger:** http://localhost:8000/swagger

## 📁 **Estrutura dos Arquivos**

```
reflex-som-mvp/
├── Dockerfile                 # Imagem Docker
├── docker-compose.yml         # Orquestração
├── docker-deploy.sh          # Script de deploy
├── backend/
│   ├── settings_docker.py    # Configurações Docker
│   └── ...
├── requirements.txt          # Dependências Python
└── .dockerignore            # Arquivos ignorados
```

## 🔧 **Comandos Disponíveis**

### **Deploy e Gerenciamento**
```bash
# Iniciar aplicação
./docker-deploy.sh up

# Parar aplicação
./docker-deploy.sh down

# Reiniciar aplicação
./docker-deploy.sh restart

# Ver logs
./docker-deploy.sh logs

# Ver status
./docker-deploy.sh status
```

### **Desenvolvimento**
```bash
# Construir imagem
./docker-deploy.sh build

# Abrir shell no container
./docker-deploy.sh shell

# Executar migrações
./docker-deploy.sh migrate

# Criar superusuário
./docker-deploy.sh createsuperuser
```

### **Backup e Restauração**
```bash
# Fazer backup
./docker-deploy.sh backup

# Restaurar backup
./docker-deploy.sh restore backup_file.tar.gz
```

### **Limpeza**
```bash
# Limpar tudo (cuidado!)
./docker-deploy.sh clean
```

## 💾 **Localização do SQLite**

### **Dentro do Container**
```
/app/data/db.sqlite3
```

### **Volume Docker**
```
reflex-som-mvp_sqlite_data
```

### **Verificar localização**
```bash
# Ver volumes Docker
docker volume ls

# Ver detalhes do volume
docker volume inspect reflex-som-mvp_sqlite_data

# Acessar dados do volume
docker run --rm -v reflex-som-mvp_sqlite_data:/data alpine ls -la /data
```

## 🔄 **Migração de Dados**

### **De SQLite Local para Docker**
```bash
# 1. Fazer backup do SQLite local
cp db.sqlite3 db.sqlite3.backup

# 2. Iniciar Docker
./docker-deploy.sh up

# 3. Copiar dados para o container
docker cp db.sqlite3.backup reflex-som-mvp_web_1:/app/data/db.sqlite3

# 4. Ajustar permissões
docker-compose exec web chown appuser:appuser /app/data/db.sqlite3
```

### **De Docker para Local**
```bash
# 1. Parar aplicação
./docker-deploy.sh down

# 2. Copiar dados do volume
docker run --rm -v reflex-som-mvp_sqlite_data:/data -v $(pwd):/backup alpine cp /data/db.sqlite3 /backup/

# 3. Usar localmente
python manage.py runserver
```

## 📊 **Monitoramento**

### **Ver logs em tempo real**
```bash
./docker-deploy.sh logs
```

### **Ver uso de recursos**
```bash
docker stats
```

### **Verificar saúde da aplicação**
```bash
curl http://localhost:8000/api/health/
```

## 🔒 **Segurança**

### **Variáveis de Ambiente**
```bash
# Criar arquivo .env
SECRET_KEY=sua-chave-secreta-muito-segura
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,seu-dominio.com
```

### **Configurações de Segurança**
- ✅ Usuário não-root no container
- ✅ Volumes isolados
- ✅ Logs estruturados
- ✅ Configurações de produção

## 🚨 **Solução de Problemas**

### **Problema: Container não inicia**
```bash
# Ver logs detalhados
docker-compose logs web

# Verificar configuração
docker-compose config

# Reconstruir imagem
./docker-deploy.sh build
```

### **Problema: Dados perdidos**
```bash
# Verificar se volume existe
docker volume ls | grep sqlite

# Restaurar backup
./docker-deploy.sh restore backup_file.tar.gz
```

### **Problema: Permissões**
```bash
# Ajustar permissões
docker-compose exec web chown -R appuser:appuser /app/data
```

## 📈 **Escalabilidade**

### **Para Produção**
```bash
# Usar múltiplos workers
docker-compose up -d --scale web=3

# Configurar Nginx como load balancer
# (já incluído no docker-compose.yml)
```

### **Para Alta Disponibilidade**
```bash
# Backup automático
crontab -e
# Adicionar: 0 2 * * * cd /path/to/project && ./docker-deploy.sh backup

# Monitoramento
# Usar ferramentas como Prometheus + Grafana
```

## 💰 **Custos**

### **Comparação de Custos**
| Opção | Custo Mensal | Complexidade |
|-------|-------------|--------------|
| **Docker + SQLite (VPS)** | $5-10 | ⭐⭐ |
| **Docker + PostgreSQL (VPS)** | $12-20 | ⭐⭐⭐ |
| **Heroku + PostgreSQL** | $7-25 | ⭐⭐ |
| **AWS ECS + RDS** | $20-50 | ⭐⭐⭐⭐ |

## 🎯 **Recomendações**

### **Para Desenvolvimento**
```bash
# Usar SQLite local
python manage.py runserver
```

### **Para Teste/Staging**
```bash
# Usar Docker com SQLite
./docker-deploy.sh up
```

### **Para Produção**
```bash
# Usar Docker com PostgreSQL
# Ou migrar para serviços gerenciados
```

## 📝 **Exemplo Completo de Deploy**

```bash
# 1. Clonar projeto
git clone <seu-repositorio>
cd reflex-som-mvp

# 2. Configurar variáveis
echo "SECRET_KEY=sua-chave-secreta" > .env

# 3. Deploy
./docker-deploy.sh up

# 4. Criar superusuário
./docker-deploy.sh createsuperuser

# 5. Verificar
curl http://localhost:8000/api/equipamentos/

# 6. Backup automático
./docker-deploy.sh backup
```

## 🔗 **Links Úteis**

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Django Deployment](https://docs.djangoproject.com/en/stable/howto/deployment/)

---

**Resumo:** Docker + SQLite é uma solução simples e eficaz para deploy da aplicação, mantendo a persistência dos dados através de volumes Docker. Perfeito para MVPs e aplicações pequenas/médias! 🚀 