import { NextResponse } from "next/server"

// In a real implementation, this would use the serialport library
// to communicate with the Arduino Mega
const sendToArduino = async (command: string) => {
  console.log(`Sending to Arduino: ${command}`)
  // Simulate a delay for the Arduino processing
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { success: true, message: "Magnet state changed successfully" }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { state } = body

    if (state === undefined) {
      return NextResponse.json({ error: "Magnet state is required" }, { status: 400 })
    }

    // Format the command for the magnet
    // M,STATE where STATE is 1 (on) or 0 (off)
    const command = `M,${state}`

    // Send the command to Arduino
    const result = await sendToArduino(command)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing magnet command:", error)
    return NextResponse.json({ error: "Failed to process magnet command" }, { status: 500 })
  }
}

