import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  useExcelPrimary?: boolean;
  onTogglePrimary?: (value: boolean) => void;
}

export function QuotationResult({
  result,
  excelResult,
  dimensions,
  materialPrices,
  laborPrices,
  thickness = defaultThickness,
  tankName = "FRP TANK",
  useExcelPrimary = false,
  onTogglePrimary,
}: QuotationResultProps) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;
  
  // 토글에 따라 표시할 결과 선택
  const r: CalculationResult = useExcelPrimary && excelResult ? excelResult : result;
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6 animate-fade-in print:animate-none">
      {/* 계산 방식 토글 */}
      {excelResult && onTogglePrimary && (
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
                <span className={`text-xs font-medium ${!useExcelPrimary ? 'text-primary' : 'text-muted-foreground'}`}>
                  RTP-1/ASME
                </span>
                <Switch
                  id="calc-toggle"
                  checked={useExcelPrimary}
                  onCheckedChange={onTogglePrimary}
                />
                <span className={`text-xs font-medium ${useExcelPrimary ? 'text-primary' : 'text-muted-foreground'}`}>
                  엑셀 실무
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {useExcelPrimary 
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
                TH'K : SHELL {r.weights.swBody > 1000 ? '15t,13t' : '6t'}, 
                BTM {r.weights.swBottom > 200 ? '15t' : '6t'}, 
                ROOF {r.weights.swHead > 200 ? '12t' : '6t'}
              </Badge>
              {useExcelPrimary && (
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
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            2) LABOR COST (인건비)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.windingLabor}>
                    WINDING LABOR
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{r.labor.winding}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.winding)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.labor.winding * laborPrices.winding)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.assemblyLabor}>
                    ASSEMBLY LABOR
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{r.labor.assembly}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.assembly)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.labor.assembly * laborPrices.assembly)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.chemicalLabor}>
                    CHEMICAL LABOR
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{r.labor.chemical}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.chemical)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.labor.chemical * laborPrices.chemical)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.specialLabor}>
                    SPECIAL LABOR
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums">{r.labor.special}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.special)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(r.labor.special * laborPrices.special)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">SUB TOTAL 2)</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(r.costs.labor)}</td>
              </tr>
            </tbody>
          </table>
          
          {/* HLU/FW 참고 (엑셀 모드일 때만) */}
          {useExcelPrimary && excelResult && (
            <div className="border-t bg-accent/20 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                📊 중량 기반 인건비 참고 (HLU/FW)
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">HLU:</span>
                  <span className="ml-1 font-mono font-medium">
                    {formatCurrency(excelResult.excelLabor.hluWeight)}kg × 4,500 = ₩{formatCurrency(excelResult.excelLabor.hluCost)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">FW:</span>
                  <span className="ml-1 font-mono font-medium">
                    {formatCurrency(excelResult.excelLabor.fwWeight)}kg × 1,500 = ₩{formatCurrency(excelResult.excelLabor.fwCost)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs font-semibold">
                합계: ₩{formatCurrency(excelResult.excelLabor.totalWeightCost)}
              </div>
            </div>
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
