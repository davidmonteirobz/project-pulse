import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { getDemandStatusLabel, getPriorityLabel } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Clock, FileText, Users, Timer } from "lucide-react";
import { useDemands } from "@/context/DemandsContext";
import { formatHoursToTime } from "@/lib/formatTime";

const ProjetoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const { demands, toggleResponsibility } = useDemands();
  const demand = demands.find((d) => d.id === id);

  const getStatusVariant = (status: string) => {
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
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalHours = () => {
    if (!demand) return 0;
    return demand.responsibles.reduce((sum, r) => {
      const responsibilities = r.responsibilities || [];
      return sum + responsibilities.reduce((taskSum, task) => taskSum + (task.hoursWorked || 0), 0);
    }, 0);
  };

  const getResponsibleHours = (responsibilities: { hoursWorked?: number }[]) => {
    return responsibilities.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  };

  const getCompletedCount = (responsibilities: { completed: boolean }[]) => {
    return responsibilities.filter(r => r.completed).length;
  };

  if (!demand) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Demanda não encontrada.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {/* Header */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-3">
                  {demand.title}
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(demand.status)} className="text-sm">
                    {getDemandStatusLabel(demand.status)}
                  </Badge>
                  <Badge variant={getPriorityVariant(demand.priority)} className="text-sm">
                    {getPriorityLabel(demand.priority)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total de Horas</p>
                  <p className="text-lg font-bold font-mono text-foreground">{formatHoursToTime(getTotalHours())}</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="projeto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projeto">Projeto</TabsTrigger>
            <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
          </TabsList>

          {/* Tab: Projeto */}
          <TabsContent value="projeto" className="space-y-4 mt-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Período</p>
                      <p className="font-medium text-foreground">
                        {formatDate(demand.startDate)} - {formatDate(demand.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Criado em</p>
                      <p className="font-medium text-foreground">{formatDate(demand.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {demand.description && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Descrição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{demand.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Responsáveis */}
          <TabsContent value="responsaveis" className="space-y-4 mt-4">
            {demand.responsibles.map((resp) => {
              const responsibilities = resp.responsibilities || [];
              const completedCount = getCompletedCount(responsibilities);
              const totalCount = responsibilities.length;
              const responsibleHours = getResponsibleHours(responsibilities);

              return (
                <Card key={resp.id} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold">
                            {resp.teamMemberName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{resp.teamMemberName}</p>
                          <p className="text-sm text-muted-foreground">
                            {completedCount}/{totalCount} atribuições concluídas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium font-mono text-foreground">{formatHoursToTime(responsibleHours)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {responsibilities.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.completed}
                            onCheckedChange={() => toggleResponsibility(item.id)}
                          />
                          <label 
                            htmlFor={item.id}
                            className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          >
                            {item.text}
                          </label>
                          <span className="text-sm font-mono text-muted-foreground bg-background px-2 py-1 rounded">
                            {formatHoursToTime(item.hoursWorked || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Total Hours Summary */}
            <Card className="shadow-sm bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Total Geral de Horas</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-primary">{formatHoursToTime(getTotalHours())}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProjetoDetalhe;
