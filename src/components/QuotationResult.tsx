import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalculationResult,
  TankDimensions,
  MaterialPrices,
  LaborPrices,
  formatCurrency,
  numberToKorean,
} from "@/lib/calculations";
import { FileText, Printer, Download, Package, Users, Layers, DollarSign } from "lucide-react";

interface QuotationResultProps {
  result: CalculationResult;
  dimensions: TankDimensions;
  materialPrices: MaterialPrices;
  laborPrices: LaborPrices;
  tankName?: string;
}

export function QuotationResult({
  result,
  dimensions,
  materialPrices,
  laborPrices,
  tankName = "FRP TANK",
}: QuotationResultProps) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6 animate-fade-in print:animate-none">
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
                {tankName} {result.capacity}㎥
              </h3>
              <p className="text-muted-foreground">
                (∅{dimensions.diameter * 1000} x {dimensions.height * 1000}H)
              </p>
              <Badge variant="secondary" className="mt-2">
                TH'K : SHELL {result.weights.swBody > 1000 ? '15t,13t' : '6t'}, 
                BTM {result.weights.swBottom > 200 ? '15t' : '6t'}, 
                ROOF {result.weights.swHead > 200 ? '12t' : '6t'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="result-highlight">
                <p className="text-sm text-muted-foreground mb-1">공사금액</p>
                <p className="text-3xl font-bold text-primary">
                  ₩{formatCurrency(result.costs.total)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {numberToKorean(result.costs.total)}
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
                <td className="p-3">RESIN (RF-1001 or EQ)</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.materials.resin)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.resin)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.resin * materialPrices.resin)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">CHOPPED STRAND MAT#450</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.materials.mat450)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.mat450)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.mat450 * materialPrices.mat450)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">ROVING CLOTH#570</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.materials.rovingCloth)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.rovingCloth)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.rovingCloth * materialPrices.rovingCloth)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">ROVING #2200</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.materials.roving2200)}</td>
                <td className="p-3 text-right">KG</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.roving2200)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.roving2200 * materialPrices.roving2200)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">SURFACE MAT#30</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.materials.surfaceMat)}</td>
                <td className="p-3 text-right">M²</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(materialPrices.surfaceMat)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.surfaceMat * materialPrices.surfaceMat)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">CONSUMABLE (소모품)</td>
                <td className="p-3 text-right">1</td>
                <td className="p-3 text-right">LOT</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.materials.consumable)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">SUB TOTAL 1)</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.costs.material)}</td>
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
                <td className="p-3">WINDING LABOR</td>
                <td className="p-3 text-right tabular-nums">{result.labor.winding}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.winding)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.labor.winding * laborPrices.winding)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">ASSEMBLY LABOR</td>
                <td className="p-3 text-right tabular-nums">{result.labor.assembly}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.assembly)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.labor.assembly * laborPrices.assembly)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">CHEMICAL LABOR</td>
                <td className="p-3 text-right tabular-nums">{result.labor.chemical}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.chemical)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.labor.chemical * laborPrices.chemical)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">SPECIAL LABOR</td>
                <td className="p-3 text-right tabular-nums">{result.labor.special}</td>
                <td className="p-3 text-right">M/D</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(laborPrices.special)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.labor.special * laborPrices.special)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">SUB TOTAL 2)</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(result.costs.labor)}</td>
              </tr>
            </tbody>
          </table>
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
                    <td className="py-2">Body</td>
                    <td className="py-2 text-right tabular-nums">{result.areas.body}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Bottom</td>
                    <td className="py-2 text-right tabular-nums">{result.areas.bottom}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Head</td>
                    <td className="py-2 text-right tabular-nums">{result.areas.head}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Joint (S.W)</td>
                    <td className="py-2 text-right tabular-nums">{result.areas.jointSW}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Joint (C.B)</td>
                    <td className="py-2 text-right tabular-nums">{result.areas.jointCB}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total</td>
                    <td className="py-2 px-2 text-right tabular-nums">{result.areas.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">무게 (kg)</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">내식층 (C.B) Total</td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(result.weights.cbTotal)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">구조층 (S.W) Total</td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(result.weights.swTotal)}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total Weight</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(result.weights.cbTotal + result.weights.swTotal)}</td>
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
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.costs.subtotal)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">3) INSPECTION & TEST</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.costs.inspection)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">4) TRANSPORTATION</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.costs.transportation)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">5) 일반관리비 및 이익</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(result.costs.profit)}</td>
              </tr>
              <tr className="bg-primary text-primary-foreground font-bold text-lg">
                <td className="p-4">TOTAL</td>
                <td className="p-4 text-right tabular-nums">₩{formatCurrency(result.costs.total)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      
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
