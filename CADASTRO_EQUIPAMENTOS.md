# Funcionalidade de Cadastro de Equipamentos

## Visão Geral

Esta funcionalidade permite que usuários com permissão de staff cadastrem novos equipamentos no sistema de locação.

## Funcionalidades Implementadas

### Backend (Django)

1. **Modelo de Equipamento** (`equipamentos/models.py`)
   - Campos completos para equipamentos de locação
   - Validações de quantidade e valores
   - Suporte a especificações técnicas em JSON
   - Suporte a múltiplas imagens

2. **API REST** (`equipamentos/views.py`)
   - `EquipamentoCreateView`: Endpoint para criar equipamentos
   - Validações customizadas no serializer
   - Permissões baseadas em `is_staff`

3. **Permissões Customizadas** (`equipamentos/permissions.py`)
   - `IsStaffUser`: Permite acesso apenas para usuários staff
   - `IsAdminOrReadOnly`: Permite leitura para todos, escrita para staff

4. **Serializers** (`equipamentos/serializers.py`)
   - `EquipamentoCreateUpdateSerializer`: Para criação e edição
   - Validações de quantidade e valores
   - Validação de número de série único

### Frontend (React)

1. **Componente de Cadastro** (`frontend/src/components/CadastrarEquipamento.jsx`)
   - Formulário completo com todos os campos
   - Validações em tempo real
   - Suporte a especificações técnicas dinâmicas
   - Suporte a múltiplas imagens
   - Interface responsiva e moderna

2. **Proteção de Rotas** (`frontend/src/components/StaffRoute.jsx`)
   - Verifica se o usuário é staff antes de permitir acesso
   - Redireciona para página de equipamentos se não autorizado

3. **Integração com API** (`frontend/src/lib/api.js`)
   - Método `equipamentoService.criar()` para enviar dados
   - Tratamento de erros e respostas

## Como Usar

### 1. Acessar a Funcionalidade

1. Faça login com um usuário que tenha permissão de staff
2. Navegue para a página de Equipamentos
3. Clique no botão "Cadastrar Equipamento" (visível apenas para staff)

### 2. Preencher o Formulário

#### Informações Básicas (Obrigatórias)
- **Nome do Equipamento**: Nome descritivo do equipamento
- **Categoria**: Selecione uma categoria existente
- **Marca**: Marca do fabricante
- **Modelo**: Modelo específico
- **Descrição**: Descrição detalhada do equipamento

#### Valores de Locação
- **Valor Diária**: Preço por dia (obrigatório)
- **Valor Semanal**: Preço por semana (opcional)
- **Valor Mensal**: Preço por mês (opcional)

#### Quantidade e Estado
- **Quantidade Total**: Total de unidades disponíveis
- **Quantidade Disponível**: Quantidade atual disponível
- **Estado**: Disponível, Locado, Em Manutenção, Inativo

#### Especificações Técnicas (Opcional)
- Adicione especificações técnicas dinâmicas
- Exemplo: Potência, Peso, Dimensões, etc.

#### Imagens (Opcional)
- **Imagem Principal**: URL da imagem principal
- **Imagens Adicionais**: URLs de imagens adicionais

#### Observações (Opcional)
- Informações adicionais sobre o equipamento

### 3. Salvar o Equipamento

1. Clique em "Cadastrar Equipamento"
2. O sistema validará todos os campos
3. Se houver erros, eles serão exibidos
4. Se tudo estiver correto, o equipamento será salvo
5. Você será redirecionado para a lista de equipamentos

## Usuários de Teste

Foram criados usuários staff para teste:

### Administrador
- **Email**: admin@reflexsom.com
- **Senha**: admin123
- **Permissões**: Staff + Superuser

### Staff
- **Email**: staff@reflexsom.com
- **Senha**: staff123
- **Permissões**: Staff

## Validações Implementadas

### Backend
- Quantidade disponível não pode ser maior que quantidade total
- Valores semanais/mensais devem ser vantajosos em relação à diária
- Número de série deve ser único
- Campos obrigatórios devem ser preenchidos
- Valores monetários devem ser positivos

### Frontend
- Validação em tempo real dos campos
- Verificação de campos obrigatórios
- Validação de valores monetários
- Verificação de quantidade disponível vs total

## Endpoints da API

### Criar Equipamento
```
POST /api/equipamentos/criar/
Content-Type: application/json
Authorization: Bearer <token>

{
  "nome": "Nome do Equipamento",
  "categoria": 1,
  "descricao": "Descrição do equipamento",
  "marca": "Marca",
  "modelo": "Modelo",
  "valor_diaria": 100.00,
  "quantidade_total": 5,
  "quantidade_disponivel": 3,
  "estado": "disponivel"
}
```

### Resposta de Sucesso
```json
{
  "message": "Equipamento cadastrado com sucesso!",
  "equipamento": {
    "id": 1,
    "nome": "Nome do Equipamento",
    "categoria": 1,
    "categoria_nome": "Som e Áudio",
    "descricao": "Descrição do equipamento",
    "marca": "Marca",
    "modelo": "Modelo",
    "valor_diaria": "100.00",
    "estado": "disponivel",
    "quantidade_disponivel": 3,
    "quantidade_total": 5,
    "disponivel": true
  }
}
```

## Estrutura de Arquivos

```
reflex-som-mvp/
├── equipamentos/
│   ├── models.py              # Modelo de Equipamento
│   ├── views.py               # Views da API
│   ├── serializers.py         # Serializers
│   ├── permissions.py         # Permissões customizadas
│   └── urls.py                # URLs da API
├── frontend/src/
│   ├── components/
│   │   ├── CadastrarEquipamento.jsx  # Formulário de cadastro
│   │   ├── StaffRoute.jsx            # Proteção de rota
│   │   └── Equipamentos.jsx          # Lista de equipamentos
│   ├── lib/
│   │   └── api.js                    # Serviços da API
│   └── App.jsx                       # Rotas da aplicação
└── create_staff_user.py              # Script para criar usuários staff
```

## Próximos Passos

1. **Upload de Imagens**: Implementar upload de arquivos
2. **Edição de Equipamentos**: Formulário de edição
3. **Exclusão de Equipamentos**: Funcionalidade de remoção
4. **Histórico de Alterações**: Log de mudanças
5. **Notificações**: Alertas para equipamentos com baixo estoque
6. **Relatórios**: Relatórios de equipamentos cadastrados

## Troubleshooting

### Problema: Botão "Cadastrar Equipamento" não aparece
**Solução**: Verifique se o usuário logado tem `is_staff=True`

### Problema: Erro 403 Forbidden ao tentar cadastrar
**Solução**: Verifique se o token de autenticação é válido e se o usuário é staff

### Problema: Validações não funcionam
**Solução**: Verifique se todos os campos obrigatórios estão preenchidos e se os valores são válidos

### Problema: Erro ao carregar categorias
**Solução**: Execute o script `create_sample_data.py` para criar categorias de exemplo 