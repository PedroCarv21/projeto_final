# API de Reservas

Sistema de gerenciamento de reservas e hóspedes.

## 🚀 Configuração do Ambiente

### Variáveis de Ambiente

O projeto usa variáveis de ambiente para configuração. Copie o arquivo `.env.example` para `.env` e ajuste os valores conforme necessário:

```bash
cp .env.example .env
```

### Variáveis Disponíveis

#### Configurações do Servidor
- `PORT`: Porta em que o servidor irá rodar (padrão: 3002)
- `NODE_ENV`: Ambiente de execução (development/production)

#### Configurações do Banco de Dados
- `DB_HOST`: Endereço do servidor MySQL
- `DB_USER`: Usuário do banco de dados
- `DB_PASSWORD`: Senha do banco de dados
- `DB_NAME`: Nome do banco de dados
- `DB_PORT`: Porta do MySQL (padrão: 3306)

#### Configurações de Conexão
- `DB_CONNECTION_LIMIT`: Número máximo de conexões simultâneas (padrão: 10)
- `DB_QUEUE_LIMIT`: Limite de requisições na fila (padrão: 0 = sem limite)
- `DB_WAIT_FOR_CONNECTIONS`: Aguardar conexão disponível quando o limite for atingido (padrão: true)

#### Configurações da Aplicação
- `DEFAULT_RESERVATION_STATUS`: Status padrão para novas reservas (padrão: Pendente)

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar o Projeto

### Modo Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

## 🔌 Endpoints da API

### Reservas
- `GET /api/reserva` ou `GET /api/reservas` - Lista todas as reservas
- `GET /api/reserva/:id` - Busca uma reserva específica
- `POST /api/reserva` - Cria uma nova reserva
- `PUT /api/reserva/:id` - Atualiza uma reserva
- `DELETE /api/reserva/:id` - Remove uma reserva

### Hóspedes
- Endpoints disponíveis em `/api/hospede`

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` no repositório. Ele já está incluído no `.gitignore`.
