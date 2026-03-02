
CREATE TABLE public.worker_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.worker_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view worker_projects" ON public.worker_projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert worker_projects" ON public.worker_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update worker_projects" ON public.worker_projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete worker_projects" ON public.worker_projects FOR DELETE USING (true);

-- Update project_workers to reference worker_projects instead
ALTER TABLE public.project_workers DROP CONSTRAINT project_workers_project_id_fkey;
ALTER TABLE public.project_workers ADD CONSTRAINT project_workers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.worker_projects(id) ON DELETE CASCADE;
