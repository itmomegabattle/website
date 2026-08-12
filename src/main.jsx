import React, { Suspense, lazy, useEffect } from "react";
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
import PageStage from "./components/PageStage";
import { AuthProvider } from "./context/AuthContext";
import { scheduleSiteWarmup } from "./lib/sitePrefetch";
import { routeModuleLoaders } from "./routes/pageModules";
import "./styles/common.css";
// Формы открываются интерактивно и часть из них рендерится порталом в body.
// Загружаем их стили заранее, чтобы первый показ не попадал в неоформленный кадр.
import "./styles/page-info.css";
import "./styles/stories-list.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
const HomePage = lazy(routeModuleLoaders["/"]);
const PeoplePage = lazy(routeModuleLoaders["/people"]);
const FacultiesPage = lazy(routeModuleLoaders["/faculties"]);
const HistoryPage = lazy(routeModuleLoaders["/history"]);
const PartnersPage = lazy(routeModuleLoaders["/partners"]);
const EventsPage = lazy(routeModuleLoaders["/events"]);
const RatingsPage = lazy(routeModuleLoaders["/ratings"]);
const AuthPage = lazy(routeModuleLoaders["/auth"]);
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const NfcPage = lazy(() => import("./pages/NfcPage"));

function App() {
  const matches = useMatches();
  const hideFooter = matches.some((match) => match.handle?.hideFooter);
  const hideBackground = matches.some((match) => match.handle?.hideBackground);
  const pageClassName = matches.some((match) => match.handle?.compactViewport)
    ? "app-shell app-shell--compact"
    : "app-shell";

  useEffect(() => {
    return scheduleSiteWarmup(queryClient);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={pageClassName}>
          <Preloader />
          <Header />
          {!hideBackground && <Background />}
          <Suspense fallback={<div className="page-stage-loading" aria-label="Загрузка страницы" />}>
            <PageStage><Outlet /></PageStage>
          </Suspense>
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
      <Route
        path="/history"
        element={<HistoryPage />}
        handle={{ hideFooter: true }}
      />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/ratings" element={<RatingsPage />} />
      <Route path="/roles" element={<Navigate to="/ratings#roles" replace />} />
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
