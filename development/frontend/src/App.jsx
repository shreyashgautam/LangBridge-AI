import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BatchPage from "./pages/BatchPage";
import ConverterPage from "./pages/ConverterPage";
import CorrectorPage from "./pages/CorrectorPage";
import DashboardPage from "./pages/DashboardPage";
import DatasetPage from "./pages/DatasetPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import SuggestPage from "./pages/SuggestPage";
import VisualizePage from "./pages/VisualizePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/visualize" element={<VisualizePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/batch" element={<BatchPage />} />
        <Route path="/suggest" element={<SuggestPage />} />
        <Route path="/correct" element={<CorrectorPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/convert" element={<ConverterPage />} />
        <Route path="/dataset" element={<DatasetPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
