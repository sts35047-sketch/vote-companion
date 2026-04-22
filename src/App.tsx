import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LiquidBackground } from "@/components/LiquidBackground";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Index from "./pages/Index.tsx";

const Journey = lazy(() => import("./pages/Journey.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Complete = lazy(() => import("./pages/Complete.tsx"));
const News = lazy(() => import("./pages/News.tsx"));
const Booth = lazy(() => import("./pages/Booth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="container py-20 flex justify-center">
    <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <LiquidBackground />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Layout>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/journey" element={<Journey />} />
                  <Route path="/booth" element={<Booth />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/complete" element={<Complete />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
            <LanguageSwitcher />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
