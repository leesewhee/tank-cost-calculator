// FRP 탱크 계산 로직

export interface TankDimensions {
  diameter: number; // 직경 (m)
  height: number;   // 높이 (m)
}

export interface MaterialPrices {
  resin: number;           // 수지 단가 (원/kg)
  mat450: number;          // 매트#450 단가 (원/kg)
  rovingCloth: number;     // 로빙 클로스 단가 (원/kg)
  roving2200: number;      // 로빙 #2200 단가 (원/kg)
  surfaceMat: number;      // 서피스 매트 단가 (원/m2)
}

export interface LaborPrices {
  winding: number;         // 와인딩 인건비 (원/M/D)
  assembly: number;        // 조립 인건비 (원/M/D)
  chemical: number;        // 케미칼 인건비 (원/M/D)
  special: number;         // 특수 인건비 (원/M/D)
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
}

export interface SafetyMargins {
  inspectionTest: number;  // 검사비
  transportation: number;  // 운송비
  profitMargin: number;    // 일반관리비 및 이익률 (%)
  safetyFactor: number;    // 안전율 (%)
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
    material: number;       // 재료비 소계
    labor: number;          // 인건비 소계
    subtotal: number;       // 재료비 + 인건비
    inspection: number;     // 검사비
    transportation: number; // 운송비
    profit: number;         // 일반관리비 및 이익
    total: number;          // 총 합계
  };
}

// 기본값
export const defaultMaterialPrices: MaterialPrices = {
  resin: 4300,
  mat450: 2500,
  rovingCloth: 2500,
  roving2200: 2000,
  surfaceMat: 1300,
};

export const defaultLaborPrices: LaborPrices = {
  winding: 140000,
  assembly: 140000,
  chemical: 140000,
  special: 140000,
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
  
  // 면적 계산
  const bodyArea = PI * diameter * height;
  const bottomArea = PI * Math.pow(diameter / 2, 2);
  const headArea = bottomArea;
  
  // 이음부 면적 (경험식 기반)
  const jointSWArea = diameter * 1.88; // 직경에 비례
  const jointCBArea = diameter * 1.57;
  const llArea = diameter * 0.69;
  const hoopArea = diameter * 1.5;
  
  const totalArea = bodyArea + bottomArea + headArea + jointSWArea + jointCBArea + llArea + hoopArea;
  
  // 단위 면적당 FRP 무게 계산 (kg/m2, 두께 1mm 기준)
  const frpDensity = 2.0; // FRP 밀도 (약 2.0 g/cm3 = 2 kg/m2/mm)
  
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
  
  // 재료 수량 계산 (회귀식 기반)
  // 수지량 = 전체 무게 * 0.7 (수지 함량 약 70%)
  const resinWeight = totalWeight * 0.7;
  
  // 유리섬유량 = 전체 무게 * 0.3
  const gfWeight = totalWeight * 0.3;
  
  // 매트#450 = 전체 유리섬유의 약 43%
  const mat450Weight = Math.round(gfWeight * 0.43);
  
  // 로빙#2200 = 전체 유리섬유의 약 50%
  const roving2200Weight = Math.round(gfWeight * 0.50);
  
  // 로빙 클로스 = 용량 기반 (큰 탱크에서만 사용)
  const rovingClothWeight = capacity > 10 ? Math.round(capacity * 2.08) : Math.round(capacity * 1.7);
  
  // 서피스 매트 = 전체 면적 * 1.2 (여유량)
  const surfaceMatArea = Math.round(totalArea * 1.2);
  
  // 소모품비 계산 (재료비의 약 6.5%)
  const materialSubtotal = 
    resinWeight * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat;
  
  const consumableRate = 0.065;
  const consumable = Math.round(materialSubtotal * consumableRate);
  
  // 재료비 총계
  const materialCost = 
    Math.round(resinWeight) * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat +
    fixedCosts.flange +
    (fixedCosts.manhole > 0 ? fixedCosts.manhole * (capacity > 30 ? 2 : 1) : 0) +
    fixedCosts.levelGauge +
    fixedCosts.sqPipe * fixedCosts.sqPipeLength +
    fixedCosts.gasket +
    fixedCosts.boltNut +
    fixedCosts.ladder +
    consumable;
  
  // 인력 계산 (용량 및 면적 기반)
  const baseLabor = Math.max(1, Math.sqrt(capacity) * 1.5);
  const windingDays = Math.round(baseLabor * 1.0);
  const assemblyDays = Math.round(baseLabor * 1.0);
  const chemicalDays = Math.round(baseLabor * 0.97);
  const specialDays = Math.round(baseLabor * 0.97);
  const totalLaborDays = windingDays + assemblyDays + chemicalDays + specialDays;
  
  // 인건비 총계
  const laborCost = 
    windingDays * laborPrices.winding +
    assemblyDays * laborPrices.assembly +
    chemicalDays * laborPrices.chemical +
    specialDays * laborPrices.special;
  
  // 비용 계산
  const subtotal = materialCost + laborCost;
  const inspection = safetyMargins.inspectionTest;
  const transportation = safetyMargins.transportation;
  
  // 일반관리비 및 이익 (안전율 적용)
  const profitBase = subtotal + inspection + transportation;
  const profit = Math.round(profitBase * (safetyMargins.profitMargin / 100));
  
  const total = subtotal + inspection + transportation + profit;
  
  // 안전율 적용 (최종 금액에 반올림)
  const safetyMultiplier = 1 + (safetyMargins.safetyFactor / 100);
  const finalTotal = Math.round(total * safetyMultiplier / 10000) * 10000;
  
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
      resin: Math.round(resinWeight),
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
    costs: {
      material: materialCost,
      labor: laborCost,
      subtotal,
      inspection,
      transportation,
      profit: finalTotal - subtotal - inspection - transportation,
      total: finalTotal,
    },
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
