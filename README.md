<div align="center">

<br>

```
██████╗ ██╗ █████╗ ██╗     ███████╗ ██████╗████████╗
██╔══██╗██║██╔══██╗██║     ██╔════╝██╔════╝╚══██╔══╝
██║  ██║██║███████║██║     █████╗  ██║        ██║   
██║  ██║██║██╔══██║██║     ██╔══╝  ██║        ██║   
██████╔╝██║██║  ██║███████╗███████╗╚██████╗   ██║   
╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝   ╚═╝  

          AWARE  NLP  ANALYZER
```

<br>

**Bengali · English · Code-Mixed**

*Full-stack AI app for dialect analysis, embedding visualization,*
*phonetic correction, semantic search & more.*

<br>

[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

<br>

</div>

---

<br>

## ⚠️ &nbsp; Model Setup — Do This First

> **The backend requires `dialect_contrastive_model.pt` placed inside `backend/` before starting.**

<br>

<div align="center">

### 📥 &nbsp; [Download Model from Kaggle →](https://www.kaggle.com/models/ankiiitmishra/dialect-contrastive-model)

</div>

<br>

Once downloaded, place it here:

```
backend/
└── dialect_contrastive_model.pt   ← here
```

> 💡 **No model?** No problem. The app automatically falls back to a **deterministic trigram embedding** — the full UI still runs end-to-end.

<br>

---

<br>

## ✦ &nbsp; Features

<br>

| &nbsp; | Feature | Description |
|:---:|---|---|
| 🔮 | **Single-text Analysis** | Cluster prediction + confidence scores for any code-mixed input |
| 📐 | **Cosine Similarity** | Sentence-to-sentence semantic comparison via embedding distance |
| 🗺️ | **Embedding Visualizer** | UMAP and TSNE scatter plots rendered over your phrase space |
| 📊 | **Analytics Dashboard** | Corpus-level cluster and code-mixing index (CMI) statistics |
| 📂 | **Batch Analyzer** | Upload `.txt` / `.csv` files and export bulk results |
| 💡 | **Smart Suggestions** | Nearest-neighbor embedding search for related phrases |
| 🔤 | **Phonetic Corrector** | Spelling normalization across transliterated Bengali text |
| 🔍 | **Semantic Search** | Query the phrase bank using embedding similarity scoring |
| 🔄 | **Dialect Converter** | Generate formal, pure, and code-mixed sentence variants |
| 🗃️ | **Dataset Explorer** | Filter by cluster and CMI stats across the full dataset |

<br>

---

<br>

## 📁 &nbsp; Project Structure

<br>

```
dialect-aware-nlp/
│
├── backend/
│   ├── dialect_contrastive_model.pt   ← place model here
│   ├── main.py
│   ├── model.py
│   ├── utils.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── routes/
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

<br>

---

<br>

## 🚀 &nbsp; Getting Started

<br>

### &nbsp; Backend

```bash
# 1 — Enter the backend directory
cd backend

# 2 — Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3 — Install dependencies
pip install -r requirements.txt

# 4 — Place your model file (download from Kaggle link above)
#     → backend/dialect_contrastive_model.pt

# 5 — Start the API server
uvicorn main:app --reload
```

> API runs on → `http://localhost:8000`

<br>

### &nbsp; Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on → `http://localhost:5173`  
> Connects to backend at → `http://localhost:8000`

<br>

### &nbsp; Docker

```bash
cd backend
docker build -t dialect-analyzer-backend .
docker run -p 8000:8000 dialect-analyzer-backend
```

<br>

---

<br>

## 🗺️ &nbsp; Pages

<br>

| Route | Page |
|---|---|
| `/` | 🏠 &nbsp; Home Analyzer |
| `/visualize` | 🗺️ &nbsp; Embedding Scatter Plot |
| `/dashboard` | 📊 &nbsp; Corpus Analytics |
| `/batch` | 📂 &nbsp; Batch Upload & Export |
| `/suggest` | 💡 &nbsp; Smart Suggestions |
| `/correct` | 🔤 &nbsp; Phonetic Corrector |
| `/search` | 🔍 &nbsp; Semantic Search |
| `/convert` | 🔄 &nbsp; Dialect Converter |
| `/dataset` | 🗃️ &nbsp; Dataset Explorer |

<br>

---

<br>

## 🛠️ &nbsp; Tech Stack

<br>

**Backend**
```
Python 3.10+  ·  FastAPI  ·  Uvicorn  ·  PyTorch  ·  UMAP-learn  ·  scikit-learn
```

**Frontend**
```
React 18  ·  Vite  ·  Tailwind CSS
```

**Model**
```
Contrastive Learning  ·  Cosine Similarity  ·  kNN Retrieval  ·  Trigram Fallback
```

**Infrastructure**
```
Docker  ·  Uvicorn ASGI
```

<br>

---

<br>

<div align="center">

Made with ❤️ &nbsp;·&nbsp; Bengali–English Code-Mixed NLP

<br>

**[⬆ Back to top](#)**

</div>