-- Add user_id column to team_members to link with system users
ALTER TABLE public.team_members 
ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);