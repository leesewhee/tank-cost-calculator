import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  TankDimensions,
  MaterialPrices,
  LaborPrices,
  FixedCosts,
  SafetyMargins,
  ThicknessConfig,
  CustomItem,
  defaultMaterialPrices,
  defaultLaborPrices,
  getDefaultsByDiameter,
} from "@/lib/calculations";
import { Calculator, Settings, Cylinder, Ruler } from "lucide-react";
import { CustomItemInput } from "./CustomItemInput";

interface TankInputFormProps {
  onCalculate: (
    dimensions: TankDimensions,
    materialPrices: MaterialPrices,
    laborPrices: LaborPrices,
    fixedCosts: FixedCosts,
    safetyMargins: SafetyMargins,
    thickness: ThicknessConfig
  ) => void;
}

export function TankInputForm({ onCalculate }: TankInputFormProps) {
  const [diameter, setDiameter] = useState<string>("4.2");
  const [height, setHeight] = useState<string>("6.0");
  
  const [materialPrices, setMaterialPrices] = useState<MaterialPrices>(defaultMaterialPrices);
  const [laborPrices, setLaborPrices] = useState<LaborPrices>(defaultLaborPrices);
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>(getDefaultsByDiameter(4.2).fixedCosts);
  const [safetyMargins, setSafetyMargins] = useState<SafetyMargins>(getDefaultsByDiameter(4.2).safetyMargins);
  const [thickness, setThickness] = useState<ThicknessConfig>(getDefaultsByDiameter(4.2).thickness);
  
  // 직경 변경시 기본값 업데이트
  useEffect(() => {
    const dia = parseFloat(diameter) || 0;
    if (dia > 0) {
      const defaults = getDefaultsByDiameter(dia);
      setFixedCosts(defaults.fixedCosts);
      setSafetyMargins(defaults.safetyMargins);
      setThickness(defaults.thickness);
    }
  }, [diameter]);
  
  const handleCalculate = () => {
    const dimensions: TankDimensions = {
      diameter: parseFloat(diameter) || 0,
      height: parseFloat(height) || 0,
    };
    
    if (dimensions.diameter > 0 && dimensions.height > 0) {
      onCalculate(dimensions, materialPrices, laborPrices, fixedCosts, safetyMargins, thickness);
    }
  };
  
  const formatNumber = (value: number) => value.toLocaleString('ko-KR');
  const parseNumber = (value: string) => parseInt(value.replace(/,/g, '')) || 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 탱크 사이즈 입력 */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cylinder className="w-5 h-5" />
            탱크 사이즈 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="diameter" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                직경 (m)
              </Label>
              <Input
                id="diameter"
                type="number"
                step="0.1"
                min="0.1"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className="input-field number-input text-lg font-semibold"
                placeholder="예: 4.2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                높이 (m)
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input-field number-input text-lg font-semibold"
                placeholder="예: 6.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 상세 설정 탭 */}
      <Card>
        <CardHeader className="bg-secondary/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            상세 설정 (기본값 적용됨)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="material" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="material">재료 단가</TabsTrigger>
              <TabsTrigger value="labor">인건비</TabsTrigger>
              <TabsTrigger value="fixed">고정비용</TabsTrigger>
              <TabsTrigger value="thickness">두께</TabsTrigger>
              <TabsTrigger value="safety">마진/안전</TabsTrigger>
            </TabsList>
            
            <TabsContent value="material" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>수지 단가 (원/kg)</Label>
                  <Input
                    type="text"
                    value={formatNumber(materialPrices.resin)}
                    onChange={(e) => setMaterialPrices({...materialPrices, resin: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>매트#450 단가 (원/kg)</Label>
                  <Input
                    type="text"
                    value={formatNumber(materialPrices.mat450)}
                    onChange={(e) => setMaterialPrices({...materialPrices, mat450: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>로빙 클로스 단가 (원/kg)</Label>
                  <Input
                    type="text"
                    value={formatNumber(materialPrices.rovingCloth)}
                    onChange={(e) => setMaterialPrices({...materialPrices, rovingCloth: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>로빙#2200 단가 (원/kg)</Label>
                  <Input
                    type="text"
                    value={formatNumber(materialPrices.roving2200)}
                    onChange={(e) => setMaterialPrices({...materialPrices, roving2200: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>서피스 매트 단가 (원/m²)</Label>
                  <Input
                    type="text"
                    value={formatNumber(materialPrices.surfaceMat)}
                    onChange={(e) => setMaterialPrices({...materialPrices, surfaceMat: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">추가 재료</Label>
                <CustomItemInput
                  items={materialPrices.custom || []}
                  onItemsChange={(items) => setMaterialPrices({...materialPrices, custom: items})}
                  unitLabel="원/kg"
                  valueLabel="단가"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="labor" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>와인딩 인건비 (원/M.D)</Label>
                  <Input
                    type="text"
                    value={formatNumber(laborPrices.winding)}
                    onChange={(e) => setLaborPrices({...laborPrices, winding: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>조립 인건비 (원/M.D)</Label>
                  <Input
                    type="text"
                    value={formatNumber(laborPrices.assembly)}
                    onChange={(e) => setLaborPrices({...laborPrices, assembly: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>케미칼 인건비 (원/M.D)</Label>
                  <Input
                    type="text"
                    value={formatNumber(laborPrices.chemical)}
                    onChange={(e) => setLaborPrices({...laborPrices, chemical: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>특수 인건비 (원/M.D)</Label>
                  <Input
                    type="text"
                    value={formatNumber(laborPrices.special)}
                    onChange={(e) => setLaborPrices({...laborPrices, special: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">추가 인건비</Label>
                <CustomItemInput
                  items={laborPrices.custom || []}
                  onItemsChange={(items) => setLaborPrices({...laborPrices, custom: items})}
                  unitLabel="원/M.D"
                  valueLabel="단가"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="fixed" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>플랜지 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.flange)}
                    onChange={(e) => setFixedCosts({...fixedCosts, flange: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>맨홀 (원/SET)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.manhole)}
                    onChange={(e) => setFixedCosts({...fixedCosts, manhole: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>레벨 게이지 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.levelGauge)}
                    onChange={(e) => setFixedCosts({...fixedCosts, levelGauge: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>가스켓 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.gasket)}
                    onChange={(e) => setFixedCosts({...fixedCosts, gasket: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>볼트/너트 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.boltNut)}
                    onChange={(e) => setFixedCosts({...fixedCosts, boltNut: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>사다리/핸드레일 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(fixedCosts.ladder)}
                    onChange={(e) => setFixedCosts({...fixedCosts, ladder: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">추가 고정비용</Label>
                <CustomItemInput
                  items={fixedCosts.custom || []}
                  onItemsChange={(items) => setFixedCosts({...fixedCosts, custom: items})}
                  unitLabel="원"
                  valueLabel="금액"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="thickness" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>쉘 상부 (mm)</Label>
                  <Input
                    type="number"
                    value={thickness.shellTop}
                    onChange={(e) => setThickness({...thickness, shellTop: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>쉘 하부 (mm)</Label>
                  <Input
                    type="number"
                    value={thickness.shellBottom}
                    onChange={(e) => setThickness({...thickness, shellBottom: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>바닥 (mm)</Label>
                  <Input
                    type="number"
                    value={thickness.bottom}
                    onChange={(e) => setThickness({...thickness, bottom: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>지붕 (mm)</Label>
                  <Input
                    type="number"
                    value={thickness.roof}
                    onChange={(e) => setThickness({...thickness, roof: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>내식층 (mm)</Label>
                  <Input
                    type="number"
                    value={thickness.cbThickness}
                    onChange={(e) => setThickness({...thickness, cbThickness: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                {/* 자동 계산 영역 표시 */}
                <div className="col-span-3 bg-muted/50 rounded-lg p-3 space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">자동 계산 항목</Label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">이음부 S.W</span>
                      <span className="font-mono">{(3.14 * (parseFloat(diameter) || 0) * 0.3 * 2).toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">이음부 C.B</span>
                      <span className="font-mono">{(3.14 * (parseFloat(diameter) || 0) * 0.25 * 2).toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">L/L</span>
                      <span className="font-mono">{(0.6 * 0.6 * 4).toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">후프</span>
                      <span className="font-mono">{((parseFloat(diameter) || 0) * 3.14 * 0.12 * 3).toFixed(2)} m²</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    비중
                    <span className="text-xs text-muted-foreground">(견적용)</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={thickness.frpDensity}
                    onChange={(e) => setThickness({...thickness, frpDensity: parseFloat(e.target.value) || 2.0})}
                    className="input-field number-input"
                  />
                  <p className="text-xs text-muted-foreground">순수 비중 1.6~1.8, 견적용 통상 2.0</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">추가 두께 항목</Label>
                <CustomItemInput
                  items={thickness.custom || []}
                  onItemsChange={(items) => setThickness({...thickness, custom: items})}
                  unitLabel="mm"
                  valueLabel="두께"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="safety" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>검사비 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(safetyMargins.inspectionTest)}
                    onChange={(e) => setSafetyMargins({...safetyMargins, inspectionTest: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>운송비 (원)</Label>
                  <Input
                    type="text"
                    value={formatNumber(safetyMargins.transportation)}
                    onChange={(e) => setSafetyMargins({...safetyMargins, transportation: parseNumber(e.target.value)})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>일반관리비 및 이익률 (%)</Label>
                  <Input
                    type="number"
                    value={safetyMargins.profitMargin}
                    onChange={(e) => setSafetyMargins({...safetyMargins, profitMargin: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>안전율 (%)</Label>
                  <Input
                    type="number"
                    value={safetyMargins.safetyFactor}
                    onChange={(e) => setSafetyMargins({...safetyMargins, safetyFactor: parseFloat(e.target.value) || 0})}
                    className="input-field number-input"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">추가 마진/안전 항목</Label>
                <CustomItemInput
                  items={safetyMargins.custom || []}
                  onItemsChange={(items) => setSafetyMargins({...safetyMargins, custom: items})}
                  unitLabel="원"
                  valueLabel="금액"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 계산 버튼 */}
      <Button 
        onClick={handleCalculate} 
        className="w-full h-14 text-lg font-semibold"
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        견적 계산하기
      </Button>
    </div>
  );
}
