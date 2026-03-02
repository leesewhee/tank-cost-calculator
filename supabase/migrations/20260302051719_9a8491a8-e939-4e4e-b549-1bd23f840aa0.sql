
-- Workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  resident_number TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  blood_type TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  bank_account TEXT NOT NULL DEFAULT '',
  safety_shoes TEXT NOT NULL DEFAULT '',
  vest_size TEXT NOT NULL DEFAULT '',
  emergency_contact TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  safety_training_number TEXT NOT NULL DEFAULT '',
  safety_training_date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project-Worker many-to-many
CREATE TABLE public.project_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, worker_id)
);

-- Worker documents (file uploads per worker)
CREATE TABLE public.worker_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workers" ON public.workers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workers" ON public.workers FOR DELETE USING (true);

-- RLS for project_workers
ALTER TABLE public.project_workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view project_workers" ON public.project_workers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert project_workers" ON public.project_workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update project_workers" ON public.project_workers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete project_workers" ON public.project_workers FOR DELETE USING (true);

-- RLS for worker_documents
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view worker_documents" ON public.worker_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert worker_documents" ON public.worker_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update worker_documents" ON public.worker_documents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete worker_documents" ON public.worker_documents FOR DELETE USING (true);

-- Storage bucket for worker documents
INSERT INTO storage.buckets (id, name, public) VALUES ('worker-documents', 'worker-documents', true);

-- Storage RLS
CREATE POLICY "Anyone can upload worker docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'worker-documents');
CREATE POLICY "Anyone can view worker docs" ON storage.objects FOR SELECT USING (bucket_id = 'worker-documents');
CREATE POLICY "Anyone can delete worker docs" ON storage.objects FOR DELETE USING (bucket_id = 'worker-documents');

-- Updated_at trigger for workers
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
