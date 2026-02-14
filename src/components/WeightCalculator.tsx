import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Square, Circle, Cylinder } from 'lucide-react';

type ShapeType = 'rectangular' | 'cylindrical-vertical' | 'pipe';
type HeadPlateType = 'flat' | 'dished';

interface Dimensions {
  length: string; width: string; height: string;
  diameter: string; cylinderHeight: string;
  topPlateType: HeadPlateType; topPlateThickness: string;
  bottomPlateType: HeadPlateType; bottomPlateThickness: string;
  pipeDiameter: string; pipeLength: string;
  thickness: string; specificGravity: string;
}

interface WeightResult {
  weight: number; surfaceArea: number; shellWeight: number; topWeight: number; bottomWeight: number;
}

const DEFAULT_FRP_SPECIFIC_GRAVITY = 1.8;

export const WeightCalculator = () => {
  const [shape, setShape] = useState<ShapeType>('rectangular');
  const [dimensions, setDimensions] = useState<Dimensions>({
    length: '', width: '', height: '', diameter: '', cylinderHeight: '',
    topPlateType: 'flat', topPlateThickness: '', bottomPlateType: 'flat', bottomPlateThickness: '',
    pipeDiameter: '', pipeLength: '', thickness: '', specificGravity: DEFAULT_FRP_SPECIFIC_GRAVITY.toString(),
  });
  const [result, setResult] = useState<WeightResult | null>(null);

  const calculateWeight = () => {
    const thickness = parseFloat(dimensions.thickness);
    const sg = parseFloat(dimensions.specificGravity) || DEFAULT_FRP_SPECIFIC_GRAVITY;
    if (!thickness || thickness <= 0) { setResult(null); return; }

    let shellSurfaceArea = 0, topSurfaceArea = 0, bottomSurfaceArea = 0;
    let topThickness = thickness, bottomThickness = thickness;

    switch (shape) {
      case 'rectangular': {
        const l = parseFloat(dimensions.length), w = parseFloat(dimensions.width), h = parseFloat(dimensions.height);
        if (!l || !w || !h) { setResult(null); return; }
        shellSurfaceArea = 2 * (l * w + l * h + w * h);
        break;
      }
      case 'cylindrical-vertical': {
        const d = parseFloat(dimensions.diameter), h = parseFloat(dimensions.cylinderHeight);
        if (!d || !h) { setResult(null); return; }
        const r = d / 2;
        shellSurfaceArea = 2 * Math.PI * r * h;
        topSurfaceArea = Math.PI * r * r * (dimensions.topPlateType === 'dished' ? 1.1 : 1.0);
        topThickness = parseFloat(dimensions.topPlateThickness) || thickness;
        bottomSurfaceArea = Math.PI * r * r * (dimensions.bottomPlateType === 'dished' ? 1.1 : 1.0);
        bottomThickness = parseFloat(dimensions.bottomPlateThickness) || thickness;
        break;
      }
      case 'pipe': {
        const d = parseFloat(dimensions.pipeDiameter), l = parseFloat(dimensions.pipeLength);
        if (!d || !l) { setResult(null); return; }
        shellSurfaceArea = Math.PI * d * l;
        break;
      }
    }

    const shellAreaM2 = shellSurfaceArea / 1000000;
    const topAreaM2 = topSurfaceArea / 1000000;
    const bottomAreaM2 = bottomSurfaceArea / 1000000;
    const shellWeight = shellAreaM2 * (thickness / 1000) * sg * 1000;
    const topWeight = topAreaM2 * (topThickness / 1000) * sg * 1000;
    const bottomWeight = bottomAreaM2 * (bottomThickness / 1000) * sg * 1000;

    setResult({
      weight: Math.round((shellWeight + topWeight + bottomWeight) * 10) / 10,
      surfaceArea: Math.round((shellAreaM2 + topAreaM2 + bottomAreaM2) * 100) / 100,
      shellWeight: Math.round(shellWeight * 10) / 10,
      topWeight: Math.round(topWeight * 10) / 10,
      bottomWeight: Math.round(bottomWeight * 10) / 10,
    });
  };

  useEffect(() => { calculateWeight(); }, [dimensions, shape]);

  const handleChange = (key: keyof Dimensions, value: string) => setDimensions(prev => ({ ...prev, [key]: value }));
  const formatNumber = (num: number) => num.toLocaleString('ko-KR');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {shape === 'rectangular' ? <Square className="w-5 h-5" /> : shape === 'cylindrical-vertical' ? <Circle className="w-5 h-5" /> : <Cylinder className="w-5 h-5" />}
            FRP 무게 계산기
          </CardTitle>
          <CardDescription>탱크 또는 파이프의 대략적인 무게를 계산합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shape Selection */}
          <div className="space-y-3">
            <Label>형상 선택</Label>
            <div className="flex flex-wrap gap-2">
              {([{ id: 'rectangular' as ShapeType, label: '사각형', icon: Square }, { id: 'cylindrical-vertical' as ShapeType, label: '원형 (수직)', icon: Circle }, { id: 'pipe' as ShapeType, label: '파이프', icon: Cylinder }]).map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setShape(item.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${shape === item.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'}`}>
                    <Icon className="w-4 h-4" />{item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shape === 'rectangular' && <>
              <div className="space-y-2"><Label>길이 (mm)</Label><Input type="number" value={dimensions.length} onChange={(e) => handleChange('length', e.target.value)} placeholder="1000" /></div>
              <div className="space-y-2"><Label>폭 (mm)</Label><Input type="number" value={dimensions.width} onChange={(e) => handleChange('width', e.target.value)} placeholder="500" /></div>
              <div className="space-y-2"><Label>높이 (mm)</Label><Input type="number" value={dimensions.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="800" /></div>
            </>}
            {shape === 'cylindrical-vertical' && <>
              <div className="space-y-2"><Label>직경 (mm)</Label><Input type="number" value={dimensions.diameter} onChange={(e) => handleChange('diameter', e.target.value)} placeholder="1000" /></div>
              <div className="space-y-2"><Label>높이 (mm)</Label><Input type="number" value={dimensions.cylinderHeight} onChange={(e) => handleChange('cylinderHeight', e.target.value)} placeholder="1500" /></div>
              <div className="space-y-2"><Label>동체 두께 (mm)</Label><Input type="number" value={dimensions.thickness} onChange={(e) => handleChange('thickness', e.target.value)} placeholder="10" /></div>
              {/* Top/Bottom Plate */}
              <div className="sm:col-span-2 lg:col-span-3 border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">상판</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>형식</Label><div className="flex gap-2"><Button type="button" variant={dimensions.topPlateType === 'flat' ? 'default' : 'outline'} size="sm" onClick={() => handleChange('topPlateType', 'flat')}>평판</Button><Button type="button" variant={dimensions.topPlateType === 'dished' ? 'default' : 'outline'} size="sm" onClick={() => handleChange('topPlateType', 'dished')}>경판</Button></div></div>
                  <div className="space-y-2"><Label>두께 (mm)</Label><Input type="number" value={dimensions.topPlateThickness} onChange={(e) => handleChange('topPlateThickness', e.target.value)} placeholder={dimensions.thickness || '10'} /></div>
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 border-t pt-4">
                <h4 className="font-medium mb-3">하판</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>형식</Label><div className="flex gap-2"><Button type="button" variant={dimensions.bottomPlateType === 'flat' ? 'default' : 'outline'} size="sm" onClick={() => handleChange('bottomPlateType', 'flat')}>평판</Button><Button type="button" variant={dimensions.bottomPlateType === 'dished' ? 'default' : 'outline'} size="sm" onClick={() => handleChange('bottomPlateType', 'dished')}>경판</Button></div></div>
                  <div className="space-y-2"><Label>두께 (mm)</Label><Input type="number" value={dimensions.bottomPlateThickness} onChange={(e) => handleChange('bottomPlateThickness', e.target.value)} placeholder={dimensions.thickness || '10'} /></div>
                </div>
              </div>
            </>}
            {shape === 'pipe' && <>
              <div className="space-y-2"><Label>외경 (mm)</Label><Input type="number" value={dimensions.pipeDiameter} onChange={(e) => handleChange('pipeDiameter', e.target.value)} placeholder="200" /></div>
              <div className="space-y-2"><Label>길이 (mm)</Label><Input type="number" value={dimensions.pipeLength} onChange={(e) => handleChange('pipeLength', e.target.value)} placeholder="6000" /></div>
            </>}
            {shape !== 'cylindrical-vertical' && <div className="space-y-2"><Label>두께 (mm)</Label><Input type="number" value={dimensions.thickness} onChange={(e) => handleChange('thickness', e.target.value)} placeholder="10" /></div>}
            <div className="space-y-2"><Label>수지 비중</Label><Input type="number" step="0.1" value={dimensions.specificGravity} onChange={(e) => handleChange('specificGravity', e.target.value)} placeholder="1.8" /><p className="text-xs text-muted-foreground">기본값: 1.8 (평균 FRP)</p></div>
          </div>

          {/* Results */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">계산 결과</h3>
            {result ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="bg-primary/5 border-primary/20"><CardContent className="pt-4"><div className="text-sm text-muted-foreground">총 예상 무게</div><div className="text-2xl font-bold text-primary">{formatNumber(result.weight)} <span className="text-base font-normal">kg</span></div></CardContent></Card>
                  <Card className="bg-muted/50"><CardContent className="pt-4"><div className="text-sm text-muted-foreground">표면적</div><div className="text-2xl font-bold">{formatNumber(result.surfaceArea)} <span className="text-base font-normal">m²</span></div></CardContent></Card>
                </div>
                {shape === 'cylindrical-vertical' && (result.topWeight > 0 || result.bottomWeight > 0) && (
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Card className="bg-muted/30"><CardContent className="pt-3 pb-3"><div className="text-xs text-muted-foreground">동체 무게</div><div className="font-semibold">{formatNumber(result.shellWeight)} kg</div></CardContent></Card>
                    <Card className="bg-muted/30"><CardContent className="pt-3 pb-3"><div className="text-xs text-muted-foreground">상판 무게</div><div className="font-semibold">{formatNumber(result.topWeight)} kg</div></CardContent></Card>
                    <Card className="bg-muted/30"><CardContent className="pt-3 pb-3"><div className="text-xs text-muted-foreground">하판 무게</div><div className="font-semibold">{formatNumber(result.bottomWeight)} kg</div></CardContent></Card>
                  </div>
                )}
              </div>
            ) : <p className="text-muted-foreground text-center py-8">치수를 입력하면 무게가 계산됩니다.</p>}
            <p className="text-xs text-muted-foreground mt-4">* 단순화된 계산입니다. 실제 무게는 수지 함침량, 보강재 등에 따라 다를 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightCalculator;
