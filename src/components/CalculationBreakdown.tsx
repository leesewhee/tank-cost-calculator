import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  FlaskConical,
  Scale,
  Coins,
} from "lucide-react";
import {
  CalculationResult,
  TankDimensions,
  ThicknessConfig,
  formatCurrency,
} from "@/lib/calculations";
import { ExcelCalculationResult } from "@/lib/excelCalculations";

interface CalculationBreakdownProps {
  result: CalculationResult;
  /** 엑셀 실무 모드일 때만 전달 (전달되면 엑셀 산출식 기준으로 근거를 표시) */
  excelResult?: ExcelCalculationResult;
  dimensions: TankDimensions;
  thickness: ThicknessConfig;
}

const n2 = (v: number) => v.toFixed(2);
const n1 = (v: number) => v.toFixed(1);

export function CalculationBreakdown({
  result,
  excelResult,
  dimensions,
  thickness,
}: CalculationBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { diameter, height } = dimensions;
  const isExcel = !!excelResult;
  const d = excelResult?.excelDetail;
  const density = d ? d.density : thickness.frpDensity || 2.0;

  // 실제 계산에 사용된 면적 (결과값 그대로 사용 → 화면과 계산이 항상 일치)
  const a = result.areas;

  const areaRows = isExcel
    ? [
        { name: "Body", formula: "D × H × 3.14 × 1.1", subst: `${diameter} × ${height} × 3.14 × 1.1`, value: a.body },
        { name: "BTM", formula: "D² × 0.785 × 1.1", subst: `${diameter}² × 0.785 × 1.1`, value: a.bottom },
        { name: "Head", formula: "D² × 0.785 × 1.25", subst: `${diameter}² × 0.785 × 1.25`, value: a.head },
        { name: "Jnt (S.W)", formula: "D × 3.14 × 0.3 × 2", subst: `${diameter} × 3.14 × 0.3 × 2`, value: a.jointSW },
        { name: "Jnt (C.B)", formula: "D × 3.14 × 0.25 × 2", subst: `${diameter} × 3.14 × 0.25 × 2`, value: a.jointCB },
        { name: "L/L", formula: "0.6 × 0.6 × 4 (고정)", subst: "-", value: a.ll },
        { name: "Hoop", formula: "D × 3.14 × 0.12 × 3", subst: `${diameter} × 3.14 × 0.12 × 3`, value: a.hoop },
      ]
    : [
        { name: "Body", formula: "π × D × H", subst: `${Math.PI.toFixed(4)} × ${diameter} × ${height}`, value: a.body },
        { name: "Bottom", formula: "π × (D/2)²", subst: `${Math.PI.toFixed(4)} × (${diameter}/2)²`, value: a.bottom },
        { name: "Head", formula: "BTM × 1.1", subst: `${n2(a.bottom)} × 1.1`, value: a.head },
        { name: "Joint S.W", formula: "0.6 × π × D", subst: `0.6 × π × ${diameter}`, value: a.jointSW },
        { name: "Joint C.B", formula: "0.5 × π × D", subst: `0.5 × π × ${diameter}`, value: a.jointCB },
        { name: "L/L", formula: "고정값 1.44", subst: "-", value: a.ll },
        { name: "Hoop", formula: "0.2 × π × D", subst: `0.2 × π × ${diameter}`, value: a.hoop },
      ];

  const avgShell = (thickness.shellTop + thickness.shellBottom) / 2;

  const cbRows = isExcel && d
    ? [
        { name: "Body", subst: `${n2(a.body)} × ${d.cbThk} × ${density}`, value: result.weights.cbBody },
        { name: "BTM", subst: `${n2(a.bottom)} × ${d.cbThk} × ${density}`, value: result.weights.cbBottom },
        { name: "Head", subst: `${n2(a.head)} × ${d.cbThk} × ${density}`, value: result.weights.cbHead },
        { name: "Jnt (C.B)", subst: `${n2(a.jointCB)} × ${n1(d.cbJntCBThk)} × ${density}`, value: result.weights.cbJoint },
      ]
    : [
        { name: "Body", subst: `${n2(a.body)} × ${thickness.cbThickness} × ${density}`, value: result.weights.cbBody },
        { name: "Bottom", subst: `${n2(a.bottom)} × ${thickness.cbThickness} × ${density}`, value: result.weights.cbBottom },
        { name: "Head", subst: `${n2(a.head)} × ${thickness.cbThickness} × ${density}`, value: result.weights.cbHead },
        { name: "Joint", subst: `${n2(a.jointCB)} × ${thickness.jointCB} × ${density}`, value: result.weights.cbJoint },
      ];

  const swRows = isExcel && d
    ? [
        { name: "Body (FW)", subst: `${n2(a.body)} × ${n1(d.swBodyThk)} × ${density}`, value: result.weights.swBody },
        { name: "BTM", subst: `${n2(a.bottom)} × ${n1(d.swBtmThk)} × ${density}`, value: result.weights.swBottom },
        { name: "Head", subst: `${n2(a.head)} × ${n1(d.swHeadThk)} × ${density}`, value: result.weights.swHead },
        { name: "Jnt (S.W)", subst: `${n2(a.jointSW)} × ${n1(d.swJntSWThk)} × ${density}`, value: result.weights.swJoint },
        { name: "L/L", subst: `${n2(a.ll)} × ${d.swLLThk} × ${density}`, value: result.weights.swLL },
        { name: "Hoop (FW)", subst: `${n2(a.hoop)} × ${d.swHoopThk} × ${density}`, value: result.weights.swHoop },
      ]
    : [
        { name: "Body", subst: `${n2(a.body)} × ${n1(avgShell)} × ${density}`, value: result.weights.swBody },
        { name: "Bottom", subst: `${n2(a.bottom)} × ${thickness.bottom} × ${density}`, value: result.weights.swBottom },
        { name: "Head", subst: `${n2(a.head)} × ${thickness.roof} × ${density}`, value: result.weights.swHead },
        { name: "Joint", subst: `${n2(a.jointSW)} × ${thickness.jointSW} × ${density}`, value: result.weights.swJoint },
        { name: "L/L", subst: `${n2(a.ll)} × ${thickness.ll} × ${density}`, value: result.weights.swLL },
        { name: "Hoop", subst: `${n2(a.hoop)} × ${thickness.hoop} × ${density}`, value: result.weights.swHoop },
      ];

  const materialRows = isExcel && d
    ? [
        { name: "RESIN", basis: `C.B × ${d.ratios.resinCB} + S.W(Body·Hoop) × ${d.ratios.resinSWBody} + S.W(기타) × ${d.ratios.resinSWOther}`, value: `${result.materials.resin} kg` },
        { name: "MAT #450", basis: `해당 부위 중량 × ${d.ratios.mat}`, value: `${result.materials.mat450} kg` },
        { name: "ROVING CLOTH #570", basis: `Jnt(S.W) 구조층 × (0.0586 × D + 0.2129) = × ${n2(d.rc570Multiplier)}`, value: `${result.materials.rovingCloth} kg` },
        { name: "ROVING #2200", basis: `(Body + Hoop) 구조층 × ${d.ratios.roving}`, value: `${result.materials.roving2200} kg` },
        { name: "SURFACE MAT #30", basis: `면적 × ${d.ratios.surfaceMatFactor} (주요부위 ×2)`, value: `${result.materials.surfaceMat} m²` },
        { name: "CONSUMABLE", basis: `(재료비 + 고정비) × ${(d.ratios.consumableRate * 100).toFixed(0)}%`, value: `${formatCurrency(result.materials.consumable)} 원` },
      ]
    : [
        { name: "RESIN", basis: "C.B × 0.7 + S.W Body × 0.4 + S.W 기타 × 0.7", value: `${result.materials.resin} kg` },
        { name: "MAT #450", basis: "C.B × 0.3 + S.W(Hand Lay-up) × 0.3", value: `${result.materials.mat450} kg` },
        { name: "ROVING CLOTH", basis: result.capacity > 10 ? `용량(${result.capacity}㎥) × 2.08` : `용량(${result.capacity}㎥) × 1.7`, value: `${result.materials.rovingCloth} kg` },
        { name: "ROVING #2200", basis: "S.W Body × 0.6", value: `${result.materials.roving2200} kg` },
        { name: "SURFACE MAT", basis: "전체 면적 × 2.2", value: `${result.materials.surfaceMat} m²` },
        { name: "CONSUMABLE", basis: "재료비 × 6.5%", value: `${formatCurrency(result.materials.consumable)} 원` },
      ];

  const c = result.costs;

  const sections = [
    {
      id: "area",
      title: "1단계: 면적 계산",
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">입력값</p>
            <p className="font-mono text-sm">직경(D) = {diameter}m, 높이(H) = {height}m</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">부위</th>
                <th className="text-left p-2">계산식</th>
                <th className="text-left p-2">대입</th>
                <th className="text-right p-2">결과(m²)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {areaRows.map((row, i) => (
                <tr key={row.name} className={`border-b ${i % 2 === 1 ? "bg-secondary/20" : ""}`}>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.formula}</td>
                  <td className="p-2">{row.subst}</td>
                  <td className="p-2 text-right font-semibold">{n2(row.value)}</td>
                </tr>
              ))}
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={3}>Total</td>
                <td className="p-2 text-right">{n2(a.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "weight",
      title: "2단계: 중량 계산",
      icon: <Scale className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">기본 공식</p>
            <p className="font-mono text-sm font-semibold">
              중량(kg) = 면적(m²) × 두께(mm) × 비중({density})
            </p>
            {isExcel && d && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                C.B 두께 {d.cbThk}mm / S.W Body {n1(d.swBodyThk)}mm (쉘 평균 {n1(d.avgShell)} − C.B) / BTM {n1(d.swBtmThk)}mm / Head {n1(d.swHeadThk)}mm
              </p>
            )}
          </div>

          <div className="bg-accent/30 p-3 rounded-lg">
            <p className="text-xs font-semibold">현재 적용 비중: {density}</p>
            <p className="text-xs text-muted-foreground mt-1">
              사내 견적에서 자재 로스·보강·시공 오차를 포함해 관행적으로 사용해 온 <strong>견적용 계수</strong>입니다.
              상세 설정 &gt; 두께 탭에서 값을 바꾸면 중량과 재료비가 그대로 비례해 바뀝니다.
            </p>
          </div>

          <h5 className="font-semibold text-sm mt-4">내식층 (C.B Layer)</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">부위</th>
                <th className="text-left p-2">면적 × 두께 × 비중</th>
                <th className="text-right p-2">결과(kg)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {cbRows.map((row, i) => (
                <tr key={row.name} className={`border-b ${i % 2 === 1 ? "bg-secondary/20" : ""}`}>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.subst}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(row.value)}</td>
                </tr>
              ))}
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={2}>C.B Total</td>
                <td className="p-2 text-right">{formatCurrency(result.weights.cbTotal)}</td>
              </tr>
            </tbody>
          </table>

          <h5 className="font-semibold text-sm mt-4">구조층 (S.W Layer)</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">부위</th>
                <th className="text-left p-2">면적 × 두께 × 비중</th>
                <th className="text-right p-2">결과(kg)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {swRows.map((row, i) => (
                <tr key={row.name} className={`border-b ${i % 2 === 1 ? "bg-secondary/20" : ""}`}>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.subst}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(row.value)}</td>
                </tr>
              ))}
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={2}>S.W Total</td>
                <td className="p-2 text-right">{formatCurrency(result.weights.swTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "material",
      title: "3단계: 재료량 산출",
      icon: <FlaskConical className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">품목</th>
                <th className="text-left p-2">산출 근거</th>
                <th className="text-right p-2">결과</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {materialRows.map((row, i) => (
                <tr key={row.name} className={`border-b ${i % 2 === 1 ? "bg-secondary/20" : ""}`}>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.basis}</td>
                  <td className="p-2 text-right font-semibold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            위 배합비·계수·단가는 <strong>월드테크(주)의 기존 견적 산출 가정</strong>입니다. 국제규격에서 정한 값이 아니며,
            설계 검증이 필요한 경우 별도의 구조 계산이 필요합니다.
          </div>
        </div>
      ),
    },
    {
      id: "cost",
      title: "4단계: 금액 합산",
      icon: <Coins className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <table className="w-full text-sm">
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="p-2">1) 재료비 (고정비·소모품 포함)</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.material)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">2) 인건비</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.labor)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">소계 (1+2)</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.subtotal)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">3) 검사비 + 4) 운송비 + 추가항목</td>
                <td className="p-2 text-right font-semibold">
                  {formatCurrency(c.inspection + c.transportation + c.extras)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">5) 일반관리비 및 이익</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.profit)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">6) 안전할증</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.safety)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">7) 만원 단위 반올림</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(c.rounding)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2">TOTAL</td>
                <td className="p-2 text-right">{formatCurrency(c.total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground">
            적용 순서: (소계 + 검사비 + 운송비 + 추가항목) → 이익률 → 안전할증 → 만원 단위 반올림.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-2 border-dashed border-primary/30 print:hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>상세 계산 근거 보기</span>
                <Badge variant="outline" className="ml-2">
                  {isExcel ? "엑셀 실무 기준" : "기존 산출식(참고)"}
                </Badge>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                현재 선택한 계산 기준({isExcel ? "엑셀 실무" : "기존 산출식"})으로 실제 견적에 사용된 값을 그대로 보여줍니다.
              </p>

              <div className="flex gap-2 flex-wrap">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className="gap-2"
                  >
                    {section.icon}
                    {section.title}
                  </Button>
                ))}
              </div>

              {activeSection && (
                <div className="mt-4 p-4 bg-background border rounded-lg animate-fade-in">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    {sections.find((s) => s.id === activeSection)?.icon}
                    {sections.find((s) => s.id === activeSection)?.title}
                  </h4>
                  {sections.find((s) => s.id === activeSection)?.content}
                </div>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">엑셀과 값이 다를 경우 확인 사항</p>
                    <ul className="text-muted-foreground mt-2 space-y-1">
                      <li>1. 부위별 두께 입력값이 동일한지 확인</li>
                      <li>2. 비중 적용값({density})이 동일한지 확인</li>
                      <li>3. 계산 기준(엑셀 실무 / 기존 산출식) 선택이 동일한지 확인</li>
                      <li>4. 고정비(플랜지·맨홀·사다리 등)와 추가 항목이 반영되어 있는지 확인</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
