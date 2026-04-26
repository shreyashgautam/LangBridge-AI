from __future__ import annotations

import csv
import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from model import service
from utils import demo_inputs, preprocess_text

router = APIRouter()


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, examples=["ami valo achi bro"])


class SimilarityRequest(BaseModel):
    text1: str = Field(..., min_length=1)
    text2: str = Field(..., min_length=1)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    cluster: str | None = None


class BatchTextRequest(BaseModel):
    texts: list[str] = Field(default_factory=list)


class VisualizationRequest(BaseModel):
    texts: list[str] = Field(default_factory=list)


@router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "model_mode": service.backend_mode,
    }


@router.get("/samples")
def sample_inputs() -> dict[str, list[str]]:
    return {"samples": demo_inputs()}


@router.get("/dashboard-metrics")
def dashboard_metrics() -> dict[str, object]:
    return service.build_dashboard_metrics()


@router.post("/embed")
def embed_text(payload: TextRequest) -> dict[str, object]:
    analysis = service.analyze(payload.text)
    return {
        "embedding": analysis.embedding,
        "cluster": analysis.cluster,
        "confidence": analysis.confidence,
        "cleaned_text": analysis.cleaned_text,
        "backend_mode": analysis.backend_mode,
        "code_mixing": analysis.code_mixing,
    }


@router.post("/similarity")
def compare_texts(payload: SimilarityRequest) -> dict[str, object]:
    return service.compare_texts(payload.text1, payload.text2)


@router.post("/analyze")
def analyze_text(payload: TextRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Input text became empty after preprocessing.")

    analysis = service.analyze(payload.text)
    return {
        "cleaned_text": analysis.cleaned_text,
        "embedding": analysis.embedding,
        "cluster": analysis.cluster,
        "confidence": analysis.confidence,
        "similar_examples": analysis.similar_examples,
        "backend_mode": analysis.backend_mode,
        "code_mixing": analysis.code_mixing,
        "reason": analysis.reason,
        "language_mix_label": f'{round(float(analysis.code_mixing["english_ratio"]) * 100)}% English, '
        f'{round(float(analysis.code_mixing["bengali_ratio"]) * 100)}% Bengali',
    }


@router.post("/cmi")
def cmi_text(payload: TextRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please enter valid text for CMI analysis.")
    return {
        "text": payload.text,
        "cleaned_text": cleaned,
        **service.build_cmi_response(payload.text),
    }


@router.post("/visualize-data")
def visualize_data(payload: VisualizationRequest) -> dict[str, object]:
    if payload.texts:
        custom_points = []
        for text in payload.texts:
            analysis = service.analyze(text)
            custom_points.append(
                {
                    "text": text,
                    "cluster": analysis.cluster,
                    "embedding": analysis.embedding,
                }
            )
        original_bank = service.dataset_bank
        original_matrix = service.dataset_matrix
        service.dataset_bank = custom_points
        service.dataset_matrix = None
        if custom_points:
            import numpy as np

            service.dataset_matrix = np.asarray([row["embedding"] for row in custom_points], dtype=np.float32)
        data = service.get_visualization_data()
        service.dataset_bank = original_bank
        service.dataset_matrix = original_matrix
        return data

    return service.get_visualization_data()


@router.post("/suggest")
def suggest_texts(payload: TextRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please enter valid text for suggestions.")

    suggestions = service.suggest_variations(payload.text)
    return {
        "text": payload.text,
        "cleaned_text": cleaned,
        "suggestions": suggestions,
    }


@router.post("/correct")
def correct_text(payload: TextRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please enter valid text for correction.")
    return service.correct_text(payload.text)


@router.post("/search")
def search_text(payload: SearchRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.query)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please enter a valid search query.")
    return service.semantic_search(payload.query, cluster=payload.cluster)


@router.post("/convert")
def convert_text(payload: TextRequest) -> dict[str, object]:
    cleaned = preprocess_text(payload.text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please enter valid text for conversion.")
    return service.convert_dialect(payload.text)


@router.post("/compare-visual")
def compare_visual(payload: SimilarityRequest) -> dict[str, object]:
    return service.build_compare_visual(payload.text1, payload.text2)


@router.get("/dataset")
def dataset_explorer(cluster: str | None = None) -> dict[str, object]:
    return {
        "items": service.get_dataset_rows(cluster=cluster),
        "available_clusters": ["Pure Bengali", "Code Mixed", "Formal Bengali"],
    }


@router.post("/batch-analyze")
async def batch_analyze(file: UploadFile | None = File(default=None), texts: str | None = None) -> dict[str, object]:
    batch_texts: list[str] = []

    if file is not None:
        content = await file.read()
        try:
            batch_texts = service.parse_batch_file(content, file.filename or "upload.txt")
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    elif texts:
        batch_texts = [line.strip() for line in texts.splitlines() if line.strip()]

    if not batch_texts:
        raise HTTPException(status_code=400, detail="No valid sentences were found for batch analysis.")

    return service.analyze_batch(batch_texts[:100])


@router.post("/batch-analyze-json")
def batch_analyze_json(payload: BatchTextRequest) -> dict[str, object]:
    texts = [text for text in payload.texts if preprocess_text(text)]
    if not texts:
        raise HTTPException(status_code=400, detail="No valid sentences were provided.")
    return service.analyze_batch(texts[:100])


@router.post("/batch-export")
def export_batch_results(payload: BatchTextRequest) -> StreamingResponse:
    texts = [text for text in payload.texts if preprocess_text(text)]
    if not texts:
        raise HTTPException(status_code=400, detail="No valid sentences were provided.")

    analysis = service.analyze_batch(texts[:100])
    stream = io.StringIO()
    writer = csv.DictWriter(
        stream,
        fieldnames=["sentence", "cleaned_text", "cluster", "confidence", "similarity_score", "code_mixing_index"],
    )
    writer.writeheader()
    writer.writerows(analysis["results"])
    stream.seek(0)

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="batch-analysis-results.csv"'},
    )
