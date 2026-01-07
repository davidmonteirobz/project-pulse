import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  getDemandStatusLabel, 
  getPriorityLabel,
  DemandStatus,
  DemandPriority
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, Plus, Calendar, AlertCircle, X, Users, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useDemands, type Demand } from "@/context/DemandsContext";

const statusFilters: { value: DemandStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'em_pausa', label: 'Em pausa' },
  { value: 'concluida', label: 'Concluída' },
];

interface ResponsibleEntry {
  teamMemberId: string;
  responsibilities: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role_function: string;
}

const Demandas = () => {
  const { demands, loading, addDemand, updateDemand, updateDemandStatus, deleteDemand } = useDemands();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'todos'>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media' as DemandPriority,
    startDate: '',
    dueDate: '',
  });
  
  const [responsibles, setResponsibles] = useState<ResponsibleEntry[]>([
    { teamMemberId: '', responsibilities: [''] }
  ]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, role_function')
        .order('name');
      
      if (!error && data) {
        setTeamMembers(data);
      }
    };
    fetchTeamMembers();
  }, []);

  const filteredDemands = demands.filter((demand) => {
    const responsibleNames = demand.responsibles.map(r => r.teamMemberName.toLowerCase()).join(' ');
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
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const addResponsible = () => {
    setResponsibles([...responsibles, { teamMemberId: '', responsibilities: [''] }]);
  };

  const removeResponsible = (index: number) => {
    if (responsibles.length > 1) {
      setResponsibles(responsibles.filter((_, i) => i !== index));
    }
  };

  const updateResponsibleUser = (index: number, teamMemberId: string) => {
    const updated = [...responsibles];
    updated[index] = { ...updated[index], teamMemberId };
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'media',
      startDate: '',
      dueDate: '',
    });
    setResponsibles([{ teamMemberId: '', responsibilities: [''] }]);
    setEditingDemand(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (demand: Demand) => {
    setEditingDemand(demand);
    setFormData({
      title: demand.title,
      description: demand.description || '',
      priority: demand.priority,
      startDate: demand.startDate || '',
      dueDate: demand.dueDate || '',
    });

    const mappedResponsibles: ResponsibleEntry[] = (demand.responsibles || []).map((r) => ({
      teamMemberId: r.teamMemberId,
      responsibilities: (r.responsibilities || []).map((x) => x.text),
    }));

    setResponsibles(mappedResponsibles.length > 0 ? mappedResponsibles : [{ teamMemberId: '', responsibilities: [''] }]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validResponsibles = responsibles.filter(r => r.teamMemberId && r.responsibilities.some(attr => attr.trim()));
    
    if (!formData.title || validResponsibles.length === 0 || !formData.startDate || !formData.dueDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        responsibles: validResponsibles.map(r => ({
          teamMemberId: r.teamMemberId,
          responsibilities: r.responsibilities.filter(attr => attr.trim())
        }))
      };

      if (editingDemand) {
        await updateDemand(editingDemand.id, payload);
        toast.success("Demanda atualizada com sucesso!");
      } else {
        await addDemand(payload);
        toast.success("Demanda criada com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingDemand ? "Erro ao atualizar demanda." : "Erro ao criar demanda.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (demandId: string, newStatus: DemandStatus) => {
    try {
      await updateDemandStatus(demandId, newStatus);
      toast.success("Status atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleDelete = async (demandId: string) => {
    try {
      await deleteDemand(demandId);
      toast.success("Demanda excluída!");
    } catch (error) {
      toast.error("Erro ao excluir demanda.");
    }
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Demanda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDemand ? "Editar Demanda" : "Criar Nova Demanda"}</DialogTitle>
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
                              value={resp.teamMemberId} 
                              onValueChange={(value) => updateResponsibleUser(respIndex, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o responsável..." />
                              </SelectTrigger>
                              <SelectContent>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} - {member.role_function}
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
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (editingDemand ? 'Salvando...' : 'Criando...') : (editingDemand ? 'Salvar alterações' : 'Criar Demanda')}
                  </Button>
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
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : filteredDemands.length === 0 ? (
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
                                <span className="font-medium">{resp.teamMemberName}</span>
                              </div>
                              <div className="pl-6 text-muted-foreground">
                                {resp.responsibilities.map(r => r.text).join(', ')}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(demand)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
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
