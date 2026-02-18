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

// ========================================
// 엑셀 방식 계수 (실무 견적서 역산)
// ========================================

// 면적 여유율 (이음/겹침/곡률 반영)
const EXCEL_BODY_FACTOR = 1.1;
const EXCEL_BTM_FACTOR = 1.1;
const EXCEL_HEAD_FACTOR = 1.25;

// S.W Body/Hoop 배합비 (Winding 부위)
const EXCEL_WINDING_RESIN_RATIO = 0.45;
const EXCEL_WINDING_ROVING_RATIO = 0.55;

// HLU 부위 배합비 (Hand Lay-Up)
const EXCEL_HLU_RESIN_RATIO = 0.7;
const EXCEL_HLU_GLASS_RATIO = 0.3;

// 소모품 비율 (고정비용 포함 기준)
const EXCEL_CONSUMABLE_RATE = 0.07;

// HLU/FW 단가 (원/kg)
const HLU_UNIT_PRICE = 4500;
const FW_UNIT_PRICE = 1500;

// 서피스매트 계수
const SM_MAIN_FACTOR = 2.2;   // 주요 면적 (body, BTM, head, hoop)
const SM_JOINT_FACTOR = 1.1;  // 이음부/L/L

export interface ExcelLaborResult {
  hluWeight: number;
  fwWeight: number;
  hluCost: number;
  fwCost: number;
  totalWeightCost: number;
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

  // 이음부 면적 (동일)
  const jointSWArea = 0.6 * PI * diameter;
  const jointCBArea = 0.5 * PI * diameter;

  // 후프 면적: 0.12 × π × D² (D ≥ 2 이상만 적용)
  const hoopArea = diameter >= 2 ? 0.12 * PI * Math.pow(diameter, 2) : 0;
  const llArea = 1.4;

  const totalArea = bodyArea + bottomArea + headArea + jointSWArea + jointCBArea + llArea + hoopArea;

  // ========================================
  // 중량 계산
  // 핵심 차이: 사용자 입력 = 전체 두께(TOTAL)
  // → S.W 두께 = 전체 두께 - C.B 두께
  // ========================================
  const frpDensity = thickness.frpDensity || 2.0;
  const cbThk = thickness.cbThickness;

  // 내식층(C.B) — 두께는 cbThickness 그대로
  const cbBody = bodyArea * cbThk * frpDensity;
  const cbBottom = bottomArea * cbThk * frpDensity;
  const cbHead = headArea * cbThk * frpDensity;
  const cbJoint = jointCBArea * thickness.jointCB * frpDensity;
  const cbTotal = cbBody + cbBottom + cbHead + cbJoint;

  // 구조층(S.W) — 전체 두께에서 C.B 두께를 뺀 값
  const shellSWThk = Math.max(0, ((thickness.shellTop + thickness.shellBottom) / 2) - cbThk);
  const bottomSWThk = Math.max(0, thickness.bottom - cbThk);
  const headSWThk = Math.max(0, thickness.roof - cbThk);
  // Joint S.W와 L/L, Hoop은 S.W 전용이므로 그대로 사용
  const jointSWThk = thickness.jointSW;
  const llThk = thickness.ll;
  const hoopThk = thickness.hoop;

  const swBody = bodyArea * shellSWThk * frpDensity;
  const swBottom = bottomArea * bottomSWThk * frpDensity;
  const swHead = headArea * headSWThk * frpDensity;
  const swJoint = jointSWArea * jointSWThk * frpDensity;
  const swLL = llArea * llThk * frpDensity;
  const swHoop = hoopArea * hoopThk * frpDensity;
  const swTotal = swBody + swBottom + swHead + swJoint + swLL + swHoop;

  // ========================================
  // 자재 소요량 (엑셀 배합비 적용)
  // ========================================

  // A. 내식층(C.B): 수지 70%, Glass#450 30% (전 부위 동일)
  const cbResin = cbTotal * EXCEL_HLU_RESIN_RATIO;
  const cbMat450 = cbTotal * EXCEL_HLU_GLASS_RATIO;

  // B. 구조층(S.W)
  // Body: Winding — 수지 45%, Roving 55%
  const swBodyResin = swBody * EXCEL_WINDING_RESIN_RATIO;
  const swBodyRoving = swBody * EXCEL_WINDING_ROVING_RATIO;

  // Hoop: Winding — 수지 45%, Roving 55% (Body와 동일)
  const swHoopResin = swHoop * EXCEL_WINDING_RESIN_RATIO;
  const swHoopRoving = swHoop * EXCEL_WINDING_ROVING_RATIO;

  // BTM/Head/Joint/L/L: HLU — 수지 70%, Glass#450 30%
  const swBottomResin = swBottom * EXCEL_HLU_RESIN_RATIO;
  const swBottomMat450 = swBottom * EXCEL_HLU_GLASS_RATIO;
  const swHeadResin = swHead * EXCEL_HLU_RESIN_RATIO;
  const swHeadMat450 = swHead * EXCEL_HLU_GLASS_RATIO;
  const swJointResin = swJoint * EXCEL_HLU_RESIN_RATIO;
  const swJointMat450 = swJoint * EXCEL_HLU_GLASS_RATIO;
  const swLLResin = swLL * EXCEL_HLU_RESIN_RATIO;
  const swLLMat450 = swLL * EXCEL_HLU_GLASS_RATIO;

  // 총 수지량
  const resinWeight = cbResin + swBodyResin + swHoopResin +
    swBottomResin + swHeadResin + swJointResin + swLLResin;

  // Mat#450: C.B 전체 + S.W HLU 부위 (Hoop 제외 — Hoop은 Roving으로 감)
  const mat450Weight = Math.round(
    cbMat450 + swBottomMat450 + swHeadMat450 + swJointMat450 + swLLMat450
  );

  // Roving#2200: Body(Winding) + Hoop(Winding)의 유리섬유
  const roving2200Weight = Math.round(swBodyRoving + swHoopRoving);

  // Roving Cloth (용량 기반 보강용)
  const rovingClothWeight = capacity > 10 ? Math.round(capacity * 2.08) : Math.round(capacity * 1.7);

  // 서피스매트: 주요 면적 ×2.2, 이음부/L/L ×1.1
  const surfaceMatArea = Math.round(
    (bodyArea + bottomArea + headArea + hoopArea) * SM_MAIN_FACTOR +
    (jointSWArea + jointCBArea + llArea) * SM_JOINT_FACTOR
  );

  // ========================================
  // 비용 계산
  // ========================================

  // 원자재 비용
  const rawMaterialCost =
    Math.round(resinWeight) * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat;

  // 고정 비용
  const fixedItemCost =
    fixedCosts.flange +
    (fixedCosts.manhole > 0 ? fixedCosts.manhole * (capacity > 30 ? 2 : 1) : 0) +
    fixedCosts.levelGauge +
    fixedCosts.sqPipe * fixedCosts.sqPipeLength +
    fixedCosts.gasket +
    fixedCosts.boltNut +
    fixedCosts.ladder;

  // 소모품비 = 7% × (원자재 + 고정비용)
  const consumableBase = rawMaterialCost + fixedItemCost;
  const consumable = Math.round(consumableBase * EXCEL_CONSUMABLE_RATE);

  // 재료비 총계
  const materialCost = rawMaterialCost + fixedItemCost + consumable;

  // ========================================
  // 인건비 (M/D 기반 — 기존 방식 유지)
  // ========================================
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

  // ========================================
  // HLU/FW 대체 인건비 (엑셀 중량 기반)
  // ========================================
  const fwWeight = Math.round(swBody + swHoop); // Winding 부위
  const hluWeight = Math.round(cbTotal + swTotal - swBody - swHoop); // HLU 부위
  const hluCost = hluWeight * HLU_UNIT_PRICE;
  const fwCost = fwWeight * FW_UNIT_PRICE;
  const totalWeightCost = hluCost + fwCost;

  // ========================================
  // 최종 비용
  // ========================================
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
