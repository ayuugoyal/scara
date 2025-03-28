import { Request, Response } from "express";
import serialService from "../services/serialService";

export class PortController {
  async listPorts(req: Request, res: Response) {
    try {
      const ports = await serialService.listPorts();
      res.json({ ports });
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async connectPort(req: Request, res: Response): Promise<void> {
    try {
      const { port, baudRate } = req.body;

      if (!port) {
        res.status(400).json({ error: "Port is required" });
      }

      const result = await serialService.connectToPort({
        path: port,
        baudRate: baudRate || 115200,
      });

      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async disconnectPort(req: Request, res: Response) {
    try {
      const result = await serialService.disconnectPort();
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  getStatus(req: Request, res: Response) {
    const status = serialService.getStatus();
    res.json(status);
  }
}
