-- Create demands table
CREATE TABLE public.demands (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'em_execucao', 'em_pausa', 'concluida', 'cancelada')),
  start_date date,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create demand_responsibles table to link demands with team members
CREATE TABLE public.demand_responsibles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demand_id uuid NOT NULL REFERENCES public.demands(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(demand_id, team_member_id)
);

-- Create responsibilities table for tasks within each responsible
CREATE TABLE public.demand_responsibilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demand_responsible_id uuid NOT NULL REFERENCES public.demand_responsibles(id) ON DELETE CASCADE,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  hours_worked numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_responsibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_responsibilities ENABLE ROW LEVEL SECURITY;

-- Policies for demands
CREATE POLICY "Admins can do everything on demands" 
ON public.demands 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Responsaveis can view demands" 
ON public.demands 
FOR SELECT 
USING (has_role(auth.uid(), 'responsavel'));

-- Policies for demand_responsibles
CREATE POLICY "Admins can do everything on demand_responsibles" 
ON public.demand_responsibles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Responsaveis can view demand_responsibles" 
ON public.demand_responsibles 
FOR SELECT 
USING (has_role(auth.uid(), 'responsavel'));

-- Policies for demand_responsibilities
CREATE POLICY "Admins can do everything on demand_responsibilities" 
ON public.demand_responsibilities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Responsaveis can view demand_responsibilities" 
ON public.demand_responsibilities 
FOR SELECT 
USING (has_role(auth.uid(), 'responsavel'));

CREATE POLICY "Responsaveis can update their own responsibilities" 
ON public.demand_responsibilities 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.demand_responsibles dr
    JOIN public.team_members tm ON dr.team_member_id = tm.id
    WHERE dr.id = demand_responsibilities.demand_responsible_id
    AND tm.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_demands_updated_at
BEFORE UPDATE ON public.demands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demand_responsibilities_updated_at
BEFORE UPDATE ON public.demand_responsibilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();