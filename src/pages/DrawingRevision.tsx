import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
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
 import { ArrowLeft, FileText, Plus, Pencil, Trash2 } from "lucide-react";
 import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
 
 interface Drawing {
   id: string;
  projectId: string;
  projectName: string;
   drawingNumber: string;
   drawingName: string;
   revision: string;
   revisionDate: string;
 }
 
 interface Project {
   id: string;
   name: string;
   createdDate: string;
 }
 
 const DrawingRevision = () => {
   const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
   const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
   const [isDrawingDialogOpen, setIsDrawingDialogOpen] = useState(false);
   const [editingDrawing, setEditingDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
   
   const [newProjectName, setNewProjectName] = useState("");
  const [newDrawing, setNewDrawing] = useState({
     drawingNumber: "",
     drawingName: "",
     revision: "Rev. 0",
     revisionDate: new Date().toISOString().split("T")[0].replace(/-/g, "."),
   });
 
   const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectDrawings = drawings.filter((d) => d.projectId === selectedProjectId);
 
  useEffect(() => {
    fetchProjects();
    fetchDrawings();

    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    const drawingsChannel = supabase
      .channel('drawings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drawings' }, () => {
        fetchDrawings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(drawingsChannel);
    };
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('프로젝트 로드 실패');
      return;
    }

    const formattedProjects: Project[] = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      createdDate: p.created_date,
    }));

    setProjects(formattedProjects);
    setLoading(false);
  };

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const fetchDrawings = async () => {
    const { data, error } = await supabase
      .from('drawings')
      .select('*, projects(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('도면 로드 실패');
      return;
    }

    const formattedDrawings: Drawing[] = (data || []).map((d) => ({
      id: d.id,
      projectId: d.project_id,
      projectName: (d.projects as { name: string })?.name || '',
      drawingNumber: d.drawing_number,
      drawingName: d.drawing_name,
      revision: d.revision,
      revisionDate: d.revision_date,
    }));

    setDrawings(formattedDrawings);
  };

  const handleAddProject = async () => {
     if (!newProjectName.trim()) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: newProjectName,
        created_date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      })
      .select()
      .single();

    if (error) {
      toast.error('프로젝트 추가 실패');
      return;
    }

    setSelectedProjectId(data.id);
     setNewProjectName("");
     setIsProjectDialogOpen(false);
    toast.success('프로젝트가 추가되었습니다');
   };
 
  const handleAddDrawing = async () => {
     if (!selectedProjectId || !newDrawing.drawingNumber.trim()) return;

    const { error } = await supabase.from('drawings').insert({
      project_id: selectedProjectId,
      drawing_number: newDrawing.drawingNumber,
      drawing_name: newDrawing.drawingName,
      revision: newDrawing.revision,
      revision_date: newDrawing.revisionDate,
    });

    if (error) {
      toast.error('도면 추가 실패');
      return;
    }

    // 모든 입력값 유지 (다음 입력 시 수정 가능하도록)
    setIsDrawingDialogOpen(false);
    toast.success('도면이 추가되었습니다');
   };
 
  const handleUpdateDrawing = async () => {
     if (!editingDrawing) return;

    const { error } = await supabase
      .from('drawings')
      .update({
        drawing_number: editingDrawing.drawingNumber,
        drawing_name: editingDrawing.drawingName,
        revision: editingDrawing.revision,
        revision_date: editingDrawing.revisionDate,
      })
      .eq('id', editingDrawing.id);

    if (error) {
      toast.error('도면 수정 실패');
      return;
    }

     setEditingDrawing(null);
    toast.success('도면이 수정되었습니다');
   };
 
  const handleDeleteDrawing = async (drawingId: string) => {
    const { error } = await supabase.from('drawings').delete().eq('id', drawingId);

    if (error) {
      toast.error('도면 삭제 실패');
      return;
    }

    toast.success('도면이 삭제되었습니다');
   };
 
  const handleDeleteProject = async () => {
     if (!selectedProjectId) return;

    const { error } = await supabase.from('projects').delete().eq('id', selectedProjectId);

    if (error) {
      toast.error('프로젝트 삭제 실패');
      return;
    }

    const remaining = projects.filter((p) => p.id !== selectedProjectId);
    setSelectedProjectId(remaining[0]?.id || "");
    toast.success('프로젝트가 삭제되었습니다');
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
           <div className="flex items-center justify-between">
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
                 <FileText className="w-8 h-8 text-sidebar-primary-foreground" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold">도면 리비전 관리</h1>
                 <p className="text-sm text-sidebar-foreground/70">
                   프로젝트별 도면 버전 관리 시스템
                 </p>
               </div>
             </div>
           </div>
         </div>
       </header>
 
       {/* 메인 컨텐츠 */}
       <main className="container max-w-6xl mx-auto px-4 py-8">
         <div className="space-y-6">
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
                           placeholder="예: OO 아파트 건설 공사"
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
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                     <SelectTrigger>
                       <SelectValue placeholder="프로젝트를 선택하세요" />
                     </SelectTrigger>
                     <SelectContent>
                       {projects.map((project) => (
                         <SelectItem key={project.id} value={project.id}>
                           {project.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 {selectedProject && (
                   <Button
                     variant="destructive"
                     size="sm"
                     onClick={handleDeleteProject}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 )}
               </div>
               {selectedProject && (
                 <p className="text-sm text-muted-foreground mt-2">
                   작성일: {selectedProject.createdDate}
                 </p>
               )}
             </CardContent>
           </Card>
 
           {/* 도면 목록 */}
           {selectedProject && (
             <Card>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle>도면 목록</CardTitle>
                   <Dialog open={isDrawingDialogOpen} onOpenChange={setIsDrawingDialogOpen}>
                     <DialogTrigger asChild>
                       <Button size="sm">
                         <Plus className="w-4 h-4 mr-1" />
                         도면 추가
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>새 도면 추가</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-4 pt-4">
                         <div className="space-y-2">
                           <Label>도면 번호</Label>
                           <Input
                             value={newDrawing.drawingNumber}
                             onChange={(e) => setNewDrawing({ ...newDrawing, drawingNumber: e.target.value })}
                             placeholder="예: DWG-001"
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>도면명</Label>
                           <Input
                             value={newDrawing.drawingName}
                             onChange={(e) => setNewDrawing({ ...newDrawing, drawingName: e.target.value })}
                             placeholder="예: 1층 평면도"
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>리비전</Label>
                           <Input
                             value={newDrawing.revision}
                             onChange={(e) => setNewDrawing({ ...newDrawing, revision: e.target.value })}
                             placeholder="예: Rev. 0"
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>개정 일자</Label>
                           <Input
                             value={newDrawing.revisionDate}
                             onChange={(e) => setNewDrawing({ ...newDrawing, revisionDate: e.target.value })}
                             placeholder="예: 2026.01.20"
                           />
                         </div>
                         <Button onClick={handleAddDrawing} className="w-full">
                           추가
                         </Button>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </div>
               </CardHeader>
               <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>도면 번호</TableHead>
                        <TableHead>프로젝트명</TableHead>
                       <TableHead>도면명</TableHead>
                       <TableHead>최신 Rev.</TableHead>
                       <TableHead>개정 일자</TableHead>
                       <TableHead className="w-[100px]">관리</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                      {projectDrawings.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                           등록된 도면이 없습니다. 도면을 추가해주세요.
                         </TableCell>
                       </TableRow>
                     ) : (
                        projectDrawings.map((drawing) => (
                         <TableRow key={drawing.id}>
                           <TableCell className="font-medium">{drawing.drawingNumber}</TableCell>
                            <TableCell className="text-muted-foreground">{drawing.projectName}</TableCell>
                           <TableCell>{drawing.drawingName}</TableCell>
                           <TableCell>
                             <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                               {drawing.revision}
                             </span>
                           </TableCell>
                           <TableCell>{drawing.revisionDate}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-1">
                               <Dialog>
                                 <DialogTrigger asChild>
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     onClick={() => setEditingDrawing(drawing)}
                                   >
                                     <Pencil className="w-4 h-4" />
                                   </Button>
                                 </DialogTrigger>
                                 <DialogContent>
                                   <DialogHeader>
                                     <DialogTitle>도면 수정</DialogTitle>
                                   </DialogHeader>
                                   {editingDrawing && (
                                     <div className="space-y-4 pt-4">
                                       <div className="space-y-2">
                                         <Label>도면 번호</Label>
                                         <Input
                                           value={editingDrawing.drawingNumber}
                                           onChange={(e) => setEditingDrawing({ ...editingDrawing, drawingNumber: e.target.value })}
                                         />
                                       </div>
                                       <div className="space-y-2">
                                         <Label>도면명</Label>
                                         <Input
                                           value={editingDrawing.drawingName}
                                           onChange={(e) => setEditingDrawing({ ...editingDrawing, drawingName: e.target.value })}
                                         />
                                       </div>
                                       <div className="space-y-2">
                                         <Label>리비전</Label>
                                         <Input
                                           value={editingDrawing.revision}
                                           onChange={(e) => setEditingDrawing({ ...editingDrawing, revision: e.target.value })}
                                         />
                                       </div>
                                       <div className="space-y-2">
                                         <Label>개정 일자</Label>
                                         <Input
                                           value={editingDrawing.revisionDate}
                                           onChange={(e) => setEditingDrawing({ ...editingDrawing, revisionDate: e.target.value })}
                                         />
                                       </div>
                                       <Button onClick={handleUpdateDrawing} className="w-full">
                                         저장
                                       </Button>
                                     </div>
                                   )}
                                 </DialogContent>
                               </Dialog>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => handleDeleteDrawing(drawing.id)}
                                 className="text-destructive hover:text-destructive"
                               >
                                 <Trash2 className="w-4 h-4" />
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
         </div>
       </main>
 
       {/* 푸터 */}
       <footer className="bg-muted py-4 mt-8">
         <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
           <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
         </div>
       </footer>
     </div>
   );
 };
 
 export default DrawingRevision;