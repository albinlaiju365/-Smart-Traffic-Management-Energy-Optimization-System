# backend/devices/streetlight.py
import cv2
import serial
import time
import threading
from flask import Blueprint, jsonify, Response, request

# --- 1. Import the shared state ---
from shared_state import data_lock, streetlight_state, output_frame

# ------------------- Blueprint Setup -------------------
app = Blueprint("streetlight", __name__)

# ------------------- Configuration -------------------
ARDUINO_PORT = "COM3"
ARDUINO_BAUD = 9600
FADE_STEP = 5
DIM_BRIGHTNESS = 50
MOTION_BRIGHTNESS = 255
MOTION_THRESHOLD = 5000

# ------------------- Arduino Setup -------------------
try:
    arduino = serial.Serial(ARDUINO_PORT, ARDUINO_BAUD, timeout=1)
    time.sleep(2)
    print("[StreetLight] Arduino connected.")
except serial.SerialException as e:
    print(f"[StreetLight] ⚠️ Could not connect to Arduino: {e}")
    arduino = None

# ------------------- Camera Setup -------------------
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("[StreetLight] ⚠️ Could not open camera.")
else:
    print("[StreetLight] Camera initialized.")

# ------------------- Helper Functions (Updated) -------------------
def generate_frames():
    """Yield camera frames for live feed"""
    global output_frame
    while True:
        with data_lock:
            if output_frame is None:
                time.sleep(0.1)
                continue
            ret, buffer = cv2.imencode(".jpg", output_frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
        yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")
        time.sleep(0.04)

def detect_motion(frame1, frame2):
    # ... (This function is unchanged)
    diff = cv2.absdiff(frame1, frame2)
    gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 20, 255, cv2.THRESH_BINARY)
    motion_level = cv2.countNonZero(thresh)
    return motion_level > MOTION_THRESHOLD

def send_to_arduino(led1, led2):
    # Use shared state
    with data_lock:
        streetlight_state["latest_brightness"]["LED1"] = int(led1)
        streetlight_state["latest_brightness"]["LED2"] = int(led2)
    
    if arduino:
        try:
            arduino.write(f"LED1:{int(led1)}\n".encode())
            time.sleep(0.01)
            arduino.write(f"LED2:{int(led2)}\n".encode())
        except Exception as e:
            print(f"[StreetLight] Arduino write error: {e}")

def fade_to(target1, target2):
    # Use shared state
    with data_lock:
        current1 = streetlight_state["latest_brightness"]["LED1"]
        current2 = streetlight_state["latest_brightness"]["LED2"]

    if current1 < target1: current1 = min(current1 + FADE_STEP, target1)
    elif current1 > target1: current1 = max(current1 - FADE_STEP, target1)
    if current2 < target2: current2 = min(current2 + FADE_STEP, target2)
    elif current2 > target2: current2 = max(current2 - FADE_STEP, target2)

    send_to_arduino(current1, current2)

def camera_loop():
    """Continuously monitor camera and adjust brightness"""
    global output_frame # Use the global output_frame from shared_state
    ret, frame1 = cap.read()
    ret2, frame2 = cap.read()
    if not ret or not ret2:
        print("[StreetLight] ⚠️ Camera loop failed to start.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.5)
            continue
            
        with data_lock:
            output_frame = frame.copy()
            current_mode = streetlight_state["mode"] # Read mode from shared state

        # This logic is now simpler, no EV check
        if current_mode == "auto":
            motion = detect_motion(frame1, frame2)
            with data_lock:
                streetlight_state["motion_detected"] = motion
            if motion:
                fade_to(MOTION_BRIGHTNESS, MOTION_BRIGHTNESS)
            else:
                fade_to(DIM_BRIGHTNESS, DIM_BRIGHTNESS)
        elif current_mode == "manual":
            # In manual, do nothing. API calls will set brightness.
            pass

        frame1, frame2 = frame2, frame
        time.sleep(0.05)

# ------------------- API Routes (Updated) -------------------
@app.route("/get_status")
def get_status():
    with data_lock:
        # Read directly from shared state
        data = {
            "led1": streetlight_state["latest_brightness"]["LED1"],
            "led2": streetlight_state["latest_brightness"]["LED2"],
            "mode": streetlight_state["mode"],
            "motion": streetlight_state["motion_detected"],
        }
    return jsonify(data)

@app.route("/camera_feed")
def camera_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/set_mode", methods=["POST"])
def set_mode():
    data = request.json
    new_mode = data.get("mode", "").lower()
    if new_mode in ["auto", "manual"]:
        with data_lock:
            streetlight_state["mode"] = new_mode # Set shared state
        print(f"[StreetLight] Mode changed to: {new_mode}")
        return jsonify({"mode": new_mode})
    return jsonify({"error": "Invalid mode"}), 400

@app.route("/set_brightness", methods=["POST"])
def set_brightness():
    data = request.json
    led = data.get("led")
    value = data.get("value")

    with data_lock:
        current_mode = streetlight_state["mode"]

    if current_mode != "manual":
        return jsonify({"error": "Switch to manual mode first"}), 403

    try:
        value_int = int(value)
        if not (0 <= value_int <= 255): raise ValueError
        
        with data_lock:
            current_led1 = streetlight_state["latest_brightness"]["LED1"]
            current_led2 = streetlight_state["latest_brightness"]["LED2"]
            
        if led.upper() == "LED1":
            send_to_arduino(value_int, current_led2)
        elif led.upper() == "LED2":
            send_to_arduino(current_led1, value_int)
        else:
            return jsonify({"error": "Invalid LED name"}), 400
        
        with data_lock:
            return jsonify(streetlight_state["latest_brightness"])
    except:
        return jsonify({"error": "Invalid value"}), 400

# ------------------- Background Camera Thread -------------------
if cap.isOpened():
    threading.Thread(target=camera_loop, daemon=True).start()
    print("[StreetLight] Camera monitoring started.")
else:
    print("[StreetLight] ⚠️ Camera loop not started.")