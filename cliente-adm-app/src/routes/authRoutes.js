import express from "express";
import AuthController from "../controllers/AuthController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting para proteger contra ataques de força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    erro: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/login - Login
router.post("/login", loginLimiter, AuthController.loginCliente);

// POST /auth/refresh - Renovar access token
router.post("/refresh", AuthController.refreshToken);

// POST /auth/logout - Logout (invalida tokens)
router.post("/logout", AuthController.logout);

export default router;
