"""
ID document OCR microservice.
Requires the Tesseract binary on PATH (e.g. macOS: brew install tesseract).
"""
from __future__ import annotations

import io
import re
from typing import Any, Optional

import pytesseract
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps

app = FastAPI(title="KYC ID OCR", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _normalize_image(raw: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    return img


def _extract_doc_number(text: str) -> Optional[str]:
    # Common ID / passport style alphanumerics (tune per locale)
    patterns = [
        r"\b([A-Z]{1,2}\d{6,9})\b",
        r"\b(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b",
        r"\b(\d{9,12})\b",
    ]
    for pat in patterns:
        m = re.search(pat, text.upper().replace("\n", " "))
        if m:
            return re.sub(r"\s+", "", m.group(1))
    return None


def _extract_name(text: str) -> Optional[str]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    skip = re.compile(
        r"^(PASSPORT|DRIVER|LICENSE|NATIONAL|REPUBLIC|STATE|USA|INDIA|"
        r"DATE|BIRTH|SEX|M|F|HEIGHT|EYES|EXPIRES|ISSUED|ID\s*NO|NO\.)\b",
        re.I,
    )
    for ln in lines[:12]:
        if skip.search(ln):
            continue
        if re.search(r"\d{3,}", ln) and len(ln) < 6:
            continue
        if 3 <= len(ln) <= 80 and re.search(r"[A-Za-z]{2,}", ln):
            return ln.title()
    return None


def _extract_dob(text: str) -> Optional[str]:
    for pat in (
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
        r"\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b",
    ):
        m = re.search(pat, text)
        if m:
            return m.group(1)
    return None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        img = _normalize_image(raw)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}") from e

    try:
        gray = ImageOps.autocontrast(ImageOps.grayscale(img))
        raw_text = pytesseract.image_to_string(gray) or ""
    except pytesseract.TesseractNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail="Tesseract is not installed or not on PATH. Install tesseract-ocr.",
        ) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {e}") from e

    name = _extract_name(raw_text) or ""
    document_number = _extract_doc_number(raw_text) or ""
    date_of_birth = _extract_dob(raw_text) or ""

    return {
        "raw_text": raw_text.strip(),
        "name": name,
        "document_number": document_number,
        "document": document_number,
        "date_of_birth": date_of_birth,
    }
