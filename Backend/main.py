from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from Backend.model import detect_accident

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/detect-accident")
async def detect_accident_api(file: UploadFile = File(...)):

    contents = await file.read()

    image = Image.open(io.BytesIO(contents))

    result = detect_accident(image)

    return {"result": result}