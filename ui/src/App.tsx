import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { CleanersPage } from "./pages/CleanersPage";
import { CleanerDetailPage } from "./pages/CleanerDetailPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cleaners" element={<CleanersPage />} />
        <Route path="/cleaners/:name" element={<CleanerDetailPage />} />
      </Routes>
    </Layout>
  );
}




