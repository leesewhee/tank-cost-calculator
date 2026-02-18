// ANSI B16.5 / JIS B2220 Flange Specification Data

export interface FlangeSpec {
  nps: string;
  dn: number;
  od: number;
  boltCircle: number;
  boltHoles: number;
  boltSize: string;
  flangeOD: number;
  flangeThk: number;
}

export const ANSI_CLASS_150: FlangeSpec[] = [
  { nps: '1/2"', dn: 15, od: 21.3, boltCircle: 60.3, boltHoles: 4, boltSize: '1/2"', flangeOD: 88.9, flangeThk: 11.2 },
  { nps: '3/4"', dn: 20, od: 26.7, boltCircle: 69.9, boltHoles: 4, boltSize: '1/2"', flangeOD: 98.4, flangeThk: 12.7 },
  { nps: '1"', dn: 25, od: 33.4, boltCircle: 79.4, boltHoles: 4, boltSize: '1/2"', flangeOD: 108.0, flangeThk: 14.3 },
  { nps: '1-1/4"', dn: 32, od: 42.2, boltCircle: 88.9, boltHoles: 4, boltSize: '1/2"', flangeOD: 117.5, flangeThk: 15.9 },
  { nps: '1-1/2"', dn: 40, od: 48.3, boltCircle: 98.4, boltHoles: 4, boltSize: '1/2"', flangeOD: 127.0, flangeThk: 17.5 },
  { nps: '2"', dn: 50, od: 60.3, boltCircle: 120.7, boltHoles: 4, boltSize: '5/8"', flangeOD: 152.4, flangeThk: 19.1 },
  { nps: '2-1/2"', dn: 65, od: 73.0, boltCircle: 139.7, boltHoles: 4, boltSize: '5/8"', flangeOD: 177.8, flangeThk: 22.2 },
  { nps: '3"', dn: 80, od: 88.9, boltCircle: 152.4, boltHoles: 4, boltSize: '5/8"', flangeOD: 190.5, flangeThk: 23.8 },
  { nps: '3-1/2"', dn: 90, od: 101.6, boltCircle: 168.3, boltHoles: 8, boltSize: '5/8"', flangeOD: 215.9, flangeThk: 23.8 },
  { nps: '4"', dn: 100, od: 114.3, boltCircle: 190.5, boltHoles: 8, boltSize: '5/8"', flangeOD: 228.6, flangeThk: 23.8 },
  { nps: '5"', dn: 125, od: 141.3, boltCircle: 215.9, boltHoles: 8, boltSize: '3/4"', flangeOD: 254.0, flangeThk: 23.8 },
  { nps: '6"', dn: 150, od: 168.3, boltCircle: 241.3, boltHoles: 8, boltSize: '3/4"', flangeOD: 279.4, flangeThk: 25.4 },
  { nps: '8"', dn: 200, od: 219.1, boltCircle: 298.5, boltHoles: 8, boltSize: '3/4"', flangeOD: 342.9, flangeThk: 28.6 },
  { nps: '10"', dn: 250, od: 273.1, boltCircle: 362.0, boltHoles: 12, boltSize: '7/8"', flangeOD: 406.4, flangeThk: 30.2 },
  { nps: '12"', dn: 300, od: 323.9, boltCircle: 431.8, boltHoles: 12, boltSize: '7/8"', flangeOD: 482.6, flangeThk: 31.8 },
  { nps: '14"', dn: 350, od: 355.6, boltCircle: 476.3, boltHoles: 12, boltSize: '1"', flangeOD: 533.4, flangeThk: 35.0 },
  { nps: '16"', dn: 400, od: 406.4, boltCircle: 539.8, boltHoles: 16, boltSize: '1"', flangeOD: 596.9, flangeThk: 36.6 },
  { nps: '18"', dn: 450, od: 457.2, boltCircle: 577.9, boltHoles: 16, boltSize: '1-1/8"', flangeOD: 635.0, flangeThk: 39.7 },
  { nps: '20"', dn: 500, od: 508.0, boltCircle: 635.0, boltHoles: 20, boltSize: '1-1/8"', flangeOD: 698.5, flangeThk: 42.9 },
  { nps: '24"', dn: 600, od: 609.6, boltCircle: 749.3, boltHoles: 20, boltSize: '1-1/4"', flangeOD: 812.8, flangeThk: 47.6 },
  { nps: '30"', dn: 750, od: 762.0, boltCircle: 914.4, boltHoles: 28, boltSize: '1-1/4"', flangeOD: 977.9, flangeThk: 53.8 },
  { nps: '36"', dn: 900, od: 914.4, boltCircle: 1079.5, boltHoles: 32, boltSize: '1-1/2"', flangeOD: 1155.7, flangeThk: 57.2 },
  { nps: '42"', dn: 1050, od: 1066.8, boltCircle: 1244.6, boltHoles: 36, boltSize: '1-1/2"', flangeOD: 1320.8, flangeThk: 60.3 },
  { nps: '48"', dn: 1200, od: 1219.2, boltCircle: 1409.7, boltHoles: 44, boltSize: '1-1/2"', flangeOD: 1473.2, flangeThk: 63.5 },
];

export const ANSI_CLASS_300: FlangeSpec[] = [
  { nps: '1/2"', dn: 15, od: 21.3, boltCircle: 66.7, boltHoles: 4, boltSize: '1/2"', flangeOD: 95.3, flangeThk: 14.3 },
  { nps: '3/4"', dn: 20, od: 26.7, boltCircle: 76.2, boltHoles: 4, boltSize: '5/8"', flangeOD: 117.5, flangeThk: 15.9 },
  { nps: '1"', dn: 25, od: 33.4, boltCircle: 85.7, boltHoles: 4, boltSize: '5/8"', flangeOD: 123.8, flangeThk: 17.5 },
  { nps: '1-1/4"', dn: 32, od: 42.2, boltCircle: 98.4, boltHoles: 4, boltSize: '5/8"', flangeOD: 133.4, flangeThk: 19.1 },
  { nps: '1-1/2"', dn: 40, od: 48.3, boltCircle: 114.3, boltHoles: 4, boltSize: '3/4"', flangeOD: 155.6, flangeThk: 20.6 },
  { nps: '2"', dn: 50, od: 60.3, boltCircle: 127.0, boltHoles: 8, boltSize: '5/8"', flangeOD: 165.1, flangeThk: 22.2 },
  { nps: '2-1/2"', dn: 65, od: 73.0, boltCircle: 149.2, boltHoles: 8, boltSize: '3/4"', flangeOD: 190.5, flangeThk: 25.4 },
  { nps: '3"', dn: 80, od: 88.9, boltCircle: 168.3, boltHoles: 8, boltSize: '3/4"', flangeOD: 209.6, flangeThk: 28.6 },
  { nps: '4"', dn: 100, od: 114.3, boltCircle: 200.0, boltHoles: 8, boltSize: '3/4"', flangeOD: 254.0, flangeThk: 31.8 },
  { nps: '5"', dn: 125, od: 141.3, boltCircle: 235.0, boltHoles: 8, boltSize: '3/4"', flangeOD: 279.4, flangeThk: 35.0 },
  { nps: '6"', dn: 150, od: 168.3, boltCircle: 269.9, boltHoles: 12, boltSize: '3/4"', flangeOD: 317.5, flangeThk: 36.6 },
  { nps: '8"', dn: 200, od: 219.1, boltCircle: 330.2, boltHoles: 12, boltSize: '7/8"', flangeOD: 381.0, flangeThk: 41.3 },
  { nps: '10"', dn: 250, od: 273.1, boltCircle: 387.4, boltHoles: 16, boltSize: '1"', flangeOD: 444.5, flangeThk: 47.6 },
  { nps: '12"', dn: 300, od: 323.9, boltCircle: 450.9, boltHoles: 16, boltSize: '1-1/8"', flangeOD: 520.7, flangeThk: 50.8 },
  { nps: '14"', dn: 350, od: 355.6, boltCircle: 514.4, boltHoles: 20, boltSize: '1-1/8"', flangeOD: 584.2, flangeThk: 53.8 },
  { nps: '16"', dn: 400, od: 406.4, boltCircle: 571.5, boltHoles: 20, boltSize: '1-1/4"', flangeOD: 647.7, flangeThk: 57.2 },
  { nps: '18"', dn: 450, od: 457.2, boltCircle: 628.7, boltHoles: 24, boltSize: '1-1/4"', flangeOD: 711.2, flangeThk: 60.3 },
  { nps: '20"', dn: 500, od: 508.0, boltCircle: 685.8, boltHoles: 24, boltSize: '1-1/4"', flangeOD: 774.7, flangeThk: 63.5 },
  { nps: '24"', dn: 600, od: 609.6, boltCircle: 812.8, boltHoles: 24, boltSize: '1-1/2"', flangeOD: 914.4, flangeThk: 69.9 },
];

export const JIS_10K: FlangeSpec[] = [
  { nps: '15A', dn: 15, od: 21.7, boltCircle: 55, boltHoles: 4, boltSize: 'M12', flangeOD: 80, flangeThk: 12 },
  { nps: '20A', dn: 20, od: 27.2, boltCircle: 65, boltHoles: 4, boltSize: 'M12', flangeOD: 90, flangeThk: 14 },
  { nps: '25A', dn: 25, od: 34.0, boltCircle: 75, boltHoles: 4, boltSize: 'M12', flangeOD: 100, flangeThk: 14 },
  { nps: '32A', dn: 32, od: 42.7, boltCircle: 85, boltHoles: 4, boltSize: 'M16', flangeOD: 115, flangeThk: 16 },
  { nps: '40A', dn: 40, od: 48.6, boltCircle: 95, boltHoles: 4, boltSize: 'M16', flangeOD: 125, flangeThk: 16 },
  { nps: '50A', dn: 50, od: 60.5, boltCircle: 105, boltHoles: 4, boltSize: 'M16', flangeOD: 135, flangeThk: 18 },
  { nps: '65A', dn: 65, od: 76.3, boltCircle: 130, boltHoles: 4, boltSize: 'M16', flangeOD: 160, flangeThk: 18 },
  { nps: '80A', dn: 80, od: 89.1, boltCircle: 145, boltHoles: 4, boltSize: 'M20', flangeOD: 180, flangeThk: 20 },
  { nps: '100A', dn: 100, od: 114.3, boltCircle: 175, boltHoles: 8, boltSize: 'M20', flangeOD: 210, flangeThk: 20 },
  { nps: '125A', dn: 125, od: 139.8, boltCircle: 210, boltHoles: 8, boltSize: 'M22', flangeOD: 250, flangeThk: 22 },
  { nps: '150A', dn: 150, od: 165.2, boltCircle: 240, boltHoles: 8, boltSize: 'M22', flangeOD: 280, flangeThk: 22 },
  { nps: '200A', dn: 200, od: 216.3, boltCircle: 290, boltHoles: 12, boltSize: 'M22', flangeOD: 330, flangeThk: 24 },
  { nps: '250A', dn: 250, od: 267.4, boltCircle: 355, boltHoles: 12, boltSize: 'M24', flangeOD: 400, flangeThk: 26 },
  { nps: '300A', dn: 300, od: 318.5, boltCircle: 410, boltHoles: 16, boltSize: 'M24', flangeOD: 450, flangeThk: 26 },
  { nps: '350A', dn: 350, od: 355.6, boltCircle: 465, boltHoles: 16, boltSize: 'M24', flangeOD: 510, flangeThk: 28 },
  { nps: '400A', dn: 400, od: 406.4, boltCircle: 515, boltHoles: 16, boltSize: 'M27', flangeOD: 565, flangeThk: 28 },
  { nps: '450A', dn: 450, od: 457.2, boltCircle: 570, boltHoles: 20, boltSize: 'M27', flangeOD: 620, flangeThk: 30 },
  { nps: '500A', dn: 500, od: 508.0, boltCircle: 620, boltHoles: 20, boltSize: 'M27', flangeOD: 675, flangeThk: 30 },
  { nps: '600A', dn: 600, od: 609.6, boltCircle: 730, boltHoles: 24, boltSize: 'M30', flangeOD: 795, flangeThk: 32 },
];

export const JIS_16K: FlangeSpec[] = [
  { nps: '15A', dn: 15, od: 21.7, boltCircle: 60, boltHoles: 4, boltSize: 'M12', flangeOD: 90, flangeThk: 14 },
  { nps: '20A', dn: 20, od: 27.2, boltCircle: 70, boltHoles: 4, boltSize: 'M12', flangeOD: 100, flangeThk: 16 },
  { nps: '25A', dn: 25, od: 34.0, boltCircle: 80, boltHoles: 4, boltSize: 'M16', flangeOD: 110, flangeThk: 16 },
  { nps: '32A', dn: 32, od: 42.7, boltCircle: 90, boltHoles: 4, boltSize: 'M16', flangeOD: 125, flangeThk: 18 },
  { nps: '40A', dn: 40, od: 48.6, boltCircle: 105, boltHoles: 4, boltSize: 'M16', flangeOD: 140, flangeThk: 18 },
  { nps: '50A', dn: 50, od: 60.5, boltCircle: 120, boltHoles: 8, boltSize: 'M16', flangeOD: 155, flangeThk: 20 },
  { nps: '65A', dn: 65, od: 76.3, boltCircle: 140, boltHoles: 8, boltSize: 'M16', flangeOD: 175, flangeThk: 20 },
  { nps: '80A', dn: 80, od: 89.1, boltCircle: 160, boltHoles: 8, boltSize: 'M20', flangeOD: 200, flangeThk: 22 },
  { nps: '100A', dn: 100, od: 114.3, boltCircle: 190, boltHoles: 8, boltSize: 'M20', flangeOD: 225, flangeThk: 24 },
  { nps: '125A', dn: 125, od: 139.8, boltCircle: 225, boltHoles: 8, boltSize: 'M24', flangeOD: 270, flangeThk: 26 },
  { nps: '150A', dn: 150, od: 165.2, boltCircle: 260, boltHoles: 12, boltSize: 'M24', flangeOD: 305, flangeThk: 28 },
  { nps: '200A', dn: 200, od: 216.3, boltCircle: 315, boltHoles: 12, boltSize: 'M24', flangeOD: 350, flangeThk: 30 },
  { nps: '250A', dn: 250, od: 267.4, boltCircle: 375, boltHoles: 12, boltSize: 'M27', flangeOD: 430, flangeThk: 32 },
  { nps: '300A', dn: 300, od: 318.5, boltCircle: 430, boltHoles: 16, boltSize: 'M27', flangeOD: 480, flangeThk: 34 },
  { nps: '350A', dn: 350, od: 355.6, boltCircle: 490, boltHoles: 16, boltSize: 'M30', flangeOD: 540, flangeThk: 36 },
  { nps: '400A', dn: 400, od: 406.4, boltCircle: 540, boltHoles: 16, boltSize: 'M30', flangeOD: 605, flangeThk: 38 },
  { nps: '450A', dn: 450, od: 457.2, boltCircle: 600, boltHoles: 20, boltSize: 'M30', flangeOD: 670, flangeThk: 40 },
  { nps: '500A', dn: 500, od: 508.0, boltCircle: 660, boltHoles: 20, boltSize: 'M33', flangeOD: 730, flangeThk: 42 },
  { nps: '600A', dn: 600, od: 609.6, boltCircle: 770, boltHoles: 24, boltSize: 'M36', flangeOD: 845, flangeThk: 46 },
];

export type FlangeStandard = 'ANSI-150' | 'ANSI-300' | 'JIS-10K' | 'JIS-16K';

export const getFlangeData = (standard: FlangeStandard): FlangeSpec[] => {
  switch (standard) {
    case 'ANSI-150': return ANSI_CLASS_150;
    case 'ANSI-300': return ANSI_CLASS_300;
    case 'JIS-10K': return JIS_10K;
    case 'JIS-16K': return JIS_16K;
    default: return ANSI_CLASS_150;
  }
};

export const FLANGE_STANDARDS = [
  { id: 'ANSI-150' as FlangeStandard, label: 'ANSI B16.5 Class 150', ref: 'ASME/ANSI B16.5' },
  { id: 'ANSI-300' as FlangeStandard, label: 'ANSI B16.5 Class 300', ref: 'ASME/ANSI B16.5' },
  { id: 'JIS-10K' as FlangeStandard, label: 'JIS B2220 10K', ref: 'JIS B2220' },
  { id: 'JIS-16K' as FlangeStandard, label: 'JIS B2220 16K', ref: 'JIS B2220' },
];
