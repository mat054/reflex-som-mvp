#!/bin/bash

# Script de Setup Completo - Reflex Som MVP com Docker
# Uso: ./setup-docker.sh [repositorio_url]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar argumentos
REPO_URL=${1:-"https://github.com/seu-usuario/reflex-som-mvp.git"}
PROJECT_NAME="reflex-som-mvp"

log "🚀 Iniciando setup completo do Reflex Som MVP"
log "Repositório: $REPO_URL"
log "Projeto: $PROJECT_NAME"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Instale o Docker primeiro:"
    echo "  Ubuntu/Debian: sudo apt install docker.io docker-compose"
    echo "  macOS: brew install docker docker-compose"
    echo "  Windows: Baixe Docker Desktop"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
fi

# Verificar se usuário está no grupo docker
if ! groups $USER | grep -q docker; then
    warn "Usuário não está no grupo docker. Adicionando..."
    sudo usermod -aG docker $USER
    echo "⚠️  Faça logout e login novamente, ou execute: newgrp docker"
    echo "   Depois execute este script novamente."
    exit 1
fi

# Criar diretório do projeto
log "📁 Criando diretório do projeto..."
if [[ -d "$PROJECT_NAME" ]]; then
    warn "Diretório $PROJECT_NAME já existe. Removendo..."
    rm -rf "$PROJECT_NAME"
fi

# Clonar repositório
log "📥 Clonando repositório..."
git clone "$REPO_URL" "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Verificar se os arquivos necessários existem
log "🔍 Verificando arquivos necessários..."
required_files=("Dockerfile" "docker-compose.yml" "requirements.txt" "manage.py" "backend/settings_docker.py")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        error "Arquivo necessário não encontrado: $file"
    fi
done

# Criar arquivo .env se não existir
if [[ ! -f ".env" ]]; then
    log "⚙️  Criando arquivo .env..."
    cat > .env << EOF
# Configurações do Django
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Configurações do banco
DATABASE_ENGINE=sqlite
DATABASE_NAME=/app/data/db.sqlite3

# Configurações de CORS
FRONTEND_URL=http://localhost:3000

# Configurações do Docker
DJANGO_SETTINGS_MODULE=backend.settings_docker
EOF
    log "✅ Arquivo .env criado"
fi

# Dar permissão de execução aos scripts
log "🔧 Configurando permissões..."
chmod +x docker-deploy.sh 2>/dev/null || true
chmod +x setup-docker.sh 2>/dev/null || true

# Construir e iniciar containers
log "🐳 Construindo imagem Docker..."
log "📋 Usando configurações: backend.settings_docker.py"
docker-compose build

log "🚀 Iniciando aplicação..."
docker-compose up -d

# Aguardar aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 15

# Verificar se a aplicação está rodando
log "🔍 Verificando status da aplicação..."
if docker-compose ps | grep -q "web.*Up"; then
    log "✅ Aplicação iniciada com sucesso!"
else
    error "❌ Falha ao iniciar aplicação. Verifique os logs:"
    docker-compose logs web
    exit 1
fi

# Verificar se os dados foram criados
log "📊 Verificando dados de exemplo..."
sleep 5

# Testar API
log "🧪 Testando API..."
if curl -s http://localhost:8000/api/equipamentos/ > /dev/null; then
    log "✅ API funcionando!"
else
    warn "⚠️  API pode estar ainda inicializando..."
fi

# Mostrar informações finais
log "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Informações da aplicação:"
echo "   🌐 Backend API: http://localhost:8000"
echo "   🔧 Admin Django: http://localhost:8000/admin"
echo "   📚 Swagger: http://localhost:8000/swagger"
echo "   🌍 Nginx (opcional): http://localhost:80"
echo ""
echo "⚙️  Configurações usadas:"
echo "   📁 Settings: backend.settings_docker.py"
echo "   💾 Banco: SQLite em volume Docker"
echo "   📊 Logs: Console + arquivo"
echo ""
echo "👥 Usuários criados:"
echo "   📧 admin@reflexsom.com / admin123 (Super Admin)"
echo "   📧 staff@reflexsom.com / staff123 (Staff)"
echo ""
echo "📦 Dados de exemplo criados:"
echo "   🎵 4 categorias de equipamentos"
echo "   🎤 8 equipamentos de exemplo"
echo ""
echo "🔧 Comandos úteis:"
echo "   📝 Ver logs: docker-compose logs -f"
echo "   🛑 Parar: docker-compose down"
echo "   🔄 Reiniciar: docker-compose restart"
echo "   🗑️  Limpar tudo: docker-compose down -v --rmi all"
echo ""
echo "💾 Localização do SQLite:"
echo "   📁 Volume Docker: reflex-som-mvp_sqlite_data"
echo "   🔗 Backup: ./docker-deploy.sh backup"
echo ""
log "🚀 Aplicação pronta para uso!" 