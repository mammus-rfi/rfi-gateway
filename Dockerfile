# syntax = docker/dockerfile:1

# Define a versão do Node e utiliza a imagem slim
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force

# Etapa de build
FROM base AS build
# Atualiza os repositórios e instala dependências de build, incluindo o OpenSSL
RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential node-gyp pkg-config python-is-python3 openssl
# Copia os arquivos de dependências e instala os pacotes
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
# Copia o restante do código e gera o Prisma Client
COPY . .
RUN yarn prisma generate
# Constrói a aplicação NestJS
RUN yarn run build

# Etapa final: imagem de produção
FROM base AS final
# Instala o OpenSSL na imagem final para garantir que o Prisma o detecte
RUN apt-get update && apt-get install --no-install-recommends -y openssl
# Copia o app construído da etapa de build
COPY --from=build /app /app

EXPOSE 3000
CMD [ "yarn", "run", "start" ]
