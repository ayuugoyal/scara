"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, RotateCw, Magnet } from "lucide-react"

export default function RobotControl() {
  const [motors, setMotors] = useState([
    { name: "Base Rotation", steps: 100, direction: 0, speed: 1000 },
    { name: "Shoulder", steps: 100, direction: 0, speed: 1000 },
    { name: "Elbow", steps: 100, direction: 0, speed: 1000 },
    { name: "Z-Axis", steps: 100, direction: 0, speed: 1000 },
  ])

  const [magnetActive, setMagnetActive] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  const handleStepsChange = (index: number, value: number) => {
    const newMotors = [...motors]
    newMotors[index].steps = value
    setMotors(newMotors)
  }

  const handleSpeedChange = (index: number, value: number) => {
    const newMotors = [...motors]
    newMotors[index].speed = value
    setMotors(newMotors)
  }

  const handleDirectionChange = (index: number, direction: number) => {
    const newMotors = [...motors]
    newMotors[index].direction = direction
    setMotors(newMotors)
  }

  const sendCommand = async (motorIndex: number) => {
    if (!isConnected) return

    const motor = motors[motorIndex]
    const command = `${motorIndex},${motor.steps},${motor.direction},${motor.speed}`

    try {
      const response = await fetch("http://localhost:3001/api/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      })

      if (!response.ok) {
        throw new Error("Failed to send command")
      }

      console.log(`Command sent: ${command}`)
    } catch (error) {
      console.error("Error sending command:", error)
    }
  }

  const toggleMagnet = async () => {
    if (!isConnected) return

    const newState = !magnetActive
    setMagnetActive(newState)

    try {
      const response = await fetch("/api/robot/magnet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: newState ? 1 : 0 }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle magnet")
        setMagnetActive(!newState) // Revert state on error
      }

      console.log(`Magnet ${newState ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error toggling magnet:", error)
      setMagnetActive(!newState) // Revert state on error
    }
  }

  return (
    <div>
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="individual">Individual Control</TabsTrigger>
          <TabsTrigger value="coordinated">Coordinated Movement</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="space-y-6">
            {motors.map((motor, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-lg mb-4">
                  {motor.name} (Motor {index})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`steps-${index}`} className="mb-2 block">
                      Steps: {motor.steps}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id={`steps-${index}`}
                        min={1}
                        max={1000}
                        step={1}
                        value={[motor.steps]}
                        onValueChange={(value) => handleStepsChange(index, value[0])}
                      />
                      <Input
                        type="number"
                        value={motor.steps}
                        onChange={(e) => handleStepsChange(index, Number.parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`speed-${index}`} className="mb-2 block">
                      Speed (µs delay): {motor.speed}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id={`speed-${index}`}
                        min={100}
                        max={5000}
                        step={100}
                        value={[motor.speed]}
                        onValueChange={(value) => handleSpeedChange(index, value[0])}
                      />
                      <Input
                        type="number"
                        value={motor.speed}
                        onChange={(e) => handleSpeedChange(index, Number.parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant={motor.direction === 0 ? "default" : "outline"}
                    onClick={() => handleDirectionChange(index, 0)}
                    className="flex items-center gap-1"
                  >
                    <RotateCw className="h-4 w-4" /> CW
                  </Button>
                  <Button
                    variant={motor.direction === 1 ? "default" : "outline"}
                    onClick={() => handleDirectionChange(index, 1)}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-4 w-4" /> CCW
                  </Button>
                  <Button onClick={() => sendCommand(index)} className="ml-auto" disabled={!isConnected}>
                    Move
                  </Button>
                </div>
              </div>
            ))}

            <div className="p-4 border rounded-lg bg-white">
              <h3 className="font-medium text-lg mb-4">End Effector</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="magnet-switch"
                  checked={magnetActive}
                  onCheckedChange={toggleMagnet}
                  disabled={!isConnected}
                />
                <Label htmlFor="magnet-switch" className="flex items-center gap-2">
                  <Magnet className="h-4 w-4" />
                  Magnet {magnetActive ? "On" : "Off"}
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coordinated">
          <div className="p-4 border rounded-lg bg-white">
            <h3 className="font-medium text-lg mb-4">Coordinated Movement</h3>
            <p className="text-slate-600 mb-4">Control multiple motors simultaneously for coordinated movements</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button className="h-20 flex flex-col items-center justify-center gap-1">
                <ArrowUpCircle className="h-6 w-6" />
                <span>Move Up</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-1">
                <ArrowDownCircle className="h-6 w-6" />
                <span>Move Down</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-1">
                <RotateCw className="h-6 w-6" />
                <span>Rotate CW</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-1">
                <RotateCcw className="h-6 w-6" />
                <span>Rotate CCW</span>
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="outline">Home Position</Button>
              <Button variant="destructive">Emergency Stop</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

