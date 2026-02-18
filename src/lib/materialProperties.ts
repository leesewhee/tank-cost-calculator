// FRP Material Properties Database

export interface MaterialProperty {
  id: string;
  property: string;
  polyester: string;
  vinylEster: string;
  novolac: string;
  unit: string;
  testMethod: string;
}

export const FRP_MATERIAL_PROPERTIES: MaterialProperty[] = [
  { id: 'tensile-strength', property: '인장강도', polyester: '100-150', vinylEster: '130-170', novolac: '140-180', unit: 'MPa', testMethod: 'ASTM D638' },
  { id: 'tensile-modulus', property: '인장탄성률', polyester: '8-12', vinylEster: '10-14', novolac: '11-15', unit: 'GPa', testMethod: 'ASTM D638' },
  { id: 'flexural-strength', property: '굴곡강도', polyester: '150-200', vinylEster: '180-240', novolac: '190-260', unit: 'MPa', testMethod: 'ASTM D790' },
  { id: 'flexural-modulus', property: '굴곡탄성률', polyester: '7-10', vinylEster: '9-13', novolac: '10-14', unit: 'GPa', testMethod: 'ASTM D790' },
  { id: 'compressive-strength', property: '압축강도', polyester: '120-180', vinylEster: '150-200', novolac: '160-220', unit: 'MPa', testMethod: 'ASTM D695' },
  { id: 'shear-strength', property: '전단강도', polyester: '60-80', vinylEster: '70-100', novolac: '75-110', unit: 'MPa', testMethod: 'ASTM D2344' },
  { id: 'izod-impact', property: '아이조드 충격강도', polyester: '400-600', vinylEster: '500-800', novolac: '350-550', unit: 'J/m', testMethod: 'ASTM D256' },
  { id: 'density', property: '밀도', polyester: '1.5-1.9', vinylEster: '1.6-1.9', novolac: '1.6-2.0', unit: 'g/cm³', testMethod: 'ASTM D792' },
  { id: 'water-absorption', property: '흡수율 (24h)', polyester: '0.15-0.30', vinylEster: '0.10-0.20', novolac: '0.08-0.15', unit: '%', testMethod: 'ASTM D570' },
  { id: 'hdt', property: '열변형 온도', polyester: '80-120', vinylEster: '100-140', novolac: '130-180', unit: '°C', testMethod: 'ASTM D648' },
  { id: 'max-service-temp', property: '최대 사용 온도', polyester: '65-80', vinylEster: '90-105', novolac: '120-150', unit: '°C', testMethod: '-' },
  { id: 'thermal-expansion', property: '열팽창 계수', polyester: '20-35', vinylEster: '18-30', novolac: '15-25', unit: '×10⁻⁶/°C', testMethod: 'ASTM D696' },
  { id: 'thermal-conductivity', property: '열전도율', polyester: '0.20-0.30', vinylEster: '0.22-0.32', novolac: '0.24-0.34', unit: 'W/m·K', testMethod: 'ASTM C177' },
  { id: 'barcol-hardness', property: '바콜 경도', polyester: '35-45', vinylEster: '40-50', novolac: '45-55', unit: '-', testMethod: 'ASTM D2583' },
  { id: 'glass-content', property: '유리섬유 함량', polyester: '25-40', vinylEster: '30-45', novolac: '30-50', unit: 'wt%', testMethod: 'ASTM D2584' },
  { id: 'flammability', property: '난연성', polyester: 'V-0 ~ V-2', vinylEster: 'V-0 ~ V-1', novolac: 'V-0', unit: 'UL94', testMethod: 'UL 94' },
  { id: 'dielectric-strength', property: '절연파괴 전압', polyester: '15-20', vinylEster: '18-22', novolac: '20-25', unit: 'kV/mm', testMethod: 'ASTM D149' },
];

export interface ResinCharacteristic {
  id: string;
  resin: string;
  advantages: string[];
  disadvantages: string[];
  applications: string[];
}

export const RESIN_CHARACTERISTICS: ResinCharacteristic[] = [
  {
    id: 'polyester',
    resin: '폴리에스터',
    advantages: ['경제적인 가격', '가공성 우수', '일반 화학약품에 양호한 내식성', '상온 경화 가능'],
    disadvantages: ['높은 수축률', '강산/강알칼리에 취약', '고온 사용 제한'],
    applications: ['일반 물탱크', '폐수 처리', '상온 화학저장', '환기 덕트'],
  },
  {
    id: 'vinylester',
    resin: '비닐에스터',
    advantages: ['우수한 내화학성', '양호한 내열성', '낮은 흡수율', '피로 저항성 우수'],
    disadvantages: ['폴리에스터 대비 고가', '경화 조건 민감', '산화성 환경에서 제한적'],
    applications: ['화학 탱크', '스크러버', '산/알칼리 배관', 'FGD 시스템'],
  },
  {
    id: 'novolac',
    resin: '노볼락',
    advantages: ['뛰어난 내화학성', '우수한 내열성', '강산/강알칼리에 강함', '낮은 흡수율'],
    disadvantages: ['고가', '취성 높음', '가공성 까다로움', '충격에 취약'],
    applications: ['강산 탱크', '고온 화학 저장', 'FGD 스크러버', '반도체 약품 탱크'],
  },
];
