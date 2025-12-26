import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projects, getStatusLabel, ProjectStatus } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, User, ChevronRight } from "lucide-react";

const statusFilters: { value: ProjectStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'a_iniciar', label: 'A iniciar' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'finalizado', label: 'Finalizado' },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'todos'>('todos');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.responsible.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: ProjectStatus) => {
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardMetrics />
        
        {/* Projects Section */}
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
                  placeholder="Buscar por nome ou responsável..."
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

            {/* Projects List */}
            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const totalEstimated = project.stages.reduce((acc, s) => acc + s.estimatedHours, 0);
                  const totalRegistered = project.stages.reduce((acc, s) => acc + s.registeredHours, 0);
                  const progress = Math.round((totalRegistered / totalEstimated) * 100);

                  return (
                    <Link key={project.id} to={`/projeto/${project.id}`}>
                      <div className="p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{project.name}</h3>
                              <Badge variant={getStatusVariant(project.status)}>
                                {getStatusLabel(project.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {project.responsible}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(project.deliveryDate)}
                              </span>
                              <span>{totalRegistered}h / {totalEstimated}h</span>
                            </div>
                            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden max-w-md">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;