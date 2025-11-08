from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import random
from collections import deque
import time
import threading

# 1. Import BOTH device blueprints
from devices import streetlight, signal_control

# 2. Import ALL shared state
try:
    from shared_state import (
        data_lock, incident_status, ev_route_status,
        cpu_history, ram_history, net_history, res_history,
        signal_state
    )
except ImportError:
    print("FATAL ERROR: Could not import 'shared_state.py'. Please create this file.")
    # Define dummy variables to prevent immediate crash
    data_lock = threading.Lock()
    incident_status = {}
    ev_route_status = {"active": False}
    signal_state = {}
    cpu_history, ram_history, net_history, res_history = deque(), deque(), deque(), deque()


app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# --- Helper Functions for Timers ---
def clear_incident_after_delay():
    global incident_status
    print("AI is 'solving' the incident...")
    time.sleep(15)
    with data_lock:
        incident_status["active"] = False
        incident_status["location"] = None
        incident_status["message"] = "Incident Cleared"
        incident_status["optimization_impact"] = random.randint(10, 20)
    print("Incident cleared. Traffic flow optimized.")
    time.sleep(10)
    with data_lock:
        incident_status["optimization_impact"] = 0
        incident_status["message"] = None

def clear_ev_route_after_delay():
    global ev_route_status
    print("EV route is clearing...")
    time.sleep(30) # Route is active for 30 seconds
    with data_lock:
        ev_route_status["active"] = False
    print("EV route cleared. Resuming normal operation.")

# --- Helper Function for System Stats ---
def get_system_stats():
    try:
        cpu_percent = psutil.cpu_percent()
        ram_percent = psutil.virtual_memory().percent
    except Exception as e:
        print(f"psutil error: {e}. Returning mock data.")
        cpu_percent = 10.0
        ram_percent = 30.0
        
    net_latency = random.randint(10, 30)
    avg_response = random.randint(150, 200)
    
    cpu_history.append({"v": cpu_percent})
    ram_history.append({"v": ram_percent})
    net_history.append({"v": net_latency})
    res_history.append({"v": avg_response})
    
    return {
        "cpu": {"value": f"{cpu_percent}%", "data": list(cpu_history)},
        "memory": {"value": f"{ram_percent}%", "data": list(ram_history)},
        "latency": {"value": f"{net_latency}ms", "data": list(net_history)},
        "response": {"value": f"{avg_response}ms", "data": list(res_history)},
        "cameras": {"value": "2/3", "data": list(cpu_history)} # Mocked
    }

# --- Mock Data ---
traffic_history = [
    {"time": "00:00", "vehicles": 120}, {"time": "01:00", "vehicles": 85},
    {"time": "02:00", "vehicles": 70}, {"time": "03:00", "vehicles": 60},
    {"time": "04:00", "vehicles": 80}, {"time": "05:00", "vehicles": 150},
    {"time": "16:00", "vehicles": 1400}, {"time": "17:00", "vehicles": 1600},
    {"time": "18:00", "vehicles": 1300}, {"time": "19:00", "vehicles": 900},
    {"time": "20:00", "vehicles": 650}, {"time": "21:00", "vehicles": 450},
    {"time": "22:00", "vehicles": 300}, {"time": "23:00", "vehicles": 200},
]
camera_data = [
    {"id": "CAM-001", "location": "Main St & 1st Ave", "status": "Online"},
    {"id": "CAM-002", "location": "Main St & 2nd Ave", "status": "Online"},
    {"id": "CAM-003", "location": "Oak St & 3rd Ave", "status": "Offline"},
]


# === MAIN API ROUTES ===

@app.route('/api/all-stats')
def get_all_stats():
    """Single endpoint for all dashboard data."""
    with data_lock:
        current_incident = incident_status.copy()
        current_ev_route = ev_route_status.copy()
    
    try:
        base_score = random.randint(60, 80)
        final_score = max(0, base_score + current_incident["optimization_impact"]) 
        
        all_data = {
            "stats": get_system_stats(),
            "trafficHistory": traffic_history,
            "cameraStatus": camera_data,
            "optimizationScore": final_score,
            "incident": current_incident,
            "ev_route": current_ev_route # <-- This is the new data
        }
        return jsonify(all_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trigger-incident')
def trigger_incident():
    """Triggers a demo incident."""
    with data_lock:
        if incident_status["active"]:
            return jsonify({"status": "error", "message": "Incident already active."}), 400
        
        print("--- INCIDENT TRIGGERED ---")
        incident_status["active"] = True
        incident_status["location"] = "Main St & 1st Ave"
        incident_status["message"] = "Stalled Vehicle Detected"
        incident_status["optimization_impact"] = -30
        
    threading.Thread(target=clear_incident_after_delay).start()
    return jsonify({"status": "success", "message": "Incident triggered."})

@app.route('/api/trigger-ev-route')
def trigger_ev_route():
    """Triggers a demo EV priority route."""
    global ev_route_status
    with data_lock:
        if ev_route_status["active"]:
            return jsonify({"status": "error", "message": "EV Route already active."}), 400
        
        print("--- EV PRIORITY ROUTE TRIGGERED ---")
        ev_route_status["active"] = True
        
    threading.Thread(target=clear_ev_route_after_delay).start()
    return jsonify({"status": "success", "message": "EV Route triggered."})

# === Register ALL Blueprints ===
app.register_blueprint(streetlight.app, url_prefix="/streetlight")
app.register_blueprint(signal_control.app, url_prefix="/signal-control") # <-- NEW

if __name__ == "__main__":
    print("✅ Backend running at http://127.0.0.1:5000")
    print("API endpoints:")
    print("  /api/all-stats (for Dashboard)")
    print("  /api/trigger-incident (for Demo)")
    print("  /api/trigger-ev-route (for EV Demo)")
    print("  /streetlight/... (for Lights page)")
    print("  /signal-control/get_status (for Signal page)") # <-- NEW
    
    # Enable reloader for development
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False, threaded=True)