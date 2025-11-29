import dotenv from "dotenv";

dotenv.config();

/**
 * Configurações centralizadas da aplicação
 * Todas as variáveis de ambiente são carregadas e validadas aqui
 */
const config = {
  // Configurações do Servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Configurações de CORS
  cors: {
    frontendUrl: process.env.FRONTEND_URL || "*",
  },

  // Configurações do Banco de Dados
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "database",
    port: parseInt(process.env.DB_PORT) || 3306,
  },

  // Configurações de JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Configurações de Upload
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,
    maxFileSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
  },

  // Configurações de Segurança
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
};

/**
 * Valida se as variáveis obrigatórias estão definidas
 */
const validateConfig = () => {
  const requiredVars = [
    { key: "JWT_SECRET", value: config.jwt.secret },
    { key: "JWT_REFRESH_SECRET", value: config.jwt.refreshSecret },
  ];

  const missingVars = requiredVars.filter((v) => !v.value);

  if (missingVars.length > 0) {
    console.error("\n❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:");
    missingVars.forEach((v) => console.error(`   - ${v.key}`));
    console.error("\n💡 Copie o arquivo .env.example para .env e configure as variáveis.\n");
    process.exit(1);
  }

  // Avisos para configurações padrão em produção
  if (config.server.nodeEnv === "production") {
    if (config.cors.frontendUrl === "*") {
      console.warn("\n⚠️  AVISO: FRONTEND_URL está configurado como '*' em produção!");
    }
    if (config.database.password === "") {
      console.warn("\n⚠️  AVISO: DB_PASSWORD está vazio em produção!");
    }
  }
};

// Validar configurações ao carregar o módulo
validateConfig();

export default config;
