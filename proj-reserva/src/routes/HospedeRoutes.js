import { Router } from "express";
import HospedeController from "../Controllers/HospedeController.js";

const router = Router();

// Define as rotas para o recurso 'hospede'
router.get("/api/hospede", HospedeController.index);
router.get("/api/hospede/:id", HospedeController.show);
router.post("/api/hospede", HospedeController.store);
router.put("/api/hospede/:id", HospedeController.update);
router.delete("/api/hospede/:id", HospedeController.destroy);

export default router;
