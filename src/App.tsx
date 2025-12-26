import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DemandsProvider } from "@/context/DemandsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Demandas from "./pages/Demandas";
import Equipe from "./pages/Equipe";
import ProjetoDetalhe from "./pages/ProjetoDetalhe";
import Relatorios from "./pages/Relatorios";
import Auth from "./pages/Auth";
import MinhasDemandas from "./pages/MinhasDemandas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/minhas-demandas" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to={role === 'admin' ? "/" : "/minhas-demandas"} replace /> : <Auth />} />
      <Route path="/" element={
        <ProtectedRoute adminOnly>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/demandas" element={
        <ProtectedRoute adminOnly>
          <Demandas />
        </ProtectedRoute>
      } />
      <Route path="/equipe" element={
        <ProtectedRoute adminOnly>
          <Equipe />
        </ProtectedRoute>
      } />
      <Route path="/demanda/:id" element={
        <ProtectedRoute>
          <ProjetoDetalhe />
        </ProtectedRoute>
      } />
      <Route path="/relatorios" element={
        <ProtectedRoute adminOnly>
          <Relatorios />
        </ProtectedRoute>
      } />
      <Route path="/minhas-demandas" element={
        <ProtectedRoute>
          <MinhasDemandas />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DemandsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DemandsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;