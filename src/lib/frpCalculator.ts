// FRP Thickness Calculator based on RTP-1 and ASME Section X standards

export type DesignStandard = 'rtp-1' | 'section-x';
export type ResinType = 'vinyl-ester' | 'novolac' | 'general-vinyl';

export interface Chemical {
  id: string;
  name: string;
  maxConcentration: number;
  maxTemperature: number;
  recommendedResin: ResinType;
}

export const CHEMICALS: Chemical[] = [
  { id: 'water', name: '일반 물 (H₂O)', maxConcentration: 100, maxTemperature: 100, recommendedResin: 'vinyl-ester' },
  { id: 'sulfuric-acid', name: '황산 (H₂SO₄)', maxConcentration: 98, maxTemperature: 120, recommendedResin: 'novolac' },
  { id: 'hydrochloric-acid', name: '염산 (HCl)', maxConcentration: 37, maxTemperature: 80, recommendedResin: 'novolac' },
  { id: 'nitric-acid', name: '질산 (HNO₃)', maxConcentration: 40, maxTemperature: 65, recommendedResin: 'novolac' },
  { id: 'phosphoric-acid', name: '인산 (H₃PO₄)', maxConcentration: 85, maxTemperature: 100, recommendedResin: 'vinyl-ester' },
  { id: 'sodium-hydroxide', name: '수산화나트륨 (NaOH)', maxConcentration: 50, maxTemperature: 100, recommendedResin: 'vinyl-ester' },
  { id: 'sodium-hypochlorite', name: '차아염소산나트륨 (NaOCl)', maxConcentration: 15, maxTemperature: 50, recommendedResin: 'novolac' },
  { id: 'acetic-acid', name: '초산 (CH₃COOH)', maxConcentration: 100, maxTemperature: 90, recommendedResin: 'vinyl-ester' },
  { id: 'acetone', name: '아세톤 (C₃H₆O)', maxConcentration: 100, maxTemperature: 55, recommendedResin: 'novolac' },
  { id: 'methanol', name: '메탄올 (CH₃OH)', maxConcentration: 100, maxTemperature: 60, recommendedResin: 'novolac' },
  { id: 'toluene', name: '톨루엔 (C₇H₈)', maxConcentration: 100, maxTemperature: 50, recommendedResin: 'novolac' },
  { id: 'saltwater', name: '소금물 (NaCl)', maxConcentration: 100, maxTemperature: 100, recommendedResin: 'vinyl-ester' },
  { id: 'wastewater', name: '폐수', maxConcentration: 100, maxTemperature: 80, recommendedResin: 'vinyl-ester' },
];

export interface HeadType {
  id: string;
  name: string;
  factor: number;
}

export const HEAD_TYPES: HeadType[] = [
  { id: 'flat', name: '플랫', factor: 1.0 },
  { id: '2-1-elliptical', name: '2:1 타원형', factor: 0.5 },
  { id: '10-percent-dish', name: '10% 디쉬', factor: 0.75 },
  { id: 'conical', name: '콘', factor: 0.6 },
];

export const BOTTOM_TYPES: HeadType[] = [
  { id: 'flat', name: '평판', factor: 1.0 },
  { id: '2-1-elliptical', name: '경판 (2:1 타원형)', factor: 0.5 },
];

export interface NozzleStandard {
  id: string;
  name: string;
  sizes: string[];
}

export const NOZZLE_STANDARDS: NozzleStandard[] = [
  { id: 'ansi', name: 'ANSI', sizes: ['1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"', '14"', '16"', '18"', '20"', '24"'] },
  { id: 'jis', name: 'JIS', sizes: ['15A', '20A', '25A', '32A', '40A', '50A', '65A', '80A', '100A', '125A', '150A', '200A', '250A', '300A', '350A', '400A', '450A', '500A', '600A'] },
];

export interface Nozzle {
  id: string;
  standard: 'ansi' | 'jis';
  size: string;
  quantity: number;
}

export interface FRPCalculationInput {
  designStandard: DesignStandard;
  chemicalId: string;
  concentration: number;
  temperature: number;
  resinType: ResinType;
  innerDiameter: number;
  height: number;
  designPressure: number;
  vacuumPressure: number;
  headType: string;
  bottomType: string;
  nozzles: Nozzle[];
}

export interface HoopReinforcement {
  required: boolean;
  size: string;
  spacing: number;
  count: number;
}

export interface FRPCalculationResult {
  shellThickness: number;
  shellLayers: number;
  shellWeight: number;
  headThickness: number;
  headWeight: number;
  bottomThickness: number;
  bottomWeight: number;
  bottomType: string;
  totalWeight: number;
  totalSurfaceArea: number;
  hoopReinforcement: HoopReinforcement;
  stiffenerRings: number;
  safetyFactor: number;
  corrosionAllowance: number;
  maxAllowableWorkingPressure: number;
  hydrostaticTestPressure: number;
  innerLinerThickness: number;
  structuralLayerThickness: number;
  outerLayerThickness: number;
  shellUpperThickness: number;
  shellLowerThickness: number;
  bottomPlateThickness: number;
  roofThickness: number;
  corrosionLayerThickness: number;
  jointSW: number;
  jointCB: number;
  linerLayer: number;
  hoopThickness: number;
  nozzleReinforcement: { nozzleId: string; reinforcementThickness: number; reinforcementDiameter: number; }[];
  warnings: string[];
}

const RESIN_PROPERTIES: Record<ResinType, { tensileStrength: number; modulus: number; density: number; name: string }> = {
  'vinyl-ester': { tensileStrength: 82, modulus: 3400, density: 1.12, name: '비닐에스터' },
  'novolac': { tensileStrength: 90, modulus: 3600, density: 1.15, name: '노볼락' },
  'general-vinyl': { tensileStrength: 75, modulus: 3200, density: 1.10, name: '일반 비닐에스터' },
};

export const getResinName = (resinType: ResinType): string => {
  return RESIN_PROPERTIES[resinType].name;
};

export const getRecommendedResin = (chemicalId: string, concentration: number, temperature: number): ResinType => {
  const chemical = CHEMICALS.find(c => c.id === chemicalId);
  if (!chemical) return 'vinyl-ester';
  if (concentration > chemical.maxConcentration * 0.8 || temperature > chemical.maxTemperature * 0.8) {
    return 'novolac';
  }
  return chemical.recommendedResin;
};

export const getRecommendedHeadType = (diameter: number, height: number, designPressure: number, vacuumPressure: number): string => {
  if (designPressure > 0.5 || vacuumPressure > 0.05) return '2-1-elliptical';
  const aspectRatio = height / diameter;
  if (aspectRatio > 2) return '2-1-elliptical';
  if (aspectRatio > 1) return '10-percent-dish';
  if (diameter > 3000) return 'conical';
  return 'flat';
};

export const getRecommendedBottomType = (diameter: number, height: number, designPressure: number): string => {
  const hydrostaticPressure = (1.0 * 9.81 * height) / 1000000;
  const totalBottomPressure = designPressure + hydrostaticPressure;
  if (totalBottomPressure > 0.1 || diameter > 2500) return '2-1-elliptical';
  if (diameter > 1500 || height > 3000) return '10-percent-dish';
  return 'flat';
};

export const calculateFRPThickness = (input: FRPCalculationInput): FRPCalculationResult => {
  const warnings: string[] = [];
  const chemical = CHEMICALS.find(c => c.id === input.chemicalId);
  const resinProps = RESIN_PROPERTIES[input.resinType];
  const headType = HEAD_TYPES.find(h => h.id === input.headType);

  if (chemical) {
    if (input.concentration > chemical.maxConcentration) {
      warnings.push(`농도가 ${chemical.name}의 최대 허용치(${chemical.maxConcentration}%)를 초과합니다.`);
    }
    if (input.temperature > chemical.maxTemperature) {
      warnings.push(`온도가 ${chemical.name}의 최대 허용치(${chemical.maxTemperature}°C)를 초과합니다.`);
    }
  }

  const designFactor = input.designStandard === 'rtp-1' ? 10 : 8;
  const safetyFactor = designFactor;
  const corrosionAllowance = input.designStandard === 'rtp-1' ? 2.5 : 3.0;

  const radius = input.innerDiameter / 2;
  const allowableStress = resinProps.tensileStrength / designFactor;
  const fluidDensity = 1.0;

  const upperZoneHeight = input.height / 3;
  const hydrostaticUpper = (fluidDensity * 9.81 * upperZoneHeight) / 1000000;
  const upperPressure = input.designPressure + hydrostaticUpper;

  let shellUpperThickness = (upperPressure * radius) / allowableStress + corrosionAllowance;
  const minThickness = Math.max(6, input.innerDiameter / 500);
  shellUpperThickness = Math.max(shellUpperThickness, minThickness);
  shellUpperThickness = Math.ceil(shellUpperThickness * 2) / 2;

  const hydrostaticLower = (fluidDensity * 9.81 * input.height) / 1000000;
  const lowerPressure = input.designPressure + hydrostaticLower;

  let shellLowerThickness = (lowerPressure * radius) / allowableStress + corrosionAllowance;
  shellLowerThickness = Math.max(shellLowerThickness, minThickness);
  shellLowerThickness = Math.ceil(shellLowerThickness * 2) / 2;

  const shellThickness = shellLowerThickness;
  const shellLayers = Math.ceil(shellThickness / 0.4);

  const headFactor = headType?.factor || 1.0;
  let headThickness = ((input.designPressure * radius) / allowableStress + corrosionAllowance) * headFactor;
  headThickness = Math.max(headThickness, 6);
  headThickness = Math.ceil(headThickness * 2) / 2;

  const bottomHeadType = HEAD_TYPES.find(h => h.id === input.bottomType);
  const bottomFactor = bottomHeadType?.factor || 1.0;
  const hydrostaticHead = (fluidDensity * 9.81 * input.height) / 1000000;
  const bottomPressure = input.designPressure + hydrostaticHead;

  let bottomThickness: number;
  if (input.bottomType === 'flat') {
    const flatFactor = 0.3;
    bottomThickness = (input.innerDiameter * Math.sqrt(flatFactor * bottomPressure / allowableStress)) + corrosionAllowance;
  } else {
    bottomThickness = ((bottomPressure * radius) / allowableStress + corrosionAllowance) * bottomFactor;
  }
  bottomThickness = Math.max(bottomThickness, shellLowerThickness);
  bottomThickness = Math.max(bottomThickness, 10);
  bottomThickness = Math.ceil(bottomThickness * 2) / 2;

  const vacuumCritical = input.vacuumPressure > 0.03;
  let stiffenerRings = 0;
  if (vacuumCritical) {
    const bucklingPressure = (2.6 * resinProps.modulus * Math.pow(shellThickness / input.innerDiameter, 2.5)) / 1000;
    if (input.vacuumPressure > bucklingPressure * 0.5) {
      stiffenerRings = Math.ceil(input.height / 1500);
      warnings.push(`진공 압력으로 인해 ${stiffenerRings}개의 보강 링이 필요합니다.`);
    }
  }

  const hoopReinforcement: HoopReinforcement = { required: false, size: '', spacing: 0, count: 0 };
  if (input.innerDiameter > 2000 || input.height > 5000 || lowerPressure > 0.3) {
    hoopReinforcement.required = true;
    if (input.innerDiameter <= 2500) hoopReinforcement.size = '100x50x8';
    else if (input.innerDiameter <= 3500) hoopReinforcement.size = '150x75x10';
    else hoopReinforcement.size = '200x100x12';
    hoopReinforcement.spacing = Math.max(800, Math.min(1500, input.height / 5));
    hoopReinforcement.spacing = Math.round(hoopReinforcement.spacing / 100) * 100;
    hoopReinforcement.count = Math.ceil(input.height / hoopReinforcement.spacing) - 1;
  }

  const shellArea = Math.PI * input.innerDiameter * input.height / 1000000;
  const headArea = Math.PI * Math.pow(input.innerDiameter / 2, 2) / 1000000;
  const bottomArea = Math.PI * Math.pow(input.innerDiameter / 2, 2) / 1000000;
  const totalSurfaceArea = shellArea + headArea + bottomArea;

  const frpDensity = 1.8;
  const shellVolume = shellArea * (shellThickness / 1000);
  const headVolume = headArea * (headThickness / 1000);
  const bottomVolume = bottomArea * (bottomThickness / 1000);
  const shellWeight = shellVolume * frpDensity * 1000;
  const headWeight = headVolume * frpDensity * 1000;
  const bottomWeight = bottomVolume * frpDensity * 1000;
  const totalWeight = shellWeight + headWeight + bottomWeight;

  const innerLinerThickness = 2.5;
  const outerLayerThickness = 1.5;
  const structuralLayerThickness = shellThickness - innerLinerThickness - outerLayerThickness;

  const maxAllowableWorkingPressure = (allowableStress * shellThickness) / radius;
  const hydrostaticTestPressure = Math.max(lowerPressure * 1.5, lowerPressure + 0.1);

  const nozzleReinforcement = input.nozzles.map(nozzle => {
    const nozzleDiameter = getNozzleDiameter(nozzle.standard, nozzle.size);
    const reinforcementDiameter = nozzleDiameter * 2.5;
    const reinforcementThickness = shellThickness * 1.5;
    return {
      nozzleId: nozzle.id,
      reinforcementThickness: Math.ceil(reinforcementThickness * 2) / 2,
      reinforcementDiameter: Math.ceil(reinforcementDiameter),
    };
  });

  const bottomPlateThickness = bottomThickness;
  const roofThickness = headThickness;
  const corrosionLayerThickness = innerLinerThickness;
  const jointSW = Math.ceil((shellLowerThickness * 1.2) * 2) / 2;
  const jointCB = Math.ceil((shellLowerThickness * 1.1) * 2) / 2;
  const linerLayer = innerLinerThickness;
  const hoopThicknessValue = hoopReinforcement.required ? Math.ceil((shellLowerThickness * 1.3) * 2) / 2 : 0;

  return {
    shellThickness, shellLayers, shellWeight: Math.round(shellWeight),
    headThickness, headWeight: Math.round(headWeight),
    bottomThickness, bottomWeight: Math.round(bottomWeight), bottomType: input.bottomType,
    totalWeight: Math.round(totalWeight),
    totalSurfaceArea: Math.round(totalSurfaceArea * 100) / 100,
    hoopReinforcement, stiffenerRings, safetyFactor, corrosionAllowance,
    maxAllowableWorkingPressure: Math.round(maxAllowableWorkingPressure * 1000) / 1000,
    hydrostaticTestPressure: Math.round(hydrostaticTestPressure * 1000) / 1000,
    innerLinerThickness,
    structuralLayerThickness: Math.round(structuralLayerThickness * 10) / 10,
    outerLayerThickness,
    shellUpperThickness, shellLowerThickness, bottomPlateThickness, roofThickness,
    corrosionLayerThickness, jointSW, jointCB, linerLayer,
    hoopThickness: hoopThicknessValue,
    nozzleReinforcement, warnings,
  };
};

const getNozzleDiameter = (standard: 'ansi' | 'jis', size: string): number => {
  const ansiSizes: Record<string, number> = {
    '1/2"': 15, '3/4"': 20, '1"': 25, '1-1/2"': 40, '2"': 50,
    '3"': 80, '4"': 100, '6"': 150, '8"': 200, '10"': 250,
    '12"': 300, '14"': 350, '16"': 400, '18"': 450, '20"': 500, '24"': 600,
  };
  const jisSizes: Record<string, number> = {
    '15A': 15, '20A': 20, '25A': 25, '32A': 32, '40A': 40,
    '50A': 50, '65A': 65, '80A': 80, '100A': 100, '125A': 125,
    '150A': 150, '200A': 200, '250A': 250, '300A': 300, '350A': 350,
    '400A': 400, '450A': 450, '500A': 500, '600A': 600,
  };
  if (standard === 'ansi') return ansiSizes[size] || 50;
  return jisSizes[size] || 50;
};
