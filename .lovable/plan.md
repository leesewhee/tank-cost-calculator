

## NCR 부적합보고서 기능 개선 계획

사용자 요청 3가지:
1. **등록된 보고서 수정 기능** - 현재는 상세보기(Eye)와 삭제만 가능. 수정 버튼 추가 필요.
2. **검사품목 동적 추가** - 현재 5개 고정. "항목 추가" 버튼으로 무제한 추가 가능하게.
3. **신규 등록 시 이전 데이터 자동 채움** - 같은 프로젝트의 마지막 보고서에서 공사번호, 공사명, 검사자, 검사장소, 작성/검토/승인 등 반복 필드를 자동으로 가져오기.

---

### 구현 세부사항

#### 1. 보고서 수정 기능
- 보고서 목록의 관리 컬럼에 **편집(Pencil) 아이콘 버튼** 추가
- 클릭 시 생성 다이얼로그와 동일한 폼을 열되, 기존 데이터를 채워서 표시
- `editingReport` state 추가하여 생성/수정 모드 구분
- 수정 시 `ncr_reports` UPDATE + `ncr_inspection_items` 삭제 후 재삽입

#### 2. 검사품목 동적 추가/삭제
- 검사품목 테이블 하단에 **"+ 항목 추가"** 버튼 추가
- 각 행에 **삭제 버튼** 추가 (최소 1개는 유지)
- `addItem` 함수: 현재 items 배열에 새 항목 push (item_no 자동 증가)
- `removeItem` 함수: 해당 index 제거 후 item_no 재정렬

#### 3. 신규 등록 시 이전 데이터 자동 채움
- 보고서 작성 버튼 클릭 시 해당 프로젝트의 **가장 최근 보고서**를 조회
- 반복성 필드만 복사: `construction_no`, `construction_name`, `inspector`, `inspection_location`, `action_department`, `written_by`, `reviewed_by`, `approved_by`
- `inspection_date`는 오늘 날짜로 초기화, 나머지 내용 필드(issues, actions 등)는 비워둠

### 수정 파일
- `src/pages/NCRReport.tsx` (단일 파일 수정)

