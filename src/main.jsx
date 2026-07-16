import React, { Suspense, lazy } from "react";
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
import Preloader from "./components/Preloader";
import { AuthProvider } from "./context/AuthContext";
import "./styles/common.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const HomePage = lazy(() => import("./pages/HomePage"));
const PeoplePage = lazy(() => import("./pages/PeoplePage"));
const FacultiesPage = lazy(() => import("./pages/FacultiesPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const RatingsPage = lazy(() => import("./pages/RatingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const NfcPage = lazy(() => import("./pages/NfcPage"));

function App() {
  const matches = useMatches();
  const hideFooter = matches.some((match) => match.handle?.hideFooter);
  const hideBackground = matches.some((match) => match.handle?.hideBackground);
  const pageClassName = matches.some((match) => match.handle?.compactViewport)
    ? "app-shell app-shell--compact"
    : "app-shell";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={pageClassName}>
          <Preloader />
          <Header />
          {!hideBackground && <Background />}
          <Suspense fallback={null}><Outlet /></Suspense>
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
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/ratings" element={<RatingsPage />} />
      <Route path="/admin" element={<Navigate to="/ratings" replace />} />
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
