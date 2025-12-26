import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, AlertTriangle, Calendar, Zap } from "lucide-react";
import { useDemands } from "@/context/DemandsContext";

export type MetricFilter = 'em_andamento' | 'atrasadas' | 'urgentes' | 'entregas_semana' | null;

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "warning" | "success" | "urgent";
  onClick?: () => void;
  isActive?: boolean;
}

function MetricCard({ title, value, icon, description, variant = "default", onClick, isActive }: MetricCardProps) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-card border-l-4 border-l-destructive",
    success: "bg-card border-l-4 border-l-chart-2",
    urgent: "bg-card border-l-4 border-l-orange-500",
  };

  return (
    <Card 
      className={`${variantStyles[variant]} shadow-sm hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
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

interface DashboardMetricsProps {
  activeFilter: MetricFilter;
  onFilterChange: (filter: MetricFilter) => void;
}

export function DashboardMetrics({ activeFilter, onFilterChange }: DashboardMetricsProps) {
  const { demands } = useDemands();

  const demandsInProgress = demands.filter(d => 
    d.status === 'em_execucao' || d.status === 'em_analise'
  ).length;

  const delayedDemands = demands.filter(d => {
    const today = new Date();
    return d.status !== 'concluida' && d.status !== 'cancelada' && new Date(d.dueDate) < today;
  }).length;

  const urgentDemands = demands.filter(d => 
    d.priority === 'urgente' && d.status !== 'concluida' && d.status !== 'cancelada'
  ).length;

  const deliveriesThisWeek = demands.filter(d => {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    const dueDate = new Date(d.dueDate);
    return dueDate >= today && dueDate <= weekFromNow && d.status !== 'concluida' && d.status !== 'cancelada';
  }).length;

  const handleClick = (filter: MetricFilter) => {
    onFilterChange(activeFilter === filter ? null : filter);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Demandas em Andamento"
        value={demandsInProgress}
        icon={<ClipboardList className="h-5 w-5" />}
        description="Em execução ou análise"
        onClick={() => handleClick('em_andamento')}
        isActive={activeFilter === 'em_andamento'}
      />
      <MetricCard
        title="Demandas Atrasadas"
        value={delayedDemands}
        icon={<AlertTriangle className="h-5 w-5" />}
        description="Precisam de atenção"
        variant={delayedDemands > 0 ? "warning" : "default"}
        onClick={() => handleClick('atrasadas')}
        isActive={activeFilter === 'atrasadas'}
      />
      <MetricCard
        title="Demandas Urgentes"
        value={urgentDemands}
        icon={<Zap className="h-5 w-5" />}
        description="Prioridade urgente"
        variant={urgentDemands > 0 ? "urgent" : "default"}
        onClick={() => handleClick('urgentes')}
        isActive={activeFilter === 'urgentes'}
      />
      <MetricCard
        title="Entregas da Semana"
        value={deliveriesThisWeek}
        icon={<Calendar className="h-5 w-5" />}
        description="Próximos 7 dias"
        onClick={() => handleClick('entregas_semana')}
        isActive={activeFilter === 'entregas_semana'}
      />
    </div>
  );
}