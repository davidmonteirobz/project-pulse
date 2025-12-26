import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { projects, getStatusLabel } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

const ProjetoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'em_andamento': return 'default';
      case 'a_iniciar': return 'secondary';
      case 'finalizado': return 'outline';
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

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Projeto não encontrado.</p>
          <Link to="/projetos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const totalEstimated = project.stages.reduce((acc, s) => acc + s.estimatedHours, 0);
  const totalRegistered = project.stages.reduce((acc, s) => acc + s.registeredHours, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/projetos">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        {/* Project Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {project.name}
                </CardTitle>
                <Badge variant={getStatusVariant(project.status)} className="text-sm">
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium text-foreground">{project.responsible}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Entrega</p>
                  <p className="font-medium text-foreground">{formatDate(project.deliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Clock className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas</p>
                  <p className="font-medium text-foreground">{totalRegistered}h / {totalEstimated}h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stages Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Etapas do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-center">Horas Estimadas</TableHead>
                  <TableHead className="text-center">Horas Registradas</TableHead>
                  <TableHead className="text-center">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.stages.map((stage) => {
                  const stageProgress = Math.round((stage.registeredHours / stage.estimatedHours) * 100);
                  
                  return (
                    <TableRow key={stage.id}>
                      <TableCell className="font-medium">{stage.name}</TableCell>
                      <TableCell className="text-center">{stage.estimatedHours}h</TableCell>
                      <TableCell className="text-center">{stage.registeredHours}h</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${Math.min(stageProgress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">{stageProgress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProjetoDetalhe;
