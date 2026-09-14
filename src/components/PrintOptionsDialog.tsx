import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";

export interface PrintSelectableItem {
  id: string;
  /** 정렬/기간 필터에 사용할 날짜 (YYYY-MM-DD 또는 YYYY.MM.DD) */
  date: string;
  /** 목록에 보일 제목 */
  label: string;
  /** 보조 설명 */
  sub?: string;
  /** 소속 프로젝트 ID */
  groupId?: string;
  /** 소속 프로젝트명 */
  groupName?: string;
}

type Scope = "all" | "recent" | "range" | "pick";

interface PrintOptionsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  /** 전체 프로젝트의 항목을 모두 넘겨주세요 */
  items: PrintSelectableItem[];
  /** 현재 선택된 프로젝트 ID (있으면 프로젝트 범위 선택이 표시됨) */
  currentGroupId?: string;
  /** 현재 선택된 프로젝트명 */
  currentGroupName?: string;
  /** 요약/상세 선택 옵션 표시 여부 */
  showDetailOption?: boolean;
  onPrint: (selectedIds: string[], options: { includeDetail: boolean }) => void;
}

const key = (v: string) => (v || "").replace(/[^0-9]/g, "");

export function PrintOptionsDialog({
  open,
  onOpenChange,
  title,
  items,
  currentGroupId,
  currentGroupName,
  showDetailOption = false,
  onPrint,
}: PrintOptionsDialogProps) {
  const [groupScope, setGroupScope] = useState<"current" | "all">("current");
  const [scope, setScope] = useState<Scope>("all");
  const [recentCount, setRecentCount] = useState("20");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [includeDetail, setIncludeDetail] = useState(true);

  useEffect(() => {
    if (open) {
      setScope("all");
      setPicked([]);
      setGroupScope("current");
    }
  }, [open]);

  const projectCount = useMemo(
    () => new Set(items.map((i) => i.groupId || "-")).size,
    [items]
  );
  const hasGroupChoice = Boolean(currentGroupId) && projectCount > 1;

  const pool = useMemo(() => {
    if (!hasGroupChoice || groupScope === "all") return items;
    return items.filter((i) => i.groupId === currentGroupId);
  }, [items, hasGroupChoice, groupScope, currentGroupId]);

  const currentCount = useMemo(
    () => items.filter((i) => i.groupId === currentGroupId).length,
    [items, currentGroupId]
  );

  const sorted = useMemo(
    () =>
      [...pool].sort((a, b) => {
        const g = (a.groupName || "").localeCompare(b.groupName || "");
        if (groupScope === "all" && g !== 0) return g;
        return key(b.date).localeCompare(key(a.date));
      }),
    [pool, groupScope]
  );

  useEffect(() => {
    setPicked((p) => p.filter((id) => pool.some((i) => i.id === id)));
  }, [pool]);

  const selected = useMemo(() => {
    if (scope === "all") return sorted;
    if (scope === "recent") {
      const n = parseInt(recentCount, 10);
      if (!Number.isFinite(n) || n <= 0) return [];
      const byDate = [...sorted].sort((a, b) => key(b.date).localeCompare(key(a.date)));
      return byDate.slice(0, n);
    }
    if (scope === "range") {
      const f = key(from);
      const t = key(to);
      return sorted.filter((i) => {
        const d = key(i.date);
        if (!d) return false;
        if (f && d < f) return false;
        if (t && d > t) return false;
        return true;
      });
    }
    return sorted.filter((i) => picked.includes(i.id));
  }, [scope, sorted, recentCount, from, to, picked]);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handlePrint = () => {
    onPrint(selected.map((i) => i.id), { includeDetail });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            출력할 범위를 고른 뒤 인쇄 창에서 인쇄 또는 PDF로 저장하세요. (전체 {items.length}건)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {hasGroupChoice && (
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">프로젝트 범위</p>
              <RadioGroup
                value={groupScope}
                onValueChange={(v) => setGroupScope(v as "current" | "all")}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="current" id="group-current" />
                  <Label htmlFor="group-current" className="font-normal">
                    현재 프로젝트만 — {currentGroupName || "-"} ({currentCount}건)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="group-all" />
                  <Label htmlFor="group-all" className="font-normal">
                    전체 프로젝트 한 번에 ({projectCount}개 · {items.length}건)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <RadioGroup value={scope} onValueChange={(v) => setScope(v as Scope)} className="space-y-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="all" id="scope-all" />
              <Label htmlFor="scope-all">전체 출력 ({pool.length}건)</Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="recent" id="scope-recent" />
              <Label htmlFor="scope-recent">최근</Label>
              <Input
                className="w-20 h-8"
                value={recentCount}
                onChange={(e) => {
                  setRecentCount(e.target.value.replace(/[^0-9]/g, ""));
                  setScope("recent");
                }}
              />
              <span className="text-sm text-muted-foreground">건만 출력</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RadioGroupItem value="range" id="scope-range" />
              <Label htmlFor="scope-range">기간</Label>
              <Input
                type="date"
                className="w-40 h-8"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setScope("range");
                }}
              />
              <span className="text-sm">~</span>
              <Input
                type="date"
                className="w-40 h-8"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setScope("range");
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem value="pick" id="scope-pick" />
              <Label htmlFor="scope-pick">직접 선택</Label>
            </div>
          </RadioGroup>

          {scope === "pick" && (
            <div className="border rounded-md">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm text-muted-foreground">
                  {picked.length}건 선택됨
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPicked(sorted.map((i) => i.id))}
                  >
                    모두 선택
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPicked([])}>
                    선택 해제
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-56">
                <div className="p-2 space-y-1">
                  {sorted.map((i, idx) => {
                    const showGroupHeader =
                      groupScope === "all" &&
                      hasGroupChoice &&
                      (idx === 0 || sorted[idx - 1].groupName !== i.groupName);
                    return (
                      <div key={i.id}>
                        {showGroupHeader && (
                          <div className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                            {i.groupName || "프로젝트 미지정"}
                          </div>
                        )}
                        <label className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
                          <Checkbox
                            checked={picked.includes(i.id)}
                            onCheckedChange={() => toggle(i.id)}
                            className="mt-0.5"
                          />
                          <span className="text-sm leading-tight">
                            <span className="font-medium">{i.label}</span>
                            {i.sub && (
                              <span className="block text-xs text-muted-foreground">{i.sub}</span>
                            )}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                            {i.date || "-"}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {showDetailOption && (
            <>
              <Separator />
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeDetail}
                  onCheckedChange={(v) => setIncludeDetail(Boolean(v))}
                />
                <span className="text-sm">
                  상세 내용까지 출력 (해제 시 요약 목록만 출력)
                </span>
              </label>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              출력 대상: <b className="text-foreground">{selected.length}</b>건
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button onClick={handlePrint} disabled={selected.length === 0}>
                <Printer className="w-4 h-4 mr-1" />
                출력
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
