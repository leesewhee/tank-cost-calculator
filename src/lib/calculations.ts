// FRP 탱크 계산 로직

export interface TankDimensions {
  diameter: number; // 직경 (m)
  height: number;   // 높이 (m)
}

// 사용자 정의 항목
export interface CustomItem {
  id: string;
  name: string;
  value: number;      // 금액(원) 또는 단가(원/단위)
  unit?: string;
  quantity?: number;  // 단가형 항목(재료/인건비)에서 사용하는 수량·공수
}

// 견적서 한 줄(품명/수량/단가/금액)
export interface QuoteLine {
  key: string;
  name: string;
  qty: number | null;
  unit: string;
  unitPrice: number | null;
  amount: number;
  note?: string;
}

export interface CalcIssue {
  level: "error" | "info";
  message: string;
}


export interface MaterialPrices {
  resin: number;           // 수지 단가 (원/kg)
  mat450: number;          // 매트#450 단가 (원/kg)
  rovingCloth: number;     // 로빙 클로스 단가 (원/kg)
  roving2200: number;      // 로빙 #2200 단가 (원/kg)
  surfaceMat: number;      // 서피스 매트 단가 (원/m2)
  custom?: CustomItem[];   // 사용자 정의 재료
}

export interface LaborPrices {
  winding: number;         // 와인딩 인건비 (원/M/D)
  assembly: number;        // 조립 인건비 (원/M/D)
  chemical: number;        // 케미칼 인건비 (원/M/D)
  special: number;         // 특수 인건비 (원/M/D)
  custom?: CustomItem[];   // 사용자 정의 인건비
}

export interface FixedCosts {
  flange: number;          // 플랜지
  manhole: number;         // 맨홀
  levelGauge: number;      // 레벨 게이지
  sqPipe: number;          // SQ 파이프 단가 (원/m)
  sqPipeLength: number;    // SQ 파이프 길이 (m)
  gasket: number;          // 가스켓
  boltNut: number;         // B/N/2W
  ladder: number;          // 사다리 및 핸드레일
  custom?: CustomItem[];   // 사용자 정의 고정비용
}

export interface SafetyMargins {
  inspectionTest: number;  // 검사비
  transportation: number;  // 운송비
  profitMargin: number;    // 일반관리비 및 이익률 (%)
  safetyFactor: number;    // 안전율 (%)
  custom?: CustomItem[];   // 사용자 정의 마진/안전
}

export interface ThicknessConfig {
  shellTop: number;        // 쉘 상부 두께 (mm)
  shellBottom: number;     // 쉘 하부 두께 (mm) 
  bottom: number;          // 바닥 두께 (mm)
  roof: number;            // 지붕 두께 (mm)
  cbThickness: number;     // 내식층(c.b) 두께 (mm)
  jointSW: number;         // 이음부(s.w) 두께 (mm)
  jointCB: number;         // 이음부(c.b) 두께 (mm)
  ll: number;              // L/L 두께 (mm)
  hoop: number;            // 후프 두께 (mm)
  frpDensity: number;      // FRP 비중 (견적용)
  custom?: CustomItem[];   // 사용자 정의 두께
}

export interface CalculationResult {
  // 용량
  capacity: number;        // 용량 (m3)
  
  // 면적
  areas: {
    body: number;
    bottom: number;
    head: number;
    jointSW: number;
    jointCB: number;
    ll: number;
    hoop: number;
    total: number;
  };
  
  // 무게 (kg)
  weights: {
    cbBody: number;
    cbBottom: number;
    cbHead: number;
    cbJoint: number;
    cbTotal: number;
    swBody: number;
    swBottom: number;
    swHead: number;
    swJoint: number;
    swLL: number;
    swHoop: number;
    swTotal: number;
  };
  
  // 재료 수량
  materials: {
    resin: number;          // 수지 (kg)
    mat450: number;         // 매트#450 (kg)
    rovingCloth: number;    // 로빙 클로스 (kg)
    roving2200: number;     // 로빙 #2200 (kg)
    surfaceMat: number;     // 서피스 매트 (m2)
    consumable: number;     // 소모품비
  };
  
  // 인력
  labor: {
    winding: number;        // M/D
    assembly: number;
    chemical: number;
    special: number;
    total: number;
  };
  
  // 비용
  costs: {
    material: number;       // 재료비 소계 (materialLines 합계와 동일)
    labor: number;          // 인건비 소계 (laborLines 합계와 동일)
    subtotal: number;       // 재료비 + 인건비
    inspection: number;     // 검사비
    transportation: number; // 운송비
    extras: number;         // 추가 마진/안전 항목 합계
    profit: number;         // 일반관리비 및 이익 (이익률 적용분)
    safety: number;         // 안전할증 적용분
    rounding: number;       // 만원 단위 반올림 차액
    total: number;          // 총 합계
  };

  // 견적서 표시용 상세 행 (화면·인쇄·합계가 동일한 값을 사용)
  materialLines: QuoteLine[];
  laborLines: QuoteLine[];
  extraLines: QuoteLine[];
  issues: CalcIssue[];
}

// ========================================
// 공통 헬퍼
// ========================================

/** 단가형 사용자 항목(수량 필요) → 견적 행 + 입력오류 */
export function buildUnitPriceLines(
  items: CustomItem[] | undefined,
  defaultUnit: string,
  keyPrefix: string
): { lines: QuoteLine[]; issues: CalcIssue[] } {
  const lines: QuoteLine[] = [];
  const issues: CalcIssue[] = [];
  (items || []).forEach((item) => {
    const qty = item.quantity;
    if (qty === undefined || qty === null || !isFinite(qty) || qty <= 0) {
      issues.push({
        level: "error",
        message: `추가 항목 "${item.name}"은(는) 단가(${item.value.toLocaleString("ko-KR")})만 입력되어 수량이 없습니다. 수량을 입력해야 금액이 계산됩니다. (현재 합계에 미반영)`,
      });
      return;
    }
    lines.push({
      key: `${keyPrefix}_${item.id}`,
      name: item.name,
      qty,
      unit: item.unit || defaultUnit,
      unitPrice: item.value,
      amount: Math.round(item.value * qty),
    });
  });
  return { lines, issues };
}

/** 금액형 사용자 항목 → 견적 행 */
export function buildAmountLines(
  items: CustomItem[] | undefined,
  keyPrefix: string,
  unit = "LOT"
): QuoteLine[] {
  return (items || []).map((item) => ({
    key: `${keyPrefix}_${item.id}`,
    name: item.name,
    qty: 1,
    unit: item.unit && item.unit !== "원" ? item.unit : unit,
    unitPrice: item.value,
    amount: item.value,
  }));
}

/** 두께 추가 항목은 면적/부위 정보가 없어 계산 불가 */
export function buildThicknessIssues(thickness: ThicknessConfig): CalcIssue[] {
  return (thickness.custom || []).map((item) => ({
    level: "info" as const,
    message: `추가 두께 항목 "${item.name}(${item.value}mm)"은(는) 적용 부위/면적 정보가 없어 계산에 반영되지 않습니다. 부위별 두께 입력란을 사용하세요.`,
  }));
}

/** 고정비용 견적 행 (플랜지·맨홀·레벨게이지·SQ파이프·가스켓·B/N·사다리) */
export function buildFixedCostLines(fixedCosts: FixedCosts, capacity: number): QuoteLine[] {
  const manholeQty = fixedCosts.manhole > 0 ? (capacity > 30 ? 2 : 1) : 0;
  const lines: QuoteLine[] = [
    { key: "flange", name: "FLANGE (플랜지)", qty: 1, unit: "LOT", unitPrice: fixedCosts.flange, amount: fixedCosts.flange },
    { key: "manhole", name: "MAN HOLE (맨홀)", qty: manholeQty, unit: "SET", unitPrice: fixedCosts.manhole, amount: fixedCosts.manhole * manholeQty },
    { key: "levelGauge", name: "LEVEL GAUGE (레벨게이지)", qty: 1, unit: "SET", unitPrice: fixedCosts.levelGauge, amount: fixedCosts.levelGauge },
    { key: "sqPipe", name: "SQ PIPE", qty: fixedCosts.sqPipeLength, unit: "M", unitPrice: fixedCosts.sqPipe, amount: fixedCosts.sqPipe * fixedCosts.sqPipeLength },
    { key: "gasket", name: "GASKET (가스켓)", qty: 1, unit: "LOT", unitPrice: fixedCosts.gasket, amount: fixedCosts.gasket },
    { key: "boltNut", name: "B/N/2W (볼트·너트)", qty: 1, unit: "LOT", unitPrice: fixedCosts.boltNut, amount: fixedCosts.boltNut },
    { key: "ladder", name: "LADDER & HAND RAIL (사다리/핸드레일)", qty: 1, unit: "LOT", unitPrice: fixedCosts.ladder, amount: fixedCosts.ladder },
  ];
  return lines.filter((l) => l.amount !== 0);
}

export interface CostBreakdown {
  material: number;
  labor: number;
  subtotal: number;
  inspection: number;
  transportation: number;
  extras: number;
  profit: number;
  safety: number;
  rounding: number;
  total: number;
}

/**
 * 기존 산출 순서를 그대로 유지: (소계+검사비+운송비+추가마진) → 이익률 → 안전할증 → 만원 단위 반올림.
 * 이익·안전할증·반올림 차액을 구분해서 돌려주므로 각 항목의 합이 총계와 정확히 일치합니다.
 */
export function finalizeCosts(
  material: number,
  labor: number,
  inspection: number,
  transportation: number,
  extras: number,
  safetyMargins: SafetyMargins
): CostBreakdown {
  const subtotal = material + labor;
  const profitBase = subtotal + inspection + transportation + extras;
  const profit = Math.round(profitBase * (safetyMargins.profitMargin / 100));
  const beforeSafety = profitBase + profit;
  const withSafety = beforeSafety * (1 + safetyMargins.safetyFactor / 100);
  const safety = Math.round(withSafety - beforeSafety);
  const total = Math.round(withSafety / 10000) * 10000;
  const rounding = total - beforeSafety - safety;
  return { material, labor, subtotal, inspection, transportation, extras, profit, safety, rounding, total };
}

/** 입력 유효성 검사 (계산 전) */
export function validateQuotationInputs(params: {
  diameter: number;
  height: number;
  thickness: ThicknessConfig;
  fixedCosts: FixedCosts;
  laborPrices: LaborPrices;
  materialPrices: MaterialPrices;
  safetyMargins: SafetyMargins;
}): string[] {
  const errors: string[] = [];
  const { diameter, height, thickness, fixedCosts, laborPrices, materialPrices, safetyMargins } = params;
  const pos = (v: number, label: string) => {
    if (!isFinite(v)) errors.push(`${label}: 숫자를 입력하세요.`);
    else if (v <= 0) errors.push(`${label}: 0보다 큰 값을 입력하세요.`);
  };
  const nonNeg = (v: number, label: string) => {
    if (!isFinite(v)) errors.push(`${label}: 숫자를 입력하세요.`);
    else if (v < 0) errors.push(`${label}: 음수는 입력할 수 없습니다.`);
  };

  pos(diameter, "직경");
  pos(height, "높이");
  pos(thickness.frpDensity, "비중");

  ([
    ["쉘 상부 두께", thickness.shellTop],
    ["쉘 하부 두께", thickness.shellBottom],
    ["바닥 두께", thickness.bottom],
    ["지붕 두께", thickness.roof],
    ["내식층 두께", thickness.cbThickness],
    ["이음부 S.W 두께", thickness.jointSW],
    ["이음부 C.B 두께", thickness.jointCB],
    ["L/L 두께", thickness.ll],
    ["후프 두께", thickness.hoop],
  ] as [string, number][]).forEach(([label, v]) => pos(v, label));

  const cb = thickness.cbThickness;
  const avgShell = (thickness.shellTop + thickness.shellBottom) / 2;
  if (isFinite(cb)) {
    if (avgShell <= cb) errors.push("쉘 총두께(상·하부 평균)는 내식층 두께보다 커야 합니다.");
    if (thickness.bottom <= cb) errors.push("바닥 총두께는 내식층 두께보다 커야 합니다.");
    if (thickness.roof <= cb) errors.push("지붕 총두께는 내식층 두께보다 커야 합니다.");
  }

  ([
    ["플랜지", fixedCosts.flange],
    ["맨홀", fixedCosts.manhole],
    ["레벨 게이지", fixedCosts.levelGauge],
    ["SQ 파이프 단가", fixedCosts.sqPipe],
    ["SQ 파이프 길이", fixedCosts.sqPipeLength],
    ["가스켓", fixedCosts.gasket],
    ["볼트/너트", fixedCosts.boltNut],
    ["사다리/핸드레일", fixedCosts.ladder],
    ["검사비", safetyMargins.inspectionTest],
    ["운송비", safetyMargins.transportation],
    ["일반관리비 및 이익률", safetyMargins.profitMargin],
    ["안전율", safetyMargins.safetyFactor],
    ["수지 단가", materialPrices.resin],
    ["매트#450 단가", materialPrices.mat450],
    ["로빙 클로스 단가", materialPrices.rovingCloth],
    ["로빙#2200 단가", materialPrices.roving2200],
    ["서피스 매트 단가", materialPrices.surfaceMat],
    ["와인딩 인건비", laborPrices.winding],
    ["조립 인건비", laborPrices.assembly],
    ["케미칼 인건비", laborPrices.chemical],
    ["특수 인건비", laborPrices.special],
  ] as [string, number][]).forEach(([label, v]) => nonNeg(v, label));

  return errors;
}


// 기본값
export const defaultMaterialPrices: MaterialPrices = {
  resin: 4700,
  mat450: 2700,
  rovingCloth: 2700,
  roving2200: 2300,
  surfaceMat: 1300,
};

export const defaultLaborPrices: LaborPrices = {
  winding: 210000,
  assembly: 210000,
  chemical: 210000,
  special: 210000,
};

export const defaultFixedCosts: FixedCosts = {
  flange: 500000,
  manhole: 350000,
  levelGauge: 400000,
  sqPipe: 12500,
  sqPipeLength: 25,
  gasket: 120000,
  boltNut: 180000,
  ladder: 1000000,
};

export const defaultSafetyMargins: SafetyMargins = {
  inspectionTest: 100000,
  transportation: 350000,
  profitMargin: 15,
  safetyFactor: 5,
};

export const defaultThickness: ThicknessConfig = {
  shellTop: 12,
  shellBottom: 15,
  bottom: 15,
  roof: 12,
  cbThickness: 3,
  jointSW: 15,
  jointCB: 10,
  ll: 6,
  hoop: 15,
  frpDensity: 2.0,
};

// 소형 탱크용 기본값 (직경 2m 미만)
export const smallTankDefaults = {
  thickness: {
    ...defaultThickness,
    shellTop: 6,
    shellBottom: 6,
    bottom: 6,
    roof: 6,
    cbThickness: 3,
    jointSW: 6,
    jointCB: 4,
    ll: 6,
    hoop: 15,
    frpDensity: 2.0,
  },
  fixedCosts: {
    flange: 300000,
    manhole: 0,
    levelGauge: 300000,
    sqPipe: 12500,
    sqPipeLength: 0,
    gasket: 60000,
    boltNut: 120000,
    ladder: 0,
  },
  safetyMargins: {
    inspectionTest: 0,
    transportation: 150000,
    profitMargin: 15,
    safetyFactor: 5,
  },
};

// 중형 탱크용 기본값 (직경 2~3m)
export const mediumTankDefaults = {
  thickness: {
    ...defaultThickness,
    shellTop: 6,
    shellBottom: 6,
    bottom: 6,
    roof: 6,
    frpDensity: 2.0,
  },
  fixedCosts: {
    flange: 400000,
    manhole: 350000,
    levelGauge: 400000,
    sqPipe: 12500,
    sqPipeLength: 15,
    gasket: 120000,
    boltNut: 180000,
    ladder: 900000,
  },
  safetyMargins: {
    inspectionTest: 50000,
    transportation: 250000,
    profitMargin: 15,
    safetyFactor: 5,
  },
};

// 대형 탱크용 기본값 (직경 3m 이상)
export const largeTankDefaults = {
  thickness: defaultThickness,
  fixedCosts: defaultFixedCosts,
  safetyMargins: defaultSafetyMargins,
};

// 탱크 크기에 따른 기본값 반환
export function getDefaultsByDiameter(diameter: number) {
  if (diameter < 2) {
    return smallTankDefaults;
  } else if (diameter < 3) {
    return mediumTankDefaults;
  } else {
    return largeTankDefaults;
  }
}

// 메인 계산 함수
export function calculateTank(
  dimensions: TankDimensions,
  materialPrices: MaterialPrices,
  laborPrices: LaborPrices,
  fixedCosts: FixedCosts,
  safetyMargins: SafetyMargins,
  thickness: ThicknessConfig
): CalculationResult {
  const { diameter, height } = dimensions;
  const PI = Math.PI;
  
  // 용량 계산 (원통 부피)
  const capacity = PI * Math.pow(diameter / 2, 2) * height;
  
  // 면적 계산 (π ≈ 3.14 적용)
  const bodyArea = PI * diameter * height;                    // Body: π × D × H
  const bottomArea = PI * Math.pow(diameter / 2, 2);          // BTM: π × (D/2)²
  const headArea = bottomArea * 1.1;                          // Head: BTM × 1.1 (접시형 헤드 곡률 반영)
  
  // 이음부 및 보강 면적
  const jointSWArea = 0.6 * PI * diameter;                    // Joint(S.W): 0.6 × π × D (유효 폭 0.6m)
  const jointCBArea = 0.5 * PI * diameter;                    // Joint(C.B): 0.5 × π × D (유효 폭 0.5m)
  const hoopArea = 0.2 * PI * diameter;                       // Hoop: 0.2 × π × D
  const llArea = 1.44;                                        // L/L: 고정값 1.44 m²
  
  const totalArea = bodyArea + bottomArea + headArea + jointSWArea + jointCBArea + llArea + hoopArea;
  
  // 단위 면적당 FRP 무게 계산 (kg/m2, 두께 1mm 기준)
  const frpDensity = thickness.frpDensity || 2.0; // FRP 견적용 비중
  
  // 내식층(C.B) 무게 계산
  const cbBody = bodyArea * thickness.cbThickness * frpDensity;
  const cbBottom = bottomArea * thickness.cbThickness * frpDensity;
  const cbHead = headArea * thickness.cbThickness * frpDensity;
  const cbJoint = jointCBArea * thickness.jointCB * frpDensity;
  const cbTotal = cbBody + cbBottom + cbHead + cbJoint;
  
  // 구조층(S.W) 무게 계산
  const avgShellThickness = (thickness.shellTop + thickness.shellBottom) / 2;
  const swBody = bodyArea * avgShellThickness * frpDensity;
  const swBottom = bottomArea * thickness.bottom * frpDensity;
  const swHead = headArea * thickness.roof * frpDensity;
  const swJoint = jointSWArea * thickness.jointSW * frpDensity;
  const swLL = llArea * thickness.ll * frpDensity;
  const swHoop = hoopArea * thickness.hoop * frpDensity;
  const swTotal = swBody + swBottom + swHead + swJoint + swLL + swHoop;
  
  const totalWeight = cbTotal + swTotal;
  
  // ========================================
  // 자재 소요량 분해 (Material Breakdown)
  // ========================================
  
  // A. 내식층 (C.B Layer) - 모든 부위 공통: 수지 70%, Glass #450 30%
  const cbResin = cbTotal * 0.7;
  const cbMat450 = cbTotal * 0.3;
  
  // B. 구조층 (S.W Layer) - 부위별 상이
  // Body: 수지 40%, Roving 60%
  const swBodyResin = swBody * 0.4;
  const swBodyRoving = swBody * 0.6;
  
  // BTM/Head: 수지 70%, Glass #450 30%
  const swBottomResin = swBottom * 0.7;
  const swBottomMat450 = swBottom * 0.3;
  const swHeadResin = swHead * 0.7;
  const swHeadMat450 = swHead * 0.3;
  
  // Joint, L/L, Hoop: 수지 70%, Glass #450 30%
  const swJointResin = swJoint * 0.7;
  const swJointMat450 = swJoint * 0.3;
  const swLLResin = swLL * 0.7;
  const swLLMat450 = swLL * 0.3;
  const swHoopResin = swHoop * 0.7;
  const swHoopMat450 = swHoop * 0.3;
  
  // 총 수지량
  const resinWeight = cbResin + swBodyResin + swBottomResin + swHeadResin + swJointResin + swLLResin + swHoopResin;
  
  // 총 매트#450 (내식층 + 구조층 BTM/Head/Joint/LL/Hoop)
  const mat450Weight = Math.round(cbMat450 + swBottomMat450 + swHeadMat450 + swJointMat450 + swLLMat450 + swHoopMat450);
  
  // 로빙#2200 = Body 구조층의 유리섬유
  const roving2200Weight = Math.round(swBodyRoving);
  
  // 로빙 클로스 = 용량 기반 (보강용)
  const rovingClothWeight = capacity > 10 ? Math.round(capacity * 2.08) : Math.round(capacity * 1.7);
  
  // 서피스 매트 #30 = 전체 면적 × 2.2 (겹침 및 여유율 반영)
  const surfaceMatArea = Math.round(totalArea * 2.2);
  
  // 소모품비 계산 (재료비의 약 6.5%)
  const materialSubtotal = 
    resinWeight * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat;
  
  const consumableRate = 0.065;
  const consumable = Math.round(materialSubtotal * consumableRate);
  const resinRounded = Math.round(resinWeight);

  // 재료비 상세 행 (표시 = 합계)
  const customMaterial = buildUnitPriceLines(materialPrices.custom, "kg", "mat");
  const materialLines: QuoteLine[] = [
    { key: "resin", name: "RESIN (RF-1001 or EQ)", qty: resinRounded, unit: "KG", unitPrice: materialPrices.resin, amount: resinRounded * materialPrices.resin },
    { key: "mat450", name: "CHOPPED STRAND MAT#450", qty: mat450Weight, unit: "KG", unitPrice: materialPrices.mat450, amount: mat450Weight * materialPrices.mat450 },
    { key: "rovingCloth", name: "ROVING CLOTH#570", qty: rovingClothWeight, unit: "KG", unitPrice: materialPrices.rovingCloth, amount: rovingClothWeight * materialPrices.rovingCloth },
    { key: "roving2200", name: "ROVING #2200", qty: roving2200Weight, unit: "KG", unitPrice: materialPrices.roving2200, amount: roving2200Weight * materialPrices.roving2200 },
    { key: "surfaceMat", name: "SURFACE MAT#30", qty: surfaceMatArea, unit: "M²", unitPrice: materialPrices.surfaceMat, amount: surfaceMatArea * materialPrices.surfaceMat },
    ...customMaterial.lines,
    ...buildFixedCostLines(fixedCosts, capacity),
    ...buildAmountLines(fixedCosts.custom, "fix"),
    { key: "consumable", name: "CONSUMABLE (소모품)", qty: 1, unit: "LOT", unitPrice: null, amount: consumable },
  ];
  const materialCost = materialLines.reduce((s, l) => s + l.amount, 0);
  
  // 인력 계산 (용량 및 면적 기반)
  const baseLabor = Math.max(1, Math.sqrt(capacity) * 1.5);
  const windingDays = Math.round(baseLabor * 1.0);
  const assemblyDays = Math.round(baseLabor * 1.0);
  const chemicalDays = Math.round(baseLabor * 0.97);
  const specialDays = Math.round(baseLabor * 0.97);
  const totalLaborDays = windingDays + assemblyDays + chemicalDays + specialDays;
  
  // 인건비 상세 행
  const customLabor = buildUnitPriceLines(laborPrices.custom, "M/D", "lab");
  const laborLines: QuoteLine[] = [
    { key: "winding", name: "WINDING LABOR", qty: windingDays, unit: "M/D", unitPrice: laborPrices.winding, amount: windingDays * laborPrices.winding },
    { key: "assembly", name: "ASSEMBLY LABOR", qty: assemblyDays, unit: "M/D", unitPrice: laborPrices.assembly, amount: assemblyDays * laborPrices.assembly },
    { key: "chemical", name: "CHEMICAL LABOR", qty: chemicalDays, unit: "M/D", unitPrice: laborPrices.chemical, amount: chemicalDays * laborPrices.chemical },
    { key: "special", name: "SPECIAL LABOR", qty: specialDays, unit: "M/D", unitPrice: laborPrices.special, amount: specialDays * laborPrices.special },
    ...customLabor.lines,
  ];
  const laborCost = laborLines.reduce((s, l) => s + l.amount, 0);

  // 추가 마진/안전 항목
  const extraLines = buildAmountLines(safetyMargins.custom, "mar");
  const extras = extraLines.reduce((s, l) => s + l.amount, 0);

  const costs = finalizeCosts(
    materialCost,
    laborCost,
    safetyMargins.inspectionTest,
    safetyMargins.transportation,
    extras,
    safetyMargins
  );

  const issues: CalcIssue[] = [
    ...customMaterial.issues,
    ...customLabor.issues,
    ...buildThicknessIssues(thickness),
  ];
  
  return {
    capacity: Math.round(capacity * 10) / 10,
    areas: {
      body: Math.round(bodyArea * 10) / 10,
      bottom: Math.round(bottomArea * 10) / 10,
      head: Math.round(headArea * 10) / 10,
      jointSW: Math.round(jointSWArea * 10) / 10,
      jointCB: Math.round(jointCBArea * 10) / 10,
      ll: Math.round(llArea * 10) / 10,
      hoop: Math.round(hoopArea * 10) / 10,
      total: Math.round(totalArea * 10) / 10,
    },
    weights: {
      cbBody: Math.round(cbBody),
      cbBottom: Math.round(cbBottom),
      cbHead: Math.round(cbHead),
      cbJoint: Math.round(cbJoint),
      cbTotal: Math.round(cbTotal),
      swBody: Math.round(swBody),
      swBottom: Math.round(swBottom),
      swHead: Math.round(swHead),
      swJoint: Math.round(swJoint),
      swLL: Math.round(swLL),
      swHoop: Math.round(swHoop),
      swTotal: Math.round(swTotal),
    },
    materials: {
      resin: resinRounded,
      mat450: mat450Weight,
      rovingCloth: rovingClothWeight,
      roving2200: roving2200Weight,
      surfaceMat: surfaceMatArea,
      consumable,
    },
    labor: {
      winding: windingDays,
      assembly: assemblyDays,
      chemical: chemicalDays,
      special: specialDays,
      total: totalLaborDays,
    },
    costs,
    materialLines,
    laborLines,
    extraLines,
    issues,
  };
}

// 금액 포맷 함수
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

// 숫자를 한글 금액으로 변환
export function numberToKorean(amount: number): string {
  const units = ['', '만', '억', '조'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const subUnits = ['', '십', '백', '천'];
  
  if (amount === 0) return '영';
  
  let result = '';
  let unitIndex = 0;
  
  while (amount > 0) {
    const part = amount % 10000;
    if (part > 0) {
      let partStr = '';
      let tempPart = part;
      let subUnitIndex = 0;
      
      while (tempPart > 0) {
        const digit = tempPart % 10;
        if (digit > 0) {
          const digitStr = subUnitIndex === 0 || digit > 1 ? digits[digit] : '';
          partStr = digitStr + subUnits[subUnitIndex] + partStr;
        }
        tempPart = Math.floor(tempPart / 10);
        subUnitIndex++;
      }
      result = partStr + units[unitIndex] + result;
    }
    amount = Math.floor(amount / 10000);
    unitIndex++;
  }
  
  return '금' + result + '원정';
}
