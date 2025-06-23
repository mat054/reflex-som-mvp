# Reflex Som - Sistema de Locação de Equipamentos (MVP)

## Visão Geral

O Reflex Som é um sistema web moderno desenvolvido para gerenciar locações de equipamentos de som e áudio. Este MVP (Minimum Viable Product) implementa as funcionalidades essenciais para cadastro de clientes, autenticação, gerenciamento de perfil e cadastro de equipamentos.

## Arquitetura Tecnológica

### Backend
- **Django 5.2.3** - Framework web Python
- **Django REST Framework** - APIs RESTful
- **Django CORS Headers** - Suporte a CORS
- **Simple JWT** - Autenticação JWT
- **drf-yasg** - Documentação Swagger/OpenAPI
- **PostgreSQL** - Banco de dados (configurado para SQLite em desenvolvimento)

### Frontend
- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Shadcn/UI** - Componentes de interface
- **Axios** - Cliente HTTP
- **React Router** - Roteamento

## Funcionalidades Implementadas

### ✅ Funcionalidades do MVP
1. **Cadastro de Cliente** - Registro completo com validações
2. **Login de Cliente** - Autenticação com JWT
3. **Logoff de Cliente** - Encerramento seguro de sessão
4. **Edição de Dados Pessoais** - Atualização de perfil
5. **Cadastro de Equipamento** - Interface para adicionar equipamentos

### 🔧 Recursos Técnicos
- Interface responsiva (desktop e mobile)
- Autenticação JWT com refresh tokens
- Validações em tempo real
- Tratamento de erros
- Documentação automática da API
- Proteção de rotas
- CORS configurado

## Estrutura do Projeto

```
reflex-som-mvp/
├── backend/                 # Configurações Django
├── clientes/               # App de clientes
├── equipamentos/           # App de equipamentos
├── frontend/               # Aplicação React
├── manage.py              # Django management
└── README.md              # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### Backend (Django)

1. **Instalar dependências:**
```bash
pip install django djangorestframework django-cors-headers psycopg2-binary djangorestframework-simplejwt drf-yasg django-filter
```

2. **Executar migrações:**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Criar superusuário:**
```bash
python manage.py createsuperuser
```

4. **Iniciar servidor:**
```bash
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React)

1. **Instalar dependências:**
```bash
cd frontend
pnpm install
```

2. **Iniciar servidor de desenvolvimento:**
```bash
pnpm run dev --host
```

## URLs de Acesso

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin
- **Documentação API:** http://localhost:8000/swagger

## Endpoints da API

### Autenticação
- `POST /api/clientes/registro/` - Cadastro de cliente
- `POST /api/clientes/login/` - Login
- `POST /api/clientes/logout/` - Logout
- `POST /api/token/` - Obter token JWT
- `POST /api/token/refresh/` - Renovar token

### Clientes
- `GET /api/clientes/perfil/` - Obter perfil
- `PUT /api/clientes/perfil/` - Atualizar perfil
- `POST /api/clientes/alterar-senha/` - Alterar senha

### Equipamentos
- `GET /api/equipamentos/` - Listar equipamentos
- `POST /api/equipamentos/` - Criar equipamento
- `GET /api/equipamentos/{id}/` - Detalhes do equipamento
- `PUT /api/equipamentos/{id}/` - Atualizar equipamento
- `DELETE /api/equipamentos/{id}/` - Excluir equipamento

## Modelos de Dados

### Cliente
```python
class Cliente(AbstractUser):
    nome_completo = CharField(max_length=255)
    cpf_cnpj = CharField(max_length=18, unique=True)
    telefone = CharField(max_length=15)
    endereco = CharField(max_length=255)
    cidade = CharField(max_length=100)
    estado = CharField(max_length=2)
    cep = CharField(max_length=9)
    data_nascimento = DateField(null=True, blank=True)
    data_cadastro = DateTimeField(auto_now_add=True)
```

### Equipamento
```python
class Equipamento(Model):
    nome = CharField(max_length=255)
    marca = CharField(max_length=100)
    modelo = CharField(max_length=100)
    categoria = ForeignKey(CategoriaEquipamento)
    descricao = TextField()
    valor_diaria = DecimalField(max_digits=10, decimal_places=2)
    quantidade_total = PositiveIntegerField()
    quantidade_disponivel = PositiveIntegerField()
    estado = CharField(max_length=20, choices=ESTADOS_EQUIPAMENTO)
    imagem_principal = URLField(blank=True)
```

## Testes Realizados

### ✅ Testes de Funcionalidade
- Cadastro de cliente com validações
- Login e autenticação JWT
- Redirecionamento após login
- Proteção de rotas
- Validação de formulários
- Tratamento de erros

### ✅ Testes de Interface
- Responsividade mobile/desktop
- Navegação entre páginas
- Feedback visual de ações
- Estados de loading
- Mensagens de erro/sucesso

## Próximos Passos

### Funcionalidades Futuras
- Sistema de locações
- Calendário de disponibilidade
- Relatórios e dashboards
- Notificações
- Sistema de pagamentos
- Gestão de contratos

### Melhorias Técnicas
- Testes automatizados
- CI/CD pipeline
- Monitoramento
- Cache Redis
- Upload de imagens
- Backup automático

## Contribuição

Este projeto segue as melhores práticas de desenvolvimento:
- Código limpo e documentado
- Separação de responsabilidades
- Validações robustas
- Tratamento de erros
- Interface intuitiva

## Licença

Projeto desenvolvido para a empresa Reflex Som como MVP do sistema de locação de equipamentos.

---

**Desenvolvido por:** Manus AI  
**Data:** Junho 2025  
**Versão:** 1.0.0 (MVP)

