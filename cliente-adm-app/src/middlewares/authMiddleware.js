import jwt from "jsonwebtoken";
import AuthController from "../controllers/AuthController.js";
import config from "../config/config.js";

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e não está na blacklist
 */
export const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ erro: "Formato de token inválido." });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: "Token mal formatado." });
  }

  // Verificar se o token está na blacklist
  if (AuthController.isTokenBlacklisted(token)) {
    return res
      .status(401)
      .json({ erro: "Token inválido. Faça login novamente." });
  }

  const JWT_SECRET = config.jwt.secret;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: "Token inválido ou expirado." });
    }

    // Adicionar informações do usuário ao request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  });
};

/**
 * Middleware para verificar se o usuário pode acessar apenas seus próprios dados
 */
export const verificarProprietario = (req, res, next) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;

  // Clientes só podem acessar seus próprios dados
  if (id && id !== usuarioId) {
    return res.status(403).json({
      erro: "Você não tem permissão para acessar este recurso.",
    });
  }

  return next();
};
