
-- Create coordinator table (single coordinator)
CREATE TABLE public.coordinators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  location TEXT NOT NULL,
  weekly_contribution_amount INTEGER NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to coordinators" ON public.coordinators FOR ALL USING (true) WITH CHECK (true);

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coordinator_id UUID NOT NULL REFERENCES public.coordinators(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to members" ON public.members FOR ALL USING (true) WITH CHECK (true);

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_on_time BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contributions" ON public.contributions FOR ALL USING (true) WITH CHECK (true);
