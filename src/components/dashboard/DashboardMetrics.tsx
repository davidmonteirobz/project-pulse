import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, AlertTriangle, Calendar, Clock } from "lucide-react";
import { 
  getProjectsInProgress, 
  getDelayedProjects, 
  getDeliveriesThisWeek, 
  getTotalRegisteredHours 
} from "@/data/mockData";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "warning" | "success";
}

function MetricCard({ title, value, icon, description, variant = "default" }: MetricCardProps) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-card border-l-4 border-l-destructive",
    success: "bg-card border-l-4 border-l-chart-2",
  };

  return (
    <Card className={`${variantStyles[variant]} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardMetrics() {
  const projectsInProgress = getProjectsInProgress();
  const delayedProjects = getDelayedProjects();
  const deliveriesThisWeek = getDeliveriesThisWeek();
  const totalHours = getTotalRegisteredHours();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Projetos em Andamento"
        value={projectsInProgress}
        icon={<FolderKanban className="h-5 w-5" />}
        description="Projetos ativos no momento"
      />
      <MetricCard
        title="Projetos Atrasados"
        value={delayedProjects}
        icon={<AlertTriangle className="h-5 w-5" />}
        description="Precisam de atenção"
        variant={delayedProjects > 0 ? "warning" : "default"}
      />
      <MetricCard
        title="Entregas da Semana"
        value={deliveriesThisWeek}
        icon={<Calendar className="h-5 w-5" />}
        description="Próximos 7 dias"
      />
      <MetricCard
        title="Horas Registradas"
        value={`${totalHours}h`}
        icon={<Clock className="h-5 w-5" />}
        description="Total em todos os projetos"
        variant="success"
      />
    </div>
  );
}
