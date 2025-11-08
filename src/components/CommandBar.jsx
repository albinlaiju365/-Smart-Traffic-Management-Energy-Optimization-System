import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // To change pages
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Video,
  Activity,
  Lightbulb,
  Settings,
} from "lucide-react";

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 1. Listen for Cmd+K (or Ctrl+K)
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 2. Helper function to run a command (e.g., navigate)
  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/live-cameras"))}>
            <Video className="mr-2 h-4 w-4" />
            <span>Live Cameras</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/signal"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Signal Control</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/streetlight"))}>
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>Street Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => alert("Rebooting all cameras... (Simulation)"))}>
            <span className="text-red-500">Reboot All Cameras</span>
          </CommandItem>
        </CommandGroup>
        
      </CommandList>
    </CommandDialog>
  );
}