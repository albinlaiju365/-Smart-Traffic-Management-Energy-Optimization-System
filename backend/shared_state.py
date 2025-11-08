# backend/shared_state.py
import threading
from collections import deque

# This lock will control all access to the shared state
data_lock = threading.Lock()

# --- State from streetlight.py ---
streetlight_state = {
    "mode": "auto",
    "motion_detected": False,
    "latest_brightness": {"LED1": 0, "LED2": 0}
}
output_frame = None  # This will be shared by the camera thread

# --- NEW: State for signal_control.py ---
signal_state = {
    # 'ns' = North/South, 'ew' = East/West
    "ns": "green", # Can be 'green', 'yellow', 'red'
    "ew": "red",
    "timer": 15 # Countdown timer
}

# --- State from server.py (for Dashboard) ---
cpu_history = deque(maxlen=20)
ram_history = deque(maxlen=20)
net_history = deque(maxlen=20)
res_history = deque(maxlen=20)

incident_status = {
    "active": False,
    "location": None,
    "message": None,
    "optimization_impact": 0
}

# --- NEW: EV Route (now correctly points to a signal) ---
ev_route_status = {
    "active": False,
    "route_name": "City Hospital Route",
    "lights": ["Main St NS"], # The signal on this route
    "message": "Ambulance en route on Main St"
}