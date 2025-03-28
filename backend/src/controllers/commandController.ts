import { Request, Response } from "express";
import serialService from "../services/serialService";

export class CommandController {
  async sendCommand(req: Request, res: Response) {
    try {
      const { command } = req.body;

      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      const status = serialService.getStatus();
      if (!status.connected) {
        return res.status(400).json({ error: "Not connected to serial port" });
      }

      const result = await serialService.sendCommand(command);
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  async toggleMagnet(req: Request, res: Response) {
    try {
      const { state } = req.body;

      if (state === undefined) {
        return res.status(400).json({ error: "Magnet state is required" });
      }

      const status = serialService.getStatus();
      if (!status.connected) {
        return res.status(400).json({ error: "Not connected to serial port" });
      }

      const command = `M,${state}`;

      const result = await serialService.sendCommand(command);
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
}
