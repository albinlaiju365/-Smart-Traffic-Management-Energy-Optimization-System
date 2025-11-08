import React from "react";
import { ShieldCheck, ShieldAlert, Siren } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemStatus({ incident, ev_route }) {
  const isIncidentActive = incident && incident.active;
  const isEvActive = ev_route && ev_route.active;

  // Priority 1: EV Route
  if (isEvActive) {
    return (
      <Card className="bg-blue-600/10 border-blue-600 text-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-300">System Status</CardTitle>
          <Siren className="h-4 w-4 text-blue-300 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-300">PRIORITY ROUTE</div>
          <p className="text-xs text-blue-400">
            {ev_route.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Priority 2: Incident
  if (isIncidentActive) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            CRITICAL INCIDENT
          </div>
          <p className="text-xs text-muted-foreground">
            {incident.message} at {incident.location}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default: All Clear
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <ShieldCheck className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-500">
          All Systems Operational
        </div>
        <p className="text-xs text-muted-foreground">
          {incident?.message || "Monitoring all traffic."}
        </p>
      </CardContent>
    </Card>
  );
}