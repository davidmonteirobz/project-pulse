import { useState, useEffect, useRef, useCallback } from "react";
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
import { Calendar, Timer, ChevronRight, ClipboardList, AlertTriangle, Play, Pause } from "lucide-react";
import { getDemandStatusLabel, getPriorityLabel, DemandStatus } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { formatHoursToTime } from "@/lib/formatTime";

// Timer component for each task
const TaskTimer = ({ 
  taskId, 
  initialHours, 
  onUpdateHours 
}: { 
  taskId: string; 
  initialHours: number; 
  onUpdateHours: (id: string, hours: number) => void 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const baseHoursRef = useRef(initialHours);

  // Update base hours when initialHours changes (from parent)
  useEffect(() => {
    if (!isRunning) {
      baseHoursRef.current = initialHours;
    }
  }, [initialHours, isRunning]);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Save accumulated hours
    const additionalHours = elapsedSeconds / 3600;
    const newTotal = baseHoursRef.current + additionalHours;
    onUpdateHours(taskId, parseFloat(newTotal.toFixed(2)));
    baseHoursRef.current = newTotal;
    setElapsedSeconds(0);
  }, [isRunning, elapsedSeconds, taskId, onUpdateHours]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatHoursToTime = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTotalHours = isRunning 
    ? baseHoursRef.current + elapsedSeconds / 3600
    : initialHours;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRunning ? "destructive" : "outline"}
        size="icon"
        className="h-8 w-8"
        onClick={isRunning ? stopTimer : startTimer}
      >
        {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-mono font-medium ${isRunning ? 'text-primary' : ''}`}>
          {formatHoursToTime(currentTotalHours)}
        </span>
      </div>
    </div>
  );
};

const MinhasDemandas = () => {
  const { profile, user } = useAuth();
  const { demands, toggleResponsibility, updateTaskHours } = useDemands();
  const navigate = useNavigate();
  const [myTeamMemberId, setMyTeamMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTeamMemberId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setMyTeamMemberId(data.id);
      }
    };
    fetchMyTeamMemberId();
  }, [user?.id]);

  // Filter demands where current user is a responsible (by team member id)
  const myDemands = demands.filter(d => 
    d.responsibles.some(r => r.teamMemberId === myTeamMemberId) &&
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
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDemandCard = (demand: typeof myDemands[0]) => {
    const myResponsible = demand.responsibles.find(r => r.teamMemberId === myTeamMemberId);
    if (!myResponsible) return null;

    const responsibilities = myResponsible.responsibilities || [];
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
                  <span className="font-mono">{formatHoursToTime(totalHours)}</span> registradas
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
                  onCheckedChange={() => toggleResponsibility(item.id)}
                />
                <label 
                  htmlFor={item.id}
                  className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                >
                  {item.text}
                </label>
                <TaskTimer
                  taskId={item.id}
                  initialHours={item.hoursWorked || 0}
                  onUpdateHours={updateTaskHours}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!myTeamMemberId) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Demandas</h1>
            <p className="text-muted-foreground">
              Olá, {profile?.name}!
            </p>
          </div>
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Você ainda não está vinculado a um membro da equipe. 
                Peça ao administrador para vincular seu usuário.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
