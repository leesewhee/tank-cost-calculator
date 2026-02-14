import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, FileText, Calculator, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  MaterialType, MATERIAL_DENSITIES, KS_SGP_PIPES, ANSI_SCH40_PIPES,
  FLATBAR_SPECS, ROUNDBAR_SPECS, ANGLE_SPECS, CHANNEL_SPECS, PLATE_SPECS, CHECKERPLATE_SPECS,
  ComponentItem, calculatePipeWeight, calculateFlatbarWeight, calculateRoundbarWeight,
  calculateAngleWeight, calculateChannelWeight, calculatePlateWeight,
} from '@/lib/handrailCalculator';

type ComponentType = 'pipe' | 'flatbar' | 'roundbar' | 'angle' | 'channel' | 'plate' | 'checkerplate';

const MATERIAL_LABELS: Record<MaterialType, string> = {
  steel: '일반 철강 (SS400)', stainless304: '스테인리스 304', stainless316: '스테인리스 316', aluminum: '알루미늄', galvanized: '용융아연도금',
};

const COMPONENT_LABELS: Record<ComponentType, string> = {
  pipe: '파이프', flatbar: '플랫바', roundbar: '환봉', angle: '앵글', channel: '채널', plate: '플레이트', checkerplate: '체커플레이트',
};

export function HandrailCalculator() {
  const { toast } = useToast();
  const [material, setMaterial] = useState<MaterialType>('steel');
  const [pipeStandard, setPipeStandard] = useState<'KS' | 'ANSI'>('KS');
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [isAnalyzing] = useState(false);

  const [newComponent, setNewComponent] = useState({
    type: 'pipe' as ComponentType, spec: '', customSpec: false, length: 1000, width: 100, height: 100, thickness: 6, diameter: 25, quantity: 1, name: '', note: '',
  });

  const getPipeSpecs = () => pipeStandard === 'KS' ? KS_SGP_PIPES : ANSI_SCH40_PIPES;

  const getSpecOptions = (type: ComponentType) => {
    switch (type) {
      case 'pipe': return getPipeSpecs().map(p => ({ value: p.nominalSize, label: p.nominalSize }));
      case 'flatbar': return FLATBAR_SPECS.map(f => ({ value: `${f.width}x${f.thickness}`, label: `${f.width} × ${f.thickness}` }));
      case 'roundbar': return ROUNDBAR_SPECS.map(r => ({ value: `${r.diameter}`, label: `Ø${r.diameter}` }));
      case 'angle': return ANGLE_SPECS.map(a => ({ value: a.size, label: a.size }));
      case 'channel': return CHANNEL_SPECS.map(c => ({ value: c.size, label: c.size }));
      case 'plate': return PLATE_SPECS.map(p => ({ value: `${p.thickness}`, label: `t=${p.thickness}mm` }));
      case 'checkerplate': return CHECKERPLATE_SPECS.map(p => ({ value: `${p.thickness}`, label: `t=${p.thickness}mm` }));
      default: return [];
    }
  };

  const calculateComponentWeight = useCallback((comp: typeof newComponent): { unitWeight: number; totalWeight: number } => {
    let unitWeight = 0;
    switch (comp.type) {
      case 'pipe': {
        const spec = getPipeSpecs().find(p => p.nominalSize === comp.spec);
        if (spec) unitWeight = calculatePipeWeight(spec.outerDiameter, spec.thickness, comp.length, material);
        else if (comp.customSpec) unitWeight = calculatePipeWeight(comp.diameter, comp.thickness, comp.length, material);
        break;
      }
      case 'flatbar': {
        const parts = comp.spec.split('x').map(Number);
        if (parts.length === 2) unitWeight = calculateFlatbarWeight(parts[0], parts[1], comp.length, material);
        else if (comp.customSpec) unitWeight = calculateFlatbarWeight(comp.width, comp.thickness, comp.length, material);
        break;
      }
      case 'roundbar': unitWeight = calculateRoundbarWeight(parseFloat(comp.spec) || comp.diameter, comp.length, material); break;
      case 'angle': { const s = ANGLE_SPECS.find(a => a.size === comp.spec); if (s) unitWeight = calculateAngleWeight(s.legWidth, s.thickness, comp.length, material); break; }
      case 'channel': { const s = CHANNEL_SPECS.find(c => c.size === comp.spec); if (s) unitWeight = calculateChannelWeight(s.height, s.width, s.thickness, comp.length, material); break; }
      case 'plate': case 'checkerplate': unitWeight = calculatePlateWeight(comp.width, comp.height, parseFloat(comp.spec) || comp.thickness, material); break;
    }
    return { unitWeight, totalWeight: unitWeight * comp.quantity };
  }, [material, pipeStandard]);

  const addComponent = () => {
    if (!newComponent.spec && !newComponent.customSpec) { toast({ title: '규격을 선택해주세요', variant: 'destructive' }); return; }
    const { unitWeight, totalWeight } = calculateComponentWeight(newComponent);
    const component: ComponentItem = {
      id: crypto.randomUUID(), type: newComponent.type,
      name: newComponent.name || `${COMPONENT_LABELS[newComponent.type]} ${newComponent.spec}`,
      spec: newComponent.spec || (newComponent.customSpec ? '직접 입력' : ''),
      length: newComponent.type !== 'plate' && newComponent.type !== 'checkerplate' ? newComponent.length : undefined,
      width: newComponent.type === 'plate' || newComponent.type === 'checkerplate' ? newComponent.width : undefined,
      height: newComponent.type === 'plate' || newComponent.type === 'checkerplate' ? newComponent.height : undefined,
      quantity: newComponent.quantity, unitWeight, totalWeight,
    };
    setComponents(prev => [...prev, component]);
    setNewComponent(prev => ({ ...prev, spec: '', customSpec: false, quantity: 1, name: '', note: '' }));
  };

  const totalWeight = components.reduce((sum, c) => sum + c.totalWeight, 0);

  const exportToExcel = () => {
    const headers = ['부재 종류', '규격', '길이', '폭', '높이', '수량', '단위 무게 (kg)', '총 무게 (kg)'];
    const rows = components.map(c => [COMPONENT_LABELS[c.type], c.spec, c.length || '-', c.width || '-', c.height || '-', c.quantity, c.unitWeight.toFixed(2), c.totalWeight.toFixed(2)]);
    rows.push(['', '', '', '', '', '합계', '', totalWeight.toFixed(2)]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `handrail_weight_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />재질</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(MATERIAL_DENSITIES) as MaterialType[]).map((mat) => (
              <Button key={mat} variant={material === mat ? 'default' : 'outline'} onClick={() => setMaterial(mat)} className="h-auto py-3 px-4">
                <div className="text-center"><div className="font-medium">{MATERIAL_LABELS[mat]}</div><div className="text-xs opacity-70">{MATERIAL_DENSITIES[mat]} g/cm³</div></div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual"><Calculator className="w-4 h-4 mr-2" />직접 입력</TabsTrigger>
          <TabsTrigger value="pdf"><FileText className="w-4 h-4 mr-2" />PDF 도면 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader><CardTitle>부재 추가</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>부재 종류</Label><Select value={newComponent.type} onValueChange={(v: ComponentType) => setNewComponent(prev => ({ ...prev, type: v, spec: '' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(['pipe', 'flatbar', 'roundbar', 'angle', 'channel', 'plate', 'checkerplate'] as ComponentType[]).map(t => <SelectItem key={t} value={t}>{COMPONENT_LABELS[t]}</SelectItem>)}</SelectContent></Select></div>
                {newComponent.type === 'pipe' && <div className="space-y-2"><Label>규격 표준</Label><Select value={pipeStandard} onValueChange={(v: 'KS' | 'ANSI') => { setPipeStandard(v); setNewComponent(prev => ({ ...prev, spec: '' })); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="KS">KS/JIS (A 사이즈)</SelectItem><SelectItem value="ANSI">ANSI (인치)</SelectItem></SelectContent></Select></div>}
                <div className="space-y-2"><Label>규격</Label><Select value={newComponent.spec} onValueChange={(v) => setNewComponent(prev => ({ ...prev, spec: v, customSpec: false }))}><SelectTrigger><SelectValue placeholder="규격 선택" /></SelectTrigger><SelectContent>{getSpecOptions(newComponent.type).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newComponent.type !== 'plate' && newComponent.type !== 'checkerplate' && <div className="space-y-2"><Label>길이 (mm)</Label><Input type="number" value={newComponent.length} onChange={(e) => setNewComponent(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))} /></div>}
                {(newComponent.type === 'plate' || newComponent.type === 'checkerplate') && <>
                  <div className="space-y-2"><Label>폭 (mm)</Label><Input type="number" value={newComponent.width} onChange={(e) => setNewComponent(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))} /></div>
                  <div className="space-y-2"><Label>높이 (mm)</Label><Input type="number" value={newComponent.height} onChange={(e) => setNewComponent(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))} /></div>
                </>}
                <div className="space-y-2"><Label>수량</Label><Input type="number" min="1" value={newComponent.quantity} onChange={(e) => setNewComponent(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} /></div>
                <div className="space-y-2"><Label>비고</Label><Input value={newComponent.name} onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))} placeholder="예: 상부 레일" /></div>
              </div>
              <Button onClick={addComponent} className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />부재 추가</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />PDF/이미지 업로드</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 text-primary animate-spin" /><p className="text-muted-foreground">AI가 도면을 분석 중입니다...</p></div>
                ) : (
                  <>
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">PDF 도면 분석 기능은 추후 지원 예정입니다.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Components Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>요약</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setComponents([])}>초기화</Button>
            <Button variant="outline" size="sm" onClick={exportToExcel} disabled={components.length === 0}><Download className="w-4 h-4 mr-2" />Excel 내보내기</Button>
          </div>
        </CardHeader>
        <CardContent>
          {components.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">추가된 부재가 없습니다</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>부재 종류</TableHead><TableHead>부재명</TableHead><TableHead>규격</TableHead>
                    <TableHead className="text-right">길이/폭×높이</TableHead><TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">단위 무게 (kg)</TableHead><TableHead className="text-right">총 무게 (kg)</TableHead><TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map(comp => (
                    <TableRow key={comp.id}>
                      <TableCell><Badge variant="secondary">{COMPONENT_LABELS[comp.type]}</Badge></TableCell>
                      <TableCell>{comp.name}</TableCell><TableCell>{comp.spec}</TableCell>
                      <TableCell className="text-right">{comp.length ? `${comp.length}mm` : `${comp.width}×${comp.height}mm`}</TableCell>
                      <TableCell className="text-right">{comp.quantity}</TableCell>
                      <TableCell className="text-right">{comp.unitWeight.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">{comp.totalWeight.toFixed(2)}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => setComponents(prev => prev.filter(c => c.id !== comp.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={6} className="text-right">합계</TableCell>
                    <TableCell className="text-right text-lg text-primary">{totalWeight.toFixed(2)} kg</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HandrailCalculator;
