import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projects, getStatusLabel } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const recentProjects = projects.filter(p => p.status === 'em_andamento').slice(0, 3);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'em_andamento': return 'default';
      case 'a_iniciar': return 'secondary';
      case 'finalizado': return 'outline';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardMetrics />
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Projetos Recentes
            </CardTitle>
            <Link 
              to="/projetos" 
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const totalEstimated = project.stages.reduce((acc, s) => acc + s.estimatedHours, 0);
                const totalRegistered = project.stages.reduce((acc, s) => acc + s.registeredHours, 0);
                const progress = Math.round((totalRegistered / totalEstimated) * 100);
                
                return (
                  <Link 
                    key={project.id} 
                    to={`/projeto/${project.id}`}
                    className="block p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      <Badge variant={getStatusVariant(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{project.responsible}</span>
                      <span>{totalRegistered}h / {totalEstimated}h ({progress}%)</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
