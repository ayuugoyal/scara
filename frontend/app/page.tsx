import RobotControl from "@/components/robot-control"
import ConnectionManager from "@/components/connection-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-2">SCARA Robot Control System</h1>
        <p className="text-slate-600 mb-8">Control your 4-axis SCARA robot with precision</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Robot Control Panel</CardTitle>
                <CardDescription>Control individual motors and the end effector</CardDescription>
              </CardHeader>
              <CardContent>
                <RobotControl />
              </CardContent>
            </Card>
          </div>

          <div>
            <ConnectionManager />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>System Log</CardTitle>
                <CardDescription>Recent commands and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-3 rounded-md h-[300px] overflow-y-auto text-sm font-mono">
                  <p className="text-green-600">&gt; Motor 0: 200 steps CW at 800µs</p>
                  <p className="text-slate-600">&lt; Command executed successfully</p>
                  <p className="text-green-600">&gt; Motor 2: 150 steps CCW at 1000µs</p>
                  <p className="text-slate-600">&lt; Command executed successfully</p>
                  <p className="text-green-600">&gt; Magnet: ON</p>
                  <p className="text-slate-600">&lt; Magnet activated</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

