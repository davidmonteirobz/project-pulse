import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, Users, ChevronRight } from "lucide-react";
import { useDemands } from "@/context/DemandsContext";
import { DemandStatus, getDemandStatusLabel, getPriorityLabel } from "@/data/mockData";

const statusFilters: { value: DemandStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'em_pausa', label: 'Em pausa' },
  { value: 'concluida', label: 'Concluída' },
];

const Index = () => {
  const { demands } = useDemands();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'todos'>('todos');

  const filteredDemands = demands.filter((demand) => {
    const responsibleNames = demand.responsibles.map(r => r.userName.toLowerCase()).join(' ');
    const matchesSearch = demand.title.toLowerCase().includes(search.toLowerCase()) ||
      responsibleNames.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardMetrics />
        
        {/* Projects/Demands Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Projetos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título ou responsável..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Demands List */}
            <div className="space-y-3">
              {filteredDemands.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
                </div>
              ) : (
                filteredDemands.map((demand) => (
                  <Link key={demand.id} to={`/demanda/${demand.id}`}>
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
                              {demand.responsibles.map(r => r.userName).join(', ')}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;