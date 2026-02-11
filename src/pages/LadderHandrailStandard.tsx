import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Ruler, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LadderHandrailStandard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-sidebar text-sidebar-foreground py-6 print:hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <Shield className="w-8 h-8 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">사다리 · 핸드레일 제작 기준</h1>
                <p className="text-sm text-sidebar-foreground/70">
                  KOSHA GUIDE 기반 안전 기준 정리
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 출처 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              관련 법규 및 출처
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary shrink-0">①</span>
                <span><strong>KSH-GUIDANCE A-G-2-2025</strong> — 작업장 내 통로(경사로, 계단, 발판사다리) 선정 및 설치에 관한 기술지원규정 (한국산업안전보건공단, 2025.2)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary shrink-0">②</span>
                <span><strong>KOSHA GUIDE G-3-2022</strong> — 고정식 사다리의 제작에 관한 기술지침 (한국산업안전보건공단, 2022.12)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary shrink-0">③</span>
                <span><strong>안전난간의 구조 및 설치요건</strong> — 산업안전보건기준에 관한 규칙 제13조 (KOSHA 기준)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary shrink-0">④</span>
                <span>KS B ISO 14122-3 (계단, 발판, 사다리 및 안전난간) / KS B ISO 14122-4 (고정식 사다리)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={["handrail", "ladder", "fixed-ladder"]} className="space-y-4">
          {/* 1. 안전난간 기준 */}
          <AccordionItem value="handrail" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                1. 안전난간 (핸드레일) 구조 및 설치 기준
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              {/* 구성요소 */}
              <div>
                <h4 className="font-semibold mb-3">1-1. 안전난간 구성요소</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">구성요소</TableHead>
                      <TableHead>설명</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">상부 난간대</TableCell>
                      <TableCell>몸을 지지하기 위해 손으로 잡는 난간의 윗부분 요소 (Handrail)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">중간 난간대</TableCell>
                      <TableCell>상부 난간대와 함께 몸을 지지하고, 손잡이 파이프 등과 평행하게 위치하는 요소 (Kneerail)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발끝막이판</TableCell>
                      <TableCell>바닥면의 물체가 아래로 떨어지는 것을 막기 위한 수직 판 (Toe-plate)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">난간 기둥</TableCell>
                      <TableCell>난간에 고정된 수직 구조요소, 다른 요소들이 연결됨 (Stanchion)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 치수 기준 */}
              <div>
                <h4 className="font-semibold mb-3">1-2. 치수 기준</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">항목</TableHead>
                      <TableHead>기준값</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">상부 난간대 높이</TableCell>
                      <TableCell>바닥면에서 <strong>90cm 이상</strong></TableCell>
                      <TableCell>안전보건규칙 제13조</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">중간 난간대 (120cm 이하)</TableCell>
                      <TableCell>상부 난간대와 바닥면의 <strong>중간</strong>에 설치</TableCell>
                      <TableCell>1단 설치</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">중간 난간대 (120cm 초과)</TableCell>
                      <TableCell><strong>2단 이상</strong> 균등 설치, 상하 간격 <strong>60cm 이하</strong></TableCell>
                      <TableCell>난간기둥 간격 25cm 이하 시 중간난간대 생략 가능</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발끝막이판 높이</TableCell>
                      <TableCell>바닥면에서 <strong>10cm 이상</strong></TableCell>
                      <TableCell>틈새 10mm 이하</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">난간대 재질</TableCell>
                      <TableCell>지름 <strong>2.7cm 이상</strong> 금속제 파이프 또는 동등 강도</TableCell>
                      <TableCell>—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">하중 내력</TableCell>
                      <TableCell>가장 취약한 방향에서 <strong>100kg 이상</strong></TableCell>
                      <TableCell>구조적으로 가장 취약한 지점 기준</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">난간 변형량</TableCell>
                      <TableCell>영구변형 없이 <strong>30mm 이내</strong></TableCell>
                      <TableCell>F(min) = 300 N/m × L</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 계단/발판 사다리 난간 */}
              <div>
                <h4 className="font-semibold mb-3">1-3. 계단 · 발판사다리 난간</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>4단 이상 또는 500mm 이상인 계단의 개방된 측면에 안전난간 1개 이상 설치</li>
                  <li>계단 폭 1.2m 이상이거나, 모든 발판사다리에는 안전난간 <strong>2개</strong> 설치</li>
                  <li>높이 500mm 이상 작업대·계단참에는 안전난간 설치 필수</li>
                  <li>난간 높이: 수평부 <strong>900~1,200mm</strong>, 경사부 <strong>900mm 이상</strong></li>
                  <li>계단 측면 공간 시 측면 보강지주 폭 200mm 이상</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. 계단/발판사다리 기준 */}
          <AccordionItem value="ladder" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                2. 계단 · 발판사다리 설치 기준
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              {/* 경사각에 따른 통로 구분 */}
              <div>
                <h4 className="font-semibold mb-3">2-1. 경사각에 따른 통로 구분</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>통로 유형</TableHead>
                      <TableHead>경사각</TableHead>
                      <TableHead>수평부재</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">경사로 (Ramp)</TableCell>
                      <TableCell>0° 초과 ~ 20°</TableCell>
                      <TableCell>평탄한 바닥</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">계단 (Stairway)</TableCell>
                      <TableCell>20° 초과 ~ 45°</TableCell>
                      <TableCell>판 모양 발판 (Step)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발판사다리 (Stepladder)</TableCell>
                      <TableCell>45° 초과 ~ 75°</TableCell>
                      <TableCell>판 모양 발판 (Step)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">고정식 사다리 (Fixed Ladder)</TableCell>
                      <TableCell>75° 초과 ~ 90°</TableCell>
                      <TableCell>봉 모양 디딤대</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 계단 안전요건 */}
              <div>
                <h4 className="font-semibold mb-3">2-2. 계단 안전 요건</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">항목</TableHead>
                      <TableHead>기준값</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">발판깊이(g) + 답단높이(h)</TableCell>
                      <TableCell><strong>600 ≤ g + 2h ≤ 660 (mm)</strong></TableCell>
                      <TableCell>걸음 폭 공식</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">머리 공간 높이(e)</TableCell>
                      <TableCell>발판 위 <strong>2,300mm 이상</strong></TableCell>
                      <TableCell>—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">계단 폭(L)</TableCell>
                      <TableCell><strong>1,000mm 이상</strong> (교차 시 1,200mm 이상)</TableCell>
                      <TableCell>손잡이/지주 사이 측정</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">계단참</TableCell>
                      <TableCell>바닥에서 <strong>3m 초과</strong> 시 3m 이내마다 설치</TableCell>
                      <TableCell>진행방향 길이 1,200mm 이상</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발판 하중</TableCell>
                      <TableCell>1,000×1,000mm 면적에 <strong>500kg (4,900N)</strong></TableCell>
                      <TableCell>안전율 4 이상</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발판 처짐량</TableCell>
                      <TableCell><strong>6mm</strong> 이하</TableCell>
                      <TableCell>—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">계단/계단참 강도</TableCell>
                      <TableCell>m² 당 <strong>500kg 이상</strong></TableCell>
                      <TableCell>안전율 4 이상</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 발판사다리 안전요건 */}
              <div>
                <h4 className="font-semibold mb-3">2-3. 발판사다리 안전 요건</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">항목</TableHead>
                      <TableHead>기준값</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">답단 높이(h)</TableCell>
                      <TableCell><strong>250mm 이내</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">발판깊이(g)</TableCell>
                      <TableCell><strong>80mm 이상</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">통로 폭</TableCell>
                      <TableCell><strong>300 ~ 800mm</strong> (난간/세로지지대 사이)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">수직높이(H)</TableCell>
                      <TableCell>계단참까지 <strong>3m 이하</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">머리 공간 높이(e)</TableCell>
                      <TableCell><strong>2,300mm 이상</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. 고정식 사다리 기준 */}
          <AccordionItem value="fixed-ladder" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                3. 고정식 사다리 제작 기준 (KOSHA GUIDE G-3-2022)
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2">
              {/* 버팀대/디딤대 */}
              <div>
                <h4 className="font-semibold mb-3">3-1. 버팀대 및 디딤대 규격</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">항목</TableHead>
                      <TableHead>기준값</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">버팀대 하중</TableCell>
                      <TableCell>버팀대 1개당 <strong>3kN (약 306kg)</strong></TableCell>
                      <TableCell>결빙·바람·충격 추가 하중 고려</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">버팀대 사이 너비</TableCell>
                      <TableCell><strong>400 ~ 600mm</strong></TableCell>
                      <TableCell>환경상 불가 시 최소 300mm 허용</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">디딤대 간격</TableCell>
                      <TableCell><strong>225 ~ 300mm</strong></TableCell>
                      <TableCell>연속 디딤대 기준</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">디딤대 지름</TableCell>
                      <TableCell><strong>20 ~ 35mm</strong></TableCell>
                      <TableCell>손으로 잡을 수 있는 치수</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">전면 장애물 간격</TableCell>
                      <TableCell><strong>650mm 이상</strong> (불연속 시 600mm)</TableCell>
                      <TableCell>사다리 전면 기준</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">후면 간격</TableCell>
                      <TableCell>디딤대 전면에서 <strong>200mm 이상</strong></TableCell>
                      <TableCell>불연속 장애물 시 150mm</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 등받이 울 */}
              <div>
                <h4 className="font-semibold mb-3">3-2. 등받이 울 (Back Guard) 설계 기준</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">항목</TableHead>
                      <TableHead>기준값</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">설치 조건</TableCell>
                      <TableCell>오름 구간 높이 <strong>3,000mm 초과</strong> 시 필수</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">시작 높이</TableCell>
                      <TableCell>바닥면에서 <strong>2,500mm</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">둥근 부분 공간 치수</TableCell>
                      <TableCell><strong>650 ~ 800mm</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">디딤대~등받이울 거리</TableCell>
                      <TableCell><strong>650 ~ 800mm</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">도착부 공간 치수</TableCell>
                      <TableCell><strong>500 ~ 700mm</strong> (디딤대 수평축 기준)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">수직부재 간 너비</TableCell>
                      <TableCell><strong>300mm 이하</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">수평부재 간 거리</TableCell>
                      <TableCell><strong>1,500mm 이하</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">최대 개구부 면적</TableCell>
                      <TableCell><strong>0.4㎡ 이하</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">수직 하중 시험</TableCell>
                      <TableCell><strong>1,000N</strong> → 영구 변형 10mm 이하</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">수평 하중 시험</TableCell>
                      <TableCell><strong>500N</strong> → 영구 변형 10mm 이하</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* 사다리참/접근통로 */}
              <div>
                <h4 className="font-semibold mb-3">3-3. 사다리참 및 접근통로</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>출발·도착 부분에 접근용 사다리참 설치 필수</li>
                  <li>출발부분 보행면이 주위보다 <strong>500mm</strong> 높은 경우 방호 지지대 설치</li>
                  <li>도착부분: 사다리 버팀대 끝 양쪽 <strong>1,500mm 이상</strong> 방호 지지대</li>
                  <li>접근통로 너비: <strong>500 ~ 700mm</strong></li>
                  <li>고정점: 버팀대 1개에 <strong>3,000N</strong> 지지</li>
                  <li>버팀대~고정 가이드 간 공간: <strong>150mm 이상</strong>, 고정가이드 두께 <strong>80mm 이하</strong></li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* 요약 카드 */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">⚠️ 핵심 수치 요약 (Quick Reference)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-primary">안전난간</p>
                <p>상부 난간대: ≥ 90cm</p>
                <p>발끝막이판: ≥ 10cm</p>
                <p>난간대 파이프: ≥ φ27mm</p>
                <p>하중 내력: ≥ 100kg</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary">계단</p>
                <p>폭: ≥ 1,000mm</p>
                <p>계단참: 3m마다 설치</p>
                <p>발판 하중: 500kg/m²</p>
                <p>안전율: ≥ 4</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary">고정식 사다리</p>
                <p>버팀대 너비: 400~600mm</p>
                <p>디딤대 간격: 225~300mm</p>
                <p>디딤대 지름: 20~35mm</p>
                <p>등받이울: 높이 3m 초과 시</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 푸터 */}
      <footer className="bg-muted py-4 mt-8 print:hidden">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

export default LadderHandrailStandard;
