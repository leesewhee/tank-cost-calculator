import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Settings2, Ruler, CircleDot, Layers, Calculator, Info, TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  calculateBoltLength,
  BOLT_SIZES,
  BOLT_PITCH,
  type BoltCalculationInput,
  type BoltCalculationResult,
  type BoltMode,
} from '@/lib/boltCalculator';

export function BoltCalculator() {
  const [boltMode, setBoltMode] = useState<BoltMode>('bolt');
  const [boltSize, setBoltSize] = useState<string>('M16');
  const [flangeThickness1, setFlangeThickness1] = useState<number>(20);
  const [flangeThickness2, setFlangeThickness2] = useState<number>(20);
  const [topWasherType, setTopWasherType] = useState<'standard' | 'heavy' | 'none'>('standard');
  const [bottomWasherType, setBottomWasherType] = useState<'standard' | 'heavy' | 'none'>('standard');
  const [nutType, setNutType] = useState<'standard' | 'heavy'>('standard');
  const [topNutType, setTopNutType] = useState<'standard' | 'heavy'>('standard');
  const [hasGasket, setHasGasket] = useState<boolean>(false);
  const [gasketThickness, setGasketThickness] = useState<number>(3);
  const [hasMiddlePart, setHasMiddlePart] = useState<boolean>(false);
  const [middlePartThickness, setMiddlePartThickness] = useState<number>(10);

  const input: BoltCalculationInput = useMemo(() => ({
    boltSize, boltMode, flangeThickness1, flangeThickness2, topWasherType, bottomWasherType, nutType, topNutType, hasGasket, gasketThickness, hasMiddlePart, middlePartThickness,
  }), [boltSize, boltMode, flangeThickness1, flangeThickness2, topWasherType, bottomWasherType, nutType, topNutType, hasGasket, gasketThickness, hasMiddlePart, middlePartThickness]);

  const result: BoltCalculationResult = useMemo(() => calculateBoltLength(input), [input]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Link to="/bolt-reference">
          <Button variant="outline" className="gap-2">
            <TableIcon className="w-4 h-4" />
            규격 참조 테이블
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Bolt Mode */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                볼트 타입
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={boltMode} onValueChange={(v) => setBoltMode(v as BoltMode)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bolt" id="mode-bolt" />
                  <Label htmlFor="mode-bolt" className="cursor-pointer">일반 볼트</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stud" id="mode-stud" />
                  <Label htmlFor="mode-stud" className="cursor-pointer">스터드 볼트 (양쪽 너트)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Bolt Size */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                볼트 사이즈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={boltSize} onValueChange={setBoltSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="볼트 사이즈 선택" />
                </SelectTrigger>
                <SelectContent>
                  {BOLT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>{size} (피치: {BOLT_PITCH[size]}mm)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Flange Thickness */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5 text-primary" />
                플랜지 / 커버 두께
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    플랜지 1
                    <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>볼트 머리 쪽 플랜지 두께</TooltipContent></Tooltip>
                  </Label>
                  <div className="relative mt-1">
                    <Input type="number" value={flangeThickness1} onChange={(e) => setFlangeThickness1(Number(e.target.value))} className="pr-10 font-mono" min={0} step={0.5} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mm</span>
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    플랜지 2
                    <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>너트 쪽 플랜지 두께</TooltipContent></Tooltip>
                  </Label>
                  <div className="relative mt-1">
                    <Input type="number" value={flangeThickness2} onChange={(e) => setFlangeThickness2(Number(e.target.value))} className="pr-10 font-mono" min={0} step={0.5} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mm</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Washer Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CircleDot className="w-5 h-5 text-primary" />
                와샤 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>상부 와샤 (볼트 머리 쪽)</Label>
                <RadioGroup value={topWasherType} onValueChange={(v) => setTopWasherType(v as 'standard' | 'heavy' | 'none')} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="top-none" /><Label htmlFor="top-none" className="cursor-pointer">없음</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="standard" id="top-standard" /><Label htmlFor="top-standard" className="cursor-pointer">일반</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="top-heavy" /><Label htmlFor="top-heavy" className="cursor-pointer">헤비</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label>하부 와샤 (너트 쪽)</Label>
                <RadioGroup value={bottomWasherType} onValueChange={(v) => setBottomWasherType(v as 'standard' | 'heavy' | 'none')} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="bottom-none" /><Label htmlFor="bottom-none" className="cursor-pointer">없음</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="standard" id="bottom-standard" /><Label htmlFor="bottom-standard" className="cursor-pointer">일반</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="bottom-heavy" /><Label htmlFor="bottom-heavy" className="cursor-pointer">헤비</Label></div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Nut Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                너트 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {boltMode === 'stud' && (
                <div className="space-y-3">
                  <Label>상부 너트</Label>
                  <RadioGroup value={topNutType} onValueChange={(v) => setTopNutType(v as 'standard' | 'heavy')} className="flex gap-6">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="standard" id="top-nut-standard" /><Label htmlFor="top-nut-standard" className="cursor-pointer">일반 너트</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="top-nut-heavy" /><Label htmlFor="top-nut-heavy" className="cursor-pointer">헤비 너트</Label></div>
                  </RadioGroup>
                </div>
              )}
              <div className="space-y-3">
                <Label>{boltMode === 'stud' ? '하부 너트' : '너트'}</Label>
                <RadioGroup value={nutType} onValueChange={(v) => setNutType(v as 'standard' | 'heavy')} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="standard" id="nut-standard" /><Label htmlFor="nut-standard" className="cursor-pointer">일반 너트</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="heavy" id="nut-heavy" /><Label htmlFor="nut-heavy" className="cursor-pointer">헤비 너트</Label></div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Gasket & Middle Part */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5 text-primary" />
                가스켓 및 중간재
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>가스켓</Label>
                  <Switch checked={hasGasket} onCheckedChange={setHasGasket} />
                </div>
                {hasGasket && (
                  <div className="relative">
                    <Input type="number" value={gasketThickness} onChange={(e) => setGasketThickness(Number(e.target.value))} className="pr-10 font-mono" min={0} step={0.5} placeholder="가스켓 두께" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mm</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>중간재</Label>
                  <Switch checked={hasMiddlePart} onCheckedChange={setHasMiddlePart} />
                </div>
                {hasMiddlePart && (
                  <div className="relative">
                    <Input type="number" value={middlePartThickness} onChange={(e) => setMiddlePartThickness(Number(e.target.value))} className="pr-10 font-mono" min={0} step={0.5} placeholder="중간재 두께" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mm</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Section */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ruler className="w-5 h-5 text-primary" />
                계산 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-sm text-muted-foreground mb-2">권장 볼트 길이</div>
                <div className="text-5xl md:text-6xl font-bold font-mono text-primary inline-block px-4 py-2">
                  {result.recommendedBoltLength}<span className="text-2xl md:text-3xl ml-1">mm</span>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">{boltSize} × {result.recommendedBoltLength}L</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">최소 필요 길이</div>
                  <div className="text-xl font-mono font-semibold">{result.minimumBoltLength}mm</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">총 그립 길이</div>
                  <div className="text-xl font-mono font-semibold">{result.totalGripLength}mm</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">상세 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">플랜지 1</span><span className="font-mono font-medium">{result.breakdown.flange1}mm</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">플랜지 2</span><span className="font-mono font-medium">{result.breakdown.flange2}mm</span></div>
                {result.breakdown.topWasher > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">상부 와샤</span><span className="font-mono font-medium">{result.breakdown.topWasher}mm</span></div>}
                {result.breakdown.bottomWasher > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">하부 와샤</span><span className="font-mono font-medium">{result.breakdown.bottomWasher}mm</span></div>}
                {result.breakdown.topNut > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">상부 너트 높이</span><span className="font-mono font-medium">{result.breakdown.topNut}mm</span></div>}
                <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">{boltMode === 'stud' ? '하부 너트 높이' : '너트 높이'}</span><span className="font-mono font-medium">{result.breakdown.bottomNut}mm</span></div>
                {result.breakdown.gasket > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">가스켓</span><span className="font-mono font-medium">{result.breakdown.gasket}mm</span></div>}
                {result.breakdown.middlePart > 0 && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">중간재</span><span className="font-mono font-medium">{result.breakdown.middlePart}mm</span></div>}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    3산 돌출 {boltMode === 'stud' && '(양쪽)'}
                    <Tooltip><TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger><TooltipContent>{boltMode === 'stud' ? '피치 × 3 × 2 = 양쪽 안전한 나사 돌출량' : '피치 × 3 = 안전한 나사 돌출량'}</TooltipContent></Tooltip>
                  </span>
                  <span className="font-mono font-medium text-primary">{result.breakdown.threadProtrusion}mm</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-3 mt-3">
                  <span className="font-semibold">합계</span>
                  <span className="font-mono font-bold">{result.totalGripLength}mm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {boltMode === 'stud' ? '스터드 볼트 3산 기준' : '3산 기준이란?'}
                </p>
                <p className="text-muted-foreground">
                  {boltMode === 'stud'
                    ? `스터드 볼트는 양쪽 너트에서 각각 피치의 3배만큼 돌출되어야 합니다. 현재 ${boltSize} 피치: ${BOLT_PITCH[boltSize]}mm × 3 × 2 = ${result.breakdown.threadProtrusion}mm`
                    : `볼트가 너트를 통과한 후 피치의 3배만큼 돌출되어야 안전한 체결이 됩니다. 현재 ${boltSize} 피치: ${BOLT_PITCH[boltSize]}mm × 3 = ${result.breakdown.threadProtrusion}mm`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoltCalculator;
