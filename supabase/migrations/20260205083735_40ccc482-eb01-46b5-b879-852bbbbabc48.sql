-- 프로젝트 테이블 생성
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 도면 테이블 생성
CREATE TABLE public.drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  drawing_number TEXT NOT NULL,
  drawing_name TEXT NOT NULL,
  revision TEXT NOT NULL DEFAULT 'Rev. 0',
  revision_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 공개 정책 (인증 없이 공유)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Anyone can view drawings" ON public.drawings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert drawings" ON public.drawings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drawings" ON public.drawings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drawings" ON public.drawings FOR DELETE USING (true);

-- 실시간 동기화 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawings;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 트리거 생성
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drawings_updated_at
  BEFORE UPDATE ON public.drawings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();