import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";

// --- 1. Import Map Components & Leaflet ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet"; // We need this to create custom icons

// --- 2. Mock Streetlight Data (with coordinates) ---
// In a real app, this would come from your backend
const initialStreetlights = [
  {
    id: "led1",
    name: "Streetlight LED1 (Main St)",
    position: [40.7128, -74.0060], // Example: New York
    brightness: 0,
  },
  {
    id: "led2",
    name: "Streetlight LED2 (Oak Ave)",
    position: [40.7135, -74.0055], // Example: Nearby
    brightness: 0,
  },
  {
    id: "cam-003",
    name: "Intersection Cam (Main & Oak)",
    position: [40.7131, -74.0058],
    brightness: 128, // Example of a light we don't control
  },
];

// --- 3. Helper Function to Create Custom Map Icons ---
const createLightIcon = (brightness, motion) => {
  const isBlinking = motion && brightness > 0;
  const color = brightness > 0 ? "#facc15" : "#6b7280"; // Yellow or Gray
  
  // This SVG will be our map marker
  const iconHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8" style="color: ${color}; stroke: #111; stroke-width: 0.5px;">
      <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H12Z" clip-rule="evenodd" />
    </svg>
    ${isBlinking ? '<div class="animate-pulse absolute top-0 left-0 w-full h-full rounded-full" style="background-color: ${color}; opacity: 0.5;"></div>' : ''}
  `;

  return L.divIcon({
    html: `<div class="relative">${iconHtml}</div>`,
    className: "custom-leaflet-icon", // Required for leaflet, but we use inline styles
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const Lights = () => {
  const [mode, setMode] = useState("auto");
  const [ledStatus, setLedStatus] = useState({ led1: 0, led2: 0, motion: false });
  
  // --- 4. State for all streetlights ---
  const [streetlights, setStreetlights] = useState(initialStreetlights);
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const debounceTimers = useRef({});

  // Fetch backend state and UPDATE the streetlights array
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/streetlight/get_status");
        const data = await res.json();
        
        setLedStatus(data); // This is your existing status
        setMode(data.mode);
        
        // --- 5. Update the streetlight array from the fetched data ---
        setStreetlights((currentLights) =>
          currentLights.map((light) => {
            if (light.id === "led1") {
              return { ...light, brightness: data.led1 };
            }
            if (light.id === "led2") {
              return { ...light, brightness: data.led2 };
            }
            return light;
          })
        );
        
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- API Functions (Debouncing, etc.) ---
  // (These are the same as before, no changes needed)
  const sendBrightnessToApi = async (led, value) => {
    try {
      await fetch("http://127.0.0.1:5000/streetlight/set_brightness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ led, value }),
      });
    } catch (err) {
      console.error("Error sending brightness:", err);
    }
  };

  const handleModeSwitch = async (newMode) => {
    if (newMode === mode) return;
    setIsTransitioning(true);
    try {
      await fetch("http://127.0.0.1:5000/streetlight/set_mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      setTimeout(() => {
        setMode(newMode);
        setIsTransitioning(false);
      }, 300);
    } catch (err) {
      console.error("Error switching mode:", err);
    }
  };

  const handleBrightnessChange = (led, [newValue]) => {
    setLedStatus((prev) => ({ ...prev, [led.toLowerCase()]: newValue }));
    
    // Update the map state instantly
    setStreetlights((currentLights) =>
      currentLights.map((light) =>
        light.id === led.toLowerCase() ? { ...light, brightness: newValue } : light
      )
    );

    if (debounceTimers.current[led]) {
      clearTimeout(debounceTimers.current[led]);
    }

    debounceTimers.current[led] = setTimeout(() => {
      sendBrightnessToApi(led, newValue);
    }, 300); 
  };

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // --- 6. NEW JSX with 2-Column Layout ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
      
      {/* --- COLUMN 1: INTERACTIVE MAP --- */}
      <div className="lg:col-span-2 h-[calc(100vh-3rem)] min-h-[500px]">
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle>Streetlight Control Map</CardTitle>
            <CardDescription>
              Live status and location of all streetlights.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <MapContainer
              center={[40.7131, -74.0058]} // Center on our mock data
              zoom={18} // Zoomed in
              scrollWheelZoom={true}
              className="h-full w-full rounded-md z-0" // z-0 is important
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* 7. Loop over streetlights and create markers */}
              {streetlights.map((light) => (
                <Marker
                  key={light.id}
                  position={light.position}
                  icon={createLightIcon(light.brightness, ledStatus.motion)}
                >
                  <Popup>
                    <div className="font-bold">{light.name}</div>
                    Brightness: {light.brightness} / 255
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- COLUMN 2: CONTROLS --- */}
      <div className="lg:col-span-1 h-full overflow-y-auto space-y-6">
        {/* Camera Feed Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden shadow-md border">
              <img
                src="http://127.0.0.1:5000/streetlight/camera_feed"
                alt="Camera Feed"
                className="w-full h-auto object-cover"
              />
            </div>
          </CardContent>
        </Card>

        {/* Controls Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
              <span className="text-sm font-medium text-muted-foreground">Mode:</span>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(newMode) => {
                  if (newMode && newMode !== mode) handleModeSwitch(newMode);
                }}
                disabled={isTransitioning}
                className="w-full sm:w-auto"
              >
                <ToggleGroupItem value="auto" aria-label="Toggle auto" className="w-1/2 sm:w-auto data-[state=on]:bg-green-600 data-[state=on]:text-white">Auto</ToggleGroupItem>
                <ToggleGroupItem value="manual" aria-label="Toggle manual" className="w-1/2 sm:w-auto data-[state=on]:bg-blue-600 data-[state=on]:text-white">Manual</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* LED Sliders */}
            <div
              className={`grid grid-cols-1 gap-6 transition-opacity duration-300 ${
                mode === "manual" ? "opacity-100" : "opacity-50"
              }`}
            >
              {["LED1", "LED2"].map((led) => (
                <div key={led} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-sm text-muted-foreground">
                      {led} Brightness
                    </label>
                    <span className="text-sm font-semibold text-primary w-10 text-right">
                      {ledStatus[led.toLowerCase()]}
                    </span>
                  </div>
                  <Slider
                    value={[ledStatus[led.toLowerCase()]]}
                    onValueChange={(newValue) => handleBrightnessChange(led, newValue)}
                    max={255}
                    step={1}
                    disabled={mode !== "manual"}
                    className={`${mode !== "manual" ? "cursor-not-allowed" : ""}`}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Status Section */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">Motion Detection:</span>
              <span className={`font-semibold ${ledStatus.motion ? "text-green-600" : "text-red-500"}`}>
                {ledStatus.motion ? "Active" : "No Motion"}
              </span>
              {ledStatus.motion && (
                <div className="ml-1 animate-pulse w-2.5 h-2.5 rounded-full bg-green-600"></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Lights;
