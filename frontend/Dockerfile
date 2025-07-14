# Dockerfile para Frontend React (Desenvolvimento)
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

# Criar arquivo .env automaticamente se não existir
RUN echo "VITE_API_BASE_URL=http://localhost/api" > .env

# Expor porta do Vite
EXPOSE 5173

# Comando para desenvolvimento (com hot reload)
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"] 