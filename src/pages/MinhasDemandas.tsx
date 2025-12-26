import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDemands } from "@/context/DemandsContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Timer, ChevronRight, ClipboardList, AlertTriangle } from "lucide-react";
import { getDemandStatusLabel, getPriorityLabel, DemandStatus } from "@/data/mockData";

const MinhasDemandas = () => {
  const { profile } = useAuth();
  const { demands, toggleResponsibility, updateTaskHours } = useDemands();
  const navigate = useNavigate();

  // Filter demands where current user is a responsible
  const myDemands = demands.filter(d => 
    d.responsibles.some(r => r.userName === profile?.name) &&
    d.status !== 'concluida' && d.status !== 'cancelada'
  );

  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  const dailyDemands = myDemands.filter(d => {
    const dueDate = new Date(d.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  const weeklyDemands = myDemands.filter(d => {
    const dueDate = new Date(d.dueDate);
    return dueDate >= today && dueDate <= weekFromNow;
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

  const renderDemandCard = (demand: typeof myDemands[0]) => {
    const myResponsible = demand.responsibles.find(r => r.userName === profile?.name);
    if (!myResponsible) return null;

    const responsibilities = Array.isArray(myResponsible.responsibilities) 
      ? myResponsible.responsibilities 
      : [];
    const completedCount = responsibilities.filter(r => r.completed).length;
    const totalCount = responsibilities.length;
    const totalHours = responsibilities.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

    return (
      <Card key={demand.id} className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {demand.title}
                </CardTitle>
                <Badge variant={getStatusVariant(demand.status)}>
                  {getDemandStatusLabel(demand.status)}
                </Badge>
                <Badge variant={getPriorityVariant(demand.priority)}>
                  {getPriorityLabel(demand.priority)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Prazo: {formatDate(demand.dueDate)}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  {completedCount}/{totalCount} tarefas
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {totalHours}h registradas
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {responsibilities.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleResponsibility(demand.id, myResponsible.userId, item.id)}
                />
                <label 
                  htmlFor={item.id}
                  className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                >
                  {item.text}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.hoursWorked || 0}
                    onChange={(e) => updateTaskHours(demand.id, myResponsible.userId, item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Demandas</h1>
          <p className="text-muted-foreground">
            Olá, {profile?.name}! Gerencie suas tarefas e registre suas horas.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Demandas Hoje
              </CardTitle>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dailyDemands.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Demandas da Semana
              </CardTitle>
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{weeklyDemands.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Demandas
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{myDemands.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="semana" className="w-full">
          <TabsList>
            <TabsTrigger value="hoje">Hoje ({dailyDemands.length})</TabsTrigger>
            <TabsTrigger value="semana">Semana ({weeklyDemands.length})</TabsTrigger>
            <TabsTrigger value="todas">Todas ({myDemands.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4 mt-4">
            {dailyDemands.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhuma demanda para hoje.</p>
                </CardContent>
              </Card>
            ) : (
              dailyDemands.map(renderDemandCard)
            )}
          </TabsContent>

          <TabsContent value="semana" className="space-y-4 mt-4">
            {weeklyDemands.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhuma demanda para esta semana.</p>
                </CardContent>
              </Card>
            ) : (
              weeklyDemands.map(renderDemandCard)
            )}
          </TabsContent>

          <TabsContent value="todas" className="space-y-4 mt-4">
            {myDemands.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Você não possui demandas abertas.</p>
                </CardContent>
              </Card>
            ) : (
              myDemands.map(renderDemandCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MinhasDemandas;