
-- 부적합보고서 테이블
CREATE TABLE public.ncr_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- 기본 정보
  construction_no TEXT NOT NULL DEFAULT '',
  construction_name TEXT NOT NULL DEFAULT '',
  equipment_name TEXT NOT NULL DEFAULT '',
  inspection_date TEXT NOT NULL DEFAULT '',
  inspector TEXT NOT NULL DEFAULT '',
  inspection_location TEXT NOT NULL DEFAULT '',
  -- 지적사항 / 조치사항
  issues TEXT NOT NULL DEFAULT '',
  actions TEXT NOT NULL DEFAULT '',
  -- 조치요구사항 (다중 선택 가능)
  action_rework BOOLEAN NOT NULL DEFAULT false,
  action_modify BOOLEAN NOT NULL DEFAULT false,
  action_sort BOOLEAN NOT NULL DEFAULT false,
  action_return BOOLEAN NOT NULL DEFAULT false,
  action_discard BOOLEAN NOT NULL DEFAULT false,
  -- 조치담당부서 / 처리기간
  action_department TEXT NOT NULL DEFAULT '',
  processing_period TEXT NOT NULL DEFAULT '',
  -- 최종확인 / 재검사결과
  final_result TEXT NOT NULL DEFAULT '',
  reinspection_result TEXT NOT NULL DEFAULT '',
  -- 작성/검토/승인
  written_by TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT NOT NULL DEFAULT '',
  approved_by TEXT NOT NULL DEFAULT '',
  -- 비고
  remarks TEXT NOT NULL DEFAULT '',
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 검사품목 테이블 (보고서당 최대 5개)
CREATE TABLE public.ncr_inspection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.ncr_reports(id) ON DELETE CASCADE,
  item_no INTEGER NOT NULL DEFAULT 1,
  drawing_number TEXT NOT NULL DEFAULT '',
  issue_count TEXT NOT NULL DEFAULT '',
  item_remarks TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.ncr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncr_inspection_items ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (공개 접근 - 도면 관리와 동일)
CREATE POLICY "Anyone can view ncr_reports" ON public.ncr_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ncr_reports" ON public.ncr_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ncr_reports" ON public.ncr_reports FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ncr_reports" ON public.ncr_reports FOR DELETE USING (true);

CREATE POLICY "Anyone can view ncr_inspection_items" ON public.ncr_inspection_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ncr_inspection_items" ON public.ncr_inspection_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ncr_inspection_items" ON public.ncr_inspection_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ncr_inspection_items" ON public.ncr_inspection_items FOR DELETE USING (true);
