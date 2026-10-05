import { describe, expect, it } from 'vitest';
import evidence from '@/features/worldtech/resin-evidence.json';
import cases from '../../tests/parity-fixtures.json';
import { recommendResin } from '@/features/worldtech/resinEngine';
import type { EvidenceRow, ResinInput } from '@/features/worldtech/resinEngine';
import { getRecommendedHeadType, calculateFRPThickness } from '@/lib/frpCalculator';

const rows = evidence.rows as EvidenceRow[];

describe('제조사 근거 조건', () => {
  it('89개 근거행은 출처와 판본을 추적한다', () => {
    expect(rows).toHaveLength(89);
    for (const row of rows) {
      expect(row.source).toBeTruthy();
      expect(row.edition).toBeTruthy();
      expect(Object.keys(row.limits).length).toBeGreaterThan(0);
    }
  });
  it('이식용 899개 Python 대조 사례와 후보가 일치한다', () => {
    for (const item of cases as { input: ResinInput; candidates: string[] }[]) {
      // Original fixtures treat missing hypochlorite pH as eligible; this is intentionally stricter.
      if (item.input.manufacturer === '폴린트' && item.input.chemical === 'sodium-hypochlorite' && item.input.ph === undefined) continue;
      expect(recommendResin(rows, item.input).candidates).toEqual(item.candidates);
    }
  });
  it('농도 불일치·미확인 pH·혼합물·물 종류 오인 방지', () => {
    const base: ResinInput = { manufacturer: '폴린트', chemical: 'hydrochloric-acid', concentration: 29, temperature: 25 };
    expect(recommendResin(rows, base).recommended).toBeNull();
    expect(recommendResin(rows, { ...base, chemical: 'sodium-hypochlorite', concentration: 12 }).recommended).toBeNull();
    expect(recommendResin(rows, { ...base, concentration: 30, mixture: true }).recommended).toBeNull();
    expect(recommendResin(rows, { ...base, chemical: 'distilled-water', concentration: 100 }).recommended).toBeNull();
    expect(() => recommendResin(rows, { ...base, concentration: NaN })).toThrow();
  });
  it('절대압이 낮아질수록 진공 차압이 커진다', () => {
    expect(getRecommendedHeadType(2000, 2000, 0, 0)).toBe('2-1-elliptical');
    expect(getRecommendedHeadType(2000, 2000, 0, 0.101325)).toBe('flat');
    const input = { designStandard: 'rtp-1' as const, chemicalId: 'water', concentration: 100, temperature: 25, resinType: 'vinyl-ester' as const, innerDiameter: 2000, height: 4000, designPressure: 0.1, vacuumPressure: 0.101325, headType: 'flat', bottomType: 'flat', nozzles: [] };
    expect(calculateFRPThickness(input).linerLayer).toBe(0);
  });
});