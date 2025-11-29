FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3005

# Comando para iniciar a aplicação
CMD ["npm", "start"]
