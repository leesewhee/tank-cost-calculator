
-- 서식 카테고리 테이블
CREATE TABLE public.document_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view document_categories" ON public.document_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert document_categories" ON public.document_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update document_categories" ON public.document_categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete document_categories" ON public.document_categories FOR DELETE USING (true);

-- 서식 파일 테이블
CREATE TABLE public.document_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.document_categories(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  used_date TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view document_files" ON public.document_files FOR SELECT USING (true);
CREATE POLICY "Anyone can insert document_files" ON public.document_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update document_files" ON public.document_files FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete document_files" ON public.document_files FOR DELETE USING (true);

-- 스토리지 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

CREATE POLICY "Anyone can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Anyone can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Anyone can delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents');
