import cv2
from threading import Thread
from detector import run_detection

CAMERAS = {}   # keeps a list of active cameras
camera_counter = 0

def camera_loop(cam_id, url):
    cap = cv2.VideoCapture(url)

    if not cap.isOpened():
        print(f"Camera {cam_id} could not open stream: {url}")
        return

    print(f"[CAM {cam_id}] Connected: {url}")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        run_detection(cam_id, frame)

def add_camera(url: str):
    global camera_counter
    camera_counter += 1
    cam_id = camera_counter

    CAMERAS[cam_id] = {"id": cam_id, "url": url, "active": True}

    # Start camera thread
    thread = Thread(target=camera_loop, args=(cam_id, url), daemon=True)
    thread.start()

    return cam_id
