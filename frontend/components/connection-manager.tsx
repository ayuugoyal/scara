"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Usb } from "lucide-react"

interface Port {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  locationId?: string
  productId?: string
  vendorId?: string
}

export default function ConnectionManager() {
  const [ports, setPorts] = useState<Port[]>([])
  const [selectedPort, setSelectedPort] = useState<string>("")
  const [baudRate, setBaudRate] = useState<string>("115200")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string>("")

  const baudRates = ["9600", "19200", "38400", "57600", "115200", "230400"]

  // Fetch available ports
  const fetchPorts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/ports")
      const data = await response.json()
      setPorts(data.ports || [])
    } catch (error) {
      console.error("Error fetching ports:", error)
      setStatus("Failed to fetch ports")
    } finally {
      setIsLoading(false)
    }
  }

  // Connect to selected port
  const connect = async () => {
    if (!selectedPort) {
      setStatus("Please select a port")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ port: selectedPort, baudRate: Number.parseInt(baudRate) }),
      })

      const data = await response.json()

      if (data.success) {
        setIsConnected(true)
        setStatus(`Connected to ${selectedPort}`)
      } else {
        setStatus(`Connection failed: ${data.message}`)
      }
    } catch (error) {
      console.error("Error connecting to port:", error)
      setStatus("Connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect from port
  const disconnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/disconnect", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setIsConnected(false)
        setStatus("Disconnected")
      } else {
        setStatus(`Disconnection failed: ${data.message}`)
      }
    } catch (error) {
      console.error("Error disconnecting:", error)
      setStatus("Disconnection failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Check connection status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/status")
        const data = await response.json()

        setIsConnected(data.connected)
        if (data.connected) {
          setSelectedPort(data.port)
          setBaudRate(data.baudRate.toString())
          setStatus(`Connected to ${data.port}`)
        }
      } catch (error) {
        console.error("Error checking status:", error)
      }
    }

    fetchPorts()
    checkStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Settings</CardTitle>
        <CardDescription>Configure the connection to your Arduino Mega</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <label className="text-sm font-medium mb-1 block">Serial Port</label>
              <div className="flex">
                <Select value={selectedPort} onValueChange={setSelectedPort} disabled={isConnected || isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select port" />
                  </SelectTrigger>
                  <SelectContent>
                    {ports.map((port) => (
                      <SelectItem key={port.path} value={port.path}>
                        {port.path} {port.manufacturer ? `(${port.manufacturer})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="ml-2" onClick={fetchPorts} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-1/3">
              <label className="text-sm font-medium mb-1 block">Baud Rate</label>
              <Select value={baudRate} onValueChange={setBaudRate} disabled={isConnected || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Baud rate" />
                </SelectTrigger>
                <SelectContent>
                  {baudRates.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <Button
              onClick={isConnected ? disconnect : connect}
              disabled={isLoading || (!selectedPort && !isConnected)}
              className="flex items-center gap-2"
            >
              <Usb className="h-4 w-4" />
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>

          {status && <div className="text-sm mt-2 p-2 bg-slate-100 rounded">{status}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

