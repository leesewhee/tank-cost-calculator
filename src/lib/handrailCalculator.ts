// 핸드레일 & 사다리 무게 계산기 유틸리티

export const MATERIAL_DENSITIES = {
  steel: 7.85,
  stainless304: 7.93,
  stainless316: 8.0,
  aluminum: 2.7,
  galvanized: 7.85,
} as const;

export type MaterialType = keyof typeof MATERIAL_DENSITIES;

export interface PipeSpec {
  nominalSize: string;
  outerDiameter: number;
  thickness: number;
  weightPerMeter: number;
  standard: 'KS' | 'ANSI';
}

export const KS_SGP_PIPES: PipeSpec[] = [
  { nominalSize: '15A', outerDiameter: 21.7, thickness: 2.8, weightPerMeter: 1.31, standard: 'KS' },
  { nominalSize: '20A', outerDiameter: 27.2, thickness: 2.8, weightPerMeter: 1.68, standard: 'KS' },
  { nominalSize: '25A', outerDiameter: 34.0, thickness: 3.2, weightPerMeter: 2.43, standard: 'KS' },
  { nominalSize: '32A', outerDiameter: 42.7, thickness: 3.5, weightPerMeter: 3.38, standard: 'KS' },
  { nominalSize: '40A', outerDiameter: 48.6, thickness: 3.5, weightPerMeter: 3.89, standard: 'KS' },
  { nominalSize: '50A', outerDiameter: 60.5, thickness: 3.8, weightPerMeter: 5.31, standard: 'KS' },
  { nominalSize: '65A', outerDiameter: 76.3, thickness: 4.2, weightPerMeter: 7.47, standard: 'KS' },
  { nominalSize: '80A', outerDiameter: 89.1, thickness: 4.2, weightPerMeter: 8.79, standard: 'KS' },
  { nominalSize: '100A', outerDiameter: 114.3, thickness: 4.5, weightPerMeter: 12.2, standard: 'KS' },
  { nominalSize: '125A', outerDiameter: 139.8, thickness: 4.5, weightPerMeter: 15.0, standard: 'KS' },
  { nominalSize: '150A', outerDiameter: 165.2, thickness: 5.0, weightPerMeter: 19.8, standard: 'KS' },
];

export const ANSI_SCH40_PIPES: PipeSpec[] = [
  { nominalSize: '1/2"', outerDiameter: 21.3, thickness: 2.77, weightPerMeter: 1.27, standard: 'ANSI' },
  { nominalSize: '3/4"', outerDiameter: 26.7, thickness: 2.87, weightPerMeter: 1.69, standard: 'ANSI' },
  { nominalSize: '1"', outerDiameter: 33.4, thickness: 3.38, weightPerMeter: 2.50, standard: 'ANSI' },
  { nominalSize: '1-1/4"', outerDiameter: 42.2, thickness: 3.56, weightPerMeter: 3.39, standard: 'ANSI' },
  { nominalSize: '1-1/2"', outerDiameter: 48.3, thickness: 3.68, weightPerMeter: 4.05, standard: 'ANSI' },
  { nominalSize: '2"', outerDiameter: 60.3, thickness: 3.91, weightPerMeter: 5.44, standard: 'ANSI' },
  { nominalSize: '2-1/2"', outerDiameter: 73.0, thickness: 5.16, weightPerMeter: 8.63, standard: 'ANSI' },
  { nominalSize: '3"', outerDiameter: 88.9, thickness: 5.49, weightPerMeter: 11.3, standard: 'ANSI' },
  { nominalSize: '4"', outerDiameter: 114.3, thickness: 6.02, weightPerMeter: 16.1, standard: 'ANSI' },
  { nominalSize: '5"', outerDiameter: 141.3, thickness: 6.55, weightPerMeter: 21.8, standard: 'ANSI' },
  { nominalSize: '6"', outerDiameter: 168.3, thickness: 7.11, weightPerMeter: 28.3, standard: 'ANSI' },
];

export interface FlatBarSpec { width: number; thickness: number; weightPerMeter: number; }
export const FLATBAR_SPECS: FlatBarSpec[] = [
  { width: 20, thickness: 3, weightPerMeter: 0.47 },
  { width: 25, thickness: 3, weightPerMeter: 0.59 },
  { width: 30, thickness: 3, weightPerMeter: 0.71 },
  { width: 30, thickness: 4, weightPerMeter: 0.94 },
  { width: 40, thickness: 3, weightPerMeter: 0.94 },
  { width: 40, thickness: 4, weightPerMeter: 1.26 },
  { width: 40, thickness: 5, weightPerMeter: 1.57 },
  { width: 50, thickness: 4, weightPerMeter: 1.57 },
  { width: 50, thickness: 5, weightPerMeter: 1.96 },
  { width: 50, thickness: 6, weightPerMeter: 2.36 },
  { width: 65, thickness: 5, weightPerMeter: 2.55 },
  { width: 65, thickness: 6, weightPerMeter: 3.06 },
  { width: 75, thickness: 6, weightPerMeter: 3.53 },
  { width: 75, thickness: 9, weightPerMeter: 5.30 },
  { width: 100, thickness: 6, weightPerMeter: 4.71 },
  { width: 100, thickness: 10, weightPerMeter: 7.85 },
];

export interface RoundBarSpec { diameter: number; weightPerMeter: number; }
export const ROUNDBAR_SPECS: RoundBarSpec[] = [
  { diameter: 6, weightPerMeter: 0.222 },
  { diameter: 9, weightPerMeter: 0.499 },
  { diameter: 10, weightPerMeter: 0.617 },
  { diameter: 12, weightPerMeter: 0.888 },
  { diameter: 13, weightPerMeter: 1.04 },
  { diameter: 14, weightPerMeter: 1.21 },
  { diameter: 16, weightPerMeter: 1.58 },
  { diameter: 19, weightPerMeter: 2.23 },
  { diameter: 22, weightPerMeter: 2.98 },
  { diameter: 25, weightPerMeter: 3.85 },
  { diameter: 28, weightPerMeter: 4.83 },
  { diameter: 32, weightPerMeter: 6.31 },
];

export interface AngleSpec { size: string; legWidth: number; thickness: number; weightPerMeter: number; }
export const ANGLE_SPECS: AngleSpec[] = [
  { size: 'L-25x25x3', legWidth: 25, thickness: 3, weightPerMeter: 1.12 },
  { size: 'L-30x30x3', legWidth: 30, thickness: 3, weightPerMeter: 1.36 },
  { size: 'L-40x40x3', legWidth: 40, thickness: 3, weightPerMeter: 1.83 },
  { size: 'L-40x40x4', legWidth: 40, thickness: 4, weightPerMeter: 2.41 },
  { size: 'L-40x40x5', legWidth: 40, thickness: 5, weightPerMeter: 2.97 },
  { size: 'L-50x50x4', legWidth: 50, thickness: 4, weightPerMeter: 3.06 },
  { size: 'L-50x50x5', legWidth: 50, thickness: 5, weightPerMeter: 3.77 },
  { size: 'L-50x50x6', legWidth: 50, thickness: 6, weightPerMeter: 4.43 },
  { size: 'L-65x65x6', legWidth: 65, thickness: 6, weightPerMeter: 5.91 },
  { size: 'L-75x75x6', legWidth: 75, thickness: 6, weightPerMeter: 6.85 },
  { size: 'L-75x75x9', legWidth: 75, thickness: 9, weightPerMeter: 10.0 },
  { size: 'L-100x100x7', legWidth: 100, thickness: 7, weightPerMeter: 10.6 },
  { size: 'L-100x100x10', legWidth: 100, thickness: 10, weightPerMeter: 14.9 },
];

export interface ChannelSpec { size: string; height: number; width: number; thickness: number; weightPerMeter: number; }
export const CHANNEL_SPECS: ChannelSpec[] = [
  { size: 'C-75x40', height: 75, width: 40, thickness: 5, weightPerMeter: 6.92 },
  { size: 'C-100x50', height: 100, width: 50, thickness: 5, weightPerMeter: 9.36 },
  { size: 'C-125x65', height: 125, width: 65, thickness: 6, weightPerMeter: 13.4 },
  { size: 'C-150x75', height: 150, width: 75, thickness: 6.5, weightPerMeter: 18.6 },
  { size: 'C-180x75', height: 180, width: 75, thickness: 7, weightPerMeter: 21.1 },
  { size: 'C-200x80', height: 200, width: 80, thickness: 7.5, weightPerMeter: 24.6 },
  { size: 'C-250x90', height: 250, width: 90, thickness: 9, weightPerMeter: 34.6 },
];

export interface PlateSpec { thickness: number; weightPerSquareMeter: number; }
export const PLATE_SPECS: PlateSpec[] = [
  { thickness: 2, weightPerSquareMeter: 15.7 },
  { thickness: 3, weightPerSquareMeter: 23.55 },
  { thickness: 4, weightPerSquareMeter: 31.4 },
  { thickness: 5, weightPerSquareMeter: 39.25 },
  { thickness: 6, weightPerSquareMeter: 47.1 },
  { thickness: 8, weightPerSquareMeter: 62.8 },
  { thickness: 9, weightPerSquareMeter: 70.65 },
  { thickness: 10, weightPerSquareMeter: 78.5 },
  { thickness: 12, weightPerSquareMeter: 94.2 },
  { thickness: 14, weightPerSquareMeter: 109.9 },
  { thickness: 16, weightPerSquareMeter: 125.6 },
  { thickness: 19, weightPerSquareMeter: 149.15 },
  { thickness: 22, weightPerSquareMeter: 172.7 },
  { thickness: 25, weightPerSquareMeter: 196.25 },
];

export const CHECKERPLATE_SPECS: PlateSpec[] = [
  { thickness: 4.5, weightPerSquareMeter: 36.2 },
  { thickness: 6, weightPerSquareMeter: 48.0 },
  { thickness: 8, weightPerSquareMeter: 63.3 },
  { thickness: 9, weightPerSquareMeter: 71.1 },
];

export interface ComponentItem {
  id: string;
  type: 'pipe' | 'flatbar' | 'roundbar' | 'angle' | 'channel' | 'plate' | 'checkerplate';
  name: string;
  spec: string;
  length?: number;
  width?: number;
  height?: number;
  quantity: number;
  unitWeight: number;
  totalWeight: number;
}

export function getMaterialFactor(material: MaterialType): number {
  return MATERIAL_DENSITIES[material] / MATERIAL_DENSITIES.steel;
}

export function calculatePipeWeight(outerDiameter: number, thickness: number, length: number, material: MaterialType): number {
  const innerDiameter = outerDiameter - 2 * thickness;
  const crossSectionArea = (Math.PI / 4) * (Math.pow(outerDiameter, 2) - Math.pow(innerDiameter, 2));
  const volume = crossSectionArea * length;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}

export function calculateFlatbarWeight(width: number, thickness: number, length: number, material: MaterialType): number {
  const volume = width * thickness * length;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}

export function calculateRoundbarWeight(diameter: number, length: number, material: MaterialType): number {
  const crossSectionArea = (Math.PI / 4) * Math.pow(diameter, 2);
  const volume = crossSectionArea * length;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}

export function calculateAngleWeight(legWidth: number, thickness: number, length: number, material: MaterialType): number {
  const crossSectionArea = 2 * (legWidth * thickness) - Math.pow(thickness, 2);
  const volume = crossSectionArea * length;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}

export function calculateChannelWeight(height: number, flangeWidth: number, thickness: number, length: number, material: MaterialType): number {
  const crossSectionArea = (height * thickness) + 2 * (flangeWidth * thickness) - 2 * Math.pow(thickness, 2);
  const volume = crossSectionArea * length;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}

export function calculatePlateWeight(width: number, height: number, thickness: number, material: MaterialType): number {
  const volume = width * height * thickness;
  const volumeM3 = volume / 1e9;
  const density = MATERIAL_DENSITIES[material] * 1000;
  return volumeM3 * density;
}
