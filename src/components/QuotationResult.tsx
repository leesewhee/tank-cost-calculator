import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CalculationResult,
  TankDimensions,
  MaterialPrices,
  LaborPrices,
  ThicknessConfig,
  formatCurrency,
  numberToKorean,
  defaultThickness,
} from "@/lib/calculations";
import { ExcelCalculationResult } from "@/lib/excelCalculations";
import { FileText, Printer, Download, Package, Users, Layers, DollarSign, ToggleLeft } from "lucide-react";
import { FormulaTooltip, formulaData } from "./FormulaTooltip";
import { CalculationBreakdown } from "./CalculationBreakdown";

interface QuotationResultProps {
  result: CalculationResult;
  excelResult?: ExcelCalculationResult;
  dimensions: TankDimensions;
  materialPrices: MaterialPrices;
  laborPrices: LaborPrices;
  thickness?: ThicknessConfig;
  tankName?: string;
  useRtpMode?: boolean;
  onToggleMode?: (value: boolean) => void;
}

export function QuotationResult({
  result,
  excelResult,
  dimensions,
  materialPrices,
  laborPrices,
  thickness = defaultThickness,
  tankName = "FRP TANK",
  useRtpMode = false,
  onToggleMode,
}: QuotationResultProps) {
  const [useMdMode, setUseMdMode] = useState(false);
  const [mdDays, setMdDays] = useState({
    winding: 0,
    assembly: 0,
    chemical: 0,
    special: 0,
  });
  const [mdInitialized, setMdInitialized] = useState(false);

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;
  
  // useRtpMode=false → 엑셀 실무 (기본), useRtpMode=true → RTP-1/ASME
  const isExcelMode = !useRtpMode;
  const baseResult: CalculationResult = isExcelMode && excelResult ? excelResult : result;

  // Initialize M/D days from calculation result
  if (!mdInitialized && baseResult.labor) {
    setMdDays({
      winding: baseResult.labor.winding,
      assembly: baseResult.labor.assembly,
      chemical: baseResult.labor.chemical,
      special: baseResult.labor.special,
    });
    setMdInitialized(true);
  }

  // Calculate M/D labor cost from editable days
  const mdLaborCost = 
    mdDays.winding * laborPrices.winding +
    mdDays.assembly * laborPrices.assembly +
    mdDays.chemical * laborPrices.chemical +
    mdDays.special * laborPrices.special;

  // Determine displayed result - override labor cost if M/D mode
  const r = useMdMode ? {
    ...baseResult,
    costs: {
      ...baseResult.costs,
      labor: mdLaborCost,
      subtotal: baseResult.costs.material + mdLaborCost,
      total: baseResult.costs.material + mdLaborCost + baseResult.costs.inspection + baseResult.costs.transportation + baseResult.costs.profit,
    }
  } : baseResult;

  // Get HLU/FW data (available from excelResult or fallback)
  const hluFwData = excelResult?.excelLabor;
  
  const handlePrint = () => {
    window.print();
  };

  const handleMdChange = (field: keyof typeof mdDays, value: string) => {
    const num = parseFloat(value) || 0;
    setMdDays(prev => ({ ...prev, [field]: num }));
  };
  
  return (
    <div className="space-y-6 animate-fade-in print:animate-none">
      {/* 계산 방식 토글 */}
      {excelResult && onToggleMode && (
        <Card className="border border-accent">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="calc-toggle" className="text-sm font-medium cursor-pointer">
                  계산 기준
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${!useRtpMode ? 'text-primary' : 'text-muted-foreground'}`}>
                  엑셀 실무
                </span>
                <Switch
                  id="calc-toggle"
                  checked={useRtpMode}
                  onCheckedChange={onToggleMode}
                />
                <span className={`text-xs font-medium ${useRtpMode ? 'text-primary' : 'text-muted-foreground'}`}>
                  RTP-1/ASME
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isExcelMode 
                ? "엑셀 실무 기준: 면적 여유율(×1.1/1.25), S.W=전체두께-C.B, 소모품 7%"
                : "RTP-1/ASME 기준: 압력탱크 설계 계산"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* 헤더 */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6" />
              QUOTATION
            </CardTitle>
            <div className="text-sm opacity-90">
              견적일자: {dateStr}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                {tankName} {r.capacity}㎥
              </h3>
              <p className="text-muted-foreground">
                (∅{dimensions.diameter * 1000} x {dimensions.height * 1000}H)
              </p>
              <Badge variant="secondary" className="mt-2">
                TH'K : SHELL {thickness.shellTop === thickness.shellBottom 
                  ? `${thickness.shellTop}t` 
                  : `${thickness.shellTop}t,${thickness.shellBottom}t`}, 
                BTM {thickness.bottom}t, 
                ROOF {thickness.roof}t
              </Badge>
              {isExcelMode && (
                <Badge variant="outline" className="mt-1 text-xs">엑셀 실무 기준</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="result-highlight">
                <p className="text-sm text-muted-foreground mb-1">공사금액</p>
                <p className="text-3xl font-bold text-primary">
                  ₩{formatCurrency(r.costs.total)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {numberToKorean(r.costs.total)}
                </p>
                <p className="text-xs text-muted-foreground">(부가세 별도)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 재료비 상세 */}
      <Card>
        <CardHeader className="bg-table-header text-table-header-foreground py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4" />
            1) MATERIAL COST (재료비)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-medium">품명</th>
                <th className="text-right p-3 font-medium">수량</th>
                <th className="text-right p-3 font-medium">단위</th>
                <th className="text-right p-3 font-medium">단가</th>
                <th className="text-right p-3 font-medium">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.resin}>
                    RESIN (RF-1001 or EQ)
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.materials.resin)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.resin)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.resin * materialPrices.resin)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.mat450}>
                    CHOPPED STRAND MAT#450
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.materials.mat450)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.mat450)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.mat450 * materialPrices.mat450)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={{
                    title: "Roving Cloth #570 (보강용)",
                    formula: "용량 > 10㎥: 용량 × 2.08 / 용량 ≤ 10㎥: 용량 × 1.7",
                    description: "탱크 용량(㎥)에 비례하여 산출되는 구조 보강용 로빙 클로스입니다.",
                    source: "업계 실적 데이터 기반 경험 계수",
                    note: "Hand Lay-up 부위 추가 보강재",
                  }}>
                    ROVING CLOTH#570
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.materials.rovingCloth)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.rovingCloth)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.rovingCloth * materialPrices.rovingCloth)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.roving2200}>
                    ROVING #2200
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.materials.roving2200)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.roving2200)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.roving2200 * materialPrices.roving2200)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.surfaceMat}>
                    SURFACE MAT#30
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.materials.surfaceMat)}</td>
                <td className="p-3 text-right">M²</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.surfaceMat)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.surfaceMat * materialPrices.surfaceMat)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.consumable}>
                    CONSUMABLE (소모품)
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right">1</td>
                <td className="p-3 text-right">LOT</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.materials.consumable)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">SUB TOTAL 1)</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.costs.material)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      {/* 인건비 상세 */}
      <Card>
        <CardHeader className="bg-table-header text-table-header-foreground py-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              2) LABOR COST (인건비)
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${!useMdMode ? 'text-primary-foreground' : 'text-table-header-foreground/60'}`}>
                HLU/FW
              </span>
              <Switch
                id="labor-toggle"
                checked={useMdMode}
                onCheckedChange={setUseMdMode}
                className="data-[state=checked]:bg-primary-foreground/30"
              />
              <span className={`text-xs font-medium ${useMdMode ? 'text-primary-foreground' : 'text-table-header-foreground/60'}`}>
                M/D
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!useMdMode ? (
            /* HLU/FW 모드 */
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left p-3 font-medium">항목</th>
                  <th className="text-right p-3 font-medium">수량</th>
                  <th className="text-right p-3 font-medium">단위</th>
                  <th className="text-right p-3 font-medium">단가</th>
                  <th className="text-right p-3 font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {hluFwData ? (
                  <>
                    <tr className="table-row-hover border-b">
                      <td className="p-3">HAND LAY-UP (HLU)</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(hluFwData.hluWeight)}</td>
                      <td className="p-3 text-right">KG</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(4500)}</td>
                      <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(hluFwData.hluCost)}</td>
                    </tr>
                    <tr className="table-row-hover border-b table-row-alt">
                      <td className="p-3">FILAMENT WINDING (FW)</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(hluFwData.fwWeight)}</td>
                      <td className="p-3 text-right">KG</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(1500)}</td>
                      <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(hluFwData.fwCost)}</td>
                    </tr>
                    <tr className="bg-primary/10 font-semibold">
                      <td colSpan={4} className="p-3 text-right">SUB TOTAL 2)</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(hluFwData.totalWeightCost)}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="table-row-hover border-b">
                      <td className="p-3">HAND LAY-UP (HLU)</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">KG</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                    </tr>
                    <tr className="bg-primary/10 font-semibold">
                      <td colSpan={4} className="p-3 text-right">SUB TOTAL 2)</td>
                      <td className="p-3 text-right tabular-nums">{formatCurrency(r.costs.labor)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          ) : (
            /* M/D 모드 - 날짜 직접 편집 가능 */
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left p-3 font-medium">항목</th>
                  <th className="text-right p-3 font-medium">M/D</th>
                  <th className="text-right p-3 font-medium">단위</th>
                  <th className="text-right p-3 font-medium">단가</th>
                  <th className="text-right p-3 font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row-hover border-b">
                  <td className="p-3">
                    <FormulaTooltip info={formulaData.windingLabor}>
                      WINDING LABOR
                    </FormulaTooltip>
                  </td>
                  <td className="p-3 text-right">
                    <Input
                      type="number"
                      value={mdDays.winding}
                      onChange={(e) => handleMdChange('winding', e.target.value)}
                      className="w-20 h-7 text-right text-sm ml-auto"
                    />
                  </td>
                  <td className="p-3 text-right">M/D</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.winding)}</td>
                  <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(mdDays.winding * laborPrices.winding)}</td>
                </tr>
                <tr className="table-row-hover border-b table-row-alt">
                  <td className="p-3">
                    <FormulaTooltip info={formulaData.assemblyLabor}>
                      ASSEMBLY LABOR
                    </FormulaTooltip>
                  </td>
                  <td className="p-3 text-right">
                    <Input
                      type="number"
                      value={mdDays.assembly}
                      onChange={(e) => handleMdChange('assembly', e.target.value)}
                      className="w-20 h-7 text-right text-sm ml-auto"
                    />
                  </td>
                  <td className="p-3 text-right">M/D</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.assembly)}</td>
                  <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(mdDays.assembly * laborPrices.assembly)}</td>
                </tr>
                <tr className="table-row-hover border-b">
                  <td className="p-3">
                    <FormulaTooltip info={formulaData.chemicalLabor}>
                      CHEMICAL LABOR
                    </FormulaTooltip>
                  </td>
                  <td className="p-3 text-right">
                    <Input
                      type="number"
                      value={mdDays.chemical}
                      onChange={(e) => handleMdChange('chemical', e.target.value)}
                      className="w-20 h-7 text-right text-sm ml-auto"
                    />
                  </td>
                  <td className="p-3 text-right">M/D</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.chemical)}</td>
                  <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(mdDays.chemical * laborPrices.chemical)}</td>
                </tr>
                <tr className="table-row-hover border-b table-row-alt">
                  <td className="p-3">
                    <FormulaTooltip info={formulaData.specialLabor}>
                      SPECIAL LABOR
                    </FormulaTooltip>
                  </td>
                  <td className="p-3 text-right">
                    <Input
                      type="number"
                      value={mdDays.special}
                      onChange={(e) => handleMdChange('special', e.target.value)}
                      className="w-20 h-7 text-right text-sm ml-auto"
                    />
                  </td>
                  <td className="p-3 text-right">M/D</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.special)}</td>
                  <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(mdDays.special * laborPrices.special)}</td>
                </tr>
                <tr className="bg-primary/10 font-semibold">
                  <td colSpan={4} className="p-3 text-right">SUB TOTAL 2)</td>
                  <td className="p-3 text-right tabular-nums">{formatCurrency(mdLaborCost)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      
      {/* 기술 사양 */}
      <Card>
        <CardHeader className="bg-table-header text-table-header-foreground py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4" />
            TECHNICAL SPECIFICATION (기술 사양)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-primary">면적 (m²)</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.bodyArea}>Body</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.areas.body}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.bottomArea}>Bottom</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.areas.bottom}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.headArea}>Head</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.areas.head}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.jointSW}>Joint (S.W)</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.areas.jointSW}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.jointCB}>Joint (C.B)</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{r.areas.jointCB}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total</td>
                    <td className="py-2 px-2 text-right tabular-nums">{r.areas.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">
                <FormulaTooltip info={formulaData.weight}>무게 (kg)</FormulaTooltip>
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.cbRatio}>내식층 (C.B) Total</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(r.weights.cbTotal)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.swBodyRatio}>구조층 (S.W) Total</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(r.weights.swTotal)}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total Weight</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(r.weights.cbTotal + r.weights.swTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 최종 합계 */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-table-header text-table-header-foreground py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            COST SUMMARY (비용 요약)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <tbody>
              <tr className="table-row-hover border-b">
                <td className="p-3">SUB TOTAL 1) + 2)</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.costs.subtotal)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.inspection}>
                    3) INSPECTION & TEST
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.costs.inspection)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.transportation}>
                    4) TRANSPORTATION
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.costs.transportation)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.profit}>
                    5) 일반관리비 및 이익
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.costs.profit)}</td>
              </tr>
              <tr className="bg-primary text-primary-foreground font-bold text-lg">
                <td className="p-4">TOTAL</td>
                <td className="p-4 text-right tabular-nums">₩{formatCurrency(r.costs.total)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      {/* 상세 계산 근거 */}
      <CalculationBreakdown
        result={r}
        dimensions={dimensions}
        thickness={thickness}
      />
      
      {/* 프린트 버튼 */}
      <div className="flex gap-4 print:hidden">
        <Button onClick={handlePrint} className="flex-1" size="lg">
          <Printer className="w-4 h-4 mr-2" />
          견적서 출력
        </Button>
        <Button variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          PDF 저장
        </Button>
      </div>
    </div>
  );
}
