import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Plus, Trash2, FileText, Beaker, Settings, CircleDot } from 'lucide-react';
import {
  DesignStandard, ResinType, CHEMICALS, HEAD_TYPES, BOTTOM_TYPES, NOZZLE_STANDARDS,
  Nozzle, FRPCalculationInput, calculateFRPThickness, getRecommendedResin,
  getRecommendedHeadType, getRecommendedBottomType, getResinName,
} from '@/lib/frpCalculator';

export const FRPThicknessCalculator = () => {
  const [designStandard, setDesignStandard] = useState<DesignStandard>('rtp-1');
  const [chemicalId, setChemicalId] = useState<string>('water');
  const [concentration, setConcentration] = useState<number>(100);
  const [temperature, setTemperature] = useState<number>(25);
  const [resinType, setResinType] = useState<ResinType>('vinyl-ester');
  const [useRecommendedResin, setUseRecommendedResin] = useState<boolean>(true);
  const [innerDiameter, setInnerDiameter] = useState<number>(2000);
  const [height, setHeight] = useState<number>(4000);
  const [designPressure, setDesignPressure] = useState<number>(0.1);
  const [vacuumPressure, setVacuumPressure] = useState<number>(0);
  const [headType, setHeadType] = useState<string>('flat');
  const [useRecommendedHead, setUseRecommendedHead] = useState<boolean>(true);
  const [bottomType, setBottomType] = useState<string>('flat');
  const [useRecommendedBottom, setUseRecommendedBottom] = useState<boolean>(true);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [newNozzleStandard, setNewNozzleStandard] = useState<'ansi' | 'jis'>('ansi');
  const [newNozzleSize, setNewNozzleSize] = useState<string>('4"');
  const [newNozzleQuantity, setNewNozzleQuantity] = useState<number>(1);
  const [showResults, setShowResults] = useState<boolean>(false);

  const recommendedResin = useMemo(() => getRecommendedResin(chemicalId, concentration, temperature), [chemicalId, concentration, temperature]);
  const recommendedHead = useMemo(() => getRecommendedHeadType(innerDiameter, height, designPressure, vacuumPressure), [innerDiameter, height, designPressure, vacuumPressure]);
  const recommendedBottom = useMemo(() => getRecommendedBottomType(innerDiameter, height, designPressure), [innerDiameter, height, designPressure]);

  const effectiveResin = useRecommendedResin ? recommendedResin : resinType;
  const effectiveHead = useRecommendedHead ? recommendedHead : headType;
  const effectiveBottom = useRecommendedBottom ? recommendedBottom : bottomType;

  const calculationInput: FRPCalculationInput = useMemo(() => ({
    designStandard, chemicalId, concentration, temperature, resinType: effectiveResin,
    innerDiameter, height, designPressure, vacuumPressure, headType: effectiveHead,
    bottomType: effectiveBottom, nozzles,
  }), [designStandard, chemicalId, concentration, temperature, effectiveResin, innerDiameter, height, designPressure, vacuumPressure, effectiveHead, effectiveBottom, nozzles]);

  const result = useMemo(() => calculateFRPThickness(calculationInput), [calculationInput]);

  const addNozzle = () => {
    setNozzles([...nozzles, { id: `nozzle-${Date.now()}`, standard: newNozzleStandard, size: newNozzleSize, quantity: newNozzleQuantity }]);
  };
  const removeNozzle = (id: string) => setNozzles(nozzles.filter(n => n.id !== id));

  const selectedChemical = CHEMICALS.find(c => c.id === chemicalId);
  const selectedNozzleStandard = NOZZLE_STANDARDS.find(s => s.id === newNozzleStandard);

  return (
    <div className="space-y-6">
      {/* Design Standard */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />설계 규격</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button type="button" onClick={() => setDesignStandard('rtp-1')} className={`p-4 rounded-lg border-2 text-left transition-all ${designStandard === 'rtp-1' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <div className="font-semibold">RTP-1</div><div className="text-sm text-muted-foreground">Reinforced Thermoset Plastic</div>
            </button>
            <button type="button" onClick={() => setDesignStandard('section-x')} className={`p-4 rounded-lg border-2 text-left transition-all ${designStandard === 'section-x' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <div className="font-semibold">ASME Section X</div><div className="text-sm text-muted-foreground">Fiber-Reinforced Plastic Pressure Vessels</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Chemical Selection */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Beaker className="w-5 h-5" />약품 선택</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>약품</Label>
              <Select value={chemicalId} onValueChange={setChemicalId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHEMICALS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>농도 (%)</Label><Input type="number" value={concentration} onChange={(e) => setConcentration(Number(e.target.value))} min={0} max={100} /></div>
            <div className="space-y-2"><Label>운전 온도 (°C)</Label><Input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} /></div>
          </div>
          {selectedChemical && <div className="flex gap-4 text-sm text-muted-foreground"><span>최대 허용 농도: {selectedChemical.maxConcentration}%</span><span>최대 허용 온도: {selectedChemical.maxTemperature}°C</span></div>}
        </CardContent>
      </Card>

      {/* Resin Selection */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CircleDot className="w-5 h-5" />수지 선택</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"><span className="text-sm">추천 수지:</span><Badge variant="secondary">{getResinName(recommendedResin)}</Badge></div>
          <div className="flex gap-4">
            <Button variant={useRecommendedResin ? 'default' : 'outline'} onClick={() => setUseRecommendedResin(true)}>추천 사용</Button>
            <Button variant={!useRecommendedResin ? 'default' : 'outline'} onClick={() => setUseRecommendedResin(false)}>직접 선택</Button>
          </div>
          {!useRecommendedResin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['general-vinyl', 'vinyl-ester', 'novolac'] as ResinType[]).map(r => (
                <button key={r} type="button" onClick={() => setResinType(r)} className={`p-3 rounded-lg border-2 text-center transition-all ${resinType === r ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>{getResinName(r)}</button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vessel Dimensions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />용기 치수</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2"><Label>내경 (mm)</Label><Input type="number" value={innerDiameter} onChange={(e) => setInnerDiameter(Number(e.target.value))} min={100} /></div>
            <div className="space-y-2"><Label>높이 (mm)</Label><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={100} /></div>
            <div className="space-y-2"><Label>설계 압력 (MPa)</Label><Input type="number" value={designPressure} onChange={(e) => setDesignPressure(Number(e.target.value))} step={0.01} min={0} /></div>
            <div className="space-y-2"><Label>진공 압력 (MPa, 절대)</Label><Input type="number" value={vacuumPressure} onChange={(e) => setVacuumPressure(Number(e.target.value))} step={0.01} min={0} /></div>
          </div>
          <Separator />
          {/* Head Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-4"><Label className="font-semibold">상판 형식</Label><div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">추천 형식:</span><Badge variant="secondary">{HEAD_TYPES.find(h => h.id === recommendedHead)?.name}</Badge></div></div>
            <div className="flex gap-4 mb-4">
              <Button variant={useRecommendedHead ? 'default' : 'outline'} size="sm" onClick={() => setUseRecommendedHead(true)}>추천 사용</Button>
              <Button variant={!useRecommendedHead ? 'default' : 'outline'} size="sm" onClick={() => setUseRecommendedHead(false)}>직접 선택</Button>
            </div>
            {!useRecommendedHead && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{HEAD_TYPES.map(t => <button key={t.id} type="button" onClick={() => setHeadType(t.id)} className={`p-3 rounded-lg border-2 text-center transition-all ${headType === t.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>{t.name}</button>)}</div>}
          </div>
          <Separator />
          {/* Bottom Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-4"><Label className="font-semibold">하판 형식</Label><div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">추천 형식:</span><Badge variant="secondary">{BOTTOM_TYPES.find(h => h.id === recommendedBottom)?.name || (recommendedBottom === 'flat' ? '평판' : '경판')}</Badge></div></div>
            <div className="flex gap-4 mb-4">
              <Button variant={useRecommendedBottom ? 'default' : 'outline'} size="sm" onClick={() => setUseRecommendedBottom(true)}>추천 사용</Button>
              <Button variant={!useRecommendedBottom ? 'default' : 'outline'} size="sm" onClick={() => setUseRecommendedBottom(false)}>직접 선택</Button>
            </div>
            {!useRecommendedBottom && <div className="grid grid-cols-2 gap-3">{BOTTOM_TYPES.map(t => <button key={t.id} type="button" onClick={() => setBottomType(t.id)} className={`p-3 rounded-lg border-2 text-center transition-all ${bottomType === t.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>{t.name}</button>)}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Nozzles */}
      <Card>
        <CardHeader><CardTitle>노즐</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2"><Label>규격</Label><Select value={newNozzleStandard} onValueChange={(v: 'ansi' | 'jis') => { setNewNozzleStandard(v); const std = NOZZLE_STANDARDS.find(s => s.id === v); if (std) setNewNozzleSize(std.sizes[5] || std.sizes[0]); }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{NOZZLE_STANDARDS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>사이즈</Label><Select value={newNozzleSize} onValueChange={setNewNozzleSize}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{selectedNozzleStandard?.sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>수량</Label><Input type="number" value={newNozzleQuantity} onChange={(e) => setNewNozzleQuantity(Number(e.target.value))} min={1} className="w-24" /></div>
            <Button onClick={addNozzle} className="flex items-center gap-2"><Plus className="w-4 h-4" />추가</Button>
          </div>
          {nozzles.length > 0 ? nozzles.map(n => (
            <div key={n.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4"><Badge>{n.standard.toUpperCase()}</Badge><span>{n.size}</span><span className="text-muted-foreground">× {n.quantity}</span></div>
              <Button variant="ghost" size="sm" onClick={() => removeNozzle(n.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          )) : <p className="text-muted-foreground text-sm">노즐이 없습니다</p>}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={() => setShowResults(true)}>통합 계산</Button>

      {/* Results */}
      {showResults && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-2xl">엔지니어링 리포트</CardTitle>
            <div className="flex gap-2"><Badge>{designStandard === 'rtp-1' ? 'RTP-1' : 'ASME Section X'}</Badge><Badge variant="outline">{getResinName(effectiveResin)}</Badge></div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {result.warnings.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 text-destructive font-semibold mb-2"><AlertTriangle className="w-5 h-5" />주의사항</div>
                <ul className="list-disc list-inside text-sm space-y-1">{result.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">쉘 설계</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">쉘 두께:</span><span className="font-medium">{result.shellThickness} mm</span><span className="text-muted-foreground">쉘 중량:</span><span className="font-medium">{result.shellWeight} kg</span></div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">상판 설계</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">상판 두께:</span><span className="font-medium">{result.headThickness} mm</span><span className="text-muted-foreground">상판 중량:</span><span className="font-medium">{result.headWeight} kg</span><span className="text-muted-foreground">상판 형식:</span><span className="font-medium">{HEAD_TYPES.find(h => h.id === effectiveHead)?.name}</span></div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">하판 설계</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">하판 두께:</span><span className="font-medium">{result.bottomThickness} mm</span><span className="text-muted-foreground">하판 중량:</span><span className="font-medium">{result.bottomWeight} kg</span><span className="text-muted-foreground">하판 형식:</span><span className="font-medium">{BOTTOM_TYPES.find(h => h.id === effectiveBottom)?.name || (effectiveBottom === 'flat' ? '평판' : '경판')}</span></div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">총 중량 & 표면적</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">총 중량:</span><span className="font-medium text-lg text-primary">{result.totalWeight} kg</span><span className="text-muted-foreground">표면적:</span><span className="font-medium">{result.totalSurfaceArea} m²</span></div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">후프 보강</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">상태:</span><span className="font-medium">{result.hoopReinforcement.required ? <Badge>필요</Badge> : <Badge variant="secondary">불필요</Badge>}</span>{result.hoopReinforcement.required && <><span className="text-muted-foreground">사이즈:</span><span className="font-medium">{result.hoopReinforcement.size}</span><span className="text-muted-foreground">간격:</span><span className="font-medium">{result.hoopReinforcement.spacing} mm</span><span className="text-muted-foreground">개수:</span><span className="font-medium">{result.hoopReinforcement.count}개</span></>}{result.stiffenerRings > 0 && <><span className="text-muted-foreground">보강 링:</span><span className="font-medium">{result.stiffenerRings}개</span></>}</div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">안전 여유</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">안전률:</span><span className="font-medium">{result.safetyFactor}:1</span><span className="text-muted-foreground">부식 여유:</span><span className="font-medium">{result.corrosionAllowance} mm</span></div></div>
              <div className="space-y-3"><h3 className="font-semibold text-lg border-b pb-2">압력 설계</h3><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">최대 허용 작동 압력:</span><span className="font-medium">{result.maxAllowableWorkingPressure} MPa</span><span className="text-muted-foreground">수압 시험 압력:</span><span className="font-medium">{result.hydrostaticTestPressure} MPa</span></div></div>
              {/* Laminate Structure */}
              <div className="space-y-3 md:col-span-2">
                <h3 className="font-semibold text-lg border-b pb-2">적층 구조</h3>
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded"><div className="text-xs text-muted-foreground">내부 라이너</div><div className="font-bold">{result.innerLinerThickness} mm</div></div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded"><div className="text-xs text-muted-foreground">구조층</div><div className="font-bold">{result.structuralLayerThickness} mm</div></div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded"><div className="text-xs text-muted-foreground">외부층</div><div className="font-bold">{result.outerLayerThickness} mm</div></div>
                </div>
              </div>
              {/* Estimation Fields */}
              <div className="space-y-3 md:col-span-2">
                <h3 className="font-semibold text-lg border-b pb-2 text-primary">견적용 두께 데이터</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { label: '쉘 상부', value: result.shellUpperThickness },
                    { label: '쉘 하부', value: result.shellLowerThickness },
                    { label: '바닥', value: result.bottomPlateThickness },
                    { label: '지붕', value: result.roofThickness },
                    { label: '내식층', value: result.corrosionLayerThickness },
                    { label: '이음부 S.W', value: result.jointSW },
                    { label: '이음부 C.B', value: result.jointCB },
                    { label: 'L/L', value: result.linerLayer },
                    { label: '후프', value: result.hoopThickness },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="font-bold text-lg">{item.value}</div>
                      <div className="text-xs text-muted-foreground">mm</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Nozzle Reinforcement */}
              {nozzles.length > 0 && (
                <div className="space-y-3 md:col-span-2">
                  <h3 className="font-semibold text-lg border-b pb-2">노즐 보강</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nozzles.map(n => {
                      const r = result.nozzleReinforcement.find(nr => nr.nozzleId === n.id);
                      return (
                        <div key={n.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="font-medium mb-2">{n.standard.toUpperCase()} {n.size} × {n.quantity}</div>
                          <div className="text-sm grid grid-cols-2 gap-1">
                            <span className="text-muted-foreground">보강 두께:</span><span>{r?.reinforcementThickness} mm</span>
                            <span className="text-muted-foreground">보강 직경:</span><span>{r?.reinforcementDiameter} mm</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FRPThicknessCalculator;
