// 볼트 사이즈별 피치 (mm) - 미터 나사 기준
export const BOLT_PITCH: Record<string, number> = {
  'M6': 1.0,
  'M8': 1.25,
  'M10': 1.5,
  'M12': 1.75,
  'M14': 2.0,
  'M16': 2.0,
  'M18': 2.5,
  'M20': 2.5,
  'M22': 2.5,
  'M24': 3.0,
  'M27': 3.0,
  'M30': 3.5,
  'M33': 3.5,
  'M36': 4.0,
  'M42': 4.5,
  'M48': 5.0,
};

export const BOLT_SIZES = Object.keys(BOLT_PITCH);

// 일반 와샤 두께 (mm)
export const STANDARD_WASHER_THICKNESS: Record<string, number> = {
  'M6': 1.6, 'M8': 2.0, 'M10': 2.0, 'M12': 2.5, 'M14': 3.0,
  'M16': 3.0, 'M18': 3.0, 'M20': 3.0, 'M22': 3.0, 'M24': 4.0,
  'M27': 4.0, 'M30': 4.0, 'M33': 5.0, 'M36': 5.0, 'M42': 8.0, 'M48': 8.0,
};

// 헤비 와샤 두께 (mm)
export const HEAVY_WASHER_THICKNESS: Record<string, number> = {
  'M6': 3.0, 'M8': 4.0, 'M10': 4.0, 'M12': 5.0, 'M14': 5.0,
  'M16': 6.0, 'M18': 6.0, 'M20': 6.0, 'M22': 6.0, 'M24': 8.0,
  'M27': 8.0, 'M30': 8.0, 'M33': 10.0, 'M36': 10.0, 'M42': 12.0, 'M48': 12.0,
};

// 일반 너트 높이 (mm)
export const STANDARD_NUT_HEIGHT: Record<string, number> = {
  'M6': 5.0, 'M8': 6.5, 'M10': 8.0, 'M12': 10.0, 'M14': 11.0,
  'M16': 13.0, 'M18': 15.0, 'M20': 16.0, 'M22': 18.0, 'M24': 19.0,
  'M27': 22.0, 'M30': 24.0, 'M33': 26.0, 'M36': 29.0, 'M42': 34.0, 'M48': 38.0,
};

// 헤비 너트 높이 (mm)
export const HEAVY_NUT_HEIGHT: Record<string, number> = {
  'M6': 6.0, 'M8': 8.0, 'M10': 10.0, 'M12': 12.0, 'M14': 14.0,
  'M16': 16.0, 'M18': 18.0, 'M20': 20.0, 'M22': 22.0, 'M24': 24.0,
  'M27': 27.0, 'M30': 30.0, 'M33': 33.0, 'M36': 36.0, 'M42': 42.0, 'M48': 48.0,
};

// 표준 볼트 길이 (mm)
export const STANDARD_BOLT_LENGTHS = [
  20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  220, 240, 260, 280, 300
];

export type BoltMode = 'bolt' | 'stud';

export interface BoltCalculationInput {
  boltSize: string;
  boltMode: BoltMode;
  flangeThickness1: number;
  flangeThickness2: number;
  topWasherType: 'standard' | 'heavy' | 'none';
  bottomWasherType: 'standard' | 'heavy' | 'none';
  nutType: 'standard' | 'heavy';
  topNutType: 'standard' | 'heavy';
  hasGasket: boolean;
  gasketThickness: number;
  hasMiddlePart: boolean;
  middlePartThickness: number;
}

export interface BoltCalculationResult {
  totalGripLength: number;
  minimumBoltLength: number;
  recommendedBoltLength: number;
  threadEngagement: number;
  breakdown: {
    flange1: number;
    flange2: number;
    topWasher: number;
    bottomWasher: number;
    topNut: number;
    bottomNut: number;
    gasket: number;
    middlePart: number;
    threadProtrusion: number;
  };
}

export function calculateBoltLength(input: BoltCalculationInput): BoltCalculationResult {
  const { boltSize, boltMode, flangeThickness1, flangeThickness2, topWasherType, bottomWasherType, nutType, topNutType, hasGasket, gasketThickness, hasMiddlePart, middlePartThickness } = input;

  const pitch = BOLT_PITCH[boltSize] || 2.0;
  const threadProtrusion = pitch * 3;

  const topWasherThickness = topWasherType === 'none' ? 0 : topWasherType === 'heavy' ? HEAVY_WASHER_THICKNESS[boltSize] || 6.0 : STANDARD_WASHER_THICKNESS[boltSize] || 3.0;
  const bottomWasherThickness = bottomWasherType === 'none' ? 0 : bottomWasherType === 'heavy' ? HEAVY_WASHER_THICKNESS[boltSize] || 6.0 : STANDARD_WASHER_THICKNESS[boltSize] || 3.0;

  const bottomNutHeight = nutType === 'heavy' ? HEAVY_NUT_HEIGHT[boltSize] || 16.0 : STANDARD_NUT_HEIGHT[boltSize] || 13.0;
  const topNutHeight = boltMode === 'stud' ? (topNutType === 'heavy' ? HEAVY_NUT_HEIGHT[boltSize] || 16.0 : STANDARD_NUT_HEIGHT[boltSize] || 13.0) : 0;

  const gasketValue = hasGasket ? gasketThickness : 0;
  const middlePartValue = hasMiddlePart ? middlePartThickness : 0;

  const totalThreadProtrusion = boltMode === 'stud' ? threadProtrusion * 2 : threadProtrusion;

  const totalGripLength = flangeThickness1 + flangeThickness2 + topWasherThickness + bottomWasherThickness + topNutHeight + bottomNutHeight + gasketValue + middlePartValue + totalThreadProtrusion;

  const minimumBoltLength = Math.ceil(totalGripLength);
  const recommendedBoltLength = STANDARD_BOLT_LENGTHS.find(length => length >= minimumBoltLength) || minimumBoltLength;

  return {
    totalGripLength: Math.round(totalGripLength * 10) / 10,
    minimumBoltLength,
    recommendedBoltLength,
    threadEngagement: totalThreadProtrusion,
    breakdown: {
      flange1: flangeThickness1,
      flange2: flangeThickness2,
      topWasher: topWasherThickness,
      bottomWasher: bottomWasherThickness,
      topNut: topNutHeight,
      bottomNut: bottomNutHeight,
      gasket: gasketValue,
      middlePart: middlePartValue,
      threadProtrusion: totalThreadProtrusion,
    },
  };
}
