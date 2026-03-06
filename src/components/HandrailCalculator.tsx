import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calculator, Download, Fence, LandPlot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  MaterialType, MATERIAL_DENSITIES, KS_SGP_PIPES, ANSI_SCH40_PIPES,
  FLATBAR_SPECS, PLATE_SPECS,
  ComponentItem, calculatePipeWeight, calculateFlatbarWeight, calculatePlateWeight,
} from '@/lib/handrailCalculator';

const PI = Math.PI;

const MATERIAL_LABELS: Record<MaterialType, string> = {
  steel: '일반 철강 (SS400)', stainless304: 'STS 304', stainless316: 'STS 316', aluminum: '알루미늄', galvanized: '용융아연도금',
};

// ========== Handrail detailed type ==========
interface HandrailDetail {
  // 기본 치수
  tankDiameter: number; // mm, 0이면 직선
  straightLength: number; // mm, 직선 길이 (탱크 미사용시)
  handrailHeight: number; // mm
  postSpacing: number; // mm (기본 1500)
  postCount: number; // 자동 or 수동
  postCountManual: boolean;

  // 규격 표준
  pipeStandard: 'KS' | 'ANSI';

  // 탑레일
  topRailSpec: string; // pipe nominal size
  topRailCustomOD: number;
  topRailCustomThk: number;
  topRailUseCustom: boolean;

  // 미드레일
  midRailSpec: string;
  midRailCustomOD: number;
  midRailCustomThk: number;
  midRailUseCustom: boolean;
  hasMidRail: boolean;

  // 포스트
  postSpec: string;
  postCustomOD: number;
  postCustomThk: number;
  postUseCustom: boolean;

  // 포스트 베이스 플레이트
  basePlateWidth: number; // mm
  basePlateLength: number; // mm
  basePlateThickness: number; // mm

  // 하부 평철 (토보드/킥플레이트)
  toeboardWidth: number; // mm (높이)
  toeboardThickness: number; // mm
  hasToeBoard: boolean;
}

// ========== Ladder detailed type ==========
interface LadderDetail {
  pipeStandard: 'KS' | 'ANSI';
  ladderHeight: number; // mm
  ladderWidth: number; // mm (기본 400)

  // 사이드레일 (양쪽 수직 파이프)
  sideRailSpec: string;
  sideRailCustomOD: number;
  sideRailCustomThk: number;
  sideRailUseCustom: boolean;

  // 발판 (런)
  rungSpec: string;
  rungCustomOD: number;
  rungCustomThk: number;
  rungUseCustom: boolean;
  rungSpacing: number; // mm (기본 300)
  rungCount: number;
  rungCountManual: boolean;

  // 백스탑 (등받이) 유무
  hasBackStop: boolean;
  backStopStartHeight: number; // mm (2000mm 이상시 설치)
  backStopSpec: string;
  backStopCustomOD: number;
  backStopCustomThk: number;
  backStopUseCustom: boolean;

  // 사다리 고정 브래킷 플레이트
  bracketPlateWidth: number;
  bracketPlateLength: number;
  bracketPlateThickness: number;
  bracketCount: number;
}

// ========== Result line item ==========
interface ResultItem {
  name: string;
  spec: string;
  length: number; // mm
  qty: number;
  unitWeight: number; // kg
  totalWeight: number; // kg
}

const defaultHandrail: HandrailDetail = {
  tankDiameter: 0, straightLength: 3000, handrailHeight: 1100, postSpacing: 1500, postCount: 3, postCountManual: false,
  pipeStandard: 'KS',
  topRailSpec: '32A', topRailCustomOD: 42.7, topRailCustomThk: 3.5, topRailUseCustom: false,
  midRailSpec: '25A', midRailCustomOD: 34.0, midRailCustomThk: 3.2, midRailUseCustom: false, hasMidRail: true,
  postSpec: '32A', postCustomOD: 42.7, postCustomThk: 3.5, postUseCustom: false,
  basePlateWidth: 100, basePlateLength: 100, basePlateThickness: 6,
  toeboardWidth: 100, toeboardThickness: 4, hasToeBoard: true,
};

const defaultLadder: LadderDetail = {
  pipeStandard: 'KS', ladderHeight: 3000, ladderWidth: 400,
  sideRailSpec: '32A', sideRailCustomOD: 42.7, sideRailCustomThk: 3.5, sideRailUseCustom: false,
  rungSpec: '25A', rungCustomOD: 34.0, rungCustomThk: 3.2, rungUseCustom: false,
  rungSpacing: 300, rungCount: 10, rungCountManual: false,
  hasBackStop: false, backStopStartHeight: 2000, backStopSpec: '25A', backStopCustomOD: 34.0, backStopCustomThk: 3.2, backStopUseCustom: false,
  bracketPlateWidth: 80, bracketPlateLength: 120, bracketPlateThickness: 6, bracketCount: 2,
};

function getPipeList(standard: 'KS' | 'ANSI') {
  return standard === 'KS' ? KS_SGP_PIPES : ANSI_SCH40_PIPES;
}

function findPipe(standard: 'KS' | 'ANSI', nominalSize: string) {
  return getPipeList(standard).find(p => p.nominalSize === nominalSize);
}

function pipeWeightPerMm(od: number, thk: number, material: MaterialType): number {
  return calculatePipeWeight(od, thk, 1, material); // weight per 1mm
}

export function HandrailCalculator() {
  const { toast } = useToast();
  const [material, setMaterial] = useState<MaterialType>('steel');
  const [activeTab, setActiveTab] = useState('handrail');

  // Handrail state
  const [hr, setHr] = useState<HandrailDetail>({ ...defaultHandrail });
  // Ladder state
  const [ld, setLd] = useState<LadderDetail>({ ...defaultLadder });

  // Manual component mode state
  const [manualComponents, setManualComponents] = useState<ComponentItem[]>([]);
  const [manualPipeStandard, setManualPipeStandard] = useState<'KS' | 'ANSI'>('KS');
  const [manualType, setManualType] = useState<string>('pipe');
  const [manualSpec, setManualSpec] = useState('');
  const [manualLength, setManualLength] = useState(1000);
  const [manualWidth, setManualWidth] = useState(100);
  const [manualHeight, setManualHeight] = useState(100);
  const [manualQty, setManualQty] = useState(1);
  const [manualName, setManualName] = useState('');

  // =============== Handrail circumference ===============
  const hrCircumference = hr.tankDiameter > 0 ? PI * hr.tankDiameter : 0;
  const hrTotalLength = hr.tankDiameter > 0 ? hrCircumference : hr.straightLength;

  // Auto post count
  const hrAutoPostCount = hr.tankDiameter > 0
    ? Math.max(3, Math.round(hrCircumference / hr.postSpacing))
    : Math.max(2, Math.floor(hrTotalLength / hr.postSpacing) + 1);

  const hrEffectivePostCount = hr.postCountManual ? hr.postCount : hrAutoPostCount;

  // =============== Handrail results ===============
  const hrResults = useMemo((): ResultItem[] => {
    const items: ResultItem[] = [];
    const pipes = getPipeList(hr.pipeStandard);

    // Helper to get OD/Thk
    const getPipeODThk = (spec: string, useCustom: boolean, customOD: number, customThk: number) => {
      if (useCustom) return { od: customOD, thk: customThk };
      const p = pipes.find(pp => pp.nominalSize === spec);
      return p ? { od: p.outerDiameter, thk: p.thickness } : { od: 0, thk: 0 };
    };

    // Top Rail
    const topRail = getPipeODThk(hr.topRailSpec, hr.topRailUseCustom, hr.topRailCustomOD, hr.topRailCustomThk);
    if (topRail.od > 0) {
      const len = hrTotalLength;
      const w = calculatePipeWeight(topRail.od, topRail.thk, len, material);
      items.push({ name: '탑레일 (Top Rail)', spec: hr.topRailUseCustom ? `Ø${topRail.od}×t${topRail.thk}` : `${hr.topRailSpec} (${hr.pipeStandard})`, length: len, qty: 1, unitWeight: w, totalWeight: w });
    }

    // Mid Rail
    if (hr.hasMidRail) {
      const midRail = getPipeODThk(hr.midRailSpec, hr.midRailUseCustom, hr.midRailCustomOD, hr.midRailCustomThk);
      if (midRail.od > 0) {
        const len = hrTotalLength;
        const w = calculatePipeWeight(midRail.od, midRail.thk, len, material);
        items.push({ name: '중간레일 (Mid Rail)', spec: hr.midRailUseCustom ? `Ø${midRail.od}×t${midRail.thk}` : `${hr.midRailSpec} (${hr.pipeStandard})`, length: len, qty: 1, unitWeight: w, totalWeight: w });
      }
    }

    // Posts
    const post = getPipeODThk(hr.postSpec, hr.postUseCustom, hr.postCustomOD, hr.postCustomThk);
    if (post.od > 0 && hrEffectivePostCount > 0) {
      const len = hr.handrailHeight;
      const w = calculatePipeWeight(post.od, post.thk, len, material);
      items.push({ name: '포스트 (Post)', spec: hr.postUseCustom ? `Ø${post.od}×t${post.thk}` : `${hr.postSpec} (${hr.pipeStandard})`, length: len, qty: hrEffectivePostCount, unitWeight: w, totalWeight: w * hrEffectivePostCount });
    }

    // Base plates
    if (hr.basePlateWidth > 0 && hr.basePlateLength > 0 && hr.basePlateThickness > 0 && hrEffectivePostCount > 0) {
      const w = calculatePlateWeight(hr.basePlateWidth, hr.basePlateLength, hr.basePlateThickness, material);
      items.push({ name: '베이스 플레이트', spec: `${hr.basePlateWidth}×${hr.basePlateLength}×t${hr.basePlateThickness}`, length: 0, qty: hrEffectivePostCount, unitWeight: w, totalWeight: w * hrEffectivePostCount });
    }

    // Toeboard (평철/킥플레이트)
    if (hr.hasToeBoard && hr.toeboardWidth > 0 && hr.toeboardThickness > 0) {
      const len = hrTotalLength;
      const w = calculateFlatbarWeight(hr.toeboardWidth, hr.toeboardThickness, len, material);
      items.push({ name: '토보드/킥플레이트 (평철)', spec: `${hr.toeboardWidth}W × t${hr.toeboardThickness}`, length: len, qty: 1, unitWeight: w, totalWeight: w });
    }

    return items;
  }, [hr, hrTotalLength, hrEffectivePostCount, material]);

  const hrTotalWeight = hrResults.reduce((s, r) => s + r.totalWeight, 0);

  // =============== Ladder results ===============
  const ldAutoRungCount = Math.max(1, Math.floor(ld.ladderHeight / ld.rungSpacing));
  const ldEffectiveRungCount = ld.rungCountManual ? ld.rungCount : ldAutoRungCount;

  const ldResults = useMemo((): ResultItem[] => {
    const items: ResultItem[] = [];
    const pipes = getPipeList(ld.pipeStandard);

    const getPipeODThk = (spec: string, useCustom: boolean, customOD: number, customThk: number) => {
      if (useCustom) return { od: customOD, thk: customThk };
      const p = pipes.find(pp => pp.nominalSize === spec);
      return p ? { od: p.outerDiameter, thk: p.thickness } : { od: 0, thk: 0 };
    };

    // Side Rails (2ea)
    const sideRail = getPipeODThk(ld.sideRailSpec, ld.sideRailUseCustom, ld.sideRailCustomOD, ld.sideRailCustomThk);
    if (sideRail.od > 0) {
      const w = calculatePipeWeight(sideRail.od, sideRail.thk, ld.ladderHeight, material);
      items.push({ name: '사이드레일 (Side Rail)', spec: ld.sideRailUseCustom ? `Ø${sideRail.od}×t${sideRail.thk}` : `${ld.sideRailSpec} (${ld.pipeStandard})`, length: ld.ladderHeight, qty: 2, unitWeight: w, totalWeight: w * 2 });
    }

    // Rungs
    const rung = getPipeODThk(ld.rungSpec, ld.rungUseCustom, ld.rungCustomOD, ld.rungCustomThk);
    if (rung.od > 0 && ldEffectiveRungCount > 0) {
      const w = calculatePipeWeight(rung.od, rung.thk, ld.ladderWidth, material);
      items.push({ name: '발판 (Rung)', spec: ld.rungUseCustom ? `Ø${rung.od}×t${rung.thk}` : `${ld.rungSpec} (${ld.pipeStandard})`, length: ld.ladderWidth, qty: ldEffectiveRungCount, unitWeight: w, totalWeight: w * ldEffectiveRungCount });
    }

    // Back stop hoops (if applicable)
    if (ld.hasBackStop && ld.ladderHeight > ld.backStopStartHeight) {
      const bs = getPipeODThk(ld.backStopSpec, ld.backStopUseCustom, ld.backStopCustomOD, ld.backStopCustomThk);
      if (bs.od > 0) {
        const hoopCirc = PI * (ld.ladderWidth + 200); // approx hoop circumference (semi-circle + sides)
        const hoopCount = Math.max(1, Math.floor((ld.ladderHeight - ld.backStopStartHeight) / 600));
        const w = calculatePipeWeight(bs.od, bs.thk, hoopCirc, material);
        items.push({ name: '등받이 (Back Stop)', spec: ld.backStopUseCustom ? `Ø${bs.od}×t${bs.thk}` : `${ld.backStopSpec} (${ld.pipeStandard})`, length: Math.round(hoopCirc), qty: hoopCount, unitWeight: w, totalWeight: w * hoopCount });
      }
    }

    // Bracket plates
    if (ld.bracketPlateWidth > 0 && ld.bracketPlateLength > 0 && ld.bracketPlateThickness > 0 && ld.bracketCount > 0) {
      const w = calculatePlateWeight(ld.bracketPlateWidth, ld.bracketPlateLength, ld.bracketPlateThickness, material);
      items.push({ name: '고정 브래킷 플레이트', spec: `${ld.bracketPlateWidth}×${ld.bracketPlateLength}×t${ld.bracketPlateThickness}`, length: 0, qty: ld.bracketCount, unitWeight: w, totalWeight: w * ld.bracketCount });
    }

    return items;
  }, [ld, ldEffectiveRungCount, material]);

  const ldTotalWeight = ldResults.reduce((s, r) => s + r.totalWeight, 0);

  // =============== Manual mode ===============
  const manualTotalWeight = manualComponents.reduce((s, c) => s + c.totalWeight, 0);

  const addManualComponent = () => {
    if (!manualSpec) { toast({ title: '규격을 선택해주세요', variant: 'destructive' }); return; }
    let unitWeight = 0;
    const pipeList = manualPipeStandard === 'KS' ? KS_SGP_PIPES : ANSI_SCH40_PIPES;

    if (manualType === 'pipe') {
      const p = pipeList.find(pp => pp.nominalSize === manualSpec);
      if (p) unitWeight = calculatePipeWeight(p.outerDiameter, p.thickness, manualLength, material);
    } else if (manualType === 'flatbar') {
      const parts = manualSpec.split('x').map(Number);
      if (parts.length === 2) unitWeight = calculateFlatbarWeight(parts[0], parts[1], manualLength, material);
    } else if (manualType === 'plate') {
      unitWeight = calculatePlateWeight(manualWidth, manualHeight, parseFloat(manualSpec) || 6, material);
    }

    const comp: ComponentItem = {
      id: crypto.randomUUID(), type: manualType as any,
      name: manualName || `${manualType} ${manualSpec}`,
      spec: `${manualSpec} (${manualPipeStandard})`,
      length: manualType !== 'plate' ? manualLength : undefined,
      width: manualType === 'plate' ? manualWidth : undefined,
      height: manualType === 'plate' ? manualHeight : undefined,
      quantity: manualQty, unitWeight, totalWeight: unitWeight * manualQty,
    };
    setManualComponents(prev => [...prev, comp]);
    setManualSpec(''); setManualName(''); setManualQty(1);
  };

  // =============== Export ===============
  const exportResults = (results: ResultItem[], title: string) => {
    const headers = ['부재명', '규격', '길이(mm)', '수량', '단위무게(kg)', '총무게(kg)'];
    const rows = results.map(r => [r.name, r.spec, r.length || '-', r.qty, r.unitWeight.toFixed(2), r.totalWeight.toFixed(2)]);
    const total = results.reduce((s, r) => s + r.totalWeight, 0);
    rows.push(['', '', '', '', '합계', total.toFixed(2)]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title}_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  // =============== Pipe Spec Selector Component ===============
  const PipeSpecSelector = ({ standard, spec, onSpecChange, useCustom, onCustomToggle, customOD, customThk, onCustomODChange, onCustomThkChange, label }: {
    standard: 'KS' | 'ANSI'; spec: string; onSpecChange: (v: string) => void;
    useCustom: boolean; onCustomToggle: () => void;
    customOD: number; customThk: number; onCustomODChange: (v: number) => void; onCustomThkChange: (v: number) => void;
    label: string;
  }) => {
    const pipes = getPipeList(standard);
    const selectedPipe = pipes.find(p => p.nominalSize === spec);
    return (
      <div className="space-y-2 p-3 border border-border rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">{label}</Label>
          <Button variant="ghost" size="sm" onClick={onCustomToggle} className="text-xs h-6">
            {useCustom ? '규격 선택' : '직접 입력'}
          </Button>
        </div>
        {useCustom ? (
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">외경 (mm)</Label><Input type="number" value={customOD} onChange={e => onCustomODChange(parseFloat(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">두께 (mm)</Label><Input type="number" value={customThk} onChange={e => onCustomThkChange(parseFloat(e.target.value) || 0)} /></div>
          </div>
        ) : (
          <div>
            <Select value={spec} onValueChange={onSpecChange}>
              <SelectTrigger><SelectValue placeholder="규격 선택" /></SelectTrigger>
              <SelectContent>{pipes.map(p => <SelectItem key={p.nominalSize} value={p.nominalSize}>{p.nominalSize} (Ø{p.outerDiameter}×t{p.thickness}) - {p.weightPerMeter} kg/m</SelectItem>)}</SelectContent>
            </Select>
            {selectedPipe && <p className="text-xs text-muted-foreground mt-1">외경 {selectedPipe.outerDiameter}mm, 두께 {selectedPipe.thickness}mm, {selectedPipe.weightPerMeter} kg/m</p>}
          </div>
        )}
      </div>
    );
  };

  // =============== Results Table Component ===============
  const ResultsTable = ({ results, totalWeight, title, onExport }: { results: ResultItem[]; totalWeight: number; title: string; onExport: () => void }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">📊 {title} 산출 결과</CardTitle>
        <Button variant="outline" size="sm" onClick={onExport} disabled={results.length === 0}><Download className="w-4 h-4 mr-2" />CSV 내보내기</Button>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">치수를 입력하면 자동 계산됩니다</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>부재명</TableHead><TableHead>규격</TableHead>
                  <TableHead className="text-right">길이 (mm)</TableHead><TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">단위무게 (kg)</TableHead><TableHead className="text-right">총무게 (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell><Badge variant="outline">{r.spec}</Badge></TableCell>
                    <TableCell className="text-right">{r.length > 0 ? r.length.toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right">{r.qty}</TableCell>
                    <TableCell className="text-right">{r.unitWeight.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{r.totalWeight.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={5} className="text-right text-base">합계</TableCell>
                  <TableCell className="text-right text-lg text-primary">{totalWeight.toFixed(2)} kg</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />재질 선택</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(MATERIAL_DENSITIES) as MaterialType[]).map((mat) => (
              <Button key={mat} variant={material === mat ? 'default' : 'outline'} onClick={() => setMaterial(mat)} className="h-auto py-3 px-4">
                <div className="text-center"><div className="font-medium text-sm">{MATERIAL_LABELS[mat]}</div><div className="text-xs opacity-70">{MATERIAL_DENSITIES[mat]} g/cm³</div></div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="handrail"><Fence className="w-4 h-4 mr-2" />핸드레일</TabsTrigger>
          <TabsTrigger value="ladder"><LandPlot className="w-4 h-4 mr-2" />사다리</TabsTrigger>
          <TabsTrigger value="manual"><Calculator className="w-4 h-4 mr-2" />직접 입력</TabsTrigger>
        </TabsList>

        {/* ============ HANDRAIL TAB ============ */}
        <TabsContent value="handrail" className="space-y-4">
          {/* 기본 치수 */}
          <Card>
            <CardHeader><CardTitle className="text-lg">📐 기본 치수</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* 규격 표준 선택 */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant={hr.pipeStandard === 'KS' ? 'default' : 'outline'} onClick={() => setHr(p => ({ ...p, pipeStandard: 'KS', topRailSpec: '32A', midRailSpec: '25A', postSpec: '32A' }))}>
                  KS/JIS (A 사이즈)
                </Button>
                <Button variant={hr.pipeStandard === 'ANSI' ? 'default' : 'outline'} onClick={() => setHr(p => ({ ...p, pipeStandard: 'ANSI', topRailSpec: '1-1/4"', midRailSpec: '1"', postSpec: '1-1/4"' }))}>
                  ANSI (인치)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>탱크 직경 (mm) — 0이면 직선 핸드레일</Label>
                  <Input type="number" value={hr.tankDiameter} onChange={e => setHr(p => ({ ...p, tankDiameter: parseFloat(e.target.value) || 0 }))} placeholder="0 = 직선" />
                  {hr.tankDiameter > 0 && (
                    <p className="text-sm text-primary font-medium">
                      → 둘레: {hrCircumference.toFixed(0)} mm ({(hrCircumference / 1000).toFixed(2)} m)
                    </p>
                  )}
                </div>
                {hr.tankDiameter === 0 && (
                  <div className="space-y-2">
                    <Label>직선 길이 (mm)</Label>
                    <Input type="number" value={hr.straightLength} onChange={e => setHr(p => ({ ...p, straightLength: parseFloat(e.target.value) || 0 }))} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>핸드레일 높이 (mm)</Label>
                  <Input type="number" value={hr.handrailHeight} onChange={e => setHr(p => ({ ...p, handrailHeight: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>포스트 간격 (mm)</Label>
                  <Input type="number" value={hr.postSpacing} onChange={e => setHr(p => ({ ...p, postSpacing: parseFloat(e.target.value) || 1500 }))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>포스트 수량</Label>
                    <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setHr(p => ({ ...p, postCountManual: !p.postCountManual, postCount: hrAutoPostCount }))}>
                      {hr.postCountManual ? '자동 계산' : '직접 입력'}
                    </Button>
                  </div>
                  <Input type="number" min={1} value={hrEffectivePostCount} disabled={!hr.postCountManual}
                    onChange={e => setHr(p => ({ ...p, postCount: parseInt(e.target.value) || 1 }))} />
                  {!hr.postCountManual && <p className="text-xs text-muted-foreground">자동: {hrAutoPostCount}개</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 부재별 규격 */}
          <Card>
            <CardHeader><CardTitle className="text-lg">🔧 부재별 규격</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PipeSpecSelector label="탑레일 (Top Rail)" standard={hr.pipeStandard} spec={hr.topRailSpec}
                  onSpecChange={v => setHr(p => ({ ...p, topRailSpec: v }))} useCustom={hr.topRailUseCustom}
                  onCustomToggle={() => setHr(p => ({ ...p, topRailUseCustom: !p.topRailUseCustom }))}
                  customOD={hr.topRailCustomOD} customThk={hr.topRailCustomThk}
                  onCustomODChange={v => setHr(p => ({ ...p, topRailCustomOD: v }))} onCustomThkChange={v => setHr(p => ({ ...p, topRailCustomThk: v }))} />

                <PipeSpecSelector label="포스트 (Post)" standard={hr.pipeStandard} spec={hr.postSpec}
                  onSpecChange={v => setHr(p => ({ ...p, postSpec: v }))} useCustom={hr.postUseCustom}
                  onCustomToggle={() => setHr(p => ({ ...p, postUseCustom: !p.postUseCustom }))}
                  customOD={hr.postCustomOD} customThk={hr.postCustomThk}
                  onCustomODChange={v => setHr(p => ({ ...p, postCustomOD: v }))} onCustomThkChange={v => setHr(p => ({ ...p, postCustomThk: v }))} />
              </div>

              {/* Mid Rail toggle */}
              <div className="flex items-center gap-3">
                <Button variant={hr.hasMidRail ? 'default' : 'outline'} size="sm" onClick={() => setHr(p => ({ ...p, hasMidRail: !p.hasMidRail }))}>
                  {hr.hasMidRail ? '✓ 중간레일 있음' : '중간레일 없음'}
                </Button>
              </div>
              {hr.hasMidRail && (
                <PipeSpecSelector label="중간레일 (Mid Rail)" standard={hr.pipeStandard} spec={hr.midRailSpec}
                  onSpecChange={v => setHr(p => ({ ...p, midRailSpec: v }))} useCustom={hr.midRailUseCustom}
                  onCustomToggle={() => setHr(p => ({ ...p, midRailUseCustom: !p.midRailUseCustom }))}
                  customOD={hr.midRailCustomOD} customThk={hr.midRailCustomThk}
                  onCustomODChange={v => setHr(p => ({ ...p, midRailCustomOD: v }))} onCustomThkChange={v => setHr(p => ({ ...p, midRailCustomThk: v }))} />
              )}

              {/* 하부 평철 */}
              <div className="flex items-center gap-3">
                <Button variant={hr.hasToeBoard ? 'default' : 'outline'} size="sm" onClick={() => setHr(p => ({ ...p, hasToeBoard: !p.hasToeBoard }))}>
                  {hr.hasToeBoard ? '✓ 토보드(평철) 있음' : '토보드(평철) 없음'}
                </Button>
              </div>
              {hr.hasToeBoard && (
                <div className="p-3 border border-border rounded-lg space-y-2">
                  <Label className="font-semibold">토보드/킥플레이트 (평철)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">폭/높이 (mm)</Label><Input type="number" value={hr.toeboardWidth} onChange={e => setHr(p => ({ ...p, toeboardWidth: parseFloat(e.target.value) || 0 }))} /></div>
                    <div><Label className="text-xs">두께 (mm)</Label><Input type="number" value={hr.toeboardThickness} onChange={e => setHr(p => ({ ...p, toeboardThickness: parseFloat(e.target.value) || 0 }))} /></div>
                  </div>
                </div>
              )}

              {/* 베이스 플레이트 */}
              <div className="p-3 border border-border rounded-lg space-y-2">
                <Label className="font-semibold">베이스 플레이트 (포스트 하부)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">폭 (mm)</Label><Input type="number" value={hr.basePlateWidth} onChange={e => setHr(p => ({ ...p, basePlateWidth: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label className="text-xs">길이 (mm)</Label><Input type="number" value={hr.basePlateLength} onChange={e => setHr(p => ({ ...p, basePlateLength: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label className="text-xs">두께 (mm)</Label><Input type="number" value={hr.basePlateThickness} onChange={e => setHr(p => ({ ...p, basePlateThickness: parseFloat(e.target.value) || 0 }))} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결과 */}
          <ResultsTable results={hrResults} totalWeight={hrTotalWeight} title="핸드레일" onExport={() => exportResults(hrResults, '핸드레일_무게')} />
        </TabsContent>

        {/* ============ LADDER TAB ============ */}
        <TabsContent value="ladder" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">📐 기본 치수</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant={ld.pipeStandard === 'KS' ? 'default' : 'outline'} onClick={() => setLd(p => ({ ...p, pipeStandard: 'KS', sideRailSpec: '32A', rungSpec: '25A', backStopSpec: '25A' }))}>
                  KS/JIS (A 사이즈)
                </Button>
                <Button variant={ld.pipeStandard === 'ANSI' ? 'default' : 'outline'} onClick={() => setLd(p => ({ ...p, pipeStandard: 'ANSI', sideRailSpec: '1-1/4"', rungSpec: '1"', backStopSpec: '1"' }))}>
                  ANSI (인치)
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>사다리 높이 (mm)</Label>
                  <Input type="number" value={ld.ladderHeight} onChange={e => setLd(p => ({ ...p, ladderHeight: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>사다리 폭 (mm)</Label>
                  <Input type="number" value={ld.ladderWidth} onChange={e => setLd(p => ({ ...p, ladderWidth: parseFloat(e.target.value) || 400 }))} />
                </div>
                <div className="space-y-2">
                  <Label>발판 간격 (mm)</Label>
                  <Input type="number" value={ld.rungSpacing} onChange={e => setLd(p => ({ ...p, rungSpacing: parseFloat(e.target.value) || 300 }))} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>발판 수량</Label>
                  <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setLd(p => ({ ...p, rungCountManual: !p.rungCountManual, rungCount: ldAutoRungCount }))}>
                    {ld.rungCountManual ? '자동 계산' : '직접 입력'}
                  </Button>
                </div>
                <Input type="number" min={1} value={ldEffectiveRungCount} disabled={!ld.rungCountManual}
                  onChange={e => setLd(p => ({ ...p, rungCount: parseInt(e.target.value) || 1 }))} />
                {!ld.rungCountManual && <p className="text-xs text-muted-foreground">자동: {ldAutoRungCount}개 (높이 ÷ 간격)</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">🔧 부재별 규격</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PipeSpecSelector label="사이드레일 (Side Rail)" standard={ld.pipeStandard} spec={ld.sideRailSpec}
                  onSpecChange={v => setLd(p => ({ ...p, sideRailSpec: v }))} useCustom={ld.sideRailUseCustom}
                  onCustomToggle={() => setLd(p => ({ ...p, sideRailUseCustom: !p.sideRailUseCustom }))}
                  customOD={ld.sideRailCustomOD} customThk={ld.sideRailCustomThk}
                  onCustomODChange={v => setLd(p => ({ ...p, sideRailCustomOD: v }))} onCustomThkChange={v => setLd(p => ({ ...p, sideRailCustomThk: v }))} />

                <PipeSpecSelector label="발판 (Rung)" standard={ld.pipeStandard} spec={ld.rungSpec}
                  onSpecChange={v => setLd(p => ({ ...p, rungSpec: v }))} useCustom={ld.rungUseCustom}
                  onCustomToggle={() => setLd(p => ({ ...p, rungUseCustom: !p.rungUseCustom }))}
                  customOD={ld.rungCustomOD} customThk={ld.rungCustomThk}
                  onCustomODChange={v => setLd(p => ({ ...p, rungCustomOD: v }))} onCustomThkChange={v => setLd(p => ({ ...p, rungCustomThk: v }))} />
              </div>

              {/* 등받이 */}
              <div className="flex items-center gap-3">
                <Button variant={ld.hasBackStop ? 'default' : 'outline'} size="sm" onClick={() => setLd(p => ({ ...p, hasBackStop: !p.hasBackStop }))}>
                  {ld.hasBackStop ? '✓ 등받이(Back Stop) 있음' : '등받이(Back Stop) 없음'}
                </Button>
              </div>
              {ld.hasBackStop && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">등받이 시작 높이 (mm)</Label>
                    <Input type="number" value={ld.backStopStartHeight} onChange={e => setLd(p => ({ ...p, backStopStartHeight: parseFloat(e.target.value) || 2000 }))} />
                    <p className="text-xs text-muted-foreground">KOSHA 기준: 2,000mm 이상 시 등받이 설치</p>
                  </div>
                  <PipeSpecSelector label="등받이 파이프" standard={ld.pipeStandard} spec={ld.backStopSpec}
                    onSpecChange={v => setLd(p => ({ ...p, backStopSpec: v }))} useCustom={ld.backStopUseCustom}
                    onCustomToggle={() => setLd(p => ({ ...p, backStopUseCustom: !p.backStopUseCustom }))}
                    customOD={ld.backStopCustomOD} customThk={ld.backStopCustomThk}
                    onCustomODChange={v => setLd(p => ({ ...p, backStopCustomOD: v }))} onCustomThkChange={v => setLd(p => ({ ...p, backStopCustomThk: v }))} />
                </div>
              )}

              {/* 고정 브래킷 */}
              <div className="p-3 border border-border rounded-lg space-y-2">
                <Label className="font-semibold">고정 브래킷 플레이트</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label className="text-xs">폭 (mm)</Label><Input type="number" value={ld.bracketPlateWidth} onChange={e => setLd(p => ({ ...p, bracketPlateWidth: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label className="text-xs">길이 (mm)</Label><Input type="number" value={ld.bracketPlateLength} onChange={e => setLd(p => ({ ...p, bracketPlateLength: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label className="text-xs">두께 (mm)</Label><Input type="number" value={ld.bracketPlateThickness} onChange={e => setLd(p => ({ ...p, bracketPlateThickness: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label className="text-xs">수량</Label><Input type="number" min={1} value={ld.bracketCount} onChange={e => setLd(p => ({ ...p, bracketCount: parseInt(e.target.value) || 1 }))} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ResultsTable results={ldResults} totalWeight={ldTotalWeight} title="사다리" onExport={() => exportResults(ldResults, '사다리_무게')} />
        </TabsContent>

        {/* ============ MANUAL TAB ============ */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>부재 직접 추가</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Button variant={manualPipeStandard === 'KS' ? 'default' : 'outline'} onClick={() => { setManualPipeStandard('KS'); setManualSpec(''); }}>KS/JIS</Button>
                <Button variant={manualPipeStandard === 'ANSI' ? 'default' : 'outline'} onClick={() => { setManualPipeStandard('ANSI'); setManualSpec(''); }}>ANSI</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>부재 종류</Label>
                  <Select value={manualType} onValueChange={v => { setManualType(v); setManualSpec(''); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pipe">파이프</SelectItem>
                      <SelectItem value="flatbar">평철</SelectItem>
                      <SelectItem value="plate">플레이트</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>규격</Label>
                  <Select value={manualSpec} onValueChange={setManualSpec}>
                    <SelectTrigger><SelectValue placeholder="규격 선택" /></SelectTrigger>
                    <SelectContent>
                      {manualType === 'pipe' && getPipeList(manualPipeStandard).map(p => <SelectItem key={p.nominalSize} value={p.nominalSize}>{p.nominalSize} ({p.weightPerMeter} kg/m)</SelectItem>)}
                      {manualType === 'flatbar' && FLATBAR_SPECS.map(f => <SelectItem key={`${f.width}x${f.thickness}`} value={`${f.width}x${f.thickness}`}>{f.width}×{f.thickness} ({f.weightPerMeter} kg/m)</SelectItem>)}
                      {manualType === 'plate' && PLATE_SPECS.map(p => <SelectItem key={`${p.thickness}`} value={`${p.thickness}`}>t={p.thickness}mm ({p.weightPerSquareMeter} kg/m²)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>비고</Label>
                  <Input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="예: 상부레일" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {manualType !== 'plate' && <div className="space-y-2"><Label>길이 (mm)</Label><Input type="number" value={manualLength} onChange={e => setManualLength(parseFloat(e.target.value) || 0)} /></div>}
                {manualType === 'plate' && <>
                  <div className="space-y-2"><Label>폭 (mm)</Label><Input type="number" value={manualWidth} onChange={e => setManualWidth(parseFloat(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>높이 (mm)</Label><Input type="number" value={manualHeight} onChange={e => setManualHeight(parseFloat(e.target.value) || 0)} /></div>
                </>}
                <div className="space-y-2"><Label>수량</Label><Input type="number" min={1} value={manualQty} onChange={e => setManualQty(parseInt(e.target.value) || 1)} /></div>
              </div>
              <Button onClick={addManualComponent}><Plus className="w-4 h-4 mr-2" />부재 추가</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>수동 입력 결과</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setManualComponents([])}>초기화</Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const results = manualComponents.map(c => ({ name: c.name, spec: c.spec, length: c.length || 0, qty: c.quantity, unitWeight: c.unitWeight, totalWeight: c.totalWeight }));
                  exportResults(results, '수동입력_무게');
                }} disabled={manualComponents.length === 0}><Download className="w-4 h-4 mr-2" />CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
              {manualComponents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">추가된 부재가 없습니다</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>부재명</TableHead><TableHead>규격</TableHead>
                        <TableHead className="text-right">길이/치수</TableHead><TableHead className="text-right">수량</TableHead>
                        <TableHead className="text-right">단위무게 (kg)</TableHead><TableHead className="text-right">총무게 (kg)</TableHead><TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualComponents.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>{c.name}</TableCell><TableCell><Badge variant="outline">{c.spec}</Badge></TableCell>
                          <TableCell className="text-right">{c.length ? `${c.length}mm` : `${c.width}×${c.height}mm`}</TableCell>
                          <TableCell className="text-right">{c.quantity}</TableCell>
                          <TableCell className="text-right">{c.unitWeight.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">{c.totalWeight.toFixed(2)}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => setManualComponents(prev => prev.filter(x => x.id !== c.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={5} className="text-right">합계</TableCell>
                        <TableCell className="text-right text-lg text-primary">{manualTotalWeight.toFixed(2)} kg</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HandrailCalculator;
