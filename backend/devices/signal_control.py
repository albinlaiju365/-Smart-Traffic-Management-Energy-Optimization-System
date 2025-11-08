# backend/devices/signal_control.py
from flask import Blueprint, jsonify
import threading
import time

# Import the shared state
from shared_state import data_lock, signal_state, ev_route_status

app = Blueprint('signal_control', __name__)

# --- Configuration ---
GREEN_TIME = 15
YELLOW_TIME = 3
ALL_RED_TIME = 2

def signal_loop():
    """
    A background thread that cycles the traffic light
    and checks for an EV Priority override.
    """
    global signal_state, ev_route_status
    
    while True:
        with data_lock:
            # Check for EV Priority Override
            if ev_route_status["active"]:
                # Main St is North/South, so force it green
                signal_state = {"ns": "green", "ew": "red", "timer": 99}
                # Skip the rest of the loop and wait
                time.sleep(1)
                continue # Re-check for EV status every second
            
            # If no EV, run normal cycle
            current_timer = signal_state["timer"]
            
            # This is a standard state machine for a US traffic light
            if signal_state["ns"] == "green" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ns"] == "green" and current_timer == 0:
                signal_state["ns"] = "yellow"
                signal_state["timer"] = YELLOW_TIME
                
            elif signal_state["ns"] == "yellow" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ns"] == "yellow" and current_timer == 0:
                signal_state["ns"] = "red"
                signal_state["ew"] = "red" # All red
                signal_state["timer"] = ALL_RED_TIME
            
            elif signal_state["ew"] == "red" and signal_state["ns"] == "red" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ew"] == "red" and signal_state["ns"] == "red" and current_timer == 0:
                signal_state["ew"] = "green"
                signal_state["timer"] = GREEN_TIME

            elif signal_state["ew"] == "green" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ew"] == "green" and current_timer == 0:
                signal_state["ew"] = "yellow"
                signal_state["timer"] = YELLOW_TIME
            
            elif signal_state["ew"] == "yellow" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ew"] == "yellow" and current_timer == 0:
                signal_state["ns"] = "red"
                signal_state["ew"] = "red" # All red
                signal_state["timer"] = ALL_RED_TIME

            elif signal_state["ew"] == "red" and signal_state["ns"] == "red" and current_timer > 0:
                signal_state["timer"] -= 1
            elif signal_state["ew"] == "red" and signal_state["ns"] == "red" and current_timer == 0:
                signal_state["ns"] = "green"
                signal_state["timer"] = GREEN_TIME

        # Wait 1 second before the next tick
        time.sleep(1)

# --- API Route for this Blueprint ---
@app.route("/get_status")
def get_signal_status():
    with data_lock:
        return jsonify({
            "signal_state": signal_state,
            "ev_route": ev_route_status
        })

# Start the background thread when this module is loaded
threading.Thread(target=signal_loop, daemon=True).start()
print("[SignalControl] Traffic signal simulation started.")