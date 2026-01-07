-- Add due_date column to demand_responsibilities table
ALTER TABLE public.demand_responsibilities
ADD COLUMN due_date date;