# Dialect-Aware NLP Analyzer

## 1. Project Overview

This project is a full-stack AI web application built for analyzing Bengali-English code-mixed text. It is based on a trained PyTorch `.pt` checkpoint that produces sentence embeddings using a MuRIL-based contrastive model. The system combines research ideas such as phonetic similarity, dialect-aware clustering, code-mixing analysis, and sentence comparison with a clean product-style frontend.

The goal of the project is not only to show a trained model, but to present it as a usable AI system. Instead of stopping at embeddings or clustering, this project turns the model into an interactive platform with analysis, search, correction, conversion, visualization, and batch processing.

## 2. Problem Statement

Bengali-English code-mixed text is common in messaging, social media, and informal communication. This kind of text is difficult for traditional NLP systems because:

- It contains mixed languages in the same sentence.
- Romanized Bengali often has inconsistent spellings.
- Similar phrases may look very different at the character level.
- Formal Bengali, pure Bengali, and code-mixed Bengali-English may belong to different usage styles.

This project addresses that problem by using learned sentence embeddings and similarity logic to understand such text more meaningfully.

## 3. Core Idea

The main idea is to convert input text into embeddings and then use those embeddings for multiple downstream tasks.

The system does the following:

- Preprocesses the text
- Generates an embedding using the trained checkpoint
- Predicts a dialect-style cluster
- Estimates code-mixing ratio
- Compares sentences using hybrid similarity
- Searches nearby phrases in embedding space
- Suggests corrections and alternative forms
- Converts text into different style variants

This makes the project both research-oriented and application-oriented.

## 4. Tech Stack

### Backend

- FastAPI
- Python
- PyTorch
- Transformers
- scikit-learn
- UMAP / TSNE support

### Frontend

- React with Vite
- Tailwind CSS
- Axios
- React Router
- Chart.js

## 5. Project Architecture

The project is divided into two major parts:

### Backend

The backend is responsible for:

- Loading the trained `.pt` checkpoint
- Tokenizing input text using MuRIL tokenizer
- Generating embeddings
- Running similarity and nearest-neighbor search
- Computing code-mixing metrics
- Returning JSON responses for frontend pages

Main files:

- `backend/main.py`
- `backend/model.py`
- `backend/utils.py`
- `backend/routes/analyzer.py`

### Frontend

The frontend is responsible for:

- Displaying all pages and UI components
- Collecting user input
- Calling backend APIs
- Showing model outputs in an easy-to-understand way
- Rendering charts, tables, badges, and suggestion cards

Main folders:

- `frontend/src/components/`
- `frontend/src/pages/`
- `frontend/src/services/`

## 6. Model Integration

The trained file `dialect_contrastive_model.pt` is used in the backend.

The checkpoint contains:

- encoder weights
- projector weights
- model configuration
- dialect map

The backend reconstructs a MuRIL-based contrastive encoder using:

- `AutoConfig`
- `AutoModel`
- projector layers defined in PyTorch

Then it loads the saved state dictionary from the checkpoint and uses it for inference.

This is important because the `.pt` file is not just a directly callable model object. It is a training checkpoint, so the backend rebuilds the architecture before loading the weights.

## 7. Preprocessing

Before inference, input text is normalized.

Preprocessing includes:

- lowercase conversion
- URL removal
- hashtag removal
- emoji removal
- punctuation cleanup
- repeated character normalization

This makes the model input more consistent and improves downstream comparison.

## 8. Embedding Generation

For each valid input sentence:

1. The text is cleaned.
2. It is tokenized using the MuRIL tokenizer.
3. The encoder produces contextual token representations.
4. Mean pooling is applied over the token representations.
5. The pooled output is passed through the projection head.
6. The final embedding is L2-normalized.

This embedding becomes the foundation for nearly every feature in the system.

## 9. Cluster Prediction

The project groups text into three style-based clusters:

- Pure Bengali
- Code Mixed
- Formal Bengali

The backend uses KMeans on reference embeddings and maps the learned clusters to readable labels. For a new input sentence:

- its embedding is computed
- the nearest cluster centroid is found
- a confidence score is generated from centroid distance

This allows the system to label the sentence style in a simple and demo-friendly way.

## 10. Hybrid Similarity

One major improvement in the project is the comparison logic.

A plain cosine similarity score alone was not enough for noisy romanized text, so the system now uses a hybrid similarity score made from:

- embedding similarity
- character n-gram similarity
- token overlap similarity
- sequence matching ratio

This gives better results for phrases like:

- `ami valo achi`
- `ami bhalo achi`
- `ami valo asi`

These may differ in spelling but still remain similar in meaning and pronunciation.

## 11. Code-Mixing Index

The project includes a CMI-style module for estimating how mixed a sentence is.

It classifies tokens approximately into:

- Bengali romanized
- English
- mixed / ambiguous

Then it computes:

- Bengali percentage
- English percentage
- mixed percentage
- CMI score

Example:

Input:

`ami valo achi bro`

Output:

- Bengali: 75%
- English: 25%
- CMI: 0.25

This makes the project more aligned with code-mixing research and gives a measurable interpretation of text style.

## 12. Explainable AI Layer

The `/analyze` route does not only return the cluster label. It also returns a reason string.

Example reasoning:

- Contains English cue words
- Keeps Bengali sentence structure
- Blends Bengali phrasing with English vocabulary

This improves interpretability and makes the result easier to explain in a demo or viva.

## 13. Features Implemented

### A. Home Analyzer

The main page allows the user to:

- input a code-mixed sentence
- run analysis
- see cluster prediction
- see confidence
- view cleaned text
- inspect similar example phrases
- compare two sentences
- see live suggestions while typing

### B. Embedding Visualization

The visualization page reduces embeddings into 2D space using:

- UMAP when available
- TSNE as fallback

It displays a scatter plot where:

- each point is a sentence
- color indicates cluster
- hover reveals the sentence

This creates a research-style visual explanation of how the model organizes text.

### C. Dashboard

The dashboard summarizes the phrase bank with:

- cluster distribution
- similarity bars
- sentence length statistics
- average code-mixing ratios

This makes the project feel like an analytics platform rather than a simple demo.

### D. Batch Analyzer

The batch page supports:

- `.txt` upload
- `.csv` upload
- manual multi-line input
- row-wise analysis
- downloadable CSV results

This is useful for handling many sentences at once and gives the project an industry-tool feel.

### E. Suggestions

The suggestions page uses nearest-neighbor search over the stored phrase bank to return top similar phrases. It helps demonstrate how the embedding space can support recommendation-like behavior.

### F. Phonetic Corrector

The corrector page uses embeddings plus reranking logic to normalize noisy romanized input.

Example:

- Input: `ami valo asi`
- Corrected: `ami valo achi`

This is one of the strongest practical use-cases of the model.

### G. Semantic Search

The search page acts like a mini retrieval system. The user gives a query and the system returns the most semantically similar phrases from the dataset bank.

Example:

- Query: `valo achi`
- Output:
  - `ami valo achi`
  - `ami bhalo achi`
  - `ami ajke khub valo achi`

### H. Dialect Converter

This is an experimental creative feature that rewrites one input into:

- formal variant
- pure variant
- code-mixed variant

It is partly rule-based, but it adds a strong presentation factor and shows understanding of dialect/style transformation.

### I. Dataset Explorer

This page exposes the internal phrase bank and lets the user:

- view sample phrases
- filter by cluster
- inspect CMI statistics per phrase

This makes the project feel like a research explorer tool.

## 14. API Routes

The backend exposes the following important routes:

- `POST /analyze`
- `POST /embed`
- `POST /similarity`
- `POST /compare-visual`
- `POST /suggest`
- `POST /correct`
- `POST /cmi`
- `POST /search`
- `POST /convert`
- `POST /visualize-data`
- `GET /dashboard-metrics`
- `POST /batch-analyze`
- `POST /batch-analyze-json`
- `POST /batch-export`
- `GET /dataset`
- `GET /samples`
- `GET /health`

## 15. Frontend Pages

The frontend now includes these pages:

- `/` Home
- `/visualize`
- `/dashboard`
- `/batch`
- `/suggest`
- `/correct`
- `/search`
- `/convert`
- `/dataset`

This multi-page structure helps present the project as a full AI product instead of a single model output screen.

## 16. Why This Project Is Strong

This project stands out because it combines:

- machine learning
- NLP research ideas
- backend engineering
- frontend product design
- explainability
- practical user-facing tools

It is not just:

- a training notebook
- a single prediction API
- a static ML demo

It is a complete AI system built around one trained model and multiple real applications of that model.

## 17. Real-World Value

This type of system can be useful in:

- code-mixed social media analysis
- text normalization
- search and retrieval for informal language
- dialect-aware user interfaces
- educational NLP tools
- low-resource language processing demos

## 18. Limitations

The project is strong, but it still has some practical limitations:

- code-mixing detection is heuristic-based, not a fully supervised classifier
- dialect conversion is experimental and partly rule-based
- correction quality depends on the phrase bank and embedding quality
- inference on CPU may take some time because MuRIL is relatively heavy

These are acceptable for a project/demo setting and can also be mentioned honestly in a viva.

## 19. Future Improvements

Possible future upgrades:

- add a larger phrase bank or dataset loader
- use FAISS for faster semantic search
- add user history and saved comparisons
- support Bengali script input more directly
- deploy backend and frontend online
- add authentication for multi-user access
- use better supervised CMI detection
- fine-tune a dedicated corrector or converter model

## 20. Demo Flow Suggestion

A strong demo flow can be:

1. Start from Home and analyze one sentence.
2. Show cluster label, confidence, and explanation.
3. Compare two similar sentences and show similarity breakdown.
4. Open Corrector and fix a noisy phrase.
5. Open Search and retrieve similar sentences.
6. Open Dashboard and explain distribution and CMI.
7. Open Visualization and show embedding clusters.
8. Open Batch Analyzer and export results.
9. End with Converter or Dataset Explorer for the wow factor.

## 21. Viva-Friendly Summary

This project is a dialect-aware NLP system for Bengali-English code-mixed text. It uses a MuRIL-based contrastive model checkpoint to generate sentence embeddings. Those embeddings are then used for multiple tasks such as clustering, hybrid similarity scoring, phonetic correction, semantic search, code-mixing analysis, visualization, and style conversion. The backend is built with FastAPI and the frontend is built with React and Tailwind. The main strength of the project is that it transforms one trained model into a complete, explainable, multi-feature AI application.

## 22. Conclusion

This project demonstrates not only model usage, but system thinking. It takes a research-based embedding model and turns it into a full-stack product with multiple NLP applications. Because of that, it can be presented as:

- a research project
- an AI product prototype
- an NLP utility system

That combination is what makes it impressive and valuable for academic evaluation, hackathons, and portfolio use.
