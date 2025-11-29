import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/clienteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import config from "./config/config.js";

const app = express();

// Configuração de CORS para permitir requisições do frontend
const corsOptions = {
  origin: config.cors.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rotas da API
app.use("/auth", authRoutes);
app.use("/clientes", clienteRoutes);

// Rota de saúde da API
app.get("/health", (req, res) => {
  res.json({ status: "API funcionando", timestamp: new Date().toISOString() });
});

// Rota raiz com documentação
app.get("/", (req, res) => {
  res.json({
    nome: "API de Autenticação - Clientes",
    versao: "1.0.0",
    endpoints: {
      autenticacao: {
        "POST /auth/login": "Login",
        "POST /auth/refresh": "Renovar token de acesso",
        "POST /auth/logout": "Logout (invalidar tokens)",
      },
      clientes: {
        "GET /clientes": "Listar todos os clientes",
        "GET /clientes/:id": "Buscar cliente por ID",
        "POST /clientes":
          "Criar novo cliente (aceita FormData com foto ou JSON)",
        "PUT /clientes/:id": "Atualizar cliente",
        "POST /clientes/:id/foto": "Upload de foto de perfil",
        "DELETE /clientes": "Desativar cliente",
      },
    },
    autorizacao: {
      header: "Authorization: Bearer {token}",
      nota: "Use o token recebido no login nas rotas protegidas",
    },
  });
});

export default app;
