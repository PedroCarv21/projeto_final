import express from "express";
import { getAllServices, getServiceById } from "../controllers/serviceController.js";
import { deleteAdditionalServiceById, getAllAdditionalServices } from "../controllers/additionalServiceController.js";

const router = express.Router();


router.get("/services", getAllServices);
router.get("/services/:id", getServiceById);
router.get("/additional-services", getAllAdditionalServices);
router.delete("/additional-services/:id", deleteAdditionalServiceById)

export default router;
