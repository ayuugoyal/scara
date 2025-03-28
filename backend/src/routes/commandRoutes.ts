import express from "express";
import { CommandController } from "../controllers/commandController";

const router = express.Router();
const commandController = new CommandController();

router.post(
  "/command",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    commandController.sendCommand(req, res).catch(next);
  }
);
router.post(
  "/magnet",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    commandController.toggleMagnet(req, res).catch(next);
  }
);

export default router;
