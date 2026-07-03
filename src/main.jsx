import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
  useMatches,
} from "react-router-dom";
import { Api } from "./api";
import Background from "./components/Background";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import EventsPage from "./pages/EventsPage";
import ExternalPrPage from "./pages/ExternalPrPage";
import FacultiesPage from "./pages/FacultiesPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import NfcPage from "./pages/NfcPage";
import PeoplePage from "./pages/PeoplePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import RatingsPage from "./pages/RatingsPage";
import "./styles/common.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const matches = useMatches();
  const hideFooter = matches.some((match) => match.handle?.hideFooter);
  const pageClassName = matches.some((match) => match.handle?.compactViewport)
    ? "app-shell app-shell--compact"
    : "app-shell";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={pageClassName}>
          <Header />
          <Background />
          <Outlet />
          <ScrollRestoration />
          {!hideFooter && <Footer />}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Создание роутов
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/faculties" element={<FacultiesPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/partners" element={<ExternalPrPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/ratings" element={<RatingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/register" element={<AuthPage mode="signup" />} />
      <Route path="/profile" element={<Navigate to="/ratings" replace />} />
      <Route path="/u/:profileId" element={<PublicProfilePage />} />
      <Route
        path="/nfc/:tagCode"
        element={<NfcPage />}
        handle={{ hideFooter: true, compactViewport: true }}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
  { basename: Api.normalizeURL("/") },
);

// Создание всего приложения
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
