import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DemandStatus, DemandPriority } from "@/data/mockData";

export interface ResponsibilityItem {
  id: string;
  text: string;
  completed: boolean;
  hoursWorked: number;
  dueDate: string;
}

export interface DemandResponsible {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  responsibilities: ResponsibilityItem[];
}

export interface Demand {
  id: string;
  title: string;
  description: string;
  responsibles: DemandResponsible[];
  priority: DemandPriority;
  status: DemandStatus;
  createdAt: string;
  startDate: string;
  dueDate: string;
}

interface CreateDemandInput {
  title: string;
  description: string;
  priority: DemandPriority;
  startDate: string;
  dueDate: string;
  responsibles: {
    teamMemberId: string;
    responsibilities: { text: string; dueDate: string }[];
  }[];
}

interface DemandsContextType {
  demands: Demand[];
  loading: boolean;
  addDemand: (demand: CreateDemandInput) => Promise<void>;
  updateDemand: (demandId: string, demand: CreateDemandInput) => Promise<void>;
  updateDemandStatus: (demandId: string, status: DemandStatus) => Promise<void>;
  deleteDemand: (demandId: string) => Promise<void>;
  toggleResponsibility: (responsibilityId: string) => Promise<void>;
  updateTaskHours: (responsibilityId: string, hours: number) => Promise<void>;
  refreshDemands: () => Promise<void>;
}

const DemandsContext = createContext<DemandsContextType | undefined>(undefined);

export function DemandsProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemands = async () => {
    try {
      // Fetch demands
      const { data: demandsData, error: demandsError } = await supabase
        .from('demands')
        .select('*')
        .order('created_at', { ascending: false });

      if (demandsError) throw demandsError;

      // Fetch responsibles with team member info
      const { data: responsiblesData, error: responsiblesError } = await supabase
        .from('demand_responsibles')
        .select(`
          id,
          demand_id,
          team_member_id,
          team_members (id, name)
        `);

      if (responsiblesError) throw responsiblesError;

      // Fetch responsibilities
      const { data: responsibilitiesData, error: responsibilitiesError } = await supabase
        .from('demand_responsibilities')
        .select('*');

      if (responsibilitiesError) throw responsibilitiesError;

      // Map data to Demand interface
      const mappedDemands: Demand[] = (demandsData || []).map(demand => {
        const demandResponsibles = (responsiblesData || [])
          .filter(r => r.demand_id === demand.id)
          .map(r => {
            const responsibilities = (responsibilitiesData || [])
              .filter(resp => resp.demand_responsible_id === r.id)
              .map(resp => ({
                id: resp.id,
                text: resp.text,
                completed: resp.completed,
                hoursWorked: Number(resp.hours_worked),
                dueDate: resp.due_date || ''
              }));

            return {
              id: r.id,
              teamMemberId: r.team_member_id,
              teamMemberName: (r.team_members as any)?.name || '',
              responsibilities
            };
          });

        return {
          id: demand.id,
          title: demand.title,
          description: demand.description || '',
          priority: demand.priority as DemandPriority,
          status: demand.status as DemandStatus,
          createdAt: demand.created_at,
          startDate: demand.start_date || '',
          dueDate: demand.due_date || '',
          responsibles: demandResponsibles
        };
      });

      setDemands(mappedDemands);
    } catch (error) {
      console.error('Error fetching demands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const addDemand = async (input: CreateDemandInput) => {
    try {
      // Create demand
      const { data: demandData, error: demandError } = await supabase
        .from('demands')
        .insert({
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: 'aberta',
          start_date: input.startDate,
          due_date: input.dueDate
        })
        .select()
        .single();

      if (demandError) throw demandError;

      // Create responsibles
      for (const resp of input.responsibles) {
        const { data: responsibleData, error: responsibleError } = await supabase
          .from('demand_responsibles')
          .insert({
            demand_id: demandData.id,
            team_member_id: resp.teamMemberId
          })
          .select()
          .single();

        if (responsibleError) throw responsibleError;

        // Create responsibilities
        const responsibilitiesInsert = resp.responsibilities
          .filter(r => r.text.trim())
          .map(r => ({
            demand_responsible_id: responsibleData.id,
            text: r.text.trim(),
            due_date: r.dueDate || null
          }));

        if (responsibilitiesInsert.length > 0) {
          const { error: respError } = await supabase
            .from('demand_responsibilities')
            .insert(responsibilitiesInsert);

          if (respError) throw respError;
        }
      }

      await fetchDemands();
    } catch (error) {
      console.error('Error adding demand:', error);
      throw error;
    }
  };

  const updateDemand = async (demandId: string, input: CreateDemandInput) => {
    try {
      // Update demand main fields
      const { error: demandError } = await supabase
        .from('demands')
        .update({
          title: input.title,
          description: input.description,
          priority: input.priority,
          start_date: input.startDate,
          due_date: input.dueDate,
        })
        .eq('id', demandId);

      if (demandError) throw demandError;

      // Fetch existing responsibles for this demand
      const { data: existingResponsibles, error: existingRespError } = await supabase
        .from('demand_responsibles')
        .select('id')
        .eq('demand_id', demandId);

      if (existingRespError) throw existingRespError;

      const existingResponsibleIds = (existingResponsibles || []).map(r => r.id);

      // Delete responsibilities first (safe even if FK cascade is missing)
      if (existingResponsibleIds.length > 0) {
        const { error: delResponsibilitiesError } = await supabase
          .from('demand_responsibilities')
          .delete()
          .in('demand_responsible_id', existingResponsibleIds);

        if (delResponsibilitiesError) throw delResponsibilitiesError;
      }

      // Delete responsibles
      const { error: delResponsiblesError } = await supabase
        .from('demand_responsibles')
        .delete()
        .eq('demand_id', demandId);

      if (delResponsiblesError) throw delResponsiblesError;

      // Recreate responsibles + responsibilities
      for (const resp of input.responsibles) {
        const { data: responsibleData, error: responsibleError } = await supabase
          .from('demand_responsibles')
          .insert({
            demand_id: demandId,
            team_member_id: resp.teamMemberId,
          })
          .select()
          .single();

        if (responsibleError) throw responsibleError;

        const responsibilitiesInsert = resp.responsibilities
          .filter(r => r.text.trim())
          .map(r => ({
            demand_responsible_id: responsibleData.id,
            text: r.text.trim(),
            due_date: r.dueDate || null
          }));

        if (responsibilitiesInsert.length > 0) {
          const { error: respError } = await supabase
            .from('demand_responsibilities')
            .insert(responsibilitiesInsert);

          if (respError) throw respError;
        }
      }

      await fetchDemands();
    } catch (error) {
      console.error('Error updating demand:', error);
      throw error;
    }
  };

  const updateDemandStatus = async (demandId: string, status: DemandStatus) => {
    try {
      const { error } = await supabase
        .from('demands')
        .update({ status })
        .eq('id', demandId);

      if (error) throw error;

      setDemands(prev => prev.map(d =>
        d.id === demandId ? { ...d, status } : d
      ));
    } catch (error) {
      console.error('Error updating demand status:', error);
      throw error;
    }
  };

  const deleteDemand = async (demandId: string) => {
    try {
      const { error } = await supabase
        .from('demands')
        .delete()
        .eq('id', demandId);

      if (error) throw error;

      setDemands(prev => prev.filter(d => d.id !== demandId));
    } catch (error) {
      console.error('Error deleting demand:', error);
      throw error;
    }
  };

  const toggleResponsibility = async (responsibilityId: string) => {
    // Optimistic update - update UI immediately
    setDemands(prev => prev.map(demand => ({
      ...demand,
      responsibles: demand.responsibles.map(resp => ({
        ...resp,
        responsibilities: resp.responsibilities.map(r =>
          r.id === responsibilityId ? { ...r, completed: !r.completed } : r
        )
      }))
    })));

    try {
      // Find the current state from original data (before optimistic update)
      const { data, error: fetchError } = await supabase
        .from('demand_responsibilities')
        .select('completed')
        .eq('id', responsibilityId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('demand_responsibilities')
        .update({ completed: !data.completed })
        .eq('id', responsibilityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling responsibility:', error);
      // Revert on error
      await fetchDemands();
      throw error;
    }
  };

  const updateTaskHours = async (responsibilityId: string, hours: number) => {
    // Optimistic update
    setDemands(prev => prev.map(demand => ({
      ...demand,
      responsibles: demand.responsibles.map(resp => ({
        ...resp,
        responsibilities: resp.responsibilities.map(r =>
          r.id === responsibilityId ? { ...r, hoursWorked: hours } : r
        )
      }))
    })));

    try {
      const { error } = await supabase
        .from('demand_responsibilities')
        .update({ hours_worked: hours })
        .eq('id', responsibilityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task hours:', error);
      // Revert on error
      await fetchDemands();
      throw error;
    }
  };

  return (
    <DemandsContext.Provider value={{
      demands,
      loading,
      addDemand,
      updateDemand,
      updateDemandStatus,
      deleteDemand,
      toggleResponsibility,
      updateTaskHours,
      refreshDemands: fetchDemands
    }}>
      {children}
    </DemandsContext.Provider>
  );
}

export function useDemands() {
  const context = useContext(DemandsContext);
  if (!context) {
    throw new Error("useDemands must be used within a DemandsProvider");
  }
  return context;
}
