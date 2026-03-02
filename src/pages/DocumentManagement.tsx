import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Upload, Download, FolderOpen, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface DocFile {
  id: string;
  category_id: string;
  file_name: string;
  file_path: string;
  original_name: string;
  project_name: string;
  used_date: string;
  memo: string;
  created_at: string;
}

const DocumentManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [files, setFiles] = useState<DocFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [usedDate, setUsedDate] = useState("");
  const [memo, setMemo] = useState("");

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("document_categories")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setCategories(data);
  }, []);

  const fetchFiles = useCallback(async (categoryId: string) => {
    const { data } = await supabase
      .from("document_files")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) fetchFiles(selectedCategory.id);
  }, [selectedCategory, fetchFiles]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    const { error } = await supabase
      .from("document_categories")
      .insert({ name: categoryName.trim() });
    if (error) {
      toast.error("카테고리 추가 실패");
      return;
    }
    toast.success("카테고리가 추가되었습니다");
    setCategoryName("");
    setShowCategoryDialog(false);
    fetchCategories();
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    const { error } = await supabase
      .from("document_categories")
      .update({ name: editCategoryName.trim() })
      .eq("id", editingCategory.id);
    if (error) {
      toast.error("카테고리 수정 실패");
      return;
    }
    toast.success("카테고리가 수정되었습니다");
    setShowEditDialog(false);
    setEditingCategory(null);
    fetchCategories();
    if (selectedCategory?.id === editingCategory.id) {
      setSelectedCategory({ ...editingCategory, name: editCategoryName.trim() });
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`"${cat.name}" 카테고리와 하위 파일을 모두 삭제하시겠습니까?`)) return;
    // Delete storage files first
    const { data: catFiles } = await supabase
      .from("document_files")
      .select("file_path")
      .eq("category_id", cat.id);
    if (catFiles && catFiles.length > 0) {
      await supabase.storage.from("documents").remove(catFiles.map((f) => f.file_path));
    }
    await supabase.from("document_categories").delete().eq("id", cat.id);
    toast.success("카테고리가 삭제되었습니다");
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
      setFiles([]);
    }
    fetchCategories();
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedCategory) return;
    setLoading(true);
    const ext = uploadFile.name.split(".").pop();
    const filePath = `${selectedCategory.id}/${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(filePath, uploadFile);
    if (storageError) {
      toast.error("파일 업로드 실패: " + storageError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("document_files").insert({
      category_id: selectedCategory.id,
      file_name: uploadFile.name,
      file_path: filePath,
      original_name: uploadFile.name,
      project_name: projectName,
      used_date: usedDate,
      memo: memo,
    });
    if (dbError) {
      toast.error("파일 정보 저장 실패");
      setLoading(false);
      return;
    }

    toast.success("파일이 업로드되었습니다");
    setUploadFile(null);
    setProjectName("");
    setUsedDate("");
    setMemo("");
    setShowUploadDialog(false);
    setLoading(false);
    fetchFiles(selectedCategory.id);
  };

  const handleDownload = async (file: DocFile) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(file.file_path);
    if (data?.publicUrl) {
      const a = document.createElement("a");
      a.href = data.publicUrl;
      a.download = file.original_name || file.file_name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDeleteFile = async (file: DocFile) => {
    if (!confirm(`"${file.file_name}" 파일을 삭제하시겠습니까?`)) return;
    await supabase.storage.from("documents").remove([file.file_path]);
    await supabase.from("document_files").delete().eq("id", file.id);
    toast.success("파일이 삭제되었습니다");
    if (selectedCategory) fetchFiles(selectedCategory.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <FileText className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">각종 서식 관리</h1>
              <p className="text-sm text-sidebar-foreground/70">서식 업로드 · 다운로드 · 이력 관리</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">서식 목록</h2>
              <Button size="sm" onClick={() => setShowCategoryDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> 추가
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory?.id === cat.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(cat);
                          setEditCategoryName(cat.name);
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">카테고리를 추가해주세요</p>
              )}
            </div>
          </div>

          {/* Main - Files */}
          <div>
            {selectedCategory ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{selectedCategory.name}</h2>
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="w-4 h-4 mr-1" /> 파일 업로드
                  </Button>
                </div>

                {files.length > 0 ? (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>파일명</TableHead>
                          <TableHead>프로젝트</TableHead>
                          <TableHead>사용일자</TableHead>
                          <TableHead>메모</TableHead>
                          <TableHead className="w-[100px]">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[200px]">{file.file_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{file.project_name || "-"}</TableCell>
                            <TableCell>{file.used_date || "-"}</TableCell>
                            <TableCell>
                              <span className="truncate max-w-[150px] block">{file.memo || "-"}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file)}>
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFile(file)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Upload className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p>등록된 파일이 없습니다</p>
                      <p className="text-sm">파일 업로드 버튼을 눌러 서식을 추가해주세요</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">서식 목록을 선택해주세요</p>
                  <p className="text-sm">왼쪽에서 카테고리를 선택하거나 새로 추가하세요</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-muted py-4 mt-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>서식 목록 추가</DialogTitle>
            <DialogDescription>새로운 서식 카테고리를 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>카테고리 이름</Label>
            <Input
              placeholder="예: 월드테크 시방서 목록"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>취소</Button>
            <Button onClick={handleAddCategory}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 이름 수정</DialogTitle>
            <DialogDescription>카테고리 이름을 변경합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>카테고리 이름</Label>
            <Input
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditCategory()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>취소</Button>
            <Button onClick={handleEditCategory}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 업로드</DialogTitle>
            <DialogDescription>{selectedCategory?.name}에 새 파일을 업로드합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>파일 선택</Label>
              <Input
                type="file"
                className="mt-1"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>프로젝트 이름</Label>
              <Input
                placeholder="예: 삼성 SDI 화성공장"
                className="mt-1"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label>사용 일자</Label>
              <Input
                type="date"
                className="mt-1"
                value={usedDate}
                onChange={(e) => setUsedDate(e.target.value)}
              />
            </div>
            <div>
              <Label>메모</Label>
              <Textarea
                placeholder="간단한 기록 사항"
                className="mt-1"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>취소</Button>
            <Button onClick={handleUpload} disabled={!uploadFile || loading}>
              {loading ? "업로드 중..." : "업로드"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;
