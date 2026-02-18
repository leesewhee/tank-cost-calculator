// 엑셀 견적서 기반 계산 로직 (비압력탱크용)
// 기존 RTP-1/ASME 계산과 병렬로 사용

import {
  TankDimensions,
  MaterialPrices,
  LaborPrices,
  FixedCosts,
  SafetyMargins,
  ThicknessConfig,
  CalculationResult,
} from "./calculations";

// 엑셀 방식 면적 계수
const EXCEL_BODY_FACTOR = 1.1;    // Body 면적 여유율 (이음/겹침 반영)
const EXCEL_BTM_FACTOR = 1.1;     // BTM 면적 여유율
const EXCEL_HEAD_FACTOR = 1.25;   // Head 면적 계수 (접시형 헤드 곡률)

// 엑셀 방식 배합비
const EXCEL_SW_BODY_RESIN_RATIO = 0.45;  // S.W Body 수지 비율 (vs RTP-1: 0.40)
const EXCEL_SW_BODY_ROVING_RATIO = 0.55; // S.W Body 로빙 비율 (vs RTP-1: 0.60)

// 소모품 비율
const EXCEL_CONSUMABLE_RATE = 0.07; // 7% (vs RTP-1: 6.5%)

// HLU/FW 단가 (원/kg)
const HLU_UNIT_PRICE = 4500;  // Hand Lay-Up 단가
const FW_UNIT_PRICE = 1500;   // Filament Winding 단가

// 서피스매트 계수
const SM_MAIN_FACTOR = 2.2;   // 주요 면적 (body, BTM, head, hoop)
const SM_JOINT_FACTOR = 1.1;  // 이음부/L/L

export interface ExcelLaborResult {
  hluWeight: number;    // HLU 중량 (kg)
  fwWeight: number;     // FW 중량 (kg)
  hluCost: number;      // HLU 비용
  fwCost: number;       // FW 비용
  totalWeightCost: number; // HLU + FW 합계
}

export interface ExcelCalculationResult extends CalculationResult {
  excelLabor: ExcelLaborResult;
}

export function calculateTankExcel(
  dimensions: TankDimensions,
  materialPrices: MaterialPrices,
  laborPrices: LaborPrices,
  fixedCosts: FixedCosts,
  safetyMargins: SafetyMargins,
  thickness: ThicknessConfig
): ExcelCalculationResult {
  const { diameter, height } = dimensions;
  const PI = Math.PI;

  // 용량 (동일)
  const capacity = PI * Math.pow(diameter / 2, 2) * height;

  // ========================================
  // 엑셀 방식 면적 계산 (여유율 적용)
  // ========================================
  const bodyArea = PI * diameter * height * EXCEL_BODY_FACTOR;
  const bottomArea = PI * Math.pow(diameter / 2, 2) * EXCEL_BTM_FACTOR;
  const headArea = PI * Math.pow(diameter / 2, 2) * EXCEL_HEAD_FACTOR;

  // 이음부/보강 면적 (동일)
  const jointSWArea = 0.6 * PI * diameter;
  const jointCBArea = 0.5 * PI * diameter;
  const hoopArea = 0.2 * PI * diameter;
  const llArea = 1.4; // 엑셀 기준

  const totalArea = bodyArea + bottomArea + headArea + jointSWArea + jointCBArea + llArea + hoopArea;

  // ========================================
  // 중량 계산 (면적 × 두께 × 비중)
  // ========================================
  const frpDensity = thickness.frpDensity || 2.0;

  // 내식층(C.B)
  const cbBody = bodyArea * thickness.cbThickness * frpDensity;
  const cbBottom = bottomArea * thickness.cbThickness * frpDensity;
  const cbHead = headArea * thickness.cbThickness * frpDensity;
  const cbJoint = jointCBArea * thickness.jointCB * frpDensity;
  const cbTotal = cbBody + cbBottom + cbHead + cbJoint;

  // 구조층(S.W)
  const avgShellThickness = (thickness.shellTop + thickness.shellBottom) / 2;
  const swBody = bodyArea * avgShellThickness * frpDensity;
  const swBottom = bottomArea * thickness.bottom * frpDensity;
  const swHead = headArea * thickness.roof * frpDensity;
  const swJoint = jointSWArea * thickness.jointSW * frpDensity;
  const swLL = llArea * thickness.ll * frpDensity;
  const swHoop = hoopArea * thickness.hoop * frpDensity;
  const swTotal = swBody + swBottom + swHead + swJoint + swLL + swHoop;

  // ========================================
  // 자재 소요량 (엑셀 배합비 적용)
  // ========================================

  // A. 내식층: 수지 70%, Glass#450 30% (동일)
  const cbResin = cbTotal * 0.7;
  const cbMat450 = cbTotal * 0.3;

  // B. 구조층 Body: 수지 45%, Roving 55% (엑셀 방식)
  const swBodyResin = swBody * EXCEL_SW_BODY_RESIN_RATIO;
  const swBodyRoving = swBody * EXCEL_SW_BODY_ROVING_RATIO;

  // 나머지: 수지 70%, Glass#450 30% (동일)
  const swBottomResin = swBottom * 0.7;
  const swBottomMat450 = swBottom * 0.3;
  const swHeadResin = swHead * 0.7;
  const swHeadMat450 = swHead * 0.3;
  const swJointResin = swJoint * 0.7;
  const swJointMat450 = swJoint * 0.3;
  const swLLResin = swLL * 0.7;
  const swLLMat450 = swLL * 0.3;
  const swHoopResin = swHoop * 0.7;
  const swHoopMat450 = swHoop * 0.3;

  const resinWeight = cbResin + swBodyResin + swBottomResin + swHeadResin + swJointResin + swLLResin + swHoopResin;
  const mat450Weight = Math.round(cbMat450 + swBottomMat450 + swHeadMat450 + swJointMat450 + swLLMat450 + swHoopMat450);
  const roving2200Weight = Math.round(swBodyRoving + swHoop * 0.3); // 후프 로빙 포함
  const rovingClothWeight = capacity > 10 ? Math.round(capacity * 2.08) : Math.round(capacity * 1.7);

  // 서피스매트: 주요 면적 ×2.2, 이음부/L/L ×1.1
  const surfaceMatArea = Math.round(
    (bodyArea + bottomArea + headArea + hoopArea) * SM_MAIN_FACTOR +
    (jointSWArea + jointCBArea + llArea) * SM_JOINT_FACTOR
  );

  // 소모품비 (7%)
  const materialSubtotal =
    resinWeight * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat;

  const consumable = Math.round(materialSubtotal * EXCEL_CONSUMABLE_RATE);

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

  // ========================================
  // HLU/FW 인건비 (엑셀 중량 기반 방식)
  // ========================================
  const fwWeight = Math.round(swBody + swHoop); // Filament Winding 부위
  const hluWeight = Math.round(cbTotal + swTotal - swBody - swHoop); // Hand Lay-Up 부위
  const hluCost = hluWeight * HLU_UNIT_PRICE;
  const fwCost = fwWeight * FW_UNIT_PRICE;
  const totalWeightCost = hluCost + fwCost;

  // 기존 M/D 인건비도 계산 (병렬 비교용)
  const baseLabor = Math.max(1, Math.sqrt(capacity) * 1.5);
  const windingDays = Math.round(baseLabor * 1.0);
  const assemblyDays = Math.round(baseLabor * 1.0);
  const chemicalDays = Math.round(baseLabor * 0.97);
  const specialDays = Math.round(baseLabor * 0.97);
  const totalLaborDays = windingDays + assemblyDays + chemicalDays + specialDays;

  const laborCost =
    windingDays * laborPrices.winding +
    assemblyDays * laborPrices.assembly +
    chemicalDays * laborPrices.chemical +
    specialDays * laborPrices.special;

  // 비용 계산
  const subtotal = materialCost + laborCost;
  const inspection = safetyMargins.inspectionTest;
  const transportation = safetyMargins.transportation;
  const profitBase = subtotal + inspection + transportation;
  const profit = Math.round(profitBase * (safetyMargins.profitMargin / 100));
  const total = subtotal + inspection + transportation + profit;
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
    excelLabor: {
      hluWeight,
      fwWeight,
      hluCost,
      fwCost,
      totalWeightCost,
    },
  };
}
