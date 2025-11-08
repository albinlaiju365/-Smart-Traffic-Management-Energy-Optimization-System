import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Mock Data (Move this to an API call later) ---
const cameraData = [
  { id: "CAM-001", location: "Main St & 1st Ave", status: "Online" },
  { id: "CAM-002", location: "Main St & 2nd Ave", status: "Online" },
  { id: "CAM-003", location: "Oak St & 3rd Ave", status: "Offline" },
  { id: "CAM-004", location: "Maple St & 1st Ave", status: "Online" },
  { id: "CAM-005", location: "Maple St & 2nd Ave", status: "Maintenance" },
  { id: "CAM-006", location: "Cedar St & 4th Ave", status: "Online" },
  { id: "CAM-007", location: "Elm St & 5th Ave", status: "Online" },
  // ... add all 50 cameras
];

export default function LiveCameras() {
  return (
    <main className="flex-1 p-6 overflow-y-auto h-full w-full">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Live Camera Status</CardTitle>
          <CardDescription>
            Live status of all traffic cameras in the network (40 / 50 Online).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cameraData.map((cam) => (
              <div
                key={cam.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div>
                  <p className="font-semibold">{cam.id}</p>
                  <p className="text-sm text-muted-foreground">{cam.location}</p>
                </div>
                <Badge
                  variant={
                    cam.status === "Online" ? "default" : 
                    cam.status === "Offline" ? "destructive" : "secondary"
                  }
                  className={
                    cam.status === "Online" 
                    ? "bg-green-600/20 text-green-600 border-green-600/30" 
                    : ""
                  }
                >
                  {cam.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}