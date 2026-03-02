import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Trash2, Download, Upload, UserPlus, Users, Eye, Edit, X, FileText } from "lucide-react";

interface WorkerProject {
  id: string;
  name: string;
  created_at: string;
}

interface Worker {
  id: string;
  name: string;
  resident_number: string;
  phone: string;
  blood_type: string;
  address: string;
  bank_account: string;
  safety_shoes: string;
  vest_size: string;
  emergency_contact: string;
  experience: string;
  email: string;
  safety_training_number: string;
  safety_training_date: string;
}

interface WorkerDocument {
  id: string;
  worker_id: string;
  doc_type: string;
  file_name: string;
  file_path: string;
  original_name: string;
}

const emptyWorker: Omit<Worker, "id"> = {
  name: "", resident_number: "", phone: "", blood_type: "",
  address: "", bank_account: "", safety_shoes: "", vest_size: "",
  emergency_contact: "", experience: "", email: "",
  safety_training_number: "", safety_training_date: "",
};

const WorkerManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<WorkerProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<WorkerProject | null>(null);
  const [projectWorkerIds, setProjectWorkerIds] = useState<string[]>([]);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [workerForm, setWorkerForm] = useState(emptyWorker);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [showWorkerDialog, setShowWorkerDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailWorker, setDetailWorker] = useState<Worker | null>(null);
  const [workerDocs, setWorkerDocs] = useState<WorkerDocument[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("project");
  const [newProjectName, setNewProjectName] = useState("");

  // Load projects & all workers
  useEffect(() => {
    fetchProjects();
    fetchAllWorkers();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from("worker_projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    const { error } = await supabase.from("worker_projects").insert({ name: newProjectName.trim() });
    if (error) { toast({ title: "추가 실패", variant: "destructive" }); return; }
    setNewProjectName("");
    fetchProjects();
    toast({ title: "프로젝트가 추가되었습니다" });
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("이 프로젝트를 삭제하시겠습니까? 배정된 작업자 연결도 함께 삭제됩니다.")) return;
    await supabase.from("worker_projects").delete().eq("id", projectId);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setProjectWorkerIds([]);
    }
    fetchProjects();
    toast({ title: "프로젝트가 삭제되었습니다" });
  };

  const fetchAllWorkers = async () => {
    const { data } = await supabase.from("workers").select("*").order("name");
    if (data) setAllWorkers(data);
  };

  const fetchProjectWorkers = async (projectId: string) => {
    const { data } = await supabase.from("project_workers").select("worker_id").eq("project_id", projectId);
    if (data) setProjectWorkerIds(data.map((d) => d.worker_id));
  };

  const selectProject = (project: WorkerProject) => {
    setSelectedProject(project);
    fetchProjectWorkers(project.id);
  };

  // Workers in the selected project
  const projectWorkers = useMemo(
    () => allWorkers.filter((w) => projectWorkerIds.includes(w.id)),
    [allWorkers, projectWorkerIds]
  );

  // Global search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allWorkers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.email.toLowerCase().includes(q)
    );
  }, [allWorkers, searchQuery]);

  // Save worker (create or update)
  const handleSaveWorker = async () => {
    if (!workerForm.name.trim()) {
      toast({ title: "이름을 입력해주세요", variant: "destructive" });
      return;
    }

    if (editingWorker) {
      const { error } = await supabase.from("workers").update(workerForm).eq("id", editingWorker.id);
      if (error) { toast({ title: "수정 실패", description: error.message, variant: "destructive" }); return; }
      toast({ title: "작업자 정보가 수정되었습니다" });
    } else {
      const { data, error } = await supabase.from("workers").insert(workerForm).select().single();
      if (error) { toast({ title: "등록 실패", description: error.message, variant: "destructive" }); return; }
      // Auto-assign to selected project
      if (selectedProject && data) {
        await supabase.from("project_workers").insert({ project_id: selectedProject.id, worker_id: data.id });
        fetchProjectWorkers(selectedProject.id);
      }
      toast({ title: "작업자가 등록되었습니다" });
    }
    fetchAllWorkers();
    setShowWorkerDialog(false);
    setEditingWorker(null);
    setWorkerForm(emptyWorker);
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm("이 작업자를 삭제하시겠습니까?")) return;
    await supabase.from("workers").delete().eq("id", workerId);
    fetchAllWorkers();
    if (selectedProject) fetchProjectWorkers(selectedProject.id);
    toast({ title: "작업자가 삭제되었습니다" });
  };

  const handleRemoveFromProject = async (workerId: string) => {
    if (!selectedProject) return;
    await supabase.from("project_workers").delete().eq("project_id", selectedProject.id).eq("worker_id", workerId);
    fetchProjectWorkers(selectedProject.id);
    toast({ title: "프로젝트에서 제외되었습니다" });
  };

  const handleAssignWorker = async (workerId: string) => {
    if (!selectedProject) return;
    const { error } = await supabase.from("project_workers").insert({ project_id: selectedProject.id, worker_id: workerId });
    if (error) {
      if (error.code === "23505") toast({ title: "이미 배정된 작업자입니다" });
      else toast({ title: "배정 실패", variant: "destructive" });
      return;
    }
    fetchProjectWorkers(selectedProject.id);
    setShowAssignDialog(false);
    toast({ title: "작업자가 프로젝트에 배정되었습니다" });
  };

  // Worker detail & documents
  const openWorkerDetail = async (worker: Worker) => {
    setDetailWorker(worker);
    setShowDetailDialog(true);
    const { data } = await supabase.from("worker_documents").select("*").eq("worker_id", worker.id);
    if (data) setWorkerDocs(data);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!detailWorker || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const filePath = `${detailWorker.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("worker-documents").upload(filePath, file);
    if (uploadError) { toast({ title: "업로드 실패", variant: "destructive" }); return; }
    await supabase.from("worker_documents").insert({
      worker_id: detailWorker.id, doc_type: docType,
      file_name: file.name, file_path: filePath, original_name: file.name,
    });
    const { data } = await supabase.from("worker_documents").select("*").eq("worker_id", detailWorker.id);
    if (data) setWorkerDocs(data);
    toast({ title: `${docType} 업로드 완료` });
  };

  const handleDocDownload = async (doc: WorkerDocument) => {
    const { data } = await supabase.storage.from("worker-documents").download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = doc.original_name; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDocDelete = async (doc: WorkerDocument) => {
    await supabase.storage.from("worker-documents").remove([doc.file_path]);
    await supabase.from("worker_documents").delete().eq("id", doc.id);
    const { data } = await supabase.from("worker_documents").select("*").eq("worker_id", doc.worker_id);
    if (data) setWorkerDocs(data);
    toast({ title: "문서가 삭제되었습니다" });
  };

  const openEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setWorkerForm({ ...worker });
    setShowWorkerDialog(true);
  };

  const openNewWorker = () => {
    setEditingWorker(null);
    setWorkerForm(emptyWorker);
    setShowWorkerDialog(true);
  };

  const unassignedWorkers = allWorkers.filter((w) => !projectWorkerIds.includes(w.id));

  const WorkerFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
      {[
        { key: "name", label: "이름 *" },
        { key: "resident_number", label: "주민번호" },
        { key: "phone", label: "핸드폰번호" },
        { key: "blood_type", label: "혈액형" },
        { key: "address", label: "주소" },
        { key: "bank_account", label: "계좌번호" },
        { key: "safety_shoes", label: "안전화 사이즈" },
        { key: "vest_size", label: "조끼 사이즈" },
        { key: "emergency_contact", label: "비상연락망" },
        { key: "experience", label: "경력" },
        { key: "email", label: "이메일" },
        { key: "safety_training_number", label: "기초안전 이수번호" },
        { key: "safety_training_date", label: "기초안전이수증 취득일" },
      ].map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs">{label}</Label>
          <Input
            value={(workerForm as any)[key]}
            onChange={(e) => setWorkerForm((prev) => ({ ...prev, [key]: e.target.value }))}
            className="h-9"
          />
        </div>
      ))}
    </div>
  );

  const WorkerTable = ({ workers, showProjectActions }: { workers: Worker[]; showProjectActions?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>핸드폰</TableHead>
            <TableHead>혈액형</TableHead>
            <TableHead>안전화</TableHead>
            <TableHead>조끼</TableHead>
            <TableHead>경력</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">작업자가 없습니다</TableCell></TableRow>
          )}
          {workers.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="font-medium">{w.name}</TableCell>
              <TableCell>{w.phone}</TableCell>
              <TableCell>{w.blood_type}</TableCell>
              <TableCell>{w.safety_shoes}</TableCell>
              <TableCell>{w.vest_size}</TableCell>
              <TableCell>{w.experience}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="sm" variant="ghost" onClick={() => openWorkerDetail(w)}><Eye className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => openEditWorker(w)}><Edit className="w-4 h-4" /></Button>
                {showProjectActions && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveFromProject(w.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteWorker(w.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground py-4">
        <div className="container max-w-7xl mx-auto px-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-sidebar-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">작업자 관리</h1>
              <p className="text-xs text-sidebar-foreground/70">Worker Management System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="project">프로젝트별 관리</TabsTrigger>
            <TabsTrigger value="search">작업자 검색</TabsTrigger>
          </TabsList>

          {/* Project-based Tab */}
          <TabsContent value="project">
            <div className="grid md:grid-cols-[280px_1fr] gap-6">
              {/* Project List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">프로젝트 목록</CardTitle>
                  <div className="flex gap-1 mt-2">
                    <Input
                      placeholder="새 프로젝트명"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={handleAddProject}><Plus className="w-4 h-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 max-h-[70vh] overflow-y-auto">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-1">
                      <Button
                        variant={selectedProject?.id === p.id ? "default" : "ghost"}
                        className="flex-1 justify-start text-sm"
                        onClick={() => selectProject(p)}
                      >
                        {p.name}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteProject(p.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      프로젝트가 없습니다.<br />위에서 새 프로젝트를 추가해주세요.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Worker List for selected project */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedProject ? `${selectedProject.name} - 작업자 목록` : "프로젝트를 선택하세요"}
                  </CardTitle>
                  {selectedProject && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)}>
                        <UserPlus className="w-4 h-4 mr-1" /> 기존 인원 배정
                      </Button>
                      <Button size="sm" onClick={openNewWorker}>
                        <Plus className="w-4 h-4 mr-1" /> 신규 등록
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedProject ? (
                    <WorkerTable workers={projectWorkers} showProjectActions />
                  ) : (
                    <p className="text-muted-foreground text-center py-12">좌측에서 프로젝트를 선택해주세요</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="이름, 연락처, 이메일로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button size="sm" onClick={openNewWorker}>
                    <Plus className="w-4 h-4 mr-1" /> 신규 등록
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {searchQuery.trim() ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">검색 결과: {searchResults.length}건</p>
                    <WorkerTable workers={searchResults} />
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-12">이름, 연락처 또는 이메일로 검색해주세요</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Worker Create/Edit Dialog */}
      <Dialog open={showWorkerDialog} onOpenChange={setShowWorkerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorker ? "작업자 정보 수정" : "신규 작업자 등록"}</DialogTitle>
          </DialogHeader>
          <WorkerFormFields />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowWorkerDialog(false)}>취소</Button>
            <Button onClick={handleSaveWorker}>{editingWorker ? "수정" : "등록"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Worker Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailWorker?.name} - 상세 정보</DialogTitle>
          </DialogHeader>
          {detailWorker && (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["이름", detailWorker.name],
                  ["주민번호", detailWorker.resident_number],
                  ["핸드폰", detailWorker.phone],
                  ["혈액형", detailWorker.blood_type],
                  ["주소", detailWorker.address],
                  ["계좌번호", detailWorker.bank_account],
                  ["안전화", detailWorker.safety_shoes],
                  ["조끼", detailWorker.vest_size],
                  ["비상연락망", detailWorker.emergency_contact],
                  ["경력", detailWorker.experience],
                  ["이메일", detailWorker.email],
                  ["기초안전 이수번호", detailWorker.safety_training_number],
                  ["이수증 취득일", detailWorker.safety_training_date],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground">{label}:</span>{" "}
                    <span className="font-medium">{value || "-"}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> 첨부 서류</h3>

                {/* Upload buttons */}
                <div className="flex gap-3 mb-3">
                  {["주민등록 사본", "기초안전이수증 사본"].map((docType) => (
                    <div key={docType}>
                      <Label htmlFor={`upload-${docType}`} className="cursor-pointer">
                        <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-2 rounded-md hover:bg-primary/20 transition-colors">
                          <Upload className="w-4 h-4" /> {docType} 업로드
                        </div>
                      </Label>
                      <input
                        id={`upload-${docType}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleDocUpload(e, docType)}
                      />
                    </div>
                  ))}
                </div>

                {/* Document list */}
                {workerDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">첨부된 서류가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {workerDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">[{doc.doc_type}]</span> {doc.original_name}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleDocDownload(doc)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDocDelete(doc)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign existing worker dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기존 작업자 배정</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-1">
            {unassignedWorkers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">배정 가능한 작업자가 없습니다</p>
            ) : (
              unassignedWorkers.map((w) => (
                <div key={w.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50">
                  <div>
                    <span className="font-medium">{w.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{w.phone}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAssignWorker(w.id)}>배정</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerManagement;
