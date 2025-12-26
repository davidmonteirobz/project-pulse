import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  demands as initialDemands, 
  users, 
  projects,
  getDemandStatusLabel, 
  getPriorityLabel,
  Demand,
  DemandStatus,
  DemandPriority
} from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Plus, Calendar, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const statusFilters: { value: DemandStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'concluida', label: 'Concluída' },
];

const Demandas = () => {
  const [demands, setDemands] = useState<Demand[]>(initialDemands);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'todos'>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible: '',
    priority: 'media' as DemandPriority,
    dueDate: '',
    projectId: '',
  });

  const filteredDemands = demands.filter((demand) => {
    const matchesSearch = demand.title.toLowerCase().includes(search.toLowerCase()) ||
      demand.responsible.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || demand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: DemandStatus) => {
    switch (status) {
      case 'em_execucao': return 'default';
      case 'em_analise': return 'secondary';
      case 'aberta': return 'outline';
      case 'concluida': return 'default';
      case 'cancelada': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: DemandPriority) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.responsible || !formData.dueDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const newDemand: Demand = {
      id: String(Date.now()),
      title: formData.title,
      description: formData.description,
      responsible: formData.responsible,
      priority: formData.priority,
      status: 'aberta',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      projectId: formData.projectId || undefined,
    };

    setDemands([newDemand, ...demands]);
    setFormData({
      title: '',
      description: '',
      responsible: '',
      priority: 'media',
      dueDate: '',
      projectId: '',
    });
    setIsDialogOpen(false);
    toast.success("Demanda criada com sucesso!");
  };

  const handleStatusChange = (demandId: string, newStatus: DemandStatus) => {
    setDemands(demands.map(d => 
      d.id === demandId ? { ...d, status: newStatus } : d
    ));
    toast.success("Status atualizado!");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Gestão de Demandas</h2>
            <p className="text-sm text-muted-foreground">
              Registre e acompanhe todas as demandas da equipe
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Demanda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Demanda</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Correção de bug no módulo de pagamentos"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva a demanda em detalhes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Responsável *</Label>
                    <Select 
                      value={formData.responsible} 
                      onValueChange={(value) => setFormData({ ...formData, responsible: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData({ ...formData, priority: value as DemandPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Entrega *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Projeto (opcional)</Label>
                    <Select 
                      value={formData.projectId || "none"} 
                      onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Criar Demanda</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

        {/* Demands Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Lista de Demandas ({filteredDemands.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDemands.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">Nenhuma demanda encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-center">Prioridade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Prazo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDemands.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{demand.title}</p>
                          {demand.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {demand.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{demand.responsible}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getPriorityVariant(demand.priority)}>
                          {getPriorityLabel(demand.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(demand.status)}>
                          {getDemandStatusLabel(demand.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(demand.dueDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select 
                          value={demand.status}
                          onValueChange={(value) => handleStatusChange(demand.id, value as DemandStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aberta">Aberta</SelectItem>
                            <SelectItem value="em_analise">Em análise</SelectItem>
                            <SelectItem value="em_execucao">Em execução</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Demandas;
