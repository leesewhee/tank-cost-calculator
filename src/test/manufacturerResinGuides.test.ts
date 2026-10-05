import { describe, expect, it } from 'vitest';
import { CHEMICAL_DATABASE } from '@/lib/chemicalResistance';
import { MANUFACTURER_CONDITIONS, RESIN_GUIDES } from '@/lib/manufacturerResinGuides';

describe('제조사별 조건과 기존 일반 참고자료 분리', () => {
  it('각 전사 행에는 추적 가능한 제조사·제품·농도·원문 위치가 있다', () => {
    expect(MANUFACTURER_CONDITIONS.length).toBeGreaterThan(0);
    for (const row of MANUFACTURER_CONDITIONS) {
      expect(RESIN_GUIDES.some(guide => guide.id === row.guideId && !!guide.url)).toBe(true);
      expect(row.reference && row.product && row.chemical && row.concentration).toBeTruthy();
      expect(row.temperature === 'NR' || (typeof row.temperature === 'number' && row.temperature > 0)).toBe(true);
    }
  });
  it('제품별 온도는 일반 수지 분류값을 덮어쓰지 않는다', () => {
    expect(CHEMICAL_DATABASE.find(row => row.id === 'acetic-10')?.maxTemp.polyester).toBe(50);
    expect(MANUFACTURER_CONDITIONS.find(row => row.id === 'sewon-acetic-2-R280')?.temperature).toBe(80);
    expect(new Set(MANUFACTURER_CONDITIONS.map(row => row.id)).size).toBe(MANUFACTURER_CONDITIONS.length);
  });
});