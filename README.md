<div align="center">

# 🧠 Dialect-Aware NLP Analyzer

**Full-stack AI app for Bengali–English code-mixed text analysis**

[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

*Cluster prediction · Embedding visualization · Phonetic correction · Semantic search · Dialect conversion*

</div>

---

## ⚠️ Model Setup — Required

> **Before running the app**, download the trained PyTorch model and place it inside `backend/`:

```
backend/dialect_contrastive_model.pt
```

📥 **[Download from Kaggle →](https://www.kaggle.com/models/ankiiitmishra/dialect-contrastive-model)**

> If the file is missing or doesn't expose a direct embedding call, the app automatically falls back to a **deterministic trigram embedding** — so the UI still runs end-to-end without the model.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔮 **Single-text Analysis** | Cluster prediction and confidence scores for any code-mixed input |
| 📐 **Cosine Similarity** | Sentence-to-sentence semantic comparison using embedding distance |
| 🗺️ **Embedding Visualizer** | UMAP and TSNE scatter plots of your phrase space |
| 📊 **Analytics Dashboard** | Corpus-level cluster and code-mixing index (CMI) stats |
| 📂 **Batch Analyzer** | Upload `.txt` or `.csv` files and export bulk results |
| 💡 **Smart Suggestions** | Nearest-neighbor embedding search to surface related phrases |
| 🔤 **Phonetic Corrector** | Spelling normalization across transliterated Bengali text |
| 🔍 **Semantic Search** | Query over the phrase bank using embedding similarity |
| 🔄 **Dialect Converter** | Formal, pure, and code-mixed variant generation |
| 🗃️ **Dataset Explorer** | Filter by cluster and CMI stats across the full dataset |

---

## 🗂️ Project Structure

```
dialect-aware-nlp/
├── backend/
│   ├── dialect_contrastive_model.pt   ← place model here
│   ├── main.py
│   ├── model.py
│   ├── utils.py
│   └── routes/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

---

## 🚀 Getting Started

### Backend

```bash
# 1. Enter backend directory
cd backend

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Place the model file (see above)
# backend/dialect_contrastive_model.pt

# 5. Start the API server
uvicorn main:app --reload
```

API runs on → `http://localhost:8000`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → `http://localhost:5173`  
Connects to backend at → `http://localhost:8000`

---

### 🐳 Docker (Backend)

```bash
cd backend
docker build -t dialect-analyzer-backend .
docker run -p 8000:8000 dialect-analyzer-backend
```

---

## 🗺️ Pages

| Route | Page |
|---|---|
| `/` | 🏠 Home Analyzer |
| `/visualize` | 🗺️ Embedding Scatter Plot |
| `/dashboard` | 📊 Corpus Analytics |
| `/batch` | 📂 Batch Upload & Export |
| `/suggest` | 💡 Smart Suggestions |
| `/correct` | 🔤 Phonetic Corrector |
| `/search` | 🔍 Semantic Search |
| `/convert` | 🔄 Dialect Converter |
| `/dataset` | 🗃️ Dataset Explorer |

---

## 🛠️ Tech Stack

**Backend**
- Python 3.10+
- FastAPI + Uvicorn
- PyTorch (contrastive learning model)
- UMAP-learn, scikit-learn

**Frontend**
- React 18 + Vite
- Tailwind CSS

**Infrastructure**
- Docker

---

<div align="center">

Made with ❤️ · Bengali–English · Code-Mixed NLP

</div>