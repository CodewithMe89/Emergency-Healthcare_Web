import tensorflow as tf
import numpy as np
from PIL import Image

model = tf.keras.models.load_model("Backend/model.h5")

def detect_accident(img):

    img = img.resize((224,224))
    img = np.array(img)/255.0
    img = np.expand_dims(img, axis=0)

    pred = model.predict(img)[0][0]

    if pred > 0.6:
        return "ACCIDENT"
    else:
        return "NO_ACCIDENT"