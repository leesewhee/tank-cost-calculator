
# bolt-friend 프로그램 마이그레이션 계획

## 개요
bolt-friend.lovable.app에서 운영 중인 9개 엔지니어링 도구를 현재 월드테크 시스템으로 이전합니다.

## 이전 대상 (총 9개 프로그램)

| 번호 | 프로그램 | 컴포넌트 파일 | 로직 파일 |
|------|----------|---------------|-----------|
| 1 | 볼트 길이 계산기 | BoltCalculator.tsx (523줄) | boltCalculator.ts (239줄) |
| 2 | FRP 두께 계산기 | FRPCalculator.tsx (944줄) | frpCalculator.ts (469줄) |
| 3 | FRP 무게 계산기 | WeightCalculator.tsx (543줄) | (자체 내장) |
| 4 | 탱크 용량 계산기 | TankVolumeCalculator.tsx (312줄) | tankCalculator.ts (119줄) |
| 5 | ANSI/JIS 플랜지 규격표 | FlangeSpecTable.tsx (135줄) | flangeSpec.ts (135줄) |
| 6 | FRP 플랜지 토크 테이블 | FlangeTorqueTable.tsx (336줄) | flangeTorque.ts (189줄) |
| 7 | FRP 물성 데이터표 | MaterialPropertiesTable.tsx (170줄) | materialProperties.ts (243줄) |
| 8 | 화학약품 내식성 조회표 | ChemicalResistanceTable.tsx (222줄) | chemicalResistance.ts (402줄) |
| 9 | 핸드레일/사다리 계산기 | HandrailCalculator.tsx (748줄) | handrailCalculator.ts (338줄) |

추가 페이지: BoltReferenceTable.tsx (볼트 규격 참조 테이블, 175줄)

## 코드 수정 사항

원본 코드에서 다음을 변경해야 합니다:

1. **다국어 지원 제거**: 원본은 `useLanguage()` Context를 사용하여 한/영 전환 지원. 현재 프로젝트는 한국어만 사용하므로 한국어 텍스트를 직접 사용하도록 변경
2. **로고 이미지 참조 제거**: BoltCalculator에서 `worldtech-logo.png` import를 제거
3. **페이지 레이아웃 통일**: 각 도구를 기존 페이지 스타일(헤더 + 뒤로가기 버튼 + 푸터)에 맞게 래핑
4. **라우팅 연결**: 각 도구에 대한 개별 라우트 추가
5. **대시보드 카드 추가**: 9개 프로그램 카드를 대시보드에 추가

## 작업 단계 (크기가 매우 크므로 3단계로 진행)

### 1단계: 계산기 도구 (4개)
- 볼트 길이 계산기 + 볼트 규격 참조 테이블
- FRP 두께 계산기
- FRP 무게 계산기
- 핸드레일/사다리 계산기

### 2단계: 탱크 + 플랜지 도구 (3개)
- 탱크 용량 계산기
- ANSI/JIS 플랜지 규격표
- FRP 플랜지 토크 테이블

### 3단계: 데이터 테이블 + 대시보드 (2개 + 통합)
- FRP 물성 데이터표
- 화학약품 내식성 조회표
- 대시보드에 9개 프로그램 카드 추가
- App.tsx에 모든 라우트 등록

## 생성/수정 파일 목록

### 새로 생성 (19개 파일)
- `src/lib/boltCalculator.ts`
- `src/lib/frpCalculator.ts`
- `src/lib/tankVolumeCalculator.ts`
- `src/lib/flangeSpec.ts`
- `src/lib/flangeTorque.ts`
- `src/lib/chemicalResistance.ts`
- `src/lib/materialProperties.ts`
- `src/lib/handrailCalculator.ts`
- `src/components/BoltCalculator.tsx`
- `src/components/FRPThicknessCalculator.tsx`
- `src/components/WeightCalculator.tsx`
- `src/components/TankVolumeCalculator.tsx`
- `src/components/FlangeSpecTable.tsx`
- `src/components/FlangeTorqueTable.tsx`
- `src/components/MaterialPropertiesTable.tsx`
- `src/components/ChemicalResistanceTable.tsx`
- `src/components/HandrailCalculator.tsx`
- `src/pages/BoltReferenceTable.tsx`
- `src/pages/EngineeringTools.tsx` (9개 도구를 개별 라우트로 감싸는 페이지)

### 수정 (2개 파일)
- `src/App.tsx` - 10개 라우트 추가
- `src/pages/Dashboard.tsx` - 9개 프로그램 카드 추가

## 주의사항
- 기존 `src/lib/calculations.ts`의 `TankDimensions` 타입과 충돌 방지를 위해 탱크 용량 계산기 lib 파일명을 `tankVolumeCalculator.ts`로 구분
- HandrailCalculator의 PDF 업로드 기능은 Supabase Edge Function을 호출하는데, 현재 프로젝트에 해당 함수가 없으므로 PDF 업로드 기능은 일단 UI만 유지하고 추후 별도 구현
- 총 코드량이 약 5,000줄 이상으로 매우 방대하므로 단계별 진행 권장
