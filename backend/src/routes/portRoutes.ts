import express from "express";
import { PortController } from "../controllers/portController";

const router = express.Router();
const portController = new PortController();

router.get("/ports", portController.listPorts);
router.post("/connect", portController.connectPort);
router.post("/disconnect", portController.disconnectPort);
router.get("/status", portController.getStatus);

export default router;
