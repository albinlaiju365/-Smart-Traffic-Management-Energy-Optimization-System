import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Siren } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- 1. Import Map Components & Leaflet ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// --- 2. NEW Helper Function to Create Custom Map Icons ---
const createSignalIcon = (state) => {
  const isGreen = state === 'green';
  const isYellow = state === 'yellow';
  const isRed = state === 'red';

  const iconHtml = `
    <div class="bg-black p-1 rounded-lg border border-gray-700 shadow-lg">
      <div class="w-4 h-4 rounded-full m-0.5 ${isRed ? 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]' : 'bg-red-900 opacity-30'}"></div>
      <div class="w-4 h-4 rounded-full m-0.5 ${isYellow ? 'bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.7)]' : 'bg-yellow-900 opacity-30'}"></div>
      <div class="w-4 h-4 rounded-full m-0.5 ${isGreen ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]' : 'bg-green-900 opacity-30'}"></div>
    </div>
  `;
  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-signal-icon",
    iconSize: [24, 48],
    iconAnchor: [12, 48],
    popupAnchor: [0, -48]
  });
};

// --- 3. Mock Coordinates for the Intersection ---
const intersectionCenter = [40.7131, -74.0058];
const nsSignalPos = [40.7133, -74.0058]; // North/South signal
const ewSignalPos = [40.7131, -74.0060]; // East/West signal

// --- API Fetcher for this page ---
const fetchSignalData = async () => {
  const res = await fetch("http://127.0.0.1:5000/signal-control/get_status");
  if (!res.ok) {
    throw new Error("Signal control server not responding");
  }
  return res.json();
};

// --- Helper Component for the Traffic Light (Unchanged) ---
const TrafficLight = ({ direction, state }) => {
  const isGreen = state === "green";
  const isYellow = state === "yellow";
  const isRed = state === "red";

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium uppercase text-muted-foreground">{direction}</h3>
      <div className="bg-card-foreground/10 p-3 rounded-lg space-y-2 border">
        <div className={`w-16 h-16 rounded-full transition-all ${isRed ? "bg-red-500 shadow-[0_0_15px_5px_rgba(239,68,68,0.7)]" : "bg-red-900 opacity-20"}`}></div>
        <div className={`w-16 h-16 rounded-full transition-all ${isYellow ? "bg-yellow-400 shadow-[0_0_15px_5px_rgba(250,204,21,0.7)]" : "bg-yellow-900 opacity-20"}`}></div>
        <div className={`w-16 h-16 rounded-full transition-all ${isGreen ? "bg-green-500 shadow-[0_0_15px_5px_rgba(34,197,94,0.7)]" : "bg-green-900 opacity-20"}`}></div>
      </div>
    </div>
  );
};

// --- Skeleton Loader for the Page (Defined ONCE here) ---
const SignalControlSkeleton = () => (
  <main className="flex-1 p-6 space-y-6">
    <Skeleton className="h-9 w-1/2" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[600px] w-full" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  </main>
);

// --- Main SignalControl Component ---
export default function SignalControl() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['signalData'],
    queryFn: fetchSignalData,
    refetchInterval: 1000, // Refetch every second
  });

  if (isLoading) return <SignalControlSkeleton />;

  if (error) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex-row gap-4 items-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not connect to the signal control module.</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const state = data.signal_state;
  const ev_route = data.ev_route;

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Signal Control: Main St & 1st Ave</h1>
      
      {/* --- Priority Override Banner --- */}
      {ev_route?.active && (
        <Card className="bg-blue-600/10 border-blue-600 text-blue-100 animate-pulse">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Siren className="h-8 w-8 text-blue-300" />
            <div>
              <CardTitle className="text-blue-300">PRIORITY OVERRIDE ACTIVE</CardTitle>
              <p className="text-blue-400">{ev_route.message}</p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* --- Main 2-Column Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- COLUMN 1: LIVE MAP --- */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Intersection Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[600px] w-full p-0">
            <MapContainer
              center={intersectionCenter}
              zoom={19}
              scrollWheelZoom={true}
              className="h-full w-full rounded-b-md z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker
                position={nsSignalPos}
                icon={createSignalIcon(state.ns)}
              >
                <Popup>
                  <div className="font-bold">North/South Signal</div>
                  Status: <span className={`font-bold ${state.ns === 'green' ? 'text-green-500' : state.ns === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {state.ns.toUpperCase()}
                  </span>
                </Popup>
              </Marker>
              
              <Marker
                position={ewSignalPos}
                icon={createSignalIcon(state.ew)}
              >
                <Popup>
                  <div className="font-bold">East/West Signal</div>
                  Status: <span className={`font-bold ${state.ew === 'green' ? 'text-green-500' : state.ew === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {state.ew.toUpperCase()}
                  </span>
                </Popup>
              </Marker>
              
            </MapContainer>
          </CardContent>
        </Card>

        {/* --- COLUMN 2: LIVE STATUS VISUAL --- */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Live Intersection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-16">
              <TrafficLight direction="North/South" state={state.ns} />
              
              <div className="text-center py-4">
                <h4 className="text-sm uppercase text-muted-foreground">Time Remaining</h4>
                <p className="text-6xl font-bold text-primary">
                  {ev_route?.active ? "∞" : state.timer}
                </p>
              </div>
              
              <TrafficLight direction="East/West" state={state.ew} />
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}