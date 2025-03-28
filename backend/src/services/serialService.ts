import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPortConfig, ConnectionResult, PortInfo } from "../types";

class SerialService {
  private serialPort: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private isConnected = false;

  async listPorts(): Promise<PortInfo[]> {
    try {
      const ports = await SerialPort.list();
      console.log("Available ports:", ports);
      return ports;
    } catch (err) {
      console.error("Error listing ports:", err);
      return [];
    }
  }

  async connectToPort(config: SerialPortConfig): Promise<ConnectionResult> {
    try {
      // Close existing connection if open
      if (this.serialPort && this.serialPort.isOpen) {
        await this.disconnectPort();
      }

      // Create new serial port instance
      this.serialPort = new SerialPort({
        path: config.path,
        baudRate: config.baudRate || 115200,
        dataBits: (config.dataBits as 8 | 5 | 6 | 7 | undefined) || 8,
        stopBits: (config.stopBits as 1 | 1.5 | 2 | undefined) || 1,
        parity: config.parity || "none",
        autoOpen: false,
      });

      // Set up event listeners
      this.serialPort.on("error", (err) => {
        console.error("Serial port error:", err);
        this.isConnected = false;
      });

      this.serialPort.on("close", () => {
        console.log("Serial port closed");
        this.isConnected = false;
      });

      // Open port with timeout
      await this.openPortWithTimeout();

      // Set up parser
      this.parser = this.serialPort.pipe(
        new ReadlineParser({ delimiter: "\r\n" })
      );

      // Handle incoming data
      this.parser.on("data", (data) => {
        console.log("Received from Arduino:", data);
      });

      // Send test command
      await this.sendCommand("\n");

      this.isConnected = true;
      return {
        success: true,
        message: `Connected to ${config.path}`,
      };
    } catch (err) {
      console.error("Error connecting to port:", err);
      this.isConnected = false;
      return {
        success: false,
        message: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  private openPortWithTimeout(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.serialPort) {
        reject(new Error("Serial port not initialized"));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }, timeout);

      this.serialPort.open((err) => {
        clearTimeout(timer);
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async sendCommand(command: string): Promise<ConnectionResult> {
    return new Promise((resolve, reject) => {
      if (!this.serialPort || !this.serialPort.isOpen) {
        reject(new Error("Serial port not connected"));
        return;
      }

      const formattedCommand = command.endsWith("\n")
        ? command
        : `${command}\n`;

      this.serialPort.write(formattedCommand, (err) => {
        if (err) {
          console.error("Error writing to port:", err);
          reject(err);
          return;
        }

        console.log(`Command sent: ${command}`);
        resolve({
          success: true,
          message: "Command sent successfully",
        });
      });
    });
  }

  async disconnectPort(): Promise<ConnectionResult> {
    return new Promise((resolve) => {
      if (this.serialPort && this.serialPort.isOpen) {
        this.serialPort.close((err) => {
          if (err) {
            console.error("Error closing port:", err);
          }
          this.isConnected = false;
          this.serialPort = null;
          this.parser = null;
          resolve({
            success: true,
            message: "Disconnected from serial port",
          });
        });
      } else {
        resolve({
          success: false,
          message: "Not connected to any port",
        });
      }
    });
  }

  getStatus() {
    return {
      connected: this.isConnected,
      port: this.serialPort ? this.serialPort.path : null,
      baudRate: this.serialPort ? this.serialPort.baudRate : null,
    };
  }
}

export default new SerialService();
