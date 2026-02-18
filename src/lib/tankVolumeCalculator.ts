// Tank Volume Calculator

export type TankShape = 'rectangular' | 'cylindrical-horizontal' | 'cylindrical-vertical';

export interface TankDimensions {
  shape: TankShape;
  length?: number;
  width?: number;
  height?: number;
  diameter?: number;
  cylinderLength?: number;
  fillLevel?: number;
}

export interface VolumeResult {
  totalVolume: number;
  totalVolumeM3: number;
  totalVolumeGal: number;
  filledVolume: number;
  filledVolumeM3: number;
  filledVolumeGal: number;
  surfaceArea: number;
  weight: number;
}

const LITERS_TO_GALLONS = 0.264172;

export const calculateTankVolume = (dimensions: TankDimensions): VolumeResult | null => {
  const fillPercent = (dimensions.fillLevel ?? 100) / 100;
  let totalVolumeLiters = 0;
  let surfaceArea = 0;

  switch (dimensions.shape) {
    case 'rectangular': {
      const l = dimensions.length ?? 0;
      const w = dimensions.width ?? 0;
      const h = dimensions.height ?? 0;
      if (l <= 0 || w <= 0 || h <= 0) return null;
      totalVolumeLiters = (l * w * h) / 1000000;
      surfaceArea = 2 * ((l * w) + (l * h) + (w * h)) / 1000000;
      break;
    }
    case 'cylindrical-vertical': {
      const d = dimensions.diameter ?? 0;
      const h = dimensions.height ?? 0;
      if (d <= 0 || h <= 0) return null;
      const r = d / 2;
      totalVolumeLiters = (Math.PI * r * r * h) / 1000000;
      surfaceArea = (2 * Math.PI * r * r + 2 * Math.PI * r * h) / 1000000;
      break;
    }
    case 'cylindrical-horizontal': {
      const d = dimensions.diameter ?? 0;
      const l = dimensions.cylinderLength ?? 0;
      if (d <= 0 || l <= 0) return null;
      const r = d / 2;
      totalVolumeLiters = (Math.PI * r * r * l) / 1000000;
      surfaceArea = (2 * Math.PI * r * r + 2 * Math.PI * r * l) / 1000000;
      break;
    }
    default:
      return null;
  }

  const filledVolumeLiters = totalVolumeLiters * fillPercent;

  return {
    totalVolume: Math.round(totalVolumeLiters * 100) / 100,
    totalVolumeM3: Math.round((totalVolumeLiters / 1000) * 1000) / 1000,
    totalVolumeGal: Math.round(totalVolumeLiters * LITERS_TO_GALLONS * 100) / 100,
    filledVolume: Math.round(filledVolumeLiters * 100) / 100,
    filledVolumeM3: Math.round((filledVolumeLiters / 1000) * 1000) / 1000,
    filledVolumeGal: Math.round(filledVolumeLiters * LITERS_TO_GALLONS * 100) / 100,
    surfaceArea: Math.round(surfaceArea * 100) / 100,
    weight: Math.round(filledVolumeLiters),
  };
};

export const TANK_SHAPES = [
  { id: 'rectangular' as TankShape, label: '사각 탱크' },
  { id: 'cylindrical-vertical' as TankShape, label: '원형 수직 탱크' },
  { id: 'cylindrical-horizontal' as TankShape, label: '원형 수평 탱크' },
];
