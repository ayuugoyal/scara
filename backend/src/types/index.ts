export interface SerialPortConfig {
  path: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: "none" | "even" | "mark" | "odd" | "space";
}

export interface ConnectionResult {
  success: boolean;
  message: string;
}

export interface PortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export interface SerialStatus {
  connected: boolean;
  port: string | null;
  baudRate: number | null;
}
