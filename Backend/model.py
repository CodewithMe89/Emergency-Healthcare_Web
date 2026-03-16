from ultralytics import YOLO
from PIL import Image
import numpy as np

# load pretrained YOLO model
model = YOLO("yolov8n.pt")

def detect_accident(img):

    img = img.convert("RGB")

    results = model(img)

    accident_objects = [
        "car",
        "truck",
        "bus",
        "motorcycle",
        "person"
    ]

    detected = []

    for r in results:
        for c in r.boxes.cls:
            label = model.names[int(c)]
            detected.append(label)

    if any(obj in detected for obj in accident_objects):
        return "ACCIDENT"
    else:
        return "NO_ACCIDENT"