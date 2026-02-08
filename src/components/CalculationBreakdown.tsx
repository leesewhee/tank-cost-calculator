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
  BookOpen,
  Layers,
  FlaskConical,
  Scale
} from "lucide-react";
import { 
  CalculationResult, 
  TankDimensions, 
  ThicknessConfig
} from "@/lib/calculations";

interface CalculationBreakdownProps {
  result: CalculationResult;
  dimensions: TankDimensions;
  thickness: ThicknessConfig;
}

export function CalculationBreakdown({ 
  result, 
  dimensions,
  thickness 
}: CalculationBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const { diameter, height } = dimensions;
  const PI = Math.PI;
  
  // 재계산하여 중간값 표시
  const bodyArea = PI * diameter * height;
  const bottomArea = PI * Math.pow(diameter / 2, 2);
  const headArea = bottomArea * 1.1;
  const jointSWArea = 0.6 * PI * diameter;
  const jointCBArea = 0.5 * PI * diameter;
  const hoopArea = 0.2 * PI * diameter;
  const llArea = 1.44;
  
  const frpDensity = 2.0;
  
  // 내식층 중량
  const cbBody = bodyArea * thickness.cbThickness * frpDensity;
  const cbBottom = bottomArea * thickness.cbThickness * frpDensity;
  const cbHead = headArea * thickness.cbThickness * frpDensity;
  const cbJoint = jointCBArea * thickness.jointCB * frpDensity;
  
  // 구조층 중량
  const avgShellThickness = (thickness.shellTop + thickness.shellBottom) / 2;
  const swBody = bodyArea * avgShellThickness * frpDensity;
  const swBottom = bottomArea * thickness.bottom * frpDensity;
  const swHead = headArea * thickness.roof * frpDensity;
  const swJoint = jointSWArea * thickness.jointSW * frpDensity;
  const swLL = llArea * thickness.ll * frpDensity;
  const swHoop = hoopArea * thickness.hoop * frpDensity;
  
  // 수지량 분해
  const cbResin = result.weights.cbTotal * 0.7;
  const swBodyResin = swBody * 0.4;
  const swOtherResin = (swBottom + swHead + swJoint + swLL + swHoop) * 0.7;
  
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
              <tr className="border-b">
                <td className="p-2">Body</td>
                <td className="p-2">π × D × H</td>
                <td className="p-2">{PI.toFixed(4)} × {diameter} × {height}</td>
                <td className="p-2 text-right font-semibold">{bodyArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Bottom</td>
                <td className="p-2">π × (D/2)²</td>
                <td className="p-2">{PI.toFixed(4)} × ({diameter}/2)²</td>
                <td className="p-2 text-right font-semibold">{bottomArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Head</td>
                <td className="p-2">BTM × 1.1</td>
                <td className="p-2">{bottomArea.toFixed(2)} × 1.1</td>
                <td className="p-2 text-right font-semibold">{headArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Joint S.W</td>
                <td className="p-2">0.6 × π × D</td>
                <td className="p-2">0.6 × {PI.toFixed(4)} × {diameter}</td>
                <td className="p-2 text-right font-semibold">{jointSWArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Joint C.B</td>
                <td className="p-2">0.5 × π × D</td>
                <td className="p-2">0.5 × {PI.toFixed(4)} × {diameter}</td>
                <td className="p-2 text-right font-semibold">{jointCBArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Hoop</td>
                <td className="p-2">0.2 × π × D</td>
                <td className="p-2">0.2 × {PI.toFixed(4)} × {diameter}</td>
                <td className="p-2 text-right font-semibold">{hoopArea.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">L/L</td>
                <td className="p-2">고정값</td>
                <td className="p-2">-</td>
                <td className="p-2 text-right font-semibold">{llArea.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
            <BookOpen className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">규격 근거</p>
              <p className="text-muted-foreground">ASME RTP-1, ASTM D 3299 - 원통형 탱크 기하학적 면적 계산법</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "weight",
      title: "2단계: 중량 계산",
      icon: <Scale className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">기본 공식</p>
            <p className="font-mono text-sm font-semibold">중량(kg) = 면적(m²) × 두께(mm) × 비중(2.0)</p>
          </div>
          
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
            <p className="text-xs font-semibold text-warning-foreground">⚠️ 비중 2.0 적용 이유</p>
            <p className="text-xs text-muted-foreground mt-1">
              FRP 순수 비중은 1.6~1.8이나, <strong>자재 로스율(10~20%)</strong>, 연결부위 보강, 
              시공 오차 등을 포함한 <strong>'견적용 할증 계수'</strong>로 2.0을 업계 통상 적용합니다.
            </p>
          </div>
          
          <h5 className="font-semibold text-sm mt-4">내식층 (C.B Layer)</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">부위</th>
                <th className="text-left p-2">면적×두께×비중</th>
                <th className="text-right p-2">결과(kg)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="p-2">Body</td>
                <td className="p-2">{bodyArea.toFixed(2)} × {thickness.cbThickness} × 2.0</td>
                <td className="p-2 text-right font-semibold">{cbBody.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Bottom</td>
                <td className="p-2">{bottomArea.toFixed(2)} × {thickness.cbThickness} × 2.0</td>
                <td className="p-2 text-right font-semibold">{cbBottom.toFixed(1)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Head</td>
                <td className="p-2">{headArea.toFixed(2)} × {thickness.cbThickness} × 2.0</td>
                <td className="p-2 text-right font-semibold">{cbHead.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Joint</td>
                <td className="p-2">{jointCBArea.toFixed(2)} × {thickness.jointCB} × 2.0</td>
                <td className="p-2 text-right font-semibold">{cbJoint.toFixed(1)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={2}>C.B Total</td>
                <td className="p-2 text-right">{result.weights.cbTotal}</td>
              </tr>
            </tbody>
          </table>
          
          <h5 className="font-semibold text-sm mt-4">구조층 (S.W Layer)</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">부위</th>
                <th className="text-left p-2">면적×두께×비중</th>
                <th className="text-right p-2">결과(kg)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="p-2">Body</td>
                <td className="p-2">{bodyArea.toFixed(2)} × {avgShellThickness.toFixed(1)} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swBody.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Bottom</td>
                <td className="p-2">{bottomArea.toFixed(2)} × {thickness.bottom} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swBottom.toFixed(1)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Head</td>
                <td className="p-2">{headArea.toFixed(2)} × {thickness.roof} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swHead.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Joint</td>
                <td className="p-2">{jointSWArea.toFixed(2)} × {thickness.jointSW} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swJoint.toFixed(1)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">L/L</td>
                <td className="p-2">{llArea} × {thickness.ll} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swLL.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Hoop</td>
                <td className="p-2">{hoopArea.toFixed(2)} × {thickness.hoop} × 2.0</td>
                <td className="p-2 text-right font-semibold">{swHoop.toFixed(1)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={2}>S.W Total</td>
                <td className="p-2 text-right">{result.weights.swTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: "resin",
      title: "3단계: 수지량 산출",
      icon: <FlaskConical className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-secondary/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">배합비 원칙</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">내식층 (C.B)</p>
                <p className="font-mono">Resin 70% : Glass 30%</p>
              </div>
              <div>
                <p className="font-semibold">구조층 Body (Winding)</p>
                <p className="font-mono">Resin 40% : Roving 60%</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">구조층 기타 (Hand Lay-up)</p>
                <p className="font-mono">Resin 70% : Glass 30%</p>
              </div>
            </div>
          </div>
          
          <h5 className="font-semibold text-sm">수지(Resin) 상세 분해</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">구분</th>
                <th className="text-left p-2">계산식</th>
                <th className="text-right p-2">결과(kg)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="p-2">C.B 전체</td>
                <td className="p-2">{result.weights.cbTotal} × 70%</td>
                <td className="p-2 text-right font-semibold">{cbResin.toFixed(1)}</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">S.W Body</td>
                <td className="p-2">{swBody.toFixed(1)} × 40%</td>
                <td className="p-2 text-right font-semibold">{swBodyResin.toFixed(1)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">S.W 기타</td>
                <td className="p-2">(BTM+Head+Joint+LL+Hoop) × 70%</td>
                <td className="p-2 text-right font-semibold">{swOtherResin.toFixed(1)}</td>
              </tr>
              <tr className="bg-primary/10 font-semibold">
                <td className="p-2" colSpan={2}>총 수지량</td>
                <td className="p-2 text-right">{result.materials.resin} kg</td>
              </tr>
            </tbody>
          </table>
          
          <h5 className="font-semibold text-sm mt-4">유리섬유(Glass) 상세 분해</h5>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-2">품목</th>
                <th className="text-left p-2">산출 근거</th>
                <th className="text-right p-2">결과</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="p-2">Mat #450</td>
                <td className="p-2">C.B×30% + S.W(Hand Lay-up)×30%</td>
                <td className="p-2 text-right font-semibold">{result.materials.mat450} kg</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Roving #2200</td>
                <td className="p-2">S.W Body × 60%</td>
                <td className="p-2 text-right font-semibold">{result.materials.roving2200} kg</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Roving Cloth</td>
                <td className="p-2">용량 기반 (보강용)</td>
                <td className="p-2 text-right font-semibold">{result.materials.rovingCloth} kg</td>
              </tr>
              <tr className="border-b bg-secondary/20">
                <td className="p-2">Surface Mat</td>
                <td className="p-2">전체면적 × 2.2</td>
                <td className="p-2 text-right font-semibold">{result.materials.surfaceMat} m²</td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
            <BookOpen className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">국제 규격 근거</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• ASME RTP-1: 유리섬유 함량 50~70% 권장</li>
                <li>• ASTM D 3299: FRP 탱크 재료 규격</li>
                <li>• KS F 4806: 한국 FRP 탱크 표준</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
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
                  엑셀 검증용
                </Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                각 단계를 클릭하면 엑셀 견적서와 비교할 수 있는 상세 계산 과정을 확인할 수 있습니다.
              </p>
              
              <div className="flex gap-2 flex-wrap">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(
                      activeSection === section.id ? null : section.id
                    )}
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
                    {sections.find(s => s.id === activeSection)?.icon}
                    {sections.find(s => s.id === activeSection)?.title}
                  </h4>
                  {sections.find(s => s.id === activeSection)?.content}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">엑셀과 값이 다를 경우 확인 사항</p>
                    <ul className="text-muted-foreground mt-2 space-y-1">
                      <li>1. 두께 설정값이 동일한지 확인</li>
                      <li>2. 배합비(70:30, 40:60)가 동일한지 확인</li>
                      <li>3. 비중 적용값(2.0)이 동일한지 확인</li>
                      <li>4. Head 곡률 할증(×1.1)이 적용되어 있는지 확인</li>
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
