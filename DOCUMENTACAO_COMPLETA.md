# Reflex Som MVP - Documentação Completa

## 📋 Visão Geral

Sistema de locação de equipamentos de som e eventos com backend Django e frontend React.

---

## 🏗️ Arquitetura

```
reflex-som-mvp/
├── 🐍 Backend (Django)
├── ⚛️ Frontend (React)
├── 🗄️ Banco SQLite
└── 📦 Scripts e Utilitários
```

---

## 📁 Estrutura de Pastas

### **Backend (Django)**

#### `backend/` - Configurações Principais
- `settings.py` - Configurações do Django, banco, apps
- `urls.py` - URLs principais da aplicação
- `asgi.py` - Configuração para produção

#### `clientes/` - App de Usuários
- `models.py` - Modelo Cliente (usuário customizado)
- `views.py` - APIs de login, registro, perfil
- `serializers.py` - Conversão de dados para JSON
- `urls.py` - URLs do app clientes
- `admin.py` - Configuração do painel admin

#### `equipamentos/` - App de Produtos
- `models.py` - Modelos Categoria e Equipamento
- `views.py` - APIs CRUD de equipamentos
- `serializers.py` - Conversão de dados
- `permissions.py` - Permissões customizadas
- `urls.py` - URLs do app equipamentos
- `admin.py` - Configuração do painel admin

### **Frontend (React)**

#### `frontend/src/components/` - Componentes React
- `ui/` - Componentes de interface (shadcn/ui)
- `Layout.jsx` - Layout principal da aplicação
- `Dashboard.jsx` - Página inicial
- `Equipamentos.jsx` - Lista e filtros de equipamentos
- `CadastrarEquipamento.jsx` - Formulário de cadastro
- `StaffRoute.jsx` - Proteção de rotas para staff
- `Login.jsx` - Página de login
- `Registro.jsx` - Página de registro
- `Perfil.jsx` - Página de perfil do usuário

#### `frontend/src/contexts/` - Contextos React
- `AuthContext.jsx` - Gerenciamento de autenticação

#### `frontend/src/lib/` - Utilitários
- `api.js` - Serviços para comunicação com backend

#### `frontend/src/hooks/` - Hooks Customizados
- `use-mobile.js` - Hook para detectar dispositivo móvel

### **Scripts e Utilitários**
- `create_sample_data.py` - Cria dados de exemplo
- `create_staff_user.py` - Cria usuários administradores
- `manage.py` - Comandos Django
- `requirements.txt` - Dependências Python
- `package.json` - Dependências Node.js

---

## 🗄️ Banco de Dados

### **Tipo:** SQLite
### **Arquivo:** `db.sqlite3`

### **Tabelas Principais:**
- `clientes_cliente` - Usuários do sistema
- `equipamentos_categoria` - Categorias de equipamentos
- `equipamentos_equipamento` - Produtos para locação

---

## 🔐 Sistema de Autenticação

### **Modelo:** Cliente customizado
### **Método:** JWT (JSON Web Tokens)
### **Permissões:** Baseadas em `is_staff`

---

## ✅ Funcionalidades Implementadas

### **🔐 Autenticação**
- ✅ Login de usuários
- ✅ Registro de novos clientes
- ✅ Logout
- ✅ Renovação automática de tokens
- ✅ Proteção de rotas

### **👥 Gestão de Usuários**
- ✅ Modelo Cliente customizado
- ✅ Perfil do usuário
- ✅ Alteração de senha
- ✅ Verificação de email/CPF
- ✅ Usuários staff/admin

### **📦 Gestão de Equipamentos**
- ✅ Listagem de equipamentos
- ✅ Filtros por categoria, preço, disponibilidade
- ✅ Busca por texto
- ✅ Visualização em grid e lista
- ✅ Detalhes do equipamento
- ✅ **Cadastro de equipamentos (apenas staff)**

### **🏷️ Categorias**
- ✅ Listagem de categorias
- ✅ Filtros por categoria
- ✅ Categorias ativas/inativas

### **💰 Valores e Preços**
- ✅ Valor diário (obrigatório)
- ✅ Valor semanal (opcional)
- ✅ Valor mensal (opcional)
- ✅ Cálculo automático de valores

### **🔒 Permissões**
- ✅ Usuários comuns: visualizar equipamentos
- ✅ Usuários staff: cadastrar, editar equipamentos
- ✅ Proteção de rotas no frontend
- ✅ Validação de permissões no backend

---

## 🚀 Como Executar

### **1. Backend (Django)**
```bash
# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Criar dados de exemplo
python create_sample_data.py
python create_staff_user.py

# Iniciar servidor
python manage.py runserver
```

### **2. Frontend (React)**
```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

---

## 👤 Usuários de Teste

### **Administrador**
- Email: `admin@reflexsom.com`
- Senha: `admin123`
- Permissões: Staff + Superuser

### **Staff**
- Email: `staff@reflexsom.com`
- Senha: `staff123`
- Permissões: Staff

---

## 📱 Endpoints da API

### **Autenticação**
- `POST /api/clientes/registro/` - Registrar usuário
- `POST /api/clientes/login/` - Fazer login
- `POST /api/clientes/logout/` - Fazer logout
- `GET /api/clientes/info/` - Informações do usuário
- `PUT /api/clientes/perfil/` - Atualizar perfil

### **Equipamentos**
- `GET /api/equipamentos/` - Listar equipamentos
- `GET /api/equipamentos/<id>/` - Detalhes do equipamento
- `POST /api/equipamentos/criar/` - Criar equipamento (staff)
- `PUT /api/equipamentos/<id>/editar/` - Editar equipamento (staff)
- `DELETE /api/equipamentos/<id>/deletar/` - Deletar equipamento (staff)

### **Categorias**
- `GET /api/equipamentos/categorias/` - Listar categorias
- `POST /api/equipamentos/categorias/criar/` - Criar categoria (staff)

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- Django 5.2.3
- Django REST Framework
- Django CORS Headers
- Simple JWT
- Django Filters
- DRF YASG (Swagger)

### **Frontend**
- React 18
- Vite
- React Router
- Axios
- Lucide React (ícones)
- Tailwind CSS
- shadcn/ui

### **Banco de Dados**
- SQLite (desenvolvimento)
- PostgreSQL (configurado para produção)

---

## 📊 Fluxo de Dados

```
Frontend (React) ←→ API REST ←→ Backend (Django) ←→ Banco SQLite
```

1. **Frontend** faz requisições HTTP para **Backend**
2. **Backend** processa, valida e salva no **Banco**
3. **Backend** retorna respostas JSON
4. **Frontend** atualiza a interface

---

## 🔧 Comandos Úteis

### **Django**
```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Shell Django
python manage.py shell

# Coletar arquivos estáticos
python manage.py collectstatic
```

### **Frontend**
```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## 📝 Próximas Funcionalidades

- [ ] Upload de imagens
- [ ] Edição de equipamentos
- [ ] Exclusão de equipamentos
- [ ] Sistema de locação
- [ ] Histórico de alterações
- [ ] Notificações
- [ ] Relatórios
- [ ] Dashboard administrativo

---

## 🐛 Troubleshooting

### **Problema:** Botão "Cadastrar Equipamento" não aparece
**Solução:** Faça login com usuário staff (`admin@reflexsom.com` ou `staff@reflexsom.com`)

### **Problema:** Erro 403 Forbidden
**Solução:** Verifique se o token de autenticação é válido

### **Problema:** Erro ao carregar categorias
**Solução:** Execute `python create_sample_data.py`

### **Problema:** Frontend não conecta com backend
**Solução:** Verifique se ambos os servidores estão rodando (Django na porta 8000, React na porta 5173)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os logs do servidor
3. Verifique a configuração do banco de dados
4. Confirme se todas as dependências estão instaladas

---

**Versão:** 1.0.0  
**Última atualização:** Junho 2025 