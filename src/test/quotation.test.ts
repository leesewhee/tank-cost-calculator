import { describe, it, expect } from "vitest";
import {
  calculateTank,
  finalizeCosts,
  defaultMaterialPrices,
  defaultLaborPrices,
  defaultFixedCosts,
  defaultSafetyMargins,
  defaultThickness,
  validateQuotationInputs,
} from "@/lib/calculations";
import { calculateTankExcel } from "@/lib/excelCalculations";

const dims = { diameter: 4.2, height: 6 };
const base = [defaultMaterialPrices, defaultLaborPrices, defaultFixedCosts, defaultSafetyMargins, defaultThickness] as const;

const run = () => calculateTank(dims, ...base);
const runExcel = (thk = defaultThickness) =>
  calculateTankExcel(dims, defaultMaterialPrices, defaultLaborPrices, defaultFixedCosts, defaultSafetyMargins, thk);

const sum = (lines: { amount: number }[]) => lines.reduce((s, l) => s + l.amount, 0);

describe("견적 합계 정합성", () => {
  it("재료비 행 합계 = SUB TOTAL 1) (기본 산출식)", () => {
    const r = run();
    expect(sum(r.materialLines)).toBe(r.costs.material);
  });

  it("재료비 행 합계 = SUB TOTAL 1) (엑셀 실무)", () => {
    const r = runExcel();
    expect(sum(r.materialLines)).toBe(r.costs.material);
    expect(sum(r.laborLines)).toBe(r.costs.labor);
  });

  it("고정비 항목이 재료비 행에 표시된다", () => {
    const r = runExcel();
    const keys = r.materialLines.map((l) => l.key);
    ["flange", "manhole", "levelGauge", "sqPipe", "gasket", "boltNut", "ladder"].forEach((k) =>
      expect(keys).toContain(k)
    );
  });

  it("이익 + 안전할증 + 반올림 차액의 합이 총계와 일치", () => {
    const r = runExcel();
    const c = r.costs;
    expect(c.subtotal + c.inspection + c.transportation + c.extras + c.profit + c.safety + c.rounding).toBe(c.total);
  });
});

describe("비중 반영", () => {
  it("비중 2.0 기본 결과가 보존된다 (면적×두께×2)", () => {
    const r = runExcel();
    expect(r.excelDetail.density).toBe(2.0);
    const bodyArea = 4.2 * 6 * 3.14 * 1.1;
    expect(r.weights.cbBody).toBe(Math.round(bodyArea * 3 * 2));
  });

  it("비중 1.6으로 낮추면 중량이 0.8배가 된다", () => {
    const a = runExcel();
    const b = runExcel({ ...defaultThickness, frpDensity: 1.6 });
    expect(b.weights.swTotal / a.weights.swTotal).toBeCloseTo(0.8, 3);
    expect(b.materials.resin / a.materials.resin).toBeCloseTo(0.8, 2);
  });
});

describe("사용자 추가 항목", () => {
  it("금액형 고정비는 합계에 포함된다", () => {
    const r = calculateTankExcel(
      dims,
      defaultMaterialPrices,
      defaultLaborPrices,
      { ...defaultFixedCosts, custom: [{ id: "a", name: "특수 노즐", value: 250000, unit: "원" }] },
      defaultSafetyMargins,
      defaultThickness
    );
    const line = r.materialLines.find((l) => l.name === "특수 노즐");
    expect(line?.amount).toBe(250000);
    expect(sum(r.materialLines)).toBe(r.costs.material);
  });

  it("수량 없는 단가형 항목은 오류로 표시되고 합계에서 제외된다", () => {
    const r = calculateTankExcel(
      dims,
      { ...defaultMaterialPrices, custom: [{ id: "m", name: "특수 수지", value: 8000, unit: "원/kg" }] },
      defaultLaborPrices,
      defaultFixedCosts,
      defaultSafetyMargins,
      defaultThickness
    );
    expect(r.issues.some((i) => i.level === "error" && i.message.includes("특수 수지"))).toBe(true);
    expect(r.materialLines.some((l) => l.name === "특수 수지")).toBe(false);
  });

  it("수량이 있으면 단가×수량으로 반영된다", () => {
    const r = calculateTankExcel(
      dims,
      { ...defaultMaterialPrices, custom: [{ id: "m", name: "특수 수지", value: 8000, unit: "kg", quantity: 30 }] },
      defaultLaborPrices,
      defaultFixedCosts,
      defaultSafetyMargins,
      defaultThickness
    );
    expect(r.materialLines.find((l) => l.name === "특수 수지")?.amount).toBe(240000);
  });

  it("추가 두께 항목은 계산 미반영 안내를 남긴다", () => {
    const r = runExcel({ ...defaultThickness, custom: [{ id: "t", name: "보강층", value: 3, unit: "mm" }] });
    expect(r.issues.some((i) => i.message.includes("보강층"))).toBe(true);
    const b = runExcel();
    expect(r.costs.total).toBe(b.costs.total);
  });
});

describe("M/D 변경 재계산", () => {
  it("인건비를 바꾸면 이익·안전할증·총계가 함께 갱신된다", () => {
    const r = runExcel();
    const md = finalizeCosts(
      r.costs.material,
      10_000_000,
      r.costs.inspection,
      r.costs.transportation,
      r.costs.extras,
      defaultSafetyMargins
    );
    expect(md.labor).toBe(10_000_000);
    expect(md.profit).not.toBe(r.costs.profit);
    expect(md.subtotal + md.inspection + md.transportation + md.extras + md.profit + md.safety + md.rounding).toBe(md.total);
  });
});

describe("입력 검증", () => {
  const args = {
    diameter: 4.2,
    height: 6,
    thickness: defaultThickness,
    fixedCosts: defaultFixedCosts,
    laborPrices: defaultLaborPrices,
    materialPrices: defaultMaterialPrices,
    safetyMargins: defaultSafetyMargins,
  };
  it("정상 입력은 오류가 없다", () => {
    expect(validateQuotationInputs(args)).toHaveLength(0);
  });
  it("직경 0, 음수 비용, 내식층 초과를 잡아낸다", () => {
    const errs = validateQuotationInputs({
      ...args,
      diameter: 0,
      thickness: { ...defaultThickness, cbThickness: 20 },
      fixedCosts: { ...defaultFixedCosts, gasket: -1 },
    });
    expect(errs.join(" ")).toContain("직경");
    expect(errs.join(" ")).toContain("내식층");
    expect(errs.join(" ")).toContain("가스켓");
  });
  it("NaN 입력을 잡아낸다", () => {
    expect(validateQuotationInputs({ ...args, height: NaN }).join(" ")).toContain("높이");
  });
});
