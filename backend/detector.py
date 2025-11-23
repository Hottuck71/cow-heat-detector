from ultralytics import YOLO
import cv2
from clip_saver import save_clip

# load model (you can swap this with cattle-specific later)
model = YOLO("yolov8n.pt")

def run_detection(cam_id, frame):
    results = model(frame, verbose=False)
    boxes = results[0].boxes

    # SIMPLE LOGIC (you can improve later)
    event_detected = False

    for box in boxes:
        cls = int(box.cls[0])
        if cls in [0]:   # person or animal — change when training your own model
            event_detected = True

    if event_detected:
        save_clip(cam_id, frame)
