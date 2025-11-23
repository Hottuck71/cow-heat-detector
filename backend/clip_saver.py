import cv2
import os
from datetime import datetime

CLIP_FOLDER = "data/clips"

def save_clip(cam_id, frame):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{CLIP_FOLDER}/cam{cam_id}_{ts}.jpg"

    os.makedirs(CLIP_FOLDER, exist_ok=True)
    cv2.imwrite(filename, frame)

    print(f"[CLIP] Saved {filename}")
