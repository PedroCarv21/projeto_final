import { Router } from "express";
import ReservaController from "../Controllers/ReservaController.js";

const router = Router();

// Define as rotas para o recurso 'reserva' (plural principal)
router.get("/reserva", ReservaController.index);
router.get("/reserva/:id", ReservaController.show);
router.post("/reserva", ReservaController.store);
router.put("/reserva/:id", ReservaController.update);
router.delete("/reserva/:id", ReservaController.destroy);

export default router;
