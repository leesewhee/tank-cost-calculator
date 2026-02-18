import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { calculateTankVolume, TANK_SHAPES, type TankShape, type TankDimensions, type VolumeResult } from '@/lib/tankVolumeCalculator';
import { Square, Circle, Droplets, Scale, Ruler } from 'lucide-react';

export const TankVolumeCalculator = () => {
  const [shape, setShape] = useState<TankShape>('rectangular');
  const [dimensions, setDimensions] = useState<TankDimensions>({
    shape: 'rectangular',
    length: 2000,
    width: 1500,
    height: 1000,
    diameter: 1500,
    cylinderLength: 3000,
    fillLevel: 100,
  });
  const [result, setResult] = useState<VolumeResult | null>(null);

  useEffect(() => {
    const newDimensions = { ...dimensions, shape };
    const calcResult = calculateTankVolume(newDimensions);
    setResult(calcResult);
  }, [dimensions, shape]);

  const handleDimensionChange = (key: keyof TankDimensions, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
  };

  const ShapeIcon = ({ shapeId }: { shapeId: TankShape }) => {
    switch (shapeId) {
      case 'rectangular':
        return <Square className="w-8 h-8" />;
      case 'cylindrical-vertical':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          </svg>
        );
      case 'cylindrical-horizontal':
        return (
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="5" cy="12" rx="3" ry="6" />
            <path d="M5 6h14c1.66 0 3 2.69 3 6s-1.34 6-3 6H5" />
          </svg>
        );
      default:
        return <Circle className="w-8 h-8" />;
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('ko-KR');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>탱크 용량 계산기</CardTitle>
          <CardDescription>사각 및 원형 탱크의 용량을 계산합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="text-sm font-medium mb-4 block">탱크 형태 선택</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TANK_SHAPES.map((s) => (
              <button
                key={s.id}
                onClick={() => setShape(s.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  shape === s.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <ShapeIcon shapeId={s.id} />
                <span className="mt-3 font-medium text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              치수 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {shape === 'rectangular' && (
              <>
                <div className="space-y-2">
                  <Label>길이 (mm)</Label>
                  <Input type="number" value={dimensions.length || ''} onChange={(e) => handleDimensionChange('length', Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>폭 (mm)</Label>
                  <Input type="number" value={dimensions.width || ''} onChange={(e) => handleDimensionChange('width', Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>높이 (mm)</Label>
                  <Input type="number" value={dimensions.height || ''} onChange={(e) => handleDimensionChange('height', Number(e.target.value))} min={0} />
                </div>
              </>
            )}
            {shape === 'cylindrical-vertical' && (
              <>
                <div className="space-y-2">
                  <Label>직경 (mm)</Label>
                  <Input type="number" value={dimensions.diameter || ''} onChange={(e) => handleDimensionChange('diameter', Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>높이 (mm)</Label>
                  <Input type="number" value={dimensions.height || ''} onChange={(e) => handleDimensionChange('height', Number(e.target.value))} min={0} />
                </div>
              </>
            )}
            {shape === 'cylindrical-horizontal' && (
              <>
                <div className="space-y-2">
                  <Label>직경 (mm)</Label>
                  <Input type="number" value={dimensions.diameter || ''} onChange={(e) => handleDimensionChange('diameter', Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>탱크 길이 (mm)</Label>
                  <Input type="number" value={dimensions.cylinderLength || ''} onChange={(e) => handleDimensionChange('cylinderLength', Number(e.target.value))} min={0} />
                </div>
              </>
            )}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>충전율</Label>
                <span className="text-lg font-bold text-primary">{dimensions.fillLevel}%</span>
              </div>
              <Slider value={[dimensions.fillLevel || 100]} onValueChange={([val]) => handleDimensionChange('fillLevel', val)} min={0} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              계산 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">총 용량</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatNumber(result.totalVolume)} <span className="text-lg">L</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{result.totalVolumeM3} m³</span>
                    <span>{formatNumber(result.totalVolumeGal)} gal</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted border">
                  <div className="text-sm text-muted-foreground mb-1">충전 용량 ({dimensions.fillLevel}%)</div>
                  <div className="text-2xl font-bold">
                    {formatNumber(result.filledVolume)} <span className="text-base font-normal">L</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{result.filledVolumeM3} m³</span>
                    <span>{formatNumber(result.filledVolumeGal)} gal</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="text-sm text-muted-foreground mb-1">표면적</div>
                    <div className="text-xl font-bold">{result.surfaceArea} <span className="text-sm font-normal">m²</span></div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Scale className="w-4 h-4" />충전 중량 (물 기준)
                    </div>
                    <div className="text-xl font-bold">{formatNumber(result.weight)} <span className="text-sm font-normal">kg</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">치수를 입력해주세요</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TankVolumeCalculator;
