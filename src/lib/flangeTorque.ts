// FRP Flange Torque Reference Table based on RTP-1 Standard

export interface FlangeTorqueData {
  size: string;
  diameterMm: number;
  diameterInch: number;
  boltSize: string;
  boltCount: number;
  torqueNm: number;
  torqueFtLb: number;
  maxTorqueNm: number;
  maxTorqueFtLb: number;
}

export const FRP_FLANGE_TORQUE_DATA: FlangeTorqueData[] = [
  { size: '1"', diameterMm: 25, diameterInch: 1, boltSize: '1/2"', boltCount: 4, torqueNm: 14, torqueFtLb: 10, maxTorqueNm: 20, maxTorqueFtLb: 15 },
  { size: '1.5"', diameterMm: 40, diameterInch: 1.5, boltSize: '1/2"', boltCount: 4, torqueNm: 14, torqueFtLb: 10, maxTorqueNm: 20, maxTorqueFtLb: 15 },
  { size: '2"', diameterMm: 50, diameterInch: 2, boltSize: '5/8"', boltCount: 4, torqueNm: 20, torqueFtLb: 15, maxTorqueNm: 27, maxTorqueFtLb: 20 },
  { size: '2.5"', diameterMm: 65, diameterInch: 2.5, boltSize: '5/8"', boltCount: 4, torqueNm: 20, torqueFtLb: 15, maxTorqueNm: 27, maxTorqueFtLb: 20 },
  { size: '3"', diameterMm: 80, diameterInch: 3, boltSize: '5/8"', boltCount: 4, torqueNm: 27, torqueFtLb: 20, maxTorqueNm: 34, maxTorqueFtLb: 25 },
  { size: '4"', diameterMm: 100, diameterInch: 4, boltSize: '5/8"', boltCount: 8, torqueNm: 27, torqueFtLb: 20, maxTorqueNm: 34, maxTorqueFtLb: 25 },
  { size: '6"', diameterMm: 150, diameterInch: 6, boltSize: '3/4"', boltCount: 8, torqueNm: 34, torqueFtLb: 25, maxTorqueNm: 47, maxTorqueFtLb: 35 },
  { size: '8"', diameterMm: 200, diameterInch: 8, boltSize: '3/4"', boltCount: 8, torqueNm: 41, torqueFtLb: 30, maxTorqueNm: 54, maxTorqueFtLb: 40 },
  { size: '10"', diameterMm: 250, diameterInch: 10, boltSize: '7/8"', boltCount: 12, torqueNm: 47, torqueFtLb: 35, maxTorqueNm: 68, maxTorqueFtLb: 50 },
  { size: '12"', diameterMm: 300, diameterInch: 12, boltSize: '7/8"', boltCount: 12, torqueNm: 54, torqueFtLb: 40, maxTorqueNm: 68, maxTorqueFtLb: 50 },
  { size: '14"', diameterMm: 350, diameterInch: 14, boltSize: '1"', boltCount: 12, torqueNm: 68, torqueFtLb: 50, maxTorqueNm: 88, maxTorqueFtLb: 65 },
  { size: '16"', diameterMm: 400, diameterInch: 16, boltSize: '1"', boltCount: 16, torqueNm: 68, torqueFtLb: 50, maxTorqueNm: 88, maxTorqueFtLb: 65 },
  { size: '18"', diameterMm: 450, diameterInch: 18, boltSize: '1-1/8"', boltCount: 16, torqueNm: 81, torqueFtLb: 60, maxTorqueNm: 102, maxTorqueFtLb: 75 },
  { size: '20"', diameterMm: 500, diameterInch: 20, boltSize: '1-1/8"', boltCount: 20, torqueNm: 81, torqueFtLb: 60, maxTorqueNm: 102, maxTorqueFtLb: 75 },
  { size: '24"', diameterMm: 600, diameterInch: 24, boltSize: '1-1/4"', boltCount: 20, torqueNm: 95, torqueFtLb: 70, maxTorqueNm: 122, maxTorqueFtLb: 90 },
  { size: '30"', diameterMm: 750, diameterInch: 30, boltSize: '1-1/4"', boltCount: 24, torqueNm: 95, torqueFtLb: 70, maxTorqueNm: 122, maxTorqueFtLb: 90 },
  { size: '36"', diameterMm: 900, diameterInch: 36, boltSize: '1-3/8"', boltCount: 28, torqueNm: 108, torqueFtLb: 80, maxTorqueNm: 136, maxTorqueFtLb: 100 },
  { size: '42"', diameterMm: 1050, diameterInch: 42, boltSize: '1-1/2"', boltCount: 32, torqueNm: 122, torqueFtLb: 90, maxTorqueNm: 149, maxTorqueFtLb: 110 },
  { size: '48"', diameterMm: 1200, diameterInch: 48, boltSize: '1-1/2"', boltCount: 36, torqueNm: 122, torqueFtLb: 90, maxTorqueNm: 149, maxTorqueFtLb: 110 },
];

export const FRP_FLANGE_TORQUE_DATA_METRIC: FlangeTorqueData[] = [
  { size: 'DN25', diameterMm: 25, diameterInch: 1, boltSize: 'M12', boltCount: 4, torqueNm: 14, torqueFtLb: 10, maxTorqueNm: 20, maxTorqueFtLb: 15 },
  { size: 'DN40', diameterMm: 40, diameterInch: 1.5, boltSize: 'M12', boltCount: 4, torqueNm: 14, torqueFtLb: 10, maxTorqueNm: 20, maxTorqueFtLb: 15 },
  { size: 'DN50', diameterMm: 50, diameterInch: 2, boltSize: 'M16', boltCount: 4, torqueNm: 20, torqueFtLb: 15, maxTorqueNm: 27, maxTorqueFtLb: 20 },
  { size: 'DN65', diameterMm: 65, diameterInch: 2.5, boltSize: 'M16', boltCount: 4, torqueNm: 20, torqueFtLb: 15, maxTorqueNm: 27, maxTorqueFtLb: 20 },
  { size: 'DN80', diameterMm: 80, diameterInch: 3, boltSize: 'M16', boltCount: 4, torqueNm: 27, torqueFtLb: 20, maxTorqueNm: 34, maxTorqueFtLb: 25 },
  { size: 'DN100', diameterMm: 100, diameterInch: 4, boltSize: 'M16', boltCount: 8, torqueNm: 27, torqueFtLb: 20, maxTorqueNm: 34, maxTorqueFtLb: 25 },
  { size: 'DN150', diameterMm: 150, diameterInch: 6, boltSize: 'M20', boltCount: 8, torqueNm: 34, torqueFtLb: 25, maxTorqueNm: 47, maxTorqueFtLb: 35 },
  { size: 'DN200', diameterMm: 200, diameterInch: 8, boltSize: 'M20', boltCount: 8, torqueNm: 41, torqueFtLb: 30, maxTorqueNm: 54, maxTorqueFtLb: 40 },
  { size: 'DN250', diameterMm: 250, diameterInch: 10, boltSize: 'M22', boltCount: 12, torqueNm: 47, torqueFtLb: 35, maxTorqueNm: 68, maxTorqueFtLb: 50 },
  { size: 'DN300', diameterMm: 300, diameterInch: 12, boltSize: 'M22', boltCount: 12, torqueNm: 54, torqueFtLb: 40, maxTorqueNm: 68, maxTorqueFtLb: 50 },
  { size: 'DN350', diameterMm: 350, diameterInch: 14, boltSize: 'M24', boltCount: 12, torqueNm: 68, torqueFtLb: 50, maxTorqueNm: 88, maxTorqueFtLb: 65 },
  { size: 'DN400', diameterMm: 400, diameterInch: 16, boltSize: 'M24', boltCount: 16, torqueNm: 68, torqueFtLb: 50, maxTorqueNm: 88, maxTorqueFtLb: 65 },
  { size: 'DN450', diameterMm: 450, diameterInch: 18, boltSize: 'M27', boltCount: 16, torqueNm: 81, torqueFtLb: 60, maxTorqueNm: 102, maxTorqueFtLb: 75 },
  { size: 'DN500', diameterMm: 500, diameterInch: 20, boltSize: 'M27', boltCount: 20, torqueNm: 81, torqueFtLb: 60, maxTorqueNm: 102, maxTorqueFtLb: 75 },
  { size: 'DN600', diameterMm: 600, diameterInch: 24, boltSize: 'M30', boltCount: 20, torqueNm: 95, torqueFtLb: 70, maxTorqueNm: 122, maxTorqueFtLb: 90 },
  { size: 'DN750', diameterMm: 750, diameterInch: 30, boltSize: 'M30', boltCount: 24, torqueNm: 95, torqueFtLb: 70, maxTorqueNm: 122, maxTorqueFtLb: 90 },
  { size: 'DN900', diameterMm: 900, diameterInch: 36, boltSize: 'M33', boltCount: 28, torqueNm: 108, torqueFtLb: 80, maxTorqueNm: 136, maxTorqueFtLb: 100 },
  { size: 'DN1050', diameterMm: 1050, diameterInch: 42, boltSize: 'M36', boltCount: 32, torqueNm: 122, torqueFtLb: 90, maxTorqueNm: 149, maxTorqueFtLb: 110 },
  { size: 'DN1200', diameterMm: 1200, diameterInch: 48, boltSize: 'M36', boltCount: 36, torqueNm: 122, torqueFtLb: 90, maxTorqueNm: 149, maxTorqueFtLb: 110 },
];

export interface TorqueSequenceStep {
  pass: number;
  percentage: number;
  description: string;
}

export const TORQUE_SEQUENCE: TorqueSequenceStep[] = [
  { pass: 1, percentage: 30, description: '1차 체결: 목표 토크의 30%로 교차 패턴(별모양)으로 체결' },
  { pass: 2, percentage: 60, description: '2차 체결: 목표 토크의 60%로 동일 패턴으로 체결' },
  { pass: 3, percentage: 100, description: '3차 체결: 목표 토크의 100%로 최종 체결' },
  { pass: 4, percentage: 100, description: '4차 확인: 시계 방향으로 순차적으로 최종 토크 확인' },
];

export interface GasketType {
  id: string;
  name: string;
  torqueMultiplier: number;
  description: string;
}

export const GASKET_TYPES: GasketType[] = [
  { id: 'ptfe', name: 'PTFE (테프론)', torqueMultiplier: 1.0, description: '표준 FRP 플랜지용 가스켓. 우수한 내화학성.' },
  { id: 'rubber-epdm', name: 'EPDM 고무', torqueMultiplier: 0.85, description: '물, 알칼리, 산화제용. 낮은 토크 권장.' },
  { id: 'rubber-viton', name: 'Viton (FKM)', torqueMultiplier: 0.9, description: '탄화수소, 고온용. 우수한 내열성.' },
  { id: 'fiber-filled-ptfe', name: '충전 PTFE', torqueMultiplier: 1.1, description: '고압, 고온 조건용. 향상된 기계적 강도.' },
];

export type UnitSystem = 'imperial' | 'metric';

export function getFlangeTorqueData(unitSystem: UnitSystem): FlangeTorqueData[] {
  return unitSystem === 'metric' ? FRP_FLANGE_TORQUE_DATA_METRIC : FRP_FLANGE_TORQUE_DATA;
}

export function calculateAdjustedTorque(baseTorque: number, gasketType: string, isLubricated: boolean): number {
  const gasket = GASKET_TYPES.find(g => g.id === gasketType);
  const gasketMultiplier = gasket?.torqueMultiplier ?? 1.0;
  const lubricationMultiplier = isLubricated ? 0.75 : 1.0;
  return Math.round(baseTorque * gasketMultiplier * lubricationMultiplier);
}
