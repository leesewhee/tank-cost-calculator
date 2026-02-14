

# bolt-friend 프로그램 마이그레이션 실행 계획

## 개요
GitHub 저장소(leesewhee/bolt-friend)에서 9개 엔지니어링 도구의 소스 코드를 확인했습니다. 이를 현재 월드테크 시스템으로 이전합니다.

## 이전 대상 (9개 프로그램 + 1개 참조 페이지)

| 프로그램 | 원본 코드량 | 비고 |
|----------|------------|------|
| 볼트 길이 계산기 | 523 + 239줄 | 볼트 규격 참조 테이블 포함 |
| FRP 두께 계산기 | 944 + 469줄 | 다국어 제거 필요 |
| FRP 무게 계산기 | 543줄 | 로직 자체 내장 |
| 탱크 용량 계산기 | 312 + 119줄 | 기존 calculations.ts와 충돌 방지 |
| ANSI/JIS 플랜지 규격표 | 135 + 135줄 | - |
| FRP 플랜지 토크 테이블 | 336 + 189줄 | - |
| FRP 물성 데이터표 | 170 + 243줄 | - |
| 화학약품 내식성 조회표 | 222 + 402줄 | - |
| 핸드레일/사다리 계산기 | 748 + 338줄 | PDF 업로드 기능은 UI만 유지 |

## 코드 수정 사항

원본 코드에서 다음을 변경합니다:

1. **다국어 코드 제거** - `useLanguage()` 호출 및 `labels.ko/en` 구조를 제거하고, 한국어 텍스트만 직접 사용
2. **로고 이미지 참조 제거** - BoltCalculator의 `worldtech-logo.png` import 삭제
3. **페이지 레이아웃 통일** - 각 도구를 개별 페이지로 감싸며 헤더 + 뒤로가기 + 푸터 적용
4. **라우팅 통합** - App.tsx에 10개 라우트 추가
5. **대시보드 카드 추가** - Dashboard.tsx에 9개 프로그램 카드 추가

## 작업 단계 (3단계)

코드량이 약 5,000줄 이상으로 매우 방대하므로 3단계로 나누어 진행합니다.

### 1단계: 계산기 도구 (4개)
- `src/lib/boltCalculator.ts` - 볼트 계산 로직
- `src/components/BoltCalculator.tsx` - 볼트 계산기 UI
- `src/pages/BoltReferenceTable.tsx` - 볼트 규격 참조 테이블
- `src/lib/frpCalculator.ts` - FRP 두께 계산 로직
- `src/components/FRPThicknessCalculator.tsx` - FRP 두께 계산기 UI
- `src/components/WeightCalculator.tsx` - FRP 무게 계산기 UI
- `src/lib/handrailCalculator.ts` - 핸드레일 계산 로직
- `src/components/HandrailCalculator.tsx` - 핸드레일 계산기 UI

### 2단계: 탱크 + 플랜지 도구 (3개)
- `src/lib/tankVolumeCalculator.ts` - 탱크 용량 계산 로직
- `src/components/TankVolumeCalculator.tsx` - 탱크 용량 계산기 UI
- `src/lib/flangeSpec.ts` - 플랜지 규격 데이터
- `src/components/FlangeSpecTable.tsx` - 플랜지 규격표 UI
- `src/lib/flangeTorque.ts` - 플랜지 토크 데이터
- `src/components/FlangeTorqueTable.tsx` - 플랜지 토크 테이블 UI

### 3단계: 데이터 테이블 + 대시보드 통합 (2개 + 통합)
- `src/lib/materialProperties.ts` - 물성 데이터
- `src/components/MaterialPropertiesTable.tsx` - 물성 데이터표 UI
- `src/lib/chemicalResistance.ts` - 내식성 데이터
- `src/components/ChemicalResistanceTable.tsx` - 내식성 조회표 UI
- `src/pages/EngineeringTools.tsx` - 각 도구를 페이지로 감싸는 래퍼
- `src/App.tsx` 수정 - 10개 라우트 추가
- `src/pages/Dashboard.tsx` 수정 - 9개 프로그램 카드 추가

## 주의사항
- 기존 `src/lib/calculations.ts`의 `TankDimensions` 타입과 충돌 방지를 위해 탱크 용량 계산기 파일명을 `tankVolumeCalculator.ts`로 구분
- HandrailCalculator의 PDF 업로드 기능은 Supabase Edge Function이 필요하나 현재 프로젝트에 없으므로, UI만 유지하고 추후 별도 구현
- 총 생성 파일: 19개 / 수정 파일: 2개

## 기술 세부 사항

### 새로운 라우트 구조

```text
/bolt-calculator        -> 볼트 길이 계산기
/bolt-reference         -> 볼트 규격 참조 테이블
/frp-calculator         -> FRP 두께 계산기
/weight-calculator      -> FRP 무게 계산기
/tank-volume-calculator -> 탱크 용량 계산기
/flange-spec            -> ANSI/JIS 플랜지 규격표
/flange-torque          -> FRP 플랜지 토크 테이블
/material-properties    -> FRP 물성 데이터표
/chemical-resistance    -> 화학약품 내식성 조회표
/handrail-calculator    -> 핸드레일/사다리 계산기
```

### 대시보드 카드 아이콘 매핑
- 볼트 계산기: Wrench
- FRP 두께 계산기: Calculator
- FRP 무게 계산기: Scale
- 탱크 용량 계산기: Droplets
- 플랜지 규격표: Table
- 플랜지 토크: Settings2
- 물성 데이터표: BarChart3
- 내식성 조회표: Beaker
- 핸드레일 계산기: Ruler

