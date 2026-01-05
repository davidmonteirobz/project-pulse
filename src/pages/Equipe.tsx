import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Users, Trash2, Pencil, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  name: string;
  role_function: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  linked_user?: Profile | null;
  user_role?: 'admin' | 'responsavel';
}

const Equipe = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role_function: '',
    user_id: '' as string | null,
    access_level: 'responsavel' as 'admin' | 'responsavel',
  });

  useEffect(() => {
    fetchMembers();
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Fetch linked user info and role for each member
      const membersWithUsers = await Promise.all(
        (data || []).map(async (member) => {
          let linked_user = null;
          let user_role: 'admin' | 'responsavel' = 'responsavel';
          
          if (member.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', member.user_id)
              .maybeSingle();
            linked_user = profile;
            
            // Fetch user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', member.user_id)
              .maybeSingle();
            
            if (roleData) {
              user_role = roleData.role as 'admin' | 'responsavel';
            }
          }
          
          return { ...member, linked_user, user_role };
        })
      );
      
      setMembers(membersWithUsers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error("Erro ao carregar membros da equipe");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role_function.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role_function.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{ 
          name: formData.name.trim(), 
          role_function: formData.role_function.trim(),
          user_id: formData.user_id || null
        }]);

      if (error) throw error;

      // Update user role if a user is linked
      if (formData.user_id) {
        // Delete existing role and insert new one
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', formData.user_id);
        
        await supabase
          .from('user_roles')
          .insert([{ user_id: formData.user_id, role: formData.access_level }]);
      }

      setFormData({ name: '', role_function: '', user_id: null, access_level: 'responsavel' });
      setIsDialogOpen(false);
      toast.success("Membro adicionado com sucesso!");
      fetchMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMember || !formData.name.trim() || !formData.role_function.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ 
          name: formData.name.trim(), 
          role_function: formData.role_function.trim(),
          user_id: formData.user_id || null
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      // Update user role if a user is linked
      if (formData.user_id) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', formData.user_id);
        
        await supabase
          .from('user_roles')
          .insert([{ user_id: formData.user_id, role: formData.access_level }]);
      }

      setFormData({ name: '', role_function: '', user_id: null, access_level: 'responsavel' });
      setEditingMember(null);
      setIsEditDialogOpen(false);
      toast.success("Membro atualizado com sucesso!");
      fetchMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error("Erro ao atualizar membro");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Membro removido com sucesso!");
      fetchMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error("Erro ao remover membro");
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      role_function: member.role_function,
      user_id: member.user_id,
      access_level: member.user_role || 'responsavel'
    });
    setIsEditDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Equipe</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os membros da equipe
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do membro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role_function">Função *</Label>
                  <Input
                    id="role_function"
                    value={formData.role_function}
                    onChange={(e) => setFormData({ ...formData, role_function: e.target.value })}
                    placeholder="Função do membro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_id">Vincular a Usuário (opcional)</Label>
                  <Select
                    value={formData.user_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, user_id: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.user_id && formData.user_id !== "none" && (
                  <div className="space-y-2">
                    <Label htmlFor="access_level">Nível de Acesso *</Label>
                    <Select
                      value={formData.access_level}
                      onValueChange={(value: 'admin' | 'responsavel') => setFormData({ ...formData, access_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="responsavel">Responsável (Acesso às demandas)</SelectItem>
                        <SelectItem value="admin">Administrador (Acesso total)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou função..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membros da Equipe ({filteredMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">Nenhum membro encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Usuário Vinculado</TableHead>
                    <TableHead>Nível de Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.role_function}</TableCell>
                      <TableCell>
                        {member.linked_user ? (
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            <span>{member.linked_user.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.linked_user ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.user_role === 'admin' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {member.user_role === 'admin' ? 'Administrador' : 'Responsável'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do membro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role_function">Função *</Label>
                <Input
                  id="edit-role_function"
                  value={formData.role_function}
                  onChange={(e) => setFormData({ ...formData, role_function: e.target.value })}
                  placeholder="Função do membro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-user_id">Vincular a Usuário (opcional)</Label>
                <Select
                  value={formData.user_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} ({profile.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.user_id && formData.user_id !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-access_level">Nível de Acesso *</Label>
                  <Select
                    value={formData.access_level}
                    onValueChange={(value: 'admin' | 'responsavel') => setFormData({ ...formData, access_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responsavel">Responsável (Acesso às demandas)</SelectItem>
                      <SelectItem value="admin">Administrador (Acesso total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Equipe;
