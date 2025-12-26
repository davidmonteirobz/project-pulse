import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, AlertTriangle, Calendar, Zap, ChevronRight, Users } from "lucide-react";
import { useDemands, Demand } from "@/context/DemandsContext";
import { getDemandStatusLabel, getPriorityLabel, DemandStatus } from "@/data/mockData";

type MetricType = 'em_andamento' | 'atrasadas' | 'urgentes' | 'entregas_semana';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "warning" | "success" | "urgent";
  onClick?: () => void;
}

function MetricCard({ title, value, icon, description, variant = "default", onClick }: MetricCardProps) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-card border-l-4 border-l-destructive",
    success: "bg-card border-l-4 border-l-chart-2",
    urgent: "bg-card border-l-4 border-l-orange-500",
  };

  return (
    <Card 
      className={`${variantStyles[variant]} shadow-sm hover:shadow-md transition-all cursor-pointer`}
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

const metricTitles: Record<MetricType, string> = {
  em_andamento: 'Demandas em Andamento',
  atrasadas: 'Demandas Atrasadas',
  urgentes: 'Demandas Urgentes',
  entregas_semana: 'Entregas da Semana',
};

export function DashboardMetrics() {
  const { demands } = useDemands();
  const [openMetric, setOpenMetric] = useState<MetricType | null>(null);

  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  const demandsInProgress = demands.filter(d => 
    d.status === 'em_execucao' || d.status === 'em_analise'
  );

  const delayedDemands = demands.filter(d => 
    d.status !== 'concluida' && d.status !== 'cancelada' && new Date(d.dueDate) < today
  );

  const urgentDemands = demands.filter(d => 
    d.priority === 'urgente' && d.status !== 'concluida' && d.status !== 'cancelada'
  );

  const deliveriesThisWeek = demands.filter(d => {
    const dueDate = new Date(d.dueDate);
    return dueDate >= today && dueDate <= weekFromNow && d.status !== 'concluida' && d.status !== 'cancelada';
  });

  const getFilteredDemands = (): Demand[] => {
    switch (openMetric) {
      case 'em_andamento': return demandsInProgress;
      case 'atrasadas': return delayedDemands;
      case 'urgentes': return urgentDemands;
      case 'entregas_semana': return deliveriesThisWeek;
      default: return [];
    }
  };

  const getStatusVariant = (status: DemandStatus) => {
    switch (status) {
      case 'em_execucao': return 'default';
      case 'em_analise': return 'secondary';
      case 'aberta': return 'outline';
      case 'em_pausa': return 'secondary';
      case 'concluida': return 'default';
      case 'cancelada': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'destructive';
      case 'alta': return 'default';
      case 'media': return 'secondary';
      case 'baixa': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredDemands = getFilteredDemands();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Demandas em Andamento"
          value={demandsInProgress.length}
          icon={<ClipboardList className="h-5 w-5" />}
          description="Em execução ou análise"
          onClick={() => setOpenMetric('em_andamento')}
        />
        <MetricCard
          title="Demandas Atrasadas"
          value={delayedDemands.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Precisam de atenção"
          variant={delayedDemands.length > 0 ? "warning" : "default"}
          onClick={() => setOpenMetric('atrasadas')}
        />
        <MetricCard
          title="Demandas Urgentes"
          value={urgentDemands.length}
          icon={<Zap className="h-5 w-5" />}
          description="Prioridade urgente"
          variant={urgentDemands.length > 0 ? "urgent" : "default"}
          onClick={() => setOpenMetric('urgentes')}
        />
        <MetricCard
          title="Entregas da Semana"
          value={deliveriesThisWeek.length}
          icon={<Calendar className="h-5 w-5" />}
          description="Próximos 7 dias"
          onClick={() => setOpenMetric('entregas_semana')}
        />
      </div>

      <Dialog open={openMetric !== null} onOpenChange={(open) => !open && setOpenMetric(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openMetric && metricTitles[openMetric]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {filteredDemands.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma demanda encontrada.</p>
            ) : (
              filteredDemands.map((demand) => (
                <Link 
                  key={demand.id} 
                  to={`/demanda/${demand.id}`}
                  onClick={() => setOpenMetric(null)}
                >
                  <div className="p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{demand.title}</h3>
                          <Badge variant={getStatusVariant(demand.status)}>
                            {getDemandStatusLabel(demand.status)}
                          </Badge>
                          <Badge variant={getPriorityVariant(demand.priority)}>
                            {getPriorityLabel(demand.priority)}
                          </Badge>
                        </div>
                        {demand.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {demand.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {demand.responsibles.map(r => r.teamMemberName).join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(demand.startDate)} - {formatDate(demand.dueDate)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}