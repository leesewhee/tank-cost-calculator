import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Plus, Eye, Trash2, Pencil, X, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { openPrintWindow, groupByDate, escapeHtml } from "@/lib/printDocument";

interface Project {
  id: string;
  name: string;
  createdDate: string;
}

interface InspectionItem {
  item_no: number;
  drawing_number: string;
  issue_count: string;
  item_remarks: string;
}

interface NCRReport {
  id: string;
  project_id: string;
  construction_no: string;
  construction_name: string;
  equipment_name: string;
  inspection_date: string;
  inspector: string;
  inspection_location: string;
  issues: string;
  actions: string;
  action_rework: boolean;
  action_modify: boolean;
  action_sort: boolean;
  action_return: boolean;
  action_discard: boolean;
  action_department: string;
  processing_period: string;
  final_result: string;
  reinspection_result: string;
  written_by: string;
  reviewed_by: string;
  approved_by: string;
  remarks: string;
  created_at: string;
  inspection_items?: InspectionItem[];
}

const emptyReport = {
  construction_no: "",
  construction_name: "",
  equipment_name: "",
  inspection_date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
  inspector: "",
  inspection_location: "",
  issues: "",
  actions: "",
  action_rework: false,
  action_modify: false,
  action_sort: false,
  action_return: false,
  action_discard: false,
  action_department: "",
  processing_period: "",
  final_result: "",
  reinspection_result: "",
  written_by: "",
  reviewed_by: "",
  approved_by: "",
  remarks: "",
};

const createEmptyItem = (itemNo: number): InspectionItem => ({
  item_no: itemNo,
  drawing_number: "",
  issue_count: "",
  item_remarks: "",
});

const defaultItems: InspectionItem[] = [1, 2, 3, 4, 5].map(createEmptyItem);

const NCRReportPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [reports, setReports] = useState<NCRReport[]>([]);
  const [loading, setLoading] = useState(true);

  // 새 보고서 작성 / 수정
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState(emptyReport);
  const [newItems, setNewItems] = useState<InspectionItem[]>(defaultItems.map(i => ({ ...i })));
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  // 보고서 상세보기
  const [viewReport, setViewReport] = useState<NCRReport | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // 프로젝트 추가
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchReports();
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("프로젝트 로드 실패");
      return;
    }

    const formatted: Project[] = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      createdDate: p.created_date,
    }));
    setProjects(formatted);
    if (formatted.length > 0 && !selectedProjectId) {
      setSelectedProjectId(formatted[0].id);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("ncr_reports")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("보고서 로드 실패");
      return;
    }

    setReports((data as NCRReport[]) || []);
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: newProjectName,
        created_date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      })
      .select()
      .single();

    if (error) {
      toast.error("프로젝트 추가 실패");
      return;
    }
    setSelectedProjectId(data.id);
    setNewProjectName("");
    setIsProjectDialogOpen(false);
    fetchProjects();
    toast.success("프로젝트가 추가되었습니다");
  };

  // 신규 등록 시 이전 데이터 자동 채움
  const handleOpenCreate = async () => {
    setEditingReportId(null);
    
    // 같은 프로젝트의 가장 최근 보고서 조회
    const { data: lastReport } = await supabase
      .from("ncr_reports")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastReport) {
      setNewReport({
        ...emptyReport,
        inspection_date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
        construction_no: lastReport.construction_no || "",
        construction_name: lastReport.construction_name || "",
        inspector: lastReport.inspector || "",
        inspection_location: lastReport.inspection_location || "",
        action_department: lastReport.action_department || "",
        written_by: lastReport.written_by || "",
        reviewed_by: lastReport.reviewed_by || "",
        approved_by: lastReport.approved_by || "",
      });
    } else {
      setNewReport({ ...emptyReport });
    }
    setNewItems(defaultItems.map(i => ({ ...i })));
    setIsCreateOpen(true);
  };

  // 수정 모드로 열기
  const handleOpenEdit = async (report: NCRReport) => {
    setEditingReportId(report.id);
    setNewReport({
      construction_no: report.construction_no,
      construction_name: report.construction_name,
      equipment_name: report.equipment_name,
      inspection_date: report.inspection_date,
      inspector: report.inspector,
      inspection_location: report.inspection_location,
      issues: report.issues,
      actions: report.actions,
      action_rework: report.action_rework,
      action_modify: report.action_modify,
      action_sort: report.action_sort,
      action_return: report.action_return,
      action_discard: report.action_discard,
      action_department: report.action_department,
      processing_period: report.processing_period,
      final_result: report.final_result,
      reinspection_result: report.reinspection_result,
      written_by: report.written_by,
      reviewed_by: report.reviewed_by,
      approved_by: report.approved_by,
      remarks: report.remarks,
    });

    // 검사품목 로드
    const { data } = await supabase
      .from("ncr_inspection_items")
      .select("*")
      .eq("report_id", report.id)
      .order("item_no");

    if (data && data.length > 0) {
      setNewItems(data.map(d => ({
        item_no: d.item_no,
        drawing_number: d.drawing_number,
        issue_count: d.issue_count,
        item_remarks: d.item_remarks,
      })));
    } else {
      setNewItems(defaultItems.map(i => ({ ...i })));
    }

    setIsCreateOpen(true);
  };

  const handleSaveReport = async () => {
    if (!selectedProjectId) return;

    if (editingReportId) {
      // 수정 모드
      const { error } = await supabase
        .from("ncr_reports")
        .update({ ...newReport })
        .eq("id", editingReportId);

      if (error) {
        toast.error("보고서 수정 실패");
        return;
      }

      // 기존 검사품목 삭제 후 재삽입
      await supabase.from("ncr_inspection_items").delete().eq("report_id", editingReportId);

      const itemsToInsert = newItems
        .filter((item) => item.drawing_number || item.issue_count || item.item_remarks)
        .map((item, idx) => ({
          report_id: editingReportId,
          item_no: idx + 1,
          drawing_number: item.drawing_number,
          issue_count: item.issue_count,
          item_remarks: item.item_remarks,
        }));

      if (itemsToInsert.length > 0) {
        await supabase.from("ncr_inspection_items").insert(itemsToInsert);
      }

      toast.success("보고서가 수정되었습니다");
    } else {
      // 신규 생성
      const { data, error } = await supabase
        .from("ncr_reports")
        .insert({ ...newReport, project_id: selectedProjectId })
        .select()
        .single();

      if (error) {
        toast.error("보고서 저장 실패");
        return;
      }

      const itemsToInsert = newItems
        .filter((item) => item.drawing_number || item.issue_count || item.item_remarks)
        .map((item, idx) => ({
          report_id: data.id,
          item_no: idx + 1,
          drawing_number: item.drawing_number,
          issue_count: item.issue_count,
          item_remarks: item.item_remarks,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemError } = await supabase
          .from("ncr_inspection_items")
          .insert(itemsToInsert);
        if (itemError) {
          toast.error("검사품목 저장 실패");
        }
      }

      toast.success("부적합보고서가 저장되었습니다");
    }

    setNewReport({ ...emptyReport });
    setNewItems(defaultItems.map(i => ({ ...i })));
    setEditingReportId(null);
    setIsCreateOpen(false);
    fetchReports();
  };

  const handleViewReport = async (report: NCRReport) => {
    const { data } = await supabase
      .from("ncr_inspection_items")
      .select("*")
      .eq("report_id", report.id)
      .order("item_no");

    setViewReport({
      ...report,
      inspection_items: (data as InspectionItem[]) || [],
    });
    setIsViewOpen(true);
  };

  const handleDeleteReport = async (id: string) => {
    const { error } = await supabase.from("ncr_reports").delete().eq("id", id);
    if (error) {
      toast.error("삭제 실패");
      return;
    }
    fetchReports();
    toast.success("보고서가 삭제되었습니다");
  };

  const updateItem = (index: number, field: keyof InspectionItem, value: string) => {
    setNewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setNewItems((prev) => [...prev, createEmptyItem(prev.length + 1)]);
  };

  const removeItem = (index: number) => {
    if (newItems.length <= 1) return;
    setNewItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, item_no: i + 1 }))
    );
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const renderReportHtml = (r: NCRReport, items: InspectionItem[]) => {
    const chk = (on: boolean, label: string) => `${on ? "■" : "□"} ${label}`;
    const rows = items.filter(
      (i) => i.drawing_number || i.issue_count || i.item_remarks
    );
    return `
    <div class="section">
      <table>
        <tr><td class="label">공사번호</td><td>${escapeHtml(r.construction_no)}</td>
            <td class="label">공사명</td><td>${escapeHtml(r.construction_name)}</td></tr>
        <tr><td class="label">장치명</td><td>${escapeHtml(r.equipment_name)}</td>
            <td class="label">검사일시</td><td>${escapeHtml(r.inspection_date)}</td></tr>
        <tr><td class="label">검사자</td><td>${escapeHtml(r.inspector)}</td>
            <td class="label">검사장소</td><td>${escapeHtml(r.inspection_location)}</td></tr>
      </table>
      <table style="margin-top:6px">
        <thead><tr>
          <th style="width:50px">No.</th><th style="width:160px">도면번호</th>
          <th style="width:120px">부적합 수량</th><th>비고</th>
        </tr></thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map(
                    (i) => `<tr><td>${i.item_no}</td><td>${escapeHtml(i.drawing_number)}</td>
                      <td>${escapeHtml(i.issue_count)}</td><td>${escapeHtml(i.item_remarks)}</td></tr>`
                  )
                  .join("")
              : `<tr><td colspan="4" class="muted">검사품목 없음</td></tr>`
          }
        </tbody>
      </table>
      <table style="margin-top:6px">
        <tr><td class="label">부적합 내용</td><td style="height:48px">${escapeHtml(r.issues).replace(/\n/g, "<br/>")}</td></tr>
        <tr><td class="label">조치 사항</td><td style="height:48px">${escapeHtml(r.actions).replace(/\n/g, "<br/>")}</td></tr>
        <tr><td class="label">조치 구분</td><td>${[
          chk(r.action_rework, "재작업"),
          chk(r.action_modify, "수정"),
          chk(r.action_sort, "선별"),
          chk(r.action_return, "반품"),
          chk(r.action_discard, "폐기"),
        ].join(" &nbsp; ")}</td></tr>
        <tr><td class="label">조치 부서</td><td>${escapeHtml(r.action_department)} / 처리기간: ${escapeHtml(r.processing_period)}</td></tr>
        <tr><td class="label">재검사 결과</td><td>${escapeHtml(r.reinspection_result)}</td></tr>
        <tr><td class="label">최종 확인</td><td>${escapeHtml(r.final_result)}</td></tr>
        <tr><td class="label">비고</td><td>${escapeHtml(r.remarks).replace(/\n/g, "<br/>")}</td></tr>
      </table>
      <table class="sign">
        <tr><th style="text-align:center">작성</th><th style="text-align:center">검토</th><th style="text-align:center">승인</th></tr>
        <tr style="text-align:center"><td style="height:46px">${escapeHtml(r.written_by)}</td>
            <td>${escapeHtml(r.reviewed_by)}</td><td>${escapeHtml(r.approved_by)}</td></tr>
      </table>
    </div>`;
  };

  const fetchItemsFor = async (ids: string[]) => {
    const { data } = await supabase
      .from("ncr_inspection_items")
      .select("*")
      .in("report_id", ids)
      .order("item_no");
    const map = new Map<string, InspectionItem[]>();
    (data || []).forEach((i: { report_id: string } & InspectionItem) => {
      if (!map.has(i.report_id)) map.set(i.report_id, []);
      map.get(i.report_id)!.push(i);
    });
    return map;
  };

  const handlePrintOne = async (report: NCRReport) => {
    const map = await fetchItemsFor([report.id]);
    openPrintWindow(
      "부 적 합 보 고 서 (NCR)",
      `${selectedProject?.name || ""} / ${report.inspection_date || ""}`,
      renderReportHtml(report, map.get(report.id) || [])
    );
  };

  const handlePrintSelected = async (ids: string[], includeDetail: boolean) => {
    const target = reports.filter((r) => ids.includes(r.id));
    if (target.length === 0) {
      toast.error("출력할 보고서가 없습니다");
      return;
    }
    const map = includeDetail ? await fetchItemsFor(target.map((r) => r.id)) : new Map();
    const groups = groupByDate(target, (r) => r.inspection_date);
    const dates = groups.map(([d]) => d).filter((d) => d !== "날짜 미지정");
    const period = dates.length ? `${dates[dates.length - 1]} ~ ${dates[0]}` : "-";
    const flat = groups.flatMap(([, list]) => list);
    const summary = `
      <div class="section">
        <table>
          <tr><td class="label">프로젝트명</td><td>${escapeHtml(selectedProject?.name || "")}</td>
              <td class="label">출력 건수</td><td>${target.length} 건 (전체 ${reports.length}건)</td></tr>
          <tr><td class="label">검사일자 범위</td><td>${escapeHtml(period)}</td>
              <td class="label">출력 형식</td><td>${includeDetail ? "요약 + 상세 보고서" : "요약 목록"}</td></tr>
        </table>
      </div>
      <div class="section">
        <h2 class="group">부적합보고서 요약 목록 (${target.length}건)</h2>
        <table>
          <thead><tr><th style="width:45px">No.</th><th style="width:100px">검사일자</th>
            <th style="width:110px">공사번호</th><th>장치명</th><th style="width:80px">검사자</th>
            <th style="width:80px">최종확인</th></tr></thead>
          <tbody>
            ${flat
              .map(
                (r, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(r.inspection_date)}</td>
                  <td>${escapeHtml(r.construction_no)}</td><td>${escapeHtml(r.equipment_name)}</td>
                  <td>${escapeHtml(r.inspector)}</td><td>${escapeHtml(r.final_result)}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    const details = includeDetail
      ? groups
          .map(
            ([date, list]) => `
        <div class="page-break"></div>
        <h2 class="group">검사일자 : ${escapeHtml(date)} (${list.length}건)</h2>
        ${list.map((r) => renderReportHtml(r, map.get(r.id) || [])).join('<div class="page-break"></div>')}`
          )
          .join("")
      : `<table class="sign">
          <tr><th style="text-align:center">작성</th><th style="text-align:center">검토</th><th style="text-align:center">승인</th></tr>
          <tr><td style="height:52px"></td><td></td><td></td></tr>
        </table>`;
    openPrintWindow(
      "부적합보고서 (NCR) 관리대장",
      selectedProject?.name || "",
      summary + details
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-sidebar text-sidebar-foreground py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <ClipboardList className="w-8 h-8 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">부적합보고서 관리</h1>
              <p className="text-sm text-sidebar-foreground/70">
                프로젝트별 부적합보고서 (NCR) 작성 및 관리
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 프로젝트 선택 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>프로젝트 선택</CardTitle>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    새 프로젝트
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 프로젝트 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>프로젝트명</Label>
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="예: OO 플랜트 건설"
                      />
                    </div>
                    <Button onClick={handleAddProject} className="w-full">
                      추가
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="프로젝트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 보고서 목록 */}
        {selectedProject && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>부적합보고서 목록</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrintAll}>
                    <Printer className="w-4 h-4 mr-1" />
                    전체 출력
                  </Button>
                  <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-1" />
                    보고서 작성
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>공사번호</TableHead>
                    <TableHead>장치명</TableHead>
                    <TableHead>검사일시</TableHead>
                    <TableHead>검사자</TableHead>
                    <TableHead>최종확인</TableHead>
                    <TableHead className="w-[120px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        등록된 보고서가 없습니다. 보고서를 작성해주세요.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.construction_no || "-"}
                        </TableCell>
                        <TableCell>{report.equipment_name || "-"}</TableCell>
                        <TableCell>{report.inspection_date || "-"}</TableCell>
                        <TableCell>{report.inspector || "-"}</TableCell>
                        <TableCell>
                          {report.final_result ? (
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                report.final_result === "만족"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {report.final_result}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePrintOne(report)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(report)}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 작성/수정 다이얼로그 */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingReportId(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReportId ? "부적합보고서 수정" : "부적합보고서 작성"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* 기본정보 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-primary">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>공사번호</Label>
                    <Input
                      value={newReport.construction_no}
                      onChange={(e) =>
                        setNewReport({ ...newReport, construction_no: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>공사명</Label>
                    <Input
                      value={newReport.construction_name}
                      onChange={(e) =>
                        setNewReport({ ...newReport, construction_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>장치명</Label>
                    <Input
                      value={newReport.equipment_name}
                      onChange={(e) =>
                        setNewReport({ ...newReport, equipment_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>검사일시</Label>
                    <Input
                      value={newReport.inspection_date}
                      onChange={(e) =>
                        setNewReport({ ...newReport, inspection_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>검사자</Label>
                    <Input
                      value={newReport.inspector}
                      onChange={(e) =>
                        setNewReport({ ...newReport, inspector: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>검사장소</Label>
                    <Input
                      value={newReport.inspection_location}
                      onChange={(e) =>
                        setNewReport({ ...newReport, inspection_location: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 검사품목 - 동적 추가/삭제 */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-primary">검사품목</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    항목 추가
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No.</TableHead>
                      <TableHead>도면번호</TableHead>
                      <TableHead className="w-[100px]">지적건수</TableHead>
                      <TableHead>비고</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.item_no}</TableCell>
                        <TableCell>
                          <Input
                            value={item.drawing_number}
                            onChange={(e) =>
                              updateItem(index, "drawing_number", e.target.value)
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.issue_count}
                            onChange={(e) =>
                              updateItem(index, "issue_count", e.target.value)
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.item_remarks}
                            onChange={(e) =>
                              updateItem(index, "item_remarks", e.target.value)
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          {newItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItem(index)}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 지적사항 / 조치사항 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-primary">지적사항 / 조치사항</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>지적사항</Label>
                    <Textarea
                      value={newReport.issues}
                      onChange={(e) =>
                        setNewReport({ ...newReport, issues: e.target.value })
                      }
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>조치사항</Label>
                    <Textarea
                      value={newReport.actions}
                      onChange={(e) =>
                        setNewReport({ ...newReport, actions: e.target.value })
                      }
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              {/* 조치요구사항 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-primary">조치요구사항</h4>
                <div className="flex flex-wrap gap-6">
                  {[
                    { key: "action_rework" as const, label: "재작업" },
                    { key: "action_modify" as const, label: "수정" },
                    { key: "action_sort" as const, label: "선별" },
                    { key: "action_return" as const, label: "반송" },
                    { key: "action_discard" as const, label: "폐기" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={newReport[key]}
                        onCheckedChange={(checked) =>
                          setNewReport({ ...newReport, [key]: !!checked })
                        }
                      />
                      <Label htmlFor={key} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 조치담당 / 처리기간 / 확인 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-primary">조치 및 확인</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>조치담당부서</Label>
                    <Input
                      value={newReport.action_department}
                      onChange={(e) =>
                        setNewReport({ ...newReport, action_department: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>처리기간</Label>
                    <Input
                      value={newReport.processing_period}
                      onChange={(e) =>
                        setNewReport({ ...newReport, processing_period: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>최종확인</Label>
                    <Select
                      value={newReport.final_result}
                      onValueChange={(v) =>
                        setNewReport({ ...newReport, final_result: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="만족">만족</SelectItem>
                        <SelectItem value="불만족">불만족</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>재검사결과</Label>
                    <Select
                      value={newReport.reinspection_result}
                      onValueChange={(v) =>
                        setNewReport({ ...newReport, reinspection_result: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="만족">만족</SelectItem>
                        <SelectItem value="불만족">불만족</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 작성/검토/승인 */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-primary">작성 / 검토 / 승인</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>작성</Label>
                    <Input
                      value={newReport.written_by}
                      onChange={(e) =>
                        setNewReport({ ...newReport, written_by: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>검토</Label>
                    <Input
                      value={newReport.reviewed_by}
                      onChange={(e) =>
                        setNewReport({ ...newReport, reviewed_by: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>승인</Label>
                    <Input
                      value={newReport.approved_by}
                      onChange={(e) =>
                        setNewReport({ ...newReport, approved_by: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>비고</Label>
                  <Textarea
                    value={newReport.remarks}
                    onChange={(e) =>
                      setNewReport({ ...newReport, remarks: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>

              <Button onClick={handleSaveReport} className="w-full" size="lg">
                {editingReportId ? "보고서 수정 저장" : "보고서 저장"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 상세보기 다이얼로그 */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                부적합보고서
              </DialogTitle>
            </DialogHeader>
            {viewReport && (
              <div className="space-y-4 pt-2 text-sm">
                <div className="text-center border-b pb-3">
                  <h3 className="text-lg font-bold">월드테크㈜</h3>
                  <p className="text-muted-foreground">부적합보고서</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <InfoRow label="공사번호" value={viewReport.construction_no} />
                  <InfoRow label="장치명" value={viewReport.equipment_name} />
                  <InfoRow label="검사일시" value={viewReport.inspection_date} />
                  <InfoRow label="공사명" value={viewReport.construction_name} />
                  <InfoRow label="검사자" value={viewReport.inspector} />
                  <InfoRow label="검사장소" value={viewReport.inspection_location} />
                </div>

                {viewReport.inspection_items && viewReport.inspection_items.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">검사품목</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">No.</TableHead>
                          <TableHead>도면번호</TableHead>
                          <TableHead>지적건수</TableHead>
                          <TableHead>비고</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewReport.inspection_items.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.item_no}</TableCell>
                            <TableCell>{item.drawing_number}</TableCell>
                            <TableCell>{item.issue_count}</TableCell>
                            <TableCell>{item.item_remarks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-1">지적사항</p>
                    <p className="whitespace-pre-wrap border rounded p-3 min-h-[80px] bg-muted/30">
                      {viewReport.issues || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">조치사항</p>
                    <p className="whitespace-pre-wrap border rounded p-3 min-h-[80px] bg-muted/30">
                      {viewReport.actions || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">조치요구사항</p>
                  <div className="flex gap-4">
                    {[
                      { v: viewReport.action_rework, l: "재작업" },
                      { v: viewReport.action_modify, l: "수정" },
                      { v: viewReport.action_sort, l: "선별" },
                      { v: viewReport.action_return, l: "반송" },
                      { v: viewReport.action_discard, l: "폐기" },
                    ].map(({ v, l }) => (
                      <span
                        key={l}
                        className={`px-2 py-1 rounded text-xs ${
                          v ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {v ? "☑" : "☐"} {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="조치담당부서" value={viewReport.action_department} />
                  <InfoRow label="처리기간" value={viewReport.processing_period} />
                  <InfoRow label="최종확인" value={viewReport.final_result} />
                  <InfoRow label="재검사결과" value={viewReport.reinspection_result} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <InfoRow label="작성" value={viewReport.written_by} />
                  <InfoRow label="검토" value={viewReport.reviewed_by} />
                  <InfoRow label="승인" value={viewReport.approved_by} />
                </div>

                {viewReport.remarks && (
                  <div>
                    <p className="font-semibold mb-1">비고</p>
                    <p className="whitespace-pre-wrap border rounded p-3 bg-muted/30">
                      {viewReport.remarks}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-right">
                  P106-4 월드테크(주)
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <footer className="bg-muted py-4 mt-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border rounded p-2">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

export default NCRReportPage;
