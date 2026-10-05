import { describe, expect, it } from 'vitest';
import { CHEMICAL_DATABASE } from '@/lib/chemicalResistance';
import { MANUFACTURER_ROWS, RESIN_GUIDES, guideFor, searchManufacturerRows } from '@/lib/manufacturerResinGuides';

describe('제조사별 내약품 조건', () => {
  it('각 행은 제품 열 수와 값 수가 같고 원문 위치가 있다', () => {
    for (const row of MANUFACTURER_ROWS) {
      expect(row.values.length).toBe(guideFor(row.guideId).products.length);
      expect(row.reference).toBeTruthy();
      expect(RESIN_GUIDES.some(g => g.id === row.guideId && !!g.url)).toBe(true);
    }
    expect(new Set(MANUFACTURER_ROWS.map(r => r.id)).size).toBe(MANUFACTURER_ROWS.length);
  });
  it('세 회사 모두 데이터가 있고 한글·화학식으로 검색된다', () => {
    for (const g of RESIN_GUIDES) expect(MANUFACTURER_ROWS.some(r => r.guideId === g.id)).toBe(true);
    expect(searchManufacturerRows('황산').some(r => r.guideId === 'polynt')).toBe(true);
    expect(searchManufacturerRows('H2SO4').length).toBeGreaterThan(0);
    expect(searchManufacturerRows('염산', 'ashland').length).toBe(9);
  });
  it('ASHLAND 초산 1%의 HETRON 942/35는 원문대로 "-"', () => {
    expect(MANUFACTURER_ROWS.find(r => r.id === 'ashland-acetic-1%')?.values[0]).toBe('-');
  });
  it('일반 참고표 값은 변경되지 않는다', () => {
    expect(CHEMICAL_DATABASE.find(row => row.id === 'acetic-10')?.maxTemp.polyester).toBe(50);
  });
});
