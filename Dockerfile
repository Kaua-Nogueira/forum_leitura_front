# ==============================================================================
# STAGE 1: Build da Aplicação React + TypeScript + Vite
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento de build para injetar a URL da API Laravel em produção
ARG VITE_API_URL=https://forum-leitura-backend.vs5wec.easypanel.host/api
ENV VITE_API_URL=${VITE_API_URL}

# Instala dependências aproveitando o cache de camadas do Docker
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o código-fonte e gera o bundle otimizado de produção
COPY . .
RUN npm run build

# ==============================================================================
# STAGE 2: Servidor Nginx de Produção (Leve e Otimizado para SPA + Runtime Env)
# ==============================================================================
FROM nginx:1.27-alpine AS production

# Remove configuração padrão e adiciona configuração com suporte a React Router (SPA)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos compilados no Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Script de inicialização que injeta variáveis de ambiente de runtime (Easypanel/Docker) em /env-config.js
RUN printf '#!/bin/sh\ncat <<EOF > /usr/share/nginx/html/env-config.js\nwindow.__ENV__ = {\n  VITE_API_URL: "${VITE_API_URL:-}",\n  API_URL: "${API_URL:-}"\n};\nEOF\n' > /docker-entrypoint.d/40-runtime-env.sh \
    && chmod +x /docker-entrypoint.d/40-runtime-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
