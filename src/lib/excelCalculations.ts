// 엑셀 견적서 기반 계산 로직 (비압력탱크용)
// FW = 필라멘트 와인딩, HLU = 핸드레이업
// S.W = 구조층(Structural Wall), C.B = 내식층(Corrosion Barrier)
//
// 핵심: 부위별로 CB/SW 두께가 다르게 적용됨
// - Body/BTM/Head: CB층 있음 (cbThickness), SW층 있음 (총두께 - cbThickness)
// - Jnt(S.W): CB층 없음, SW층만 있음 (jointSW 두께)
// - Jnt(C.B): CB층만 있음 (jointCB 두께), SW층 없음
// - L/L: CB층 없음, SW층만 있음 (ll 두께)
// - Hoop: CB층 없음, SW층만 있음 (hoop 두께)

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
// 상수
// ========================================
const PI = 3.14;
const RESIN_RATIO_CB = 0.7;
const RESIN_RATIO_SW_BODY = 0.45;
const RESIN_RATIO_SW_OTHER = 0.7;
const MAT_RATIO = 0.3;
const ROVING_RATIO = 0.55;
const SURFACE_MAT_FACTOR = 1.1;
const COST_HLU = 4500;
const COST_FW = 1500;
const CONSUMABLE_RATE = 0.07;

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
  const diameter = dimensions.diameter;
  const length = dimensions.height;

  // 부위별 두께 산출 (mm 단위)
  const cbThk = thickness.cbThickness; // 내식층 공통 두께
  const avgShell = (thickness.shellTop + thickness.shellBottom) / 2;
  const swBodyThk = Math.max(0, avgShell - cbThk);   // Body SW = 쉘두께 - CB
  const swBtmThk = Math.max(0, thickness.bottom - cbThk); // BTM SW = 바닥두께 - CB
  const swHeadThk = Math.max(0, thickness.roof - cbThk);  // Head SW = 지붕두께 - CB
  const swJntSWThk = thickness.jointSW;  // Jnt(S.W) SW 두께 (별도 입력)
  const cbJntCBThk = swHeadThk;  // Jnt(C.B) CB 두께 = head th'k(s.w) = 지붕두께 - CB
  const swLLThk = thickness.ll;          // L/L SW 두께
  const swHoopThk = thickness.hoop;      // Hoop SW 두께

  // 용량
  const capacity = PI * Math.pow(diameter / 2, 2) * length;

  // ========================================
  // 면적 계산 (m²)
  // ========================================
  const bodyArea = diameter * length * PI * 1.1;
  const btmArea = diameter * diameter * 0.785 * 1.1;
  const headArea = diameter * diameter * 0.785 * 1.25;
  const jntSWArea = diameter * PI * 0.3 * 2;
  const jntCBArea = diameter * PI * 0.25 * 2;
  const llArea = 0.6 * 0.6 * 4;
  const hoopArea = diameter * PI * 0.12 * 3;

  // ========================================
  // 1단계: 방식층(CB) 무게 계산
  // Body, BTM, Head → cbThk 적용
  // Jnt(C.B) → cbJntCBThk 적용
  // Jnt(S.W), L/L, Hoop → CB층 없음 (0)
  // ========================================
  const bodyWeight_CB = bodyArea * cbThk * 2;
  const bottomWeight_CB = btmArea * cbThk * 2;
  const headWeight_CB = headArea * cbThk * 2;
  const jointSW_Weight_CB = jntSWArea * cbThk * 2; // Jnt(S.W) CB층: th'k(c.b) 적용
  const jointCB_Weight_CB = jntCBArea * cbJntCBThk * 2;
  const hoopWeight_CB = 0; // Hoop에는 CB층 없음

  const totalWeight_CB = bodyWeight_CB + bottomWeight_CB + headWeight_CB
    + jointSW_Weight_CB + jointCB_Weight_CB + hoopWeight_CB;

  // ========================================
  // 2단계: 구조층(SW) 무게 계산
  // Body → swBodyThk (쉘-CB)
  // BTM → swBtmThk (바닥-CB)
  // Head → swHeadThk (지붕-CB)
  // Jnt(S.W) → swJntSWThk
  // Jnt(C.B) → SW층 없음 (0)
  // L/L → swLLThk
  // Hoop → swHoopThk
  // ========================================
  const bodyWeight_SW = bodyArea * swBodyThk * 2;
  const bottomWeight_SW = btmArea * swBtmThk * 2;
  const headWeight_SW = headArea * swHeadThk * 2;
  const jointSW_Weight_SW = jntSWArea * swJntSWThk * 2;
  const jointCB_Weight_SW = jntCBArea * swJntSWThk * 2; // Jnt(C.B) SW층: jnt(s.w) th'k(s.w) 적용
  const ladderWeight_SW = llArea * swLLThk * 2;
  const hoopWeight_SW = hoopArea * swHoopThk * 2;

  const totalWeight_SW = bodyWeight_SW + bottomWeight_SW + headWeight_SW
    + jointSW_Weight_SW + jointCB_Weight_SW
    + ladderWeight_SW + hoopWeight_SW;

  // ========================================
  // 3단계: 수지(RESIN) 계산
  // ========================================
  // 3.1 방식층 수지 (CB 무게 × 0.7)
  const bodyResin_CB = bodyWeight_CB * RESIN_RATIO_CB;
  const bottomResin_CB = bottomWeight_CB * RESIN_RATIO_CB;
  const headResin_CB = headWeight_CB * RESIN_RATIO_CB;
  const jointSW_Resin_CB = jointSW_Weight_CB * RESIN_RATIO_CB;
  const jointCB_Resin_CB = jointCB_Weight_CB * RESIN_RATIO_CB;
  const hoopResin_CB = hoopWeight_CB * RESIN_RATIO_CB;

  const totalResin_CB = bodyResin_CB + bottomResin_CB + headResin_CB
    + jointSW_Resin_CB + jointCB_Resin_CB + hoopResin_CB;

  // 3.2 구조층 수지
  // Body, Hoop: SW무게 × 0.45 (FW 부위)
  // 나머지: SW무게 × 0.7 (HLU 부위)
  const bodyResin_SW = bodyWeight_SW * RESIN_RATIO_SW_BODY;
  const bottomResin_SW = bottomWeight_SW * RESIN_RATIO_SW_OTHER;
  const headResin_SW = headWeight_SW * RESIN_RATIO_SW_OTHER;
  const jointSW_Resin_SW = jointSW_Weight_SW * RESIN_RATIO_SW_OTHER;
  const jointCB_Resin_SW = jointCB_Weight_SW * RESIN_RATIO_SW_OTHER;
  const ladderResin_SW = ladderWeight_SW * RESIN_RATIO_SW_OTHER;
  const hoopResin_SW = hoopWeight_SW * RESIN_RATIO_SW_BODY;

  const totalResin_SW = bodyResin_SW + bottomResin_SW + headResin_SW
    + jointSW_Resin_SW + jointCB_Resin_SW
    + ladderResin_SW + hoopResin_SW;

  const TOTAL_RESIN = totalResin_CB + totalResin_SW;

  // ========================================
  // 4단계: CHOPPED STRAND MAT #450
  // CB무게 × 0.3 (BTM, Head, Jnt(C.B)는 2배)
  // L/L은 SW무게 × 0.3
  // ========================================
  const bodyMat450 = bodyWeight_CB * MAT_RATIO;
  const bottomMat450 = (bottomWeight_CB + bottomWeight_SW) * MAT_RATIO;
  const headMat450 = (headWeight_CB + headWeight_SW) * MAT_RATIO;
  const jointSW_Mat450 = jointSW_Weight_SW * MAT_RATIO;
  const jointCB_Mat450 = (jointCB_Weight_CB + jointCB_Weight_SW) * MAT_RATIO;
  const ladderMat450 = ladderWeight_SW * MAT_RATIO;
  const hoopMat450 = hoopWeight_CB * MAT_RATIO;

  const TOTAL_MAT450 = bodyMat450 + bottomMat450 + headMat450
    + jointSW_Mat450 + jointCB_Mat450
    + ladderMat450 + hoopMat450;

  // ========================================
  // 5단계: ROVING CLOTH #570
  // Jnt(S.W), Jnt(C.B)의 SW무게 × 0.55
  // ========================================
  const jointSW_RovingCloth570 = jointSW_Weight_SW * ROVING_RATIO;
  const jointCB_RovingCloth570 = jointCB_Weight_SW * ROVING_RATIO;

  const TOTAL_ROVING_CLOTH570 = jointSW_RovingCloth570 + jointCB_RovingCloth570;

  // ========================================
  // 6단계: ROVING #2200
  // Body, Hoop SW무게 × 0.55
  // ========================================
  const bodyRoving2200 = bodyWeight_SW * ROVING_RATIO;
  const hoopRoving2200 = hoopWeight_SW * ROVING_RATIO;

  const TOTAL_ROVING2200 = bodyRoving2200 + hoopRoving2200;

  // ========================================
  // 7단계: SURFACE MAT #30
  // 주요 부위: 면적 × 1.1 × 2
  // 조인트/L/L: 면적 × 1.1
  // ========================================
  const bodySurfaceMat30 = bodyArea * SURFACE_MAT_FACTOR * 2;
  const bottomSurfaceMat30 = btmArea * SURFACE_MAT_FACTOR * 2;
  const headSurfaceMat30 = headArea * SURFACE_MAT_FACTOR * 2;
  const jointSW_SurfaceMat30 = jntSWArea * SURFACE_MAT_FACTOR;
  const jointCB_SurfaceMat30 = jntCBArea * SURFACE_MAT_FACTOR;
  const ladderSurfaceMat30 = llArea * SURFACE_MAT_FACTOR;
  const hoopSurfaceMat30 = hoopArea * SURFACE_MAT_FACTOR * 2;

  const TOTAL_SURFACE_MAT30 = bodySurfaceMat30 + bottomSurfaceMat30 + headSurfaceMat30
    + jointSW_SurfaceMat30 + jointCB_SurfaceMat30
    + ladderSurfaceMat30 + hoopSurfaceMat30;

  // ========================================
  // 8단계: 총 무게 및 HLU/FW 비용
  // HLU: BTM(SW) + Head(SW) + Jnt(S.W)(SW) + L/L(SW) + 전체 CB
  // FW: Body(SW) + Hoop(SW)
  // ========================================
  const TOTAL_WEIGHT = totalWeight_CB + totalWeight_SW;

  const hluWeight = Math.round(bottomWeight_SW + headWeight_SW + jointSW_Weight_SW
    + ladderWeight_SW + totalWeight_CB);
  const fwWeight = Math.round(bodyWeight_SW + hoopWeight_SW);
  const hluCost = hluWeight * COST_HLU;
  const fwCost = fwWeight * COST_FW;
  const totalWeightCost = hluCost + fwCost;

  // ========================================
  // 면적 합계
  // ========================================
  const totalArea = bodyArea + btmArea + headArea + jntSWArea + jntCBArea + llArea + hoopArea;

  // ========================================
  // 비용 계산
  // ========================================
  const resinWeight = Math.round(TOTAL_RESIN);
  const mat450Weight = Math.round(TOTAL_MAT450);
  const rovingClothWeight = Math.round(TOTAL_ROVING_CLOTH570);
  const roving2200Weight = Math.round(TOTAL_ROVING2200);
  const surfaceMatArea = Math.round(TOTAL_SURFACE_MAT30);

  const rawMaterialCost =
    resinWeight * materialPrices.resin +
    mat450Weight * materialPrices.mat450 +
    rovingClothWeight * materialPrices.rovingCloth +
    roving2200Weight * materialPrices.roving2200 +
    surfaceMatArea * materialPrices.surfaceMat;

  const fixedItemCost =
    fixedCosts.flange +
    (fixedCosts.manhole > 0 ? fixedCosts.manhole * (capacity > 30 ? 2 : 1) : 0) +
    fixedCosts.levelGauge +
    fixedCosts.sqPipe * fixedCosts.sqPipeLength +
    fixedCosts.gasket +
    fixedCosts.boltNut +
    fixedCosts.ladder;

  const consumable = Math.round((rawMaterialCost + fixedItemCost) * CONSUMABLE_RATE);
  const materialCost = rawMaterialCost + fixedItemCost + consumable;

  // 인건비 (M/D 기반)
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

  // 최종 비용
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
      bottom: Math.round(btmArea * 10) / 10,
      head: Math.round(headArea * 10) / 10,
      jointSW: Math.round(jntSWArea * 10) / 10,
      jointCB: Math.round(jntCBArea * 10) / 10,
      ll: Math.round(llArea * 10) / 10,
      hoop: Math.round(hoopArea * 10) / 10,
      total: Math.round(totalArea * 10) / 10,
    },
    weights: {
      cbBody: Math.round(bodyWeight_CB),
      cbBottom: Math.round(bottomWeight_CB),
      cbHead: Math.round(headWeight_CB),
      cbJoint: Math.round(jointSW_Weight_CB + jointCB_Weight_CB),
      cbTotal: Math.round(totalWeight_CB),
      swBody: Math.round(bodyWeight_SW),
      swBottom: Math.round(bottomWeight_SW),
      swHead: Math.round(headWeight_SW),
      swJoint: Math.round(jointSW_Weight_SW + jointCB_Weight_SW),
      swLL: Math.round(ladderWeight_SW),
      swHoop: Math.round(hoopWeight_SW),
      swTotal: Math.round(totalWeight_SW),
    },
    materials: {
      resin: resinWeight,
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
