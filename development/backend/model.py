from __future__ import annotations

import csv
import io
import os
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn as nn
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.neighbors import NearestNeighbors
from transformers import AutoConfig, AutoModel, AutoTokenizer

from utils import cosine_similarity, preprocess_text

try:
    import umap
except ImportError:  # pragma: no cover - optional runtime path
    umap = None

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

MODEL_FILENAME = "dialect_contrastive_model.pt"
CLUSTER_LABELS = {
    0: "Pure Bengali",
    1: "Code Mixed",
    2: "Formal Bengali",
}

REFERENCE_TEXTS = {
    "Pure Bengali": [
        "ami ajke khub valo achi",
        "tumi kemon acho",
        "ora aj school e jacche",
        "bikel bela brishti hote pare",
        "aj amar mon khub bhalo",
        "gramer poth diye hawar gondho aschilo",
    ],
    "Code Mixed": [
        "ami office e meeting kore then bari jabo",
        "movie ta honestly khub entertaining chilo bro",
        "ajker class ta fully online hocche",
        "weekend e amra cafe e hangout korbo",
        "assignment ta kal submit korte hobe maybe",
        "amar phone ta suddenly hang kore gelo yaar",
    ],
    "Formal Bengali": [
        "ami ajker alochonay angsogrohon korte ichhuk",
        "ei prostabti bishesh vabe guruttopurno mone hoy",
        "sangbadti shune tini prochondo anondito holen",
        "uposthapito bishoyti bistrito bhabe porjalochona kora holo",
        "sammelone uposthit shobai bishoyti niye matamot janalen",
        "gabeshonar folafol alochonar jonne uposthapon kora holo",
    ],
}

SUGGESTION_TEXTS = {
    "ami valo achi": ["ami bhalo achi", "ami valo asi", "ami onek valo achi"],
    "tumi kemon acho": ["tumi kemon aso", "tumi kamon acho", "tumi valo acho"],
    "movie ta valo": ["movie ta bhalo", "cinema ta valo laglo", "movie ta khub valo chilo"],
    "ajke class ache": ["aj class ache", "ajke class ase", "ajker class ache"],
    "office e jabo": ["office e jabo aj", "ami office jabo", "office e jacchi"],
}

ENGLISH_HINTS = {
    "bro", "office", "meeting", "movie", "weekend", "online", "class", "submit",
    "phone", "hang", "fine", "honestly", "cafe", "project", "system", "search",
}

BENGALI_ROMANIZED_HINTS = {
    "ami", "tumi", "valo", "bhalo", "achi", "asi", "acho", "aso", "ajke", "aj", "khub",
    "ora", "brishti", "hote", "pare", "mon", "gramer", "poth", "hawar", "gondho", "jachche",
    "bikel", "bari", "jabo", "laglo", "lagche", "ta", "e", "amra", "kemon", "jacchi",
    "prostabti", "guruttopurno", "alochonay", "angsogrohon", "ichhuk", "sangbadti", "shune",
    "uposthapon", "porjalochona", "shobai", "niye", "matamot", "jonne", "bondhu",
}

FORMAL_REPLACEMENTS = {
    "valo": "bhalo",
    "bhalo": "bhalo",
    "achi": "achi",
    "bro": "bondhu",
    "movie": "chalachitra",
    "office": "karyaloy",
    "class": "shreni",
}

PURE_REPLACEMENTS = {
    "bro": "",
    "office": "kajer jayga",
    "movie": "cinema",
    "weekend": "soptaho sesh",
    "class": "class",
}

CODE_MIXED_INSERTIONS = ("bro", "actually", "honestly", "basically")


class MuRILContrastiveEncoder(nn.Module):
    def __init__(self, model_name: str, hidden_dim: int, proj_dim: int, dropout: float) -> None:
        super().__init__()
        config = AutoConfig.from_pretrained(model_name)
        self.encoder = AutoModel.from_config(config)
        hidden_size = int(self.encoder.config.hidden_size)
        self.projector = nn.Sequential(
            nn.Linear(hidden_size, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, proj_dim),
        )

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        token_embeddings = outputs.last_hidden_state
        mask = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        pooled = (token_embeddings * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)
        projected = self.projector(pooled)
        return torch.nn.functional.normalize(projected, p=2, dim=-1)


@dataclass
class EmbeddingResult:
    embedding: list[float]
    cleaned_text: str
    cluster: str
    confidence: float
    similar_examples: list[dict[str, Any]]
    backend_mode: str
    code_mixing: dict[str, float | int]
    reason: str


class DialectModelService:
    def __init__(self, model_path: str | Path | None = None) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = Path(model_path or Path(__file__).resolve().parent / MODEL_FILENAME)
        self.model: MuRILContrastiveEncoder | None = None
        self.tokenizer = None
        self.backend_mode = "fallback"
        self.kmeans: KMeans | None = None
        self.cluster_name_by_id: dict[int, str] = {}
        self.reference_bank: list[dict[str, Any]] = []
        self.dataset_bank: list[dict[str, Any]] = []
        self.nearest_neighbors: NearestNeighbors | None = None
        self.dataset_matrix: np.ndarray | None = None
        self.model_config: dict[str, Any] = {
            "model_name": "google/muril-base-cased",
            "hidden_dim": 512,
            "proj_dim": 256,
            "dropout": 0.1,
            "max_len": 128,
        }
        self._load_model()
        self._fit_reference_clusters()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            return

        checkpoint = torch.load(self.model_path, map_location="cpu")
        if not isinstance(checkpoint, dict):
            return

        self.model_config.update(checkpoint.get("model_config", {}))
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_config["model_name"])
            model = MuRILContrastiveEncoder(
                model_name=self.model_config["model_name"],
                hidden_dim=int(self.model_config["hidden_dim"]),
                proj_dim=int(self.model_config["proj_dim"]),
                dropout=float(self.model_config["dropout"]),
            )
            state_dict = checkpoint.get("model_state_dict", {})
            model.load_state_dict(state_dict, strict=False)
            model.to(self.device)
            model.eval()
            self.model = model
            self.backend_mode = "muril-checkpoint"
        except Exception:
            self.model = None
            self.tokenizer = None
            self.backend_mode = "fallback"

    def _fit_reference_clusters(self) -> None:
        embeddings: list[list[float]] = []
        labels: list[str] = []
        dataset_bank: list[dict[str, Any]] = []

        for label, texts in REFERENCE_TEXTS.items():
            for text in texts:
                vector = self._embed_text(text)
                entry = {"text": text, "cluster": label, "embedding": vector}
                embeddings.append(vector)
                labels.append(label)
                self.reference_bank.append(entry)
                dataset_bank.append(entry)

        for source_text, variants in SUGGESTION_TEXTS.items():
            for variant in [source_text, *variants]:
                vector = self._embed_text(variant)
                dataset_bank.append({"text": variant, "cluster": "", "embedding": vector})

        matrix = np.asarray(embeddings, dtype=np.float32)
        self.kmeans = KMeans(n_clusters=3, n_init=10, random_state=42)
        cluster_ids = self.kmeans.fit_predict(matrix)

        buckets: dict[int, list[str]] = {0: [], 1: [], 2: []}
        for cluster_id, label in zip(cluster_ids, labels, strict=True):
            buckets[int(cluster_id)].append(label)

        for cluster_id, bucket_labels in buckets.items():
            self.cluster_name_by_id[cluster_id] = (
                max(set(bucket_labels), key=bucket_labels.count) if bucket_labels else CLUSTER_LABELS[cluster_id]
            )

        self.dataset_bank = []
        for item in dataset_bank:
            cluster = item["cluster"] or self.predict_cluster(item["embedding"])[0]
            self.dataset_bank.append({**item, "cluster": cluster})

        self.dataset_matrix = np.asarray([item["embedding"] for item in self.dataset_bank], dtype=np.float32)
        self.nearest_neighbors = NearestNeighbors(metric="cosine")
        self.nearest_neighbors.fit(self.dataset_matrix)

    def _fallback_embedding(self, cleaned_text: str) -> list[float]:
        dim = 256
        vector = np.zeros(dim, dtype=np.float32)
        padded = f"  {cleaned_text}  "
        for index in range(len(padded) - 2):
            trigram = padded[index : index + 3]
            bucket = hash(trigram) % dim
            vector[bucket] += 1.0
        for token in cleaned_text.split():
            vector[hash(token) % dim] += 0.75
        norm = np.linalg.norm(vector)
        if norm:
            vector /= norm
        return vector.astype(np.float32).tolist()

    def _embed_with_model(self, cleaned_text: str) -> list[float]:
        assert self.model is not None
        assert self.tokenizer is not None
        encoded = self.tokenizer(
            cleaned_text,
            padding="max_length",
            truncation=True,
            max_length=int(self.model_config["max_len"]),
            return_tensors="pt",
        )
        encoded = {key: value.to(self.device) for key, value in encoded.items()}
        with torch.no_grad():
            embedding = self.model(encoded["input_ids"], encoded["attention_mask"])
        return embedding.squeeze(0).detach().cpu().float().tolist()

    def _embed_text(self, text: str) -> list[float]:
        cleaned = preprocess_text(text)
        if not cleaned:
            return [0.0] * int(self.model_config.get("proj_dim", 256))

        if self.model is not None and self.tokenizer is not None:
            try:
                return self._embed_with_model(cleaned)
            except Exception:
                pass

        return self._fallback_embedding(cleaned)

    def get_embedding(self, text: str) -> list[float]:
        return self._embed_text(text)

    def predict_cluster(self, embedding: list[float]) -> tuple[str, float]:
        if self.kmeans is None:
            return "Code Mixed", 0.0

        vector = np.asarray([embedding], dtype=np.float32)
        cluster_id = int(self.kmeans.predict(vector)[0])
        distances = self.kmeans.transform(vector)[0]
        confidence = float(1.0 / (1.0 + distances[cluster_id]))
        cluster = self.cluster_name_by_id.get(cluster_id, CLUSTER_LABELS[cluster_id])
        return cluster, round(confidence, 4)

    def estimate_code_mixing(self, text: str) -> dict[str, float | int]:
        cleaned = preprocess_text(text)
        tokens = [token for token in cleaned.split() if token]
        if not tokens:
            return {
                "english_ratio": 0.0,
                "bengali_ratio": 0.0,
                "mixed_ratio": 0.0,
                "code_mixing_index": 0.0,
                "token_count": 0,
            }

        english = 0
        bengali = 0
        mixed = 0
        for token in tokens:
            has_alpha = any(char.isalpha() for char in token)
            if token.isascii() and has_alpha:
                if token in ENGLISH_HINTS:
                    english += 1
                elif token in BENGALI_ROMANIZED_HINTS or any(
                    chunk in token for chunk in ("bh", "kh", "sh", "chh", "ng", "valo", "bhalo", "ami", "tumi")
                ):
                    bengali += 1
                else:
                    mixed += 1
            elif has_alpha:
                bengali += 1
            else:
                mixed += 1

        total = len(tokens)
        english_ratio = english / total
        bengali_ratio = bengali / total
        mixed_ratio = mixed / total
        cmi = (1.0 - max(english_ratio, bengali_ratio, mixed_ratio)) * 100.0
        return {
            "english_ratio": round(english_ratio, 4),
            "bengali_ratio": round(bengali_ratio, 4),
            "mixed_ratio": round(mixed_ratio, 4),
            "code_mixing_index": round(cmi / 100.0, 4),
            "token_count": total,
        }

    def build_cmi_response(self, text: str) -> dict[str, float | int]:
        metrics = self.estimate_code_mixing(text)
        return {
            "bengali_percent": round(float(metrics["bengali_ratio"]) * 100, 2),
            "english_percent": round(float(metrics["english_ratio"]) * 100, 2),
            "mixed_percent": round(float(metrics["mixed_ratio"]) * 100, 2),
            "cmi_score": round(float(metrics["code_mixing_index"]), 4),
            "token_count": int(metrics["token_count"]),
        }

    def explain_cluster(self, text: str, cluster: str, code_mixing: dict[str, float | int]) -> str:
        cleaned = preprocess_text(text)
        tokens = cleaned.split()
        english_tokens = [token for token in tokens if token in ENGLISH_HINTS]
        reasons = []

        if english_tokens:
            reasons.append(f'Contains English cues like "{english_tokens[0]}"')
        if float(code_mixing["english_ratio"]) > 0.2:
            reasons.append("Shows noticeable English token usage")
        if float(code_mixing["bengali_ratio"]) > 0.3:
            reasons.append("Keeps Bengali sentence structure")
        if cluster == "Formal Bengali":
            reasons.append("Uses comparatively formal and presentation-style wording")
        elif cluster == "Pure Bengali":
            reasons.append("Mostly stays in Bengali-style vocabulary")
        else:
            reasons.append("Blends Bengali phrasing with English vocabulary")

        return " | ".join(reasons[:3])

    def _char_ngram_similarity(self, text1: str, text2: str) -> float:
        def ngrams(value: str) -> set[str]:
            padded = f"  {value}  "
            return {padded[index : index + 3] for index in range(max(0, len(padded) - 2))}

        left = ngrams(text1)
        right = ngrams(text2)
        if not left or not right:
            return 0.0
        return len(left & right) / len(left | right)

    def _token_similarity(self, text1: str, text2: str) -> float:
        left = set(text1.split())
        right = set(text2.split())
        if not left or not right:
            return 0.0
        overlap = len(left & right)
        precision = overlap / len(left)
        recall = overlap / len(right)
        if precision + recall == 0:
            return 0.0
        return (2 * precision * recall) / (precision + recall)

    def compare_texts(self, text1: str, text2: str) -> dict[str, Any]:
        cleaned1 = preprocess_text(text1)
        cleaned2 = preprocess_text(text2)
        embedding1 = self.get_embedding(cleaned1)
        embedding2 = self.get_embedding(cleaned2)

        embedding_score = max(cosine_similarity(embedding1, embedding2), 0.0)
        char_score = self._char_ngram_similarity(cleaned1, cleaned2)
        token_score = self._token_similarity(cleaned1, cleaned2)
        sequence_score = SequenceMatcher(None, cleaned1, cleaned2).ratio()
        final_score = (
            0.58 * embedding_score
            + 0.18 * char_score
            + 0.14 * token_score
            + 0.10 * sequence_score
        )

        return {
            "similarity": round(float(final_score), 4),
            "embedding_similarity": round(float(embedding_score), 4),
            "character_similarity": round(float(char_score), 4),
            "token_similarity": round(float(token_score), 4),
            "sequence_similarity": round(float(sequence_score), 4),
            "text1_cleaned": cleaned1,
            "text2_cleaned": cleaned2,
        }

    def build_compare_visual(self, text1: str, text2: str) -> dict[str, Any]:
        comparison = self.compare_texts(text1, text2)
        embedding1 = self.get_embedding(text1)
        embedding2 = self.get_embedding(text2)
        differences = [round(abs(a - b), 4) for a, b in zip(embedding1[:24], embedding2[:24], strict=True)]
        return {
            **comparison,
            "vector_difference": differences,
            "vector_difference_average": round(float(np.mean(differences)) if differences else 0.0, 4),
        }

    def find_similar_examples(self, embedding: list[float], limit: int = 3) -> list[dict[str, Any]]:
        scored = []
        for item in self.reference_bank:
            score = cosine_similarity(embedding, item["embedding"])
            scored.append({"text": item["text"], "cluster": item["cluster"], "score": round(score, 4)})
        scored.sort(key=lambda row: row["score"], reverse=True)
        return scored[:limit]

    def suggest_variations(self, text: str, limit: int = 5) -> list[dict[str, Any]]:
        if self.nearest_neighbors is None or self.dataset_matrix is None:
            return []

        embedding = np.asarray([self.get_embedding(text)], dtype=np.float32)
        neighbor_count = min(limit + 8, len(self.dataset_bank))
        distances, indices = self.nearest_neighbors.kneighbors(embedding, n_neighbors=neighbor_count)
        cleaned = preprocess_text(text)

        suggestions: list[dict[str, Any]] = []
        seen: set[str] = set()
        for distance, index in zip(distances[0], indices[0], strict=True):
            item = self.dataset_bank[int(index)]
            candidate = preprocess_text(item["text"])
            if not candidate or candidate == cleaned or candidate in seen:
                continue
            seen.add(candidate)
            reranked = self.compare_texts(text, item["text"])
            suggestions.append(
                {
                    "text": item["text"],
                    "cluster": item["cluster"],
                    "similarity": reranked["similarity"],
                    "embedding_similarity": round(float(1.0 - distance), 4),
                }
            )

        suggestions.sort(key=lambda item: item["similarity"], reverse=True)
        return suggestions[:limit]

    def correct_text(self, text: str) -> dict[str, Any]:
        suggestions = self.suggest_variations(text, limit=5)
        corrected = suggestions[0]["text"] if suggestions else preprocess_text(text)
        return {
            "input": text,
            "corrected": corrected,
            "alternatives": [item["text"] for item in suggestions[:3]],
            "suggestions": suggestions,
        }

    def semantic_search(self, query: str, limit: int = 5, cluster: str | None = None) -> dict[str, Any]:
        cleaned = preprocess_text(query)
        results = []
        for item in self.dataset_bank:
            if cluster and item["cluster"] != cluster:
                continue
            comparison = self.compare_texts(cleaned, item["text"])
            results.append(
                {
                    "text": item["text"],
                    "cluster": item["cluster"],
                    "similarity": comparison["similarity"],
                }
            )
        results.sort(key=lambda item: item["similarity"], reverse=True)
        return {
            "query": query,
            "cleaned_query": cleaned,
            "results": results[:limit],
        }

    def convert_dialect(self, text: str) -> dict[str, str]:
        cleaned = preprocess_text(text)
        tokens = cleaned.split()

        formal_tokens = [FORMAL_REPLACEMENTS.get(token, token) for token in tokens]
        pure_tokens = [PURE_REPLACEMENTS.get(token, token) for token in tokens]
        pure_tokens = [token for token in pure_tokens if token]
        code_mixed_tokens = tokens[:]
        if code_mixed_tokens and not any(token in ENGLISH_HINTS for token in code_mixed_tokens):
            code_mixed_tokens.append(CODE_MIXED_INSERTIONS[len(tokens) % len(CODE_MIXED_INSERTIONS)])

        return {
            "input": text,
            "formal": " ".join(formal_tokens).strip(),
            "code_mixed": " ".join(code_mixed_tokens).strip(),
            "pure": " ".join(pure_tokens).strip(),
        }

    def get_dataset_rows(self, cluster: str | None = None) -> list[dict[str, Any]]:
        rows = []
        for item in self.dataset_bank:
            if cluster and item["cluster"] != cluster:
                continue
            rows.append(
                {
                    "text": item["text"],
                    "cluster": item["cluster"],
                    "code_mixing": self.build_cmi_response(item["text"]),
                }
            )
        rows.sort(key=lambda item: (item["cluster"], item["text"]))
        return rows

    def analyze(self, text: str) -> EmbeddingResult:
        cleaned = preprocess_text(text)
        embedding = self.get_embedding(cleaned)
        cluster, confidence = self.predict_cluster(embedding)
        similar_examples = self.find_similar_examples(embedding)
        code_mixing = self.estimate_code_mixing(cleaned)
        return EmbeddingResult(
            embedding=embedding,
            cleaned_text=cleaned,
            cluster=cluster,
            confidence=confidence,
            similar_examples=similar_examples,
            backend_mode=self.backend_mode,
            code_mixing=code_mixing,
            reason=self.explain_cluster(cleaned, cluster, code_mixing),
        )

    def get_visualization_data(self) -> dict[str, Any]:
        if self.dataset_matrix is None:
            return {"points": [], "method": "none"}

        if len(self.dataset_bank) < 3:
            projection = np.zeros((len(self.dataset_bank), 2), dtype=np.float32)
            method = "raw"
        elif umap is not None:
            reducer = umap.UMAP(n_components=2, random_state=42, n_neighbors=min(6, len(self.dataset_bank) - 1))
            projection = reducer.fit_transform(self.dataset_matrix)
            method = "umap"
        else:
            perplexity = min(5, max(2, len(self.dataset_bank) - 1))
            reducer = TSNE(n_components=2, random_state=42, init="random", learning_rate="auto", perplexity=perplexity)
            projection = reducer.fit_transform(self.dataset_matrix)
            method = "tsne"

        points = []
        for coords, item in zip(projection, self.dataset_bank, strict=True):
            points.append(
                {
                    "x": round(float(coords[0]), 4),
                    "y": round(float(coords[1]), 4),
                    "text": item["text"],
                    "cluster": item["cluster"],
                }
            )
        return {"points": points, "method": method}

    def build_dashboard_metrics(self, texts: list[str] | None = None) -> dict[str, Any]:
        corpus = texts or [item["text"] for item in self.dataset_bank]
        analyses = [self.analyze(text) for text in corpus if preprocess_text(text)]
        if not analyses:
            return {
                "cluster_distribution": {},
                "sentence_lengths": {"average": 0, "max": 0, "min": 0},
                "code_mixing": {"english_pct": 0, "bengali_pct": 0, "mixed_pct": 0, "average_cmi": 0},
                "similarity_samples": [],
            }

        cluster_distribution: dict[str, int] = {}
        lengths: list[int] = []
        english_ratios: list[float] = []
        bengali_ratios: list[float] = []
        mixed_ratios: list[float] = []
        cmi_scores: list[float] = []

        for analysis in analyses:
            cluster_distribution[analysis.cluster] = cluster_distribution.get(analysis.cluster, 0) + 1
            lengths.append(int(analysis.code_mixing["token_count"]))
            english_ratios.append(float(analysis.code_mixing["english_ratio"]))
            bengali_ratios.append(float(analysis.code_mixing["bengali_ratio"]))
            mixed_ratios.append(float(analysis.code_mixing["mixed_ratio"]))
            cmi_scores.append(float(analysis.code_mixing["code_mixing_index"]))

        similarity_samples = []
        anchor_texts = corpus[: min(6, len(corpus))]
        if anchor_texts:
            for text in anchor_texts[1:]:
                comparison = self.compare_texts(anchor_texts[0], text)
                similarity_samples.append(
                    {
                        "label": text[:24] + ("..." if len(text) > 24 else ""),
                        "score": comparison["similarity"],
                    }
                )

        return {
            "cluster_distribution": cluster_distribution,
            "sentence_lengths": {
                "average": round(float(np.mean(lengths)), 2),
                "max": int(np.max(lengths)),
                "min": int(np.min(lengths)),
            },
            "code_mixing": {
                "english_pct": round(float(np.mean(english_ratios) * 100), 2),
                "bengali_pct": round(float(np.mean(bengali_ratios) * 100), 2),
                "mixed_pct": round(float(np.mean(mixed_ratios) * 100), 2),
                "average_cmi": round(float(np.mean(cmi_scores)), 2),
            },
            "similarity_samples": similarity_samples,
        }

    def parse_batch_file(self, content: bytes, filename: str) -> list[str]:
        suffix = Path(filename).suffix.lower()
        decoded = content.decode("utf-8", errors="ignore")
        if suffix == ".txt":
            return [line.strip() for line in decoded.splitlines() if line.strip()]
        if suffix == ".csv":
            rows = []
            reader = csv.reader(io.StringIO(decoded))
            for row in reader:
                joined = " ".join(cell.strip() for cell in row if cell.strip())
                if joined:
                    rows.append(joined)
            return rows
        raise ValueError("Unsupported file type. Please upload a .txt or .csv file.")

    def analyze_batch(self, texts: list[str]) -> dict[str, Any]:
        results = []
        similarities = []
        baseline = texts[0] if texts else None

        for text in texts:
            analysis = self.analyze(text)
            avg_similarity = self.compare_texts(baseline, text)["similarity"] if baseline else 0.0
            similarities.append(avg_similarity)
            results.append(
                {
                    "sentence": text,
                    "cleaned_text": analysis.cleaned_text,
                    "cluster": analysis.cluster,
                    "confidence": analysis.confidence,
                    "similarity_score": round(avg_similarity, 4),
                    "code_mixing_index": analysis.code_mixing["code_mixing_index"],
                }
            )

        distribution: dict[str, int] = {}
        for item in results:
            distribution[item["cluster"]] = distribution.get(item["cluster"], 0) + 1

        return {
            "results": results,
            "summary": {
                "total_sentences": len(results),
                "average_similarity": round(float(np.mean(similarities)) if similarities else 0.0, 4),
                "cluster_distribution": distribution,
            },
        }


service = DialectModelService()
