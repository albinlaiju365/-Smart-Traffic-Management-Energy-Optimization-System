# backend/motion/motion_detector.py
import cv2
import numpy as np

class MotionDetector:
    def __init__(self, camera_index=0):
        self.cap = cv2.VideoCapture(camera_index)
        self.prev_frame = None
        if not self.cap.isOpened():
            raise RuntimeError("Camera not found")

    def get_motion_intensity(self):
        ret, frame = self.cap.read()
        if not ret:
            return 0.0, None
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21,21), 0)
        if self.prev_frame is None:
            self.prev_frame = gray
            return 0.0, frame
        delta = cv2.absdiff(self.prev_frame, gray)
        thresh = cv2.threshold(delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)
        motion_pixels = np.sum(thresh) / 255.0
        total_pixels = thresh.shape[0] * thresh.shape[1]
        intensity = motion_pixels / total_pixels   # 0..1
        intensity = min(1.0, intensity * 10)       # scale a bit
        self.prev_frame = gray
        return float(intensity), frame

    def release(self):
        self.cap.release()
