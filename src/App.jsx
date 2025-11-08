import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import SignalControl from "./components/SignalControl";
import LiveCameras from "./components/LiveCameras";
import Lights from "./components/Lights";
import CommandBar from "./components/CommandBar"; 
import { Toaster } from "@/components/ui/sonner"; // <-- 1. Import Toaster from sonner

// A simple placeholder for pages you haven't built yet
const PlaceholderPage = ({ title }) => (
  <main className="flex-1 p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground">This page is under construction.</p>
  </main>
);

function App() {
  return (
    // 1. Wrap your entire app in BrowserRouter
    <BrowserRouter>
      {/* 2. Use theme-aware classes from Shadcn */}
      <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        
        {/* This component is global and listens for Cmd+K */}
        <CommandBar /> 
        
        {/* 3. Use <Routes> to define your pages */}
        {/* This main content area will change based on the URL */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live-cameras" element={<LiveCameras />} />
            <Route path="/streetlight" element={<Lights />} />
            
            {/* --- Placeholder Routes --- */}
            {/* When you build these pages, you can replace the 'element' */}
            <Route 
             path="/signal" 
             element={<SignalControl />} 
            />
            <Route 
             path="/settings" 
             element={<Settings />}  
            />
          </Routes>
        </main>
      </div>

      {/* 4. Add the Toaster component for alerts */}
      <Toaster richColors />

    </BrowserRouter>
  );
}

export default App;