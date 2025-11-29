import { Router } from "express";
import hospedeRoutes from "./HospedeRoutes.js";
import reservaRoutes from "./ReservaRoutes.js";

const router = Router();

// Usa os arquivos de rotas específicos
router.use(hospedeRoutes);
router.use(reservaRoutes);

export default router;
