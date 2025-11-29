import express from "express";
import ClienteController from "../controllers/ClienteController.js";
import {
  autenticar,
  verificarProprietario,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET /clientes - Lista todos os clientes
router.get("/", autenticar, ClienteController.listarTodos);

// GET /clientes/:id - Busca cliente por ID (próprio cliente)
router.get(
  "/:id",
  autenticar,
  verificarProprietario,
  ClienteController.buscarPorId
);

// POST /clientes - Cria um novo cliente (público para registro)
// Aceita tanto JSON quanto FormData com foto
router.post("/", upload.single("fotoPerfil"), ClienteController.criar);

// PUT /clientes/:id - Atualiza um cliente (próprio cliente)
router.put(
  "/:id",
  autenticar,
  verificarProprietario,
  ClienteController.atualizar
);

// POST /clientes/:id/foto - Upload de foto de perfil (próprio cliente)
router.post(
  "/:id/foto",
  autenticar,
  verificarProprietario,
  upload.single("fotoPerfil"),
  ClienteController.uploadFotoPerfil
);

// PUT /clientes/:id/senha - Altera a senha do cliente (próprio cliente)
router.put(
  "/:id/senha",
  autenticar,
  verificarProprietario,
  ClienteController.alterarSenha
);

// PUT /clientes/:id/desativar - Desativa um cliente pelo ID (próprio cliente)
router.put(
  "/:id/desativar",
  autenticar,
  verificarProprietario,
  ClienteController.desativarPorId
);

// DELETE /clientes - Desativa um cliente (próprio cliente apenas)
router.delete("/", autenticar, ClienteController.desativar);

export default router;
