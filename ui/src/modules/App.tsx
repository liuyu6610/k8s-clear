import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { CleanersPage } from "./pages/CleanersPage";
import { CleanerDetailPage } from "./pages/CleanerDetailPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cleaners" element={<CleanersPage />} />
        <Route path="/cleaners/:name" element={<CleanerDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
