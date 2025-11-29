import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ClienteModel from "../models/ClienteModel.js";
import config from "../config/config.js";

class AuthController {
  // Armazenamento temporário de refresh tokens
  static refreshTokens = new Set();
  static tokenBlacklist = new Set();

  static JWT_SECRET = config.jwt.secret;
  static JWT_REFRESH_SECRET = config.jwt.refreshSecret;
  static JWT_EXPIRES_IN = config.jwt.expiresIn;
  static JWT_REFRESH_EXPIRES_IN = config.jwt.refreshExpiresIn;

  /**
   * Gera access token e refresh token
   */
  static gerarTokens(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
    };

    const accessToken = jwt.sign(payload, AuthController.JWT_SECRET, {
      expiresIn: AuthController.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, AuthController.JWT_REFRESH_SECRET, {
      expiresIn: AuthController.JWT_REFRESH_EXPIRES_IN,
    });

    AuthController.refreshTokens.add(refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Login de Cliente
   */
  static async loginCliente(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res
          .status(400)
          .json({ erro: "Email e senha são obrigatórios." });
      }

      // Buscar cliente pelo email
      const [rows] = await ClienteModel.buscarPorEmail(email);

      if (rows.length === 0) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
      }

      const cliente = rows[0];

      // Verificar se o cliente está ativo
      if (cliente.status_cliente !== "Ativo") {
        return res.status(403).json({
          erro: "Conta inativa. Entre em contato com o suporte.",
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, cliente.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
      }

      // Gerar tokens
      const { accessToken, refreshToken } = AuthController.gerarTokens(cliente);

      res.json({
        message: "Login realizado com sucesso.",
        accessToken,
        refreshToken,
        usuario: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
        },
      });
    } catch (error) {
      console.error("Erro ao fazer login de cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Refresh Token - Gera novo access token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ erro: "Refresh token é obrigatório." });
      }

      // Verificar se o refresh token está na lista de tokens válidos
      if (!AuthController.refreshTokens.has(refreshToken)) {
        return res.status(403).json({ erro: "Refresh token inválido." });
      }

      // Verificar o refresh token
      jwt.verify(
        refreshToken,
        AuthController.JWT_REFRESH_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(403).json({ erro: "Refresh token inválido." });
          }

          // Gerar novo access token
          const payload = {
            id: decoded.id,
            email: decoded.email,
          };

          const accessToken = jwt.sign(payload, AuthController.JWT_SECRET, {
            expiresIn: AuthController.JWT_EXPIRES_IN,
          });

          res.json({
            message: "Token renovado com sucesso.",
            accessToken,
          });
        }
      );
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Logout - Invalida o refresh token
   */
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const authHeader = req.headers.authorization;

      if (refreshToken) {
        AuthController.refreshTokens.delete(refreshToken);
      }

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        AuthController.tokenBlacklist.add(token);
      }

      res.json({ message: "Logout realizado com sucesso." });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      res.status(500).json({ erro: "Erro interno do servidor." });
    }
  }

  /**
   * Verificar se um token está na blacklist
   */
  static isTokenBlacklisted(token) {
    return AuthController.tokenBlacklist.has(token);
  }
}

export default AuthController;
