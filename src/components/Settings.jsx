import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./ModeToggle"; // <-- Import our new toggle

export default function Settings() {
  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* --- Appearance Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="theme" className="text-lg">
              Theme
            </Label>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

      {/* --- Placeholder for System Parameters --- */}
      <Card className="opacity-50 cursor-not-allowed">
        <CardHeader>
          <CardTitle>System Parameters</CardTitle>
          <CardDescription>
            (Coming Soon) Adjust live parameters for your AI modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This will allow you to change signal timings and light brightness
            directly from the UI.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}