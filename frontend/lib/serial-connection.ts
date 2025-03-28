export interface SerialConnectionOptions {
  port: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: "none" | "even" | "odd"
}

export interface SerialConnection {
  isConnected: boolean
  connect: (options: SerialConnectionOptions) => Promise<boolean>
  disconnect: () => Promise<boolean>
  send: (command: string) => Promise<{ success: boolean; message: string }>
}

// This is a mock implementation for the frontend
export const createSerialConnection = (): SerialConnection => {
  let connected = false

  return {
    isConnected: connected,

    connect: async (options: SerialConnectionOptions) => {
      console.log(`Connecting to ${options.port} at ${options.baudRate} baud`)
      // In a real implementation, this would connect to the serial port
      connected = true
      return connected
    },

    disconnect: async () => {
      console.log("Disconnecting from serial port")
      // In a real implementation, this would disconnect from the serial port
      connected = false
      return true
    },

    send: async (command: string) => {
      if (!connected) {
        return { success: false, message: "Not connected to serial port" }
      }

      console.log(`Sending command: ${command}`)
      // In a real implementation, this would send the command to the serial port

      // Simulate a delay for the Arduino processing
      await new Promise((resolve) => setTimeout(resolve, 500))

      return { success: true, message: "Command executed successfully" }
    },
  }
}

