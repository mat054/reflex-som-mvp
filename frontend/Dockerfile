# Dockerfile para Frontend React (Produção)
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Criar arquivo .env se não existir (para Docker Compose local)
# No Render, as variáveis vêm do render.yaml
RUN if [ ! -f .env ]; then echo "VITE_API_BASE_URL=/api" > .env; fi

# Fazer build da aplicação para produção
RUN pnpm run build

# Expor porta 8080 (padrão para produção)
EXPOSE 8080

# Comando para produção (vite preview na porta 8080)
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "8080"] 