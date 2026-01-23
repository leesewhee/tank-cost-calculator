import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Info, BookOpen, Calculator, FlaskConical } from "lucide-react";

interface FormulaInfo {
  title: string;
  formula?: string;
  description: string;
  source?: string;
  standard?: string;
  note?: string;
}

interface FormulaTooltipProps {
  info: FormulaInfo;
  children: React.ReactNode;
  className?: string;
}

export function FormulaTooltip({ info, children, className = "" }: FormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span 
          className={`cursor-help inline-flex items-center gap-1 hover:text-primary transition-colors border-b border-dashed border-muted-foreground/50 hover:border-primary ${className}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {children}
          <Info className="w-3 h-3 opacity-50 print:hidden" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 print:hidden" align="start">
        <div className="bg-primary/10 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            {info.title}
          </h4>
        </div>
        <div className="p-4 space-y-3 text-sm">
          {info.formula && (
            <div className="bg-secondary/50 p-3 rounded-md font-mono text-xs">
              <p className="text-muted-foreground text-xs mb-1">계산식:</p>
              <p className="text-foreground">{info.formula}</p>
            </div>
          )}
          
          <p className="text-muted-foreground leading-relaxed">
            {info.description}
          </p>
          
          {info.standard && (
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">규격 근거:</p>
                <p className="text-xs font-medium">{info.standard}</p>
              </div>
            </div>
          )}
          
          {info.source && (
            <div className="flex items-start gap-2">
              <FlaskConical className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">출처:</p>
                <p className="text-xs font-medium">{info.source}</p>
              </div>
            </div>
          )}
          
          {info.note && (
            <Badge variant="outline" className="text-xs bg-accent text-accent-foreground border-accent">
              💡 {info.note}
            </Badge>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 계산식 정보 데이터
export const formulaData = {
  // 면적 계산
  bodyArea: {
    title: "Body (몸체) 면적",
    formula: "π × D × H",
    description: "원통형 몸체의 측면적을 계산합니다. 직경(D)과 높이(H)를 곱한 원주 면적입니다.",
    source: "기하학적 공식 (원통 측면적)",
    standard: "ASME RTP-1, ASTM D 3299",
  },
  bottomArea: {
    title: "Bottom (바닥) 면적",
    formula: "π × (D/2)²",
    description: "원형 바닥판의 면적을 계산합니다. 반지름의 제곱에 π를 곱한 값입니다.",
    source: "기하학적 공식 (원 면적)",
    standard: "ASME RTP-1",
  },
  headArea: {
    title: "Head (지붕) 면적",
    formula: "BTM 면적 × 1.1",
    description: "접시형 경판(Torispherical Head)의 곡률을 반영하여 평면적의 10%를 할증합니다.",
    source: "업계 통상 경험치",
    standard: "RTP-1 Section 3A (접시형 경판)",
    note: "견적 단계 약식 계산",
  },
  jointSW: {
    title: "Joint S.W (용접부 구조층)",
    formula: "0.6 × π × D",
    description: "이음부의 구조층 면적입니다. 유효 폭 0.6m를 가정한 원주 면적입니다.",
    source: "업계 통상 경험치",
    note: "상세 설계 전 물량 산출용",
  },
  jointCB: {
    title: "Joint C.B (용접부 내식층)",
    formula: "0.5 × π × D",
    description: "이음부의 내식층 면적입니다. 유효 폭 0.5m를 가정한 원주 면적입니다.",
    source: "업계 통상 경험치",
    note: "상세 설계 전 물량 산출용",
  },
  hoopArea: {
    title: "Hoop (보강 링) 면적",
    formula: "0.2 × π × D",
    description: "보강 링의 면적입니다. 탱크 강성 보강을 위해 설치됩니다.",
    source: "구조 계산 결과 기반",
  },
  llArea: {
    title: "L/L (Lifting Lug) 면적",
    formula: "고정값 1.44 m²",
    description: "리프팅 러그 면적은 탱크 크기와 관계없이 고정값을 사용합니다.",
    source: "표준 Lifting Lug 사양",
  },

  // 중량 계산
  weight: {
    title: "FRP 중량 계산",
    formula: "면적(m²) × 두께(mm) × 비중(2.0)",
    description: "FRP의 순수 물리적 비중은 1.6~1.8이나, 자재 로스(10~20%), 연결부위, 오차 등을 포함한 '견적용 할증 계수'로 2.0을 적용합니다.",
    source: "영업용 원가 계산 방식",
    standard: "순수 비중: 1.6~1.8 (Filament Winding)",
    note: "상업적 비중으로 Loss 포함",
  },

  // 재료 배합비
  cbRatio: {
    title: "내식층 (C.B) 배합비",
    formula: "Resin 70% : Glass #450 30%",
    description: "내식층은 내화학성을 위해 수지 비율을 높게 가져갑니다. Surface Mat과 Chopped Mat으로 구성됩니다.",
    source: "국제 표준 배합비",
    standard: "ASME RTP-1, ASTM D 3299, KS F 4806",
  },
  swBodyRatio: {
    title: "구조층 Body (Winding) 배합비",
    formula: "Resin 40% : Glass (Roving) 60%",
    description: "Filament Winding 공법으로 유리섬유 함량을 높여 구조적 강도를 확보합니다.",
    source: "국제 표준 배합비",
    standard: "ASME RTP-1 (유리섬유 함량 50~70% 권장)",
  },
  swHandLayup: {
    title: "구조층 BTM/Head (Hand Lay-up) 배합비",
    formula: "Resin 70% : Glass #450 30%",
    description: "바닥과 헤드는 Hand Lay-up 공법으로 매트 작업을 하므로 수지가 더 많이 필요합니다.",
    source: "국제 표준 배합비",
    standard: "ASTM D 3299",
  },

  // 재료
  resin: {
    title: "RESIN (수지)",
    formula: "CB층×70% + SW Body×40% + SW 기타×70%",
    description: "Vinyl Ester 또는 Polyester 수지로, 내화학성과 구조적 결합력을 제공합니다.",
    source: "배합비 기반 산출",
    standard: "ASME RTP-1 Type I (Vinyl Ester)",
  },
  mat450: {
    title: "Chopped Strand Mat #450",
    formula: "CB층×30% + SW(BTM/Head/Joint)×30%",
    description: "450g/m² 규격의 유리섬유 매트입니다. 내식층과 Hand Lay-up 구조층에 사용됩니다.",
    source: "배합비 기반 산출",
    standard: "ASTM D 2584",
  },
  roving2200: {
    title: "Roving #2200",
    formula: "SW Body × 60%",
    description: "2200tex 유리섬유 로빙으로, Body Filament Winding에 사용되어 높은 인장강도를 제공합니다.",
    source: "배합비 기반 산출",
    standard: "ASME RTP-1 Section 4",
  },
  surfaceMat: {
    title: "Surface Mat #30",
    formula: "전체 면적 × 2.2",
    description: "30g/m² 규격의 표면 매트입니다. 겹침 및 여유율을 반영하여 2.2배를 적용합니다.",
    source: "업계 통상 경험치",
    note: "겹침 및 여유율 포함",
  },
  consumable: {
    title: "소모품비 (Consumable)",
    formula: "재료비 × 6.5%",
    description: "경화제, 촉진제, 이형제, 롤러, 브러시 등 소모성 자재비입니다.",
    source: "원가 산출 경험치",
  },

  // 인건비
  windingLabor: {
    title: "Winding Labor",
    formula: "용량 기반 회귀식",
    description: "Filament Winding 작업 인건비입니다. 탱크 용량에 비례하여 M/D(Man-Day)를 산출합니다.",
    source: "작업 실적 기반 회귀 분석",
  },
  assemblyLabor: {
    title: "Assembly Labor",
    formula: "용량 기반 회귀식",
    description: "탱크 조립 및 부자재 설치 작업 인건비입니다.",
    source: "작업 실적 기반 회귀 분석",
  },
  chemicalLabor: {
    title: "Chemical Labor",
    formula: "용량 기반 회귀식",
    description: "내식층 시공 및 화학약품 관련 특수 작업 인건비입니다.",
    source: "작업 실적 기반 회귀 분석",
  },
  specialLabor: {
    title: "Special Labor",
    formula: "용량 기반 회귀식",
    description: "검사, 테스트, 특수 마감 등 추가 작업 인건비입니다.",
    source: "작업 실적 기반 회귀 분석",
  },

  // 비용
  inspection: {
    title: "검사 및 시험비",
    formula: "고정비 + (소계 × 비율)",
    description: "품질 검사, 수압 시험, NDT 등 각종 시험 비용입니다.",
    standard: "KS 품질검사 기준",
  },
  transportation: {
    title: "운반비",
    formula: "고정비 설정",
    description: "완성된 탱크의 현장 운반 비용입니다. 거리와 크기에 따라 조정됩니다.",
    note: "현장 조건에 따라 변동",
  },
  profit: {
    title: "일반관리비 및 이익",
    formula: "소계 × 이익률(%)",
    description: "기업 운영비와 적정 이익을 반영한 금액입니다. 통상 10~20%를 적용합니다.",
    source: "기업 원가 정책",
  },
  safetyFactor: {
    title: "안전율 (Safety Factor)",
    formula: "최종금액 × 안전율(%)",
    description: "예상치 못한 비용 변동에 대비한 안전 마진입니다.",
    source: "리스크 관리 정책",
  },
};
