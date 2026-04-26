import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const analyzeText = async (text) => {
  const { data } = await api.post("/analyze", { text });
  return data;
};

export const compareTexts = async (text1, text2) => {
  const { data } = await api.post("/similarity", { text1, text2 });
  return data;
};

export const fetchSamples = async () => {
  const { data } = await api.get("/samples");
  return data.samples;
};

export const fetchHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};

export const fetchDashboardMetrics = async () => {
  const { data } = await api.get("/dashboard-metrics");
  return data;
};

export const fetchVisualizationData = async (texts = []) => {
  const { data } = await api.post("/visualize-data", { texts });
  return data;
};

export const fetchSuggestions = async (text) => {
  const { data } = await api.post("/suggest", { text });
  return data;
};

export const correctText = async (text) => {
  const { data } = await api.post("/correct", { text });
  return data;
};

export const fetchCmi = async (text) => {
  const { data } = await api.post("/cmi", { text });
  return data;
};

export const searchDataset = async (query, cluster = null) => {
  const { data } = await api.post("/search", { query, cluster });
  return data;
};

export const convertText = async (text) => {
  const { data } = await api.post("/convert", { text });
  return data;
};

export const fetchCompareVisual = async (text1, text2) => {
  const { data } = await api.post("/compare-visual", { text1, text2 });
  return data;
};

export const fetchDataset = async (cluster = "") => {
  const { data } = await api.get("/dataset", {
    params: cluster ? { cluster } : {},
  });
  return data;
};

export const batchAnalyzeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/batch-analyze", formData);
  return data;
};

export const batchAnalyzeTexts = async (texts) => {
  const { data } = await api.post("/batch-analyze-json", { texts });
  return data;
};

export const downloadBatchResults = async (texts) => {
  const response = await api.post(
    "/batch-export",
    { texts },
    {
      responseType: "blob",
    },
  );
  return response.data;
};
