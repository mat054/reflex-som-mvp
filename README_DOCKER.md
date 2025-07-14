# 🐳 Setup Completo com Docker - Reflex Som MVP

## 🎯 **Visão Geral**

Este guia fornece instruções completas para configurar e executar o Reflex Som MVP usando Docker, incluindo dados de exemplo e usuários pré-configurados.

## ✅ **O que está incluído**

- ✅ **Backend Django** com API REST
- ✅ **Banco SQLite** com persistência
- ✅ **Usuários de exemplo** (admin e staff)
- ✅ **Dados de exemplo** (categorias e equipamentos)
- ✅ **Nginx** para servir arquivos estáticos
- ✅ **Scripts automatizados** de setup


## 📋 **Pré-requisitos**

### **Sistema Operacional**
- ✅ **Linux** (Ubuntu 20.04+, Debian 11+)
- ✅ **macOS** (10.15+)
- ✅ **Windows** (10/11 com WSL2)

### **Software Necessário**
- **Docker** (versão 20.10+)
- **Docker Compose** (versão 2.0+)
- **Git** (versão 2.20+)

### **Instalação do Docker**

#### **Ubuntu/Debian:**
```bash
# Atualizar sistema
sudo apt update

# Instalar Docker
sudo apt install docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar:
newgrp docker
```

#### **macOS:**
```bash
# Usando Homebrew
brew install docker docker-compose

# Ou baixar Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### **Windows:**
1. Baixar [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Instalar e reiniciar
3. Habilitar WSL2 se necessário

## 🔧 **Setup Detalhado**

### **1. Preparar Ambiente**

```bash
# Verificar se Docker está funcionando
docker --version
docker-compose --version

# Verificar se usuário está no grupo docker
groups $USER | grep docker
```

### **2. Clonar e Configurar**

```bash
# Clonar repositório
git clone git@github.com:mat054/reflex-som-mvp.git
cd reflex-som-mvp
git checkout dev

# Verificar arquivos
ls -la
# Deve mostrar: Dockerfile, docker-compose.yml, requirements.txt, etc.
```


### **3. Criar o arquivo .env**

Se o arquivo `.env` não existir na raiz do projeto, crie-o com o seguinte conteúdo:

```env
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
```

Crie com:

```bash
nano .env
# Cole o conteúdo acima, salve com CTRL+O e feche com CTRL+X
```


---

### **4. Construir e subir os containers Docker**

```bash
docker-compose build
docker-compose up -d
```

> Se necessário, use `sudo`:
>
> ```bash
> sudo docker-compose build
> sudo docker-compose up -d
> ```

---

### **5. Aguardar a inicialização**

Você pode monitorar os logs com:

```bash
docker-compose logs -f
```

Espere até que o backend Django esteja rodando em `0.0.0.0:8000`.

---

### **6. Testar a aplicação**

Verifique se a API está funcionando:

```bash
curl http://localhost:8000/api/equipamentos/
```

Ou abra no navegador:

```
http://localhost:8000
```

---

## 🧪 Endpoints úteis

* Backend API: [http://localhost:8000](http://localhost:8000)
* Admin Django: [http://localhost:8000/admin](http://localhost:8000/admin)
* Swagger: [http://localhost:8000/swagger](http://localhost:8000/swagger)

### 7. Frontend

 Frontend (React)

1. **Instalar dependências:**
```bash
cd frontend
pnpm install
```

2. **Iniciar servidor de desenvolvimento:**
```bash
pnpm run dev --host
```


## 📊 **Dados Criados Automaticamente**

### **👥 Usuários**
| Email | Senha | Tipo |
|-------|-------|------|
| `admin@reflexsom.com` | `admin123` | Super Admin |
| `staff@reflexsom.com` | `staff123` | Staff |

### **📦 Categorias**
- 🎵 **Som e Áudio** - Equipamentos de som profissional
- 💡 **Iluminação** - Equipamentos de iluminação para eventos
- 🏗️ **Estrutura** - Estruturas e suportes para eventos
- 🎧 **DJ e Música** - Equipamentos para DJs e música ao vivo

### **🎤 Equipamentos de Exemplo**
- Caixa de Som JBL EON615
- Mesa de Som Yamaha MG16XU
- Microfone Shure SM58
- Par LED RGB 54x3W
- Moving Head Beam 230W
- Treliça Q30 2m
- CDJ Pioneer CDJ-2000NXS2
- Mixer Pioneer DJM-900NXS2

## 🌐 **Acessos da Aplicação**

### **URLs Principais**
- **🌐 Backend API:** http://localhost:8000
- **🔧 Admin Django:** http://localhost:8000/admin
- **📚 Swagger:** http://localhost:8000/swagger

### **Endpoints da API**
- **📦 Equipamentos:** http://localhost:8000/api/equipamentos/
- **👥 Clientes:** http://localhost:8000/api/clientes/
- **📋 Reservas:** http://localhost:8000/api/reservas/
- **🔐 Autenticação:** http://localhost:8000/api/token/

## 🔧 **Comandos Úteis**

### **Gerenciamento de Containers**
```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar aplicação
docker-compose down

# Reiniciar aplicação
docker-compose restart

# Limpar tudo (cuidado!)
docker-compose down -v --rmi all
```

### **Desenvolvimento**
```bash
# Abrir shell no container
docker-compose exec web bash

# Executar migrações
docker-compose exec web python manage.py migrate

# Criar superusuário
docker-compose exec web python manage.py createsuperuser

# Executar scripts Python
docker-compose exec web python create_sample_data.py
```

### **Backup e Restauração**
```bash
# Fazer backup
./docker-deploy.sh backup

# Restaurar backup
./docker-deploy.sh restore backup_file.tar.gz
```

## 🚨 **Solução de Problemas**

### **Problema: Container não inicia**
```bash
# Ver logs detalhados
docker-compose logs web

# Verificar configuração
docker-compose config

# Reconstruir imagem
docker-compose build --no-cache
```

### **Problema: Porta 8000 em uso**
```bash
# Verificar o que está usando a porta
sudo lsof -i :8000

# Parar processo ou usar porta diferente
# Editar docker-compose.yml e mudar "8000:8000" para "8001:8000"
```

### **Problema: Permissões Docker**
```bash
# Verificar grupo docker
groups $USER

# Adicionar ao grupo se necessário
sudo usermod -aG docker $USER
newgrp docker
```

### **Problema: Dados não aparecem**
```bash
# Verificar se scripts foram executados
docker-compose logs web | grep "create_sample_data"

# Executar manualmente
docker-compose exec web python create_sample_data.py
```

## 📈 **Monitoramento**

### **Ver uso de recursos**
```bash
docker stats
```

### **Verificar saúde da aplicação**
```bash
curl http://localhost:8000/api/equipamentos/
```

### **Ver logs em tempo real**
```bash
docker-compose logs -f web
```

## 🔒 **Segurança**

### **Para Produção**
```bash
# Editar arquivo .env
SECRET_KEY=sua-chave-secreta-muito-segura
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com
```

### **Backup Automático**
```bash
# Adicionar ao crontab
crontab -e
# Adicionar linha: 0 2 * * * cd /path/to/reflex-som-mvp && ./docker-deploy.sh backup
```

## 💰 **Custos**

### **Desenvolvimento Local**
- **Docker:** Gratuito
- **Recursos:** ~500MB RAM, ~2GB disco

### **Produção (VPS)**
- **DigitalOcean:** $5-10/mês
- **AWS EC2:** $10-20/mês
- **Google Cloud:** $10-20/mês

## 🎯 **Próximos Passos**

### **1. Testar Funcionalidades**
- [ ] Fazer login como admin
- [ ] Cadastrar novo equipamento
- [ ] Fazer reserva

### **2. Configurar Frontend**
```bash
# Se tiver frontend React
cd frontend
npm install
npm run dev
```

### **3. Deploy em Produção**
- Configurar domínio
- Configurar SSL/HTTPS
- Configurar backup automático
- Configurar monitoramento

## 📞 **Suporte**

### **Logs Úteis**
```bash
# Logs da aplicação
docker-compose logs web

# Logs do Nginx
docker-compose logs nginx

# Logs do sistema
docker system df
```

### **Comandos de Debug**
```bash
# Verificar volumes
docker volume ls

# Verificar redes
docker network ls

# Verificar imagens
docker images
```

---

## 🎉 **Resumo**

Com este setup, você terá:
- ✅ **Backend completo** funcionando
- ✅ **Dados de exemplo** carregados
- ✅ **Usuários de teste** criados
- ✅ **API documentada** (Swagger)
- ✅ **Persistência de dados** garantida

**Tempo estimado:** 5-10 minutos
**Recursos necessários:** 500MB RAM, 2GB disco
**Complexidade:** ⭐⭐ (Fácil)

🚀 **Aplicação pronta para desenvolvimento e testes!** 