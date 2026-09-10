import { useEffect, useState } from "react";
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
  SafetyMargins,
  ThicknessConfig,
  QuoteLine,
  formatCurrency,
  numberToKorean,
  finalizeCosts,
  defaultThickness,
  defaultSafetyMargins,
} from "@/lib/calculations";
import { ExcelCalculationResult } from "@/lib/excelCalculations";
import { FileText, Printer, Package, Users, Layers, DollarSign, ToggleLeft, AlertTriangle, Info } from "lucide-react";
import { FormulaTooltip, formulaData, FormulaInfo } from "./FormulaTooltip";
import { CalculationBreakdown } from "./CalculationBreakdown";

interface QuotationResultProps {
  result: CalculationResult;
  excelResult?: ExcelCalculationResult;
  dimensions: TankDimensions;
  materialPrices: MaterialPrices;
  laborPrices: LaborPrices;
  thickness?: ThicknessConfig;
  safetyMargins?: SafetyMargins;
  tankName?: string;
  useRtpMode?: boolean;
  onToggleMode?: (value: boolean) => void;
  stale?: boolean;
}

/** 숫자 표시 (소수 수량/두께도 안전하게) */
const fmtQty = (v: number | null) => {
  if (v === null || !isFinite(v)) return "-";
  return Number.isInteger(v) ? v.toLocaleString("ko-KR") : v.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
};

const lineTooltip: Record<string, FormulaInfo | undefined> = {
  resin: formulaData.resin,
  mat450: formulaData.mat450,
  roving2200: formulaData.roving2200,
  surfaceMat: formulaData.surfaceMat,
  consumable: formulaData.consumable,
  winding: formulaData.windingLabor,
  assembly: formulaData.assemblyLabor,
  chemical: formulaData.chemicalLabor,
  special: formulaData.specialLabor,
};

function LineRows({ lines }: { lines: QuoteLine[] }) {
  return (
    <>
      {lines.map((line, i) => {
        const info = lineTooltip[line.key];
        return (
          <tr key={line.key} className={`table-row-hover border-b ${i % 2 === 1 ? "table-row-alt" : ""}`}>
            <td className="p-3">
              {info ? <FormulaTooltip info={info}>{line.name}</FormulaTooltip> : line.name}
            </td>
            <td className="p-3 text-right tabular-nums">{fmtQty(line.qty)}</td>
            <td className="p-3 text-right">{line.unit}</td>
            <td className="p-3 text-right tabular-nums">
              {line.unitPrice === null ? "-" : formatCurrency(line.unitPrice)}
            </td>
            <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(line.amount)}</td>
          </tr>
        );
      })}
    </>
  );
}

export function QuotationResult({
  result,
  excelResult,
  dimensions,
  materialPrices,
  laborPrices,
  thickness = defaultThickness,
  safetyMargins = defaultSafetyMargins,
  tankName = "FRP TANK",
  useRtpMode = false,
  onToggleMode,
  stale = false,
}: QuotationResultProps) {
  const [useMdMode, setUseMdMode] = useState(false);

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, "0")}월 ${String(today.getDate()).padStart(2, "0")}일`;

  // useRtpMode=false → 엑셀 실무 (기본), useRtpMode=true → 기존 산출식(참고)
  const isExcelMode = !useRtpMode;
  const baseResult: CalculationResult = isExcelMode && excelResult ? excelResult : result;

  // 새로 계산할 때마다 M/D 값을 현재 결과로 초기화 (이전 탱크 값 유지 방지)
  const [mdDays, setMdDays] = useState({
    winding: baseResult.labor.winding,
    assembly: baseResult.labor.assembly,
    chemical: baseResult.labor.chemical,
    special: baseResult.labor.special,
  });

  useEffect(() => {
    setMdDays({
      winding: baseResult.labor.winding,
      assembly: baseResult.labor.assembly,
      chemical: baseResult.labor.chemical,
      special: baseResult.labor.special,
    });
  }, [baseResult]);

  // M/D 인건비 행 (선택한 계산 모드와 혼용하지 않고 M/D만 사용)
  const mdLines: QuoteLine[] = [
    { key: "winding", name: "WINDING LABOR", qty: mdDays.winding, unit: "M/D", unitPrice: laborPrices.winding, amount: Math.round(mdDays.winding * laborPrices.winding) },
    { key: "assembly", name: "ASSEMBLY LABOR", qty: mdDays.assembly, unit: "M/D", unitPrice: laborPrices.assembly, amount: Math.round(mdDays.assembly * laborPrices.assembly) },
    { key: "chemical", name: "CHEMICAL LABOR", qty: mdDays.chemical, unit: "M/D", unitPrice: laborPrices.chemical, amount: Math.round(mdDays.chemical * laborPrices.chemical) },
    { key: "special", name: "SPECIAL LABOR", qty: mdDays.special, unit: "M/D", unitPrice: laborPrices.special, amount: Math.round(mdDays.special * laborPrices.special) },
  ];
  const mdLaborCost = mdLines.reduce((s, l) => s + l.amount, 0);

  // M/D 모드에서는 이익률 → 안전할증 → 만원 반올림을 동일 순서로 재계산
  const costs = useMdMode
    ? finalizeCosts(
        baseResult.costs.material,
        mdLaborCost,
        baseResult.costs.inspection,
        baseResult.costs.transportation,
        baseResult.costs.extras,
        safetyMargins
      )
    : baseResult.costs;

  const laborLines = useMdMode ? mdLines : baseResult.laborLines;
  const materialLines = baseResult.materialLines;
  const extraLines = baseResult.extraLines;
  const issues = baseResult.issues || [];

  const handlePrint = () => window.print();

  const handleMdChange = (field: keyof typeof mdDays, value: string) => {
    const num = parseFloat(value);
    setMdDays((prev) => ({ ...prev, [field]: isFinite(num) && num >= 0 ? num : 0 }));
  };

  return (
    <div className="space-y-6 animate-fade-in print:animate-none">
      {stale && (
        <Card className="border border-destructive bg-destructive/5 print:hidden">
          <CardContent className="py-3 px-4 flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <span>
              입력값이 변경되었습니다. 아래 결과는 이전 입력 기준입니다. <b>견적 계산하기</b>를 다시 눌러 재계산한 뒤 출력하세요.
            </span>
          </CardContent>
        </Card>
      )}

      {/* 입력 오류 / 안내 */}
      {issues.length > 0 && (
        <Card className="border border-accent">
          <CardContent className="py-3 px-4 space-y-1.5">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {issue.level === "error" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <span className={issue.level === "error" ? "text-destructive" : "text-muted-foreground"}>
                  {issue.message}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 계산 방식 토글 */}
      {excelResult && onToggleMode && (
        <Card className="border border-accent print:hidden">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="calc-toggle" className="text-sm font-medium cursor-pointer">
                  계산 기준
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${!useRtpMode ? "text-primary" : "text-muted-foreground"}`}>
                  엑셀 실무
                </span>
                <Switch id="calc-toggle" checked={useRtpMode} onCheckedChange={onToggleMode} />
                <span className={`text-xs font-medium ${useRtpMode ? "text-primary" : "text-muted-foreground"}`}>
                  기존 산출식(참고)
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isExcelMode
                ? "엑셀 실무 기준: 면적 여유율(×1.1/1.25), S.W = 전체두께 − C.B, 소모품 7%"
                : "기존 사내 수량산출식(참고용). 압력·온도·강도 입력이 없는 수량 산출이며 설계 검증용이 아닙니다."}
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
            <div className="text-sm opacity-90">견적일자: {dateStr}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">
                {tankName} {baseResult.capacity}㎥
              </h3>
              <p className="text-muted-foreground">
                (∅{Math.round(dimensions.diameter * 1000)} x {Math.round(dimensions.height * 1000)}H)
              </p>
              <Badge variant="secondary" className="mt-2">
                TH'K : SHELL{" "}
                {thickness.shellTop === thickness.shellBottom
                  ? `${thickness.shellTop}t`
                  : `${thickness.shellTop}t,${thickness.shellBottom}t`}
                , BTM {thickness.bottom}t, ROOF {thickness.roof}t
              </Badge>
              <Badge variant="outline" className="mt-1 text-xs">
                {isExcelMode ? "엑셀 실무 기준" : "기존 산출식(참고)"} · 비중 {thickness.frpDensity}
              </Badge>
            </div>
            <div className="text-right">
              <div className="result-highlight">
                <p className="text-sm text-muted-foreground mb-1">공사금액</p>
                <p className="text-3xl font-bold text-primary break-keep">₩{formatCurrency(costs.total)}</p>
                <p className="text-sm text-muted-foreground mt-1 break-keep">{numberToKorean(costs.total)}</p>
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
              <LineRows lines={materialLines} />
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">
                  SUB TOTAL 1)
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(costs.material)}</td>
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
            <div className="flex items-center gap-2 print:hidden">
              <span className={`text-xs font-medium ${!useMdMode ? "text-primary-foreground" : "text-table-header-foreground/60"}`}>
                산출값
              </span>
              <Switch
                id="labor-toggle"
                checked={useMdMode}
                onCheckedChange={setUseMdMode}
                className="data-[state=checked]:bg-primary-foreground/30"
              />
              <span className={`text-xs font-medium ${useMdMode ? "text-primary-foreground" : "text-table-header-foreground/60"}`}>
                M/D 직접입력
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-medium">항목</th>
                <th className="text-right p-3 font-medium">{useMdMode ? "M/D" : "수량"}</th>
                <th className="text-right p-3 font-medium">단위</th>
                <th className="text-right p-3 font-medium">단가</th>
                <th className="text-right p-3 font-medium">금액</th>
              </tr>
            </thead>
            <tbody>
              {useMdMode ? (
                mdLines.map((line, i) => (
                  <tr key={line.key} className={`table-row-hover border-b ${i % 2 === 1 ? "table-row-alt" : ""}`}>
                    <td className="p-3">
                      {lineTooltip[line.key] ? (
                        <FormulaTooltip info={lineTooltip[line.key]!}>{line.name}</FormulaTooltip>
                      ) : (
                        line.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        value={mdDays[line.key as keyof typeof mdDays]}
                        onChange={(e) => handleMdChange(line.key as keyof typeof mdDays, e.target.value)}
                        className="w-20 h-7 text-right text-sm ml-auto"
                      />
                    </td>
                    <td className="p-3 text-right">M/D</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(line.unitPrice ?? 0)}</td>
                    <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(line.amount)}</td>
                  </tr>
                ))
              ) : (
                <LineRows lines={laborLines} />
              )}
              <tr className="bg-primary/10 font-semibold">
                <td colSpan={4} className="p-3 text-right">
                  SUB TOTAL 2)
                </td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(costs.labor)}</td>
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
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.bodyArea}>Body</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.body}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.bottomArea}>Bottom</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.bottom}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.headArea}>Head</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.head}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.jointSW}>Joint (S.W)</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.jointSW}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.jointCB}>Joint (C.B)</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.jointCB}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">L/L (사다리 자리)</td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.ll}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Hoop (보강밴드)</td>
                    <td className="py-2 text-right tabular-nums">{baseResult.areas.hoop}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total</td>
                    <td className="py-2 px-2 text-right tabular-nums">{baseResult.areas.total}</td>
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
                    <td className="py-2 text-right tabular-nums">{formatCurrency(baseResult.weights.cbTotal)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">
                      <FormulaTooltip info={formulaData.swBodyRatio}>구조층 (S.W) Total</FormulaTooltip>
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(baseResult.weights.swTotal)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 text-muted-foreground">적용 비중</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{thickness.frpDensity}</td>
                  </tr>
                  <tr className="font-semibold bg-secondary">
                    <td className="py-2 px-2">Total Weight</td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      {formatCurrency(baseResult.weights.cbTotal + baseResult.weights.swTotal)}
                    </td>
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
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(costs.subtotal)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.inspection}>3) INSPECTION &amp; TEST</FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(costs.inspection)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.transportation}>4) TRANSPORTATION</FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(costs.transportation)}</td>
              </tr>
              {extraLines.map((line) => (
                <tr key={line.key} className="table-row-hover border-b">
                  <td className="p-3">추가 항목 · {line.name}</td>
                  <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(line.amount)}</td>
                </tr>
              ))}
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3">
                  <FormulaTooltip info={formulaData.profit}>
                    5) 일반관리비 및 이익 ({safetyMargins.profitMargin}%)
                  </FormulaTooltip>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(costs.profit)}</td>
              </tr>
              <tr className="table-row-hover border-b">
                <td className="p-3">6) 안전할증 ({safetyMargins.safetyFactor}%)</td>
                <td className="p-3 text-right tabular-nums font-medium">{formatCurrency(costs.safety)}</td>
              </tr>
              <tr className="table-row-hover border-b table-row-alt">
                <td className="p-3 text-muted-foreground">7) 만원 단위 반올림 차액</td>
                <td className="p-3 text-right tabular-nums font-medium text-muted-foreground">
                  {formatCurrency(costs.rounding)}
                </td>
              </tr>
              <tr className="bg-primary text-primary-foreground font-bold text-lg">
                <td className="p-4">TOTAL</td>
                <td className="p-4 text-right tabular-nums">₩{formatCurrency(costs.total)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 상세 계산 근거 */}
      <CalculationBreakdown
        result={baseResult}
        excelResult={isExcelMode ? excelResult : undefined}
        dimensions={dimensions}
        thickness={thickness}
      />

      {/* 프린트 버튼 */}
      <div className="flex flex-col gap-2 print:hidden">
        <Button onClick={handlePrint} className="w-full" size="lg" disabled={stale}>
          <Printer className="w-4 h-4 mr-2" />
          견적서 출력 / PDF 저장
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          인쇄 창에서 프린터를 <b>"PDF로 저장"</b>으로 선택하면 PDF 파일로 저장됩니다.
          {stale && " 입력이 변경되어 재계산 전에는 출력할 수 없습니다."}
        </p>
      </div>
    </div>
  );
}
