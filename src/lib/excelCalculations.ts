// 엑셀 견적서 기반 계산 로직 (비압력탱크용)
// FW = 필라멘트 와인딩, HLU = 핸드레이업
// S.W = 구조층(Structural Wall), C.B = 내식층(Corrosion Barrier)

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
// 배합비 상수
// ========================================
// C.B(내식층) 전 부위: HLU 방식 — 수지 70%, Glass#450 30%
const CB_RESIN_RATIO = 0.7;
const CB_GLASS_RATIO = 0.3;

// S.W(구조층) Winding 부위 (Body, Hoop): 수지 45%, Roving 55%
const SW_WINDING_RESIN_RATIO = 0.45;
const SW_WINDING_ROVING_RATIO = 0.55;

// S.W(구조층) HLU 부위 (BTM, Head, Joint, L/L): 수지 70%, Glass 30%
const SW_HLU_RESIN_RATIO = 0.7;
const SW_HLU_GLASS_RATIO = 0.3;

// 소모품 비율
const CONSUMABLE_RATE = 0.07;

// HLU/FW 단가 (원/kg)
const HLU_UNIT_PRICE = 4500;
const FW_UNIT_PRICE = 1500;

// 밀도 (엑셀 고정값)
const DENSITY = 2;

// 서피스매트 계수
const SM_FACTOR = 1.1;

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
  const D = diameter;
  const L = height;

  // 용량
  const capacity = 3.14 * Math.pow(D / 2, 2) * L;

  // 두께
  const cbThk = thickness.cbThickness;
  const swThk = thickness.ll; // L/L용 S.W 두께

  // ========================================
  // 면적 (엑셀 공식: π=3.14 고정)
  // ========================================
  const bodyArea = D * L * 3.14 * 1.1;
  const btmArea = D * D * 0.785 * 1.1;
  const headArea = D * D * 0.785 * 1.25;
  const jntSWArea = D * 3.14 * 0.3 * 2;
  const jntCBArea = D * 3.14 * 0.25 * 2;
  const llArea = 0.6 * 0.6 * 4; // 1.44 m²
  const hoopArea = D * 3.14 * 0.12 * 3;

  const totalArea = bodyArea + btmArea + headArea + jntSWArea + jntCBArea + llArea + hoopArea;

  // ========================================
  // C.B(내식층) 중량: 면적 × th'k(c.b) × 2
  // ========================================
  const cbBodyWt = bodyArea * cbThk * DENSITY;
  const cbBtmWt = btmArea * cbThk * DENSITY;
  const cbHeadWt = headArea * cbThk * DENSITY;
  const cbJntSWWt = jntSWArea * cbThk * DENSITY;
  const cbJntCBWt = jntCBArea * cbThk * DENSITY;
  const cbHoopWt = hoopArea * cbThk * DENSITY;
  const cbTotal = cbBodyWt + cbBtmWt + cbHeadWt + cbJntSWWt + cbJntCBWt + cbHoopWt;

  // ========================================
  // S.W(구조층) 중량: 면적 × th'k(c.b) × 2 (L/L만 th'k(s.w) × 2)
  // ========================================
  const swBodyWt = bodyArea * cbThk * DENSITY;
  const swBtmWt = btmArea * cbThk * DENSITY;
  const swHeadWt = headArea * cbThk * DENSITY;
  const swJntSWWt = jntSWArea * cbThk * DENSITY;
  const swJntCBWt = jntCBArea * cbThk * DENSITY;
  const swLLWt = llArea * swThk * DENSITY;
  const swHoopWt = hoopArea * cbThk * DENSITY;
  const swTotal = swBodyWt + swBtmWt + swHeadWt + swJntSWWt + swJntCBWt + swLLWt + swHoopWt;

  // ========================================
  // RESIN (수지) 소요량
  // ========================================
  // C.B 수지: 전 부위 × 0.7
  const cbResinTotal = cbTotal * CB_RESIN_RATIO;

  // S.W 수지: Body/Hoop → 0.45, 나머지 → 0.7
  const swResinBody = swBodyWt * SW_WINDING_RESIN_RATIO;
  const swResinBtm = swBtmWt * SW_HLU_RESIN_RATIO;
  const swResinHead = swHeadWt * SW_HLU_RESIN_RATIO;
  const swResinJntSW = swJntSWWt * SW_HLU_RESIN_RATIO;
  const swResinJntCB = swJntCBWt * SW_HLU_RESIN_RATIO;
  const swResinLL = swLLWt * SW_HLU_RESIN_RATIO;
  const swResinHoop = swHoopWt * SW_WINDING_RESIN_RATIO;
  const swResinTotal = swResinBody + swResinBtm + swResinHead +
    swResinJntSW + swResinJntCB + swResinLL + swResinHoop;

  const resinWeight = cbResinTotal + swResinTotal;

  // ========================================
  // CHOPPED STRAND MAT #450 (유리섬유 매트)
  // ========================================
  // Body: C.B만 (S.W Body는 Roving 사용)
  const mat450Body = cbBodyWt * CB_GLASS_RATIO;
  // BTM: C.B + S.W (둘 다 HLU)
  const mat450Btm = (cbBtmWt + swBtmWt) * CB_GLASS_RATIO;
  // Head: C.B + S.W (둘 다 HLU)
  const mat450Head = (cbHeadWt + swHeadWt) * CB_GLASS_RATIO;
  // Jnt(S.W): C.B만 (S.W는 Roving Cloth)
  const mat450JntSW = cbJntSWWt * CB_GLASS_RATIO;
  // Jnt(C.B): C.B + S.W
  const mat450JntCB = (cbJntCBWt + swJntCBWt) * CB_GLASS_RATIO;
  // L/L: S.W만
  const mat450LL = swLLWt * SW_HLU_GLASS_RATIO;
  // Hoop: C.B만 (S.W Hoop은 Roving)
  const mat450Hoop = cbHoopWt * CB_GLASS_RATIO;

  const mat450Weight = Math.round(
    mat450Body + mat450Btm + mat450Head + mat450JntSW + mat450JntCB + mat450LL + mat450Hoop
  );

  // ========================================
  // ROVING CLOTH #570 (Joint S.W 보강용)
  // ========================================
  const rovingClothJntSW = swJntSWWt * SW_WINDING_ROVING_RATIO;
  const rovingClothJntCB = swJntCBWt * SW_WINDING_ROVING_RATIO;
  const rovingClothWeight = Math.round(rovingClothJntSW + rovingClothJntCB);

  // ========================================
  // ROVING #2200 (Body/Hoop FW용)
  // ========================================
  const roving2200Body = swBodyWt * SW_WINDING_ROVING_RATIO;
  const roving2200Hoop = swHoopWt * SW_WINDING_ROVING_RATIO;
  const roving2200Weight = Math.round(roving2200Body + roving2200Hoop);

  // ========================================
  // SURFACE MAT #30
  // ========================================
  const smBody = bodyArea * SM_FACTOR * 2;
  const smBtm = btmArea * SM_FACTOR * 2;
  const smHead = headArea * SM_FACTOR * 2;
  const smJntSW = jntSWArea * SM_FACTOR;
  const smJntCB = jntCBArea * SM_FACTOR;
  const smLL = llArea * SM_FACTOR;
  const smHoop = hoopArea * SM_FACTOR * 2;
  const surfaceMatArea = Math.round(smBody + smBtm + smHead + smJntSW + smJntCB + smLL + smHoop);

  // ========================================
  // 비용 계산
  // ========================================
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
  const consumable = Math.round((rawMaterialCost + fixedItemCost) * CONSUMABLE_RATE);

  // 재료비 총계
  const materialCost = rawMaterialCost + fixedItemCost + consumable;

  // ========================================
  // 인건비 (M/D 기반)
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
  // HLU/FW 중량 기반 인건비 (참고용)
  // HLU = BTM(S.W) + Head(S.W) + Jnt(S.W) S.W + L/L(S.W) + C.B 전체
  // FW = Body(S.W) + Hoop(S.W)
  // ========================================
  const hluWeight = Math.round(
    swBtmWt + swHeadWt + swJntSWWt + swLLWt + cbTotal
  );
  const fwWeight = Math.round(swBodyWt + swHoopWt);
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
      bottom: Math.round(btmArea * 10) / 10,
      head: Math.round(headArea * 10) / 10,
      jointSW: Math.round(jntSWArea * 10) / 10,
      jointCB: Math.round(jntCBArea * 10) / 10,
      ll: Math.round(llArea * 10) / 10,
      hoop: Math.round(hoopArea * 10) / 10,
      total: Math.round(totalArea * 10) / 10,
    },
    weights: {
      cbBody: Math.round(cbBodyWt),
      cbBottom: Math.round(cbBtmWt),
      cbHead: Math.round(cbHeadWt),
      cbJoint: Math.round(cbJntSWWt + cbJntCBWt),
      cbTotal: Math.round(cbTotal),
      swBody: Math.round(swBodyWt),
      swBottom: Math.round(swBtmWt),
      swHead: Math.round(swHeadWt),
      swJoint: Math.round(swJntSWWt + swJntCBWt),
      swLL: Math.round(swLLWt),
      swHoop: Math.round(swHoopWt),
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
