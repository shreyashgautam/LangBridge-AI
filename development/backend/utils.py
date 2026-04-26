from __future__ import annotations

import re
from functools import lru_cache
from typing import Iterable

import numpy as np

URL_PATTERN = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
HASHTAG_PATTERN = re.compile(r"#\w+")
MENTION_PATTERN = re.compile(r"@\w+")
MULTISPACE_PATTERN = re.compile(r"\s+")
REPEATED_CHAR_PATTERN = re.compile(r"(.)\1{2,}")
NON_WORD_PATTERN = re.compile(r"[^\w\s]", re.UNICODE)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001F5FF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U0001F700-\U0001F77F"
    "\U0001F780-\U0001F7FF"
    "\U0001F800-\U0001F8FF"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\u2600-\u26FF"
    "\u2700-\u27BF"
    "]+",
    flags=re.UNICODE,
)


def preprocess_text(text: str) -> str:
    cleaned = text.strip().lower()
    cleaned = URL_PATTERN.sub("", cleaned)
    cleaned = HASHTAG_PATTERN.sub("", cleaned)
    cleaned = MENTION_PATTERN.sub("", cleaned)
    cleaned = EMOJI_PATTERN.sub("", cleaned)
    cleaned = REPEATED_CHAR_PATTERN.sub(r"\1\1", cleaned)
    cleaned = NON_WORD_PATTERN.sub(" ", cleaned)
    cleaned = MULTISPACE_PATTERN.sub(" ", cleaned)
    return cleaned.strip()


def cosine_similarity(vec1: Iterable[float], vec2: Iterable[float]) -> float:
    left = np.asarray(list(vec1), dtype=np.float32)
    right = np.asarray(list(vec2), dtype=np.float32)
    denom = float(np.linalg.norm(left) * np.linalg.norm(right))
    if denom == 0.0:
        return 0.0
    score = float(np.dot(left, right) / denom)
    return max(min(score, 1.0), -1.0)


@lru_cache(maxsize=1)
def demo_inputs() -> list[str]:
    return [
        "ami valo achi",
        "I am fine bro",
        "valo lagche movie ta",
    ]
