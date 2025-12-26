import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  users, 
  getDemandStatusLabel, 
  getPriorityLabel,
  Demand,
  DemandStatus,
  DemandPriority,
  DemandResponsible
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
import { Search, Plus, Calendar, AlertCircle, X, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDemands } from "@/context/DemandsContext";

const statusFilters: { value: DemandStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'em_pausa', label: 'Em pausa' },
  { value: 'concluida', label: 'Concluída' },
];

interface ResponsibleEntry {
  userId: string;
  responsibilities: string[];
}

const Demandas = () => {
  const { demands, addDemand, updateDemandStatus, deleteDemand } = useDemands();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'todos'>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media' as DemandPriority,
    startDate: '',
    dueDate: '',
  });
  
  const [responsibles, setResponsibles] = useState<ResponsibleEntry[]>([
    { userId: '', responsibilities: [''] }
  ]);

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

  const addResponsible = () => {
    setResponsibles([...responsibles, { userId: '', responsibilities: [''] }]);
  };

  const removeResponsible = (index: number) => {
    if (responsibles.length > 1) {
      setResponsibles(responsibles.filter((_, i) => i !== index));
    }
  };

  const updateResponsibleUser = (index: number, userId: string) => {
    const updated = [...responsibles];
    updated[index] = { ...updated[index], userId };
    setResponsibles(updated);
  };

  const addResponsibility = (respIndex: number) => {
    const updated = [...responsibles];
    updated[respIndex].responsibilities.push('');
    setResponsibles(updated);
  };

  const removeResponsibility = (respIndex: number, attrIndex: number) => {
    const updated = [...responsibles];
    if (updated[respIndex].responsibilities.length > 1) {
      updated[respIndex].responsibilities = updated[respIndex].responsibilities.filter((_, i) => i !== attrIndex);
      setResponsibles(updated);
    }
  };

  const updateResponsibility = (respIndex: number, attrIndex: number, value: string) => {
    const updated = [...responsibles];
    updated[respIndex].responsibilities[attrIndex] = value;
    setResponsibles(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validResponsibles = responsibles.filter(r => r.userId && r.responsibilities.some(attr => attr.trim()));
    
    if (!formData.title || validResponsibles.length === 0 || !formData.startDate || !formData.dueDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const demandResponsibles: DemandResponsible[] = validResponsibles.map(r => {
      const user = users.find(u => u.id === r.userId);
      return {
        userId: r.userId,
        userName: user?.name || '',
        responsibilities: r.responsibilities.filter(attr => attr.trim()).map((text, idx) => ({
          id: `${Date.now()}-${r.userId}-${idx}`,
          text,
          completed: false,
          hoursWorked: 0
        }))
      };
    });

    const newDemand: Demand = {
      id: String(Date.now()),
      title: formData.title,
      description: formData.description,
      responsibles: demandResponsibles,
      priority: formData.priority,
      status: 'aberta',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: formData.startDate,
      dueDate: formData.dueDate,
    };

    addDemand(newDemand);
    setFormData({
      title: '',
      description: '',
      priority: 'media',
      startDate: '',
      dueDate: '',
    });
    setResponsibles([{ userId: '', responsibilities: [''] }]);
    setIsDialogOpen(false);
    toast.success("Demanda criada com sucesso!");
  };

  const handleStatusChange = (demandId: string, newStatus: DemandStatus) => {
    updateDemandStatus(demandId, newStatus);
    toast.success("Status atualizado!");
  };

  const handleDelete = (demandId: string) => {
    deleteDemand(demandId);
    toast.success("Demanda excluída!");
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva a demanda em detalhes..."
                    rows={3}
                  />
                </div>

                {/* Responsibles Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Responsáveis *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addResponsible}>
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {responsibles.map((resp, respIndex) => (
                      <div key={respIndex} className="p-3 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Select 
                              value={resp.userId} 
                              onValueChange={(value) => updateResponsibleUser(respIndex, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o responsável..." />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} - {user.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {responsibles.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeResponsible(respIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Atribuições</Label>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => addResponsibility(respIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Atribuição
                            </Button>
                          </div>
                          {resp.responsibilities.map((attr, attrIndex) => (
                            <div key={attrIndex} className="flex gap-2">
                              <Input
                                placeholder="Responsabilidade atribuída..."
                                value={attr}
                                onChange={(e) => updateResponsibility(respIndex, attrIndex, e.target.value)}
                                className="flex-1"
                              />
                              {resp.responsibilities.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-10 w-10"
                                  onClick={() => removeResponsibility(respIndex, attrIndex)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Entrega *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
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
                    <TableHead>Responsáveis</TableHead>
                    <TableHead className="text-center">Prioridade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Período</TableHead>
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
                        <div className="space-y-2">
                          {demand.responsibles.map((resp, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">{resp.userName}</span>
                              </div>
                              <div className="pl-6 text-muted-foreground">
                                {Array.isArray(resp.responsibilities) 
                                  ? resp.responsibilities.map(r => typeof r === 'string' ? r : r.text).join(', ') 
                                  : ''}
                              </div>
                            </div>
                          ))}
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
                        <div className="flex flex-col items-center gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(demand.startDate)}</span>
                          </div>
                          <span className="text-muted-foreground">até</span>
                          <span>{formatDate(demand.dueDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                              <SelectItem value="em_pausa">Em pausa</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(demand.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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