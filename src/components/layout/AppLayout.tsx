import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/demandas": "Demandas",
  "/projetos": "Projetos",
  "/relatorios": "Relatórios",
};

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname.startsWith("/projeto/")) {
      return "Detalhes do Projeto";
    }
    return pageTitles[location.pathname] || "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background flex items-center px-6 gap-4">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
          </header>
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
