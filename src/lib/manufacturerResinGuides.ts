// 제조사 내약품표 전사 데이터. 사진에서 행·열이 명확히 판독된 값만 옮김.
// null = 사진상 판독 불확실(미확인, 원문 확인 필요). '-' = 원문에 '-'로 인쇄(자료 없음).
// 'NR' = 사용 비권장. 'A/B' 형태(ASHLAND)는 원문 표기 그대로이며 의미는 원문 각주 확인.
// 제품별 조건이므로 기존 일반 수지 분류표(CHEMICAL_DATABASE)와 혼용하지 않는다.
import ashland from '@/assets/resin-guides/ashland.pdf.asset.json';
import sewon from '@/assets/resin-guides/sewon.pdf.asset.json';
import polynt from '@/assets/resin-guides/polynt.pdf.asset.json';

export const RESIN_GUIDES = [
  { id: 'sewon', vendor: '세원화성', title: '내식용 수지의 내약품 성능표', url: sewon.url,
    products: ['R280 (ISO)', 'R470 (HET)', 'R585 (BIS)', 'SR825L/H (BIS)', 'SR841L/H (Novolac)', 'SR870SE (Bromine)', 'SR819SE (Bromine)'],
    coverage: '사진 28장 중 내약품표 p.18–37' },
  { id: 'ashland', vendor: 'ASHLAND', title: 'Chemical Resistance Guide', url: ashland.url,
    products: ['HETRON 942/35', 'HETRON 980/35', 'HETRON FR998/35', 'HETRON 970/35', 'HETRON 922/FR992', 'HETRON 980', 'HETRON 197-3', 'HETRON 800', 'AROPOL 7241/7334', 'HETRON 92/99P'],
    coverage: '사진 19장' },
  { id: 'polynt', vendor: 'Polynt', title: 'Corrosion Resistance Guide (EPOVIA 최고 사용온도)', url: polynt.url,
    products: ['RF-1001/KRF-1001', 'RF-2000SE/KRF-2000SE', 'RF-1051/KRF-1051'],
    coverage: '사진 9장, 일부 페이지 누락(염산·질산·인산 등 미수록)' },
] as const;

export type GuideId = typeof RESIN_GUIDES[number]['id'];
export type CellValue = string | null;

/** 검색용 약품 이름(한글·영문·화학식) */
export const CHEMICALS: Record<string, { ko: string; en: string; formula: string }> = {
  acetic: { ko: '초산', en: 'Acetic Acid', formula: 'CH₃COOH' },
  acetone: { ko: '아세톤', en: 'Acetone', formula: 'C₃H₆O' },
  nh4oh: { ko: '수산화암모늄(암모니아수)', en: 'Ammonium Hydroxide', formula: 'NH₄OH' },
  cuso4: { ko: '황산구리', en: 'Copper Sulfate', formula: 'CuSO₄' },
  diwater: { ko: '탈이온수', en: 'Deionized Water', formula: 'H₂O' },
  demin: { ko: '탈염수', en: 'Demineralized Water', formula: 'H₂O' },
  ethanol: { ko: '에탄올', en: 'Ethanol (Ethyl Alcohol)', formula: 'C₂H₅OH' },
  fecl3: { ko: '염화제이철', en: 'Ferric Chloride', formula: 'FeCl₃' },
  hcl: { ko: '염산', en: 'Hydrochloric Acid', formula: 'HCl' },
  hf: { ko: '불산', en: 'Hydrofluoric Acid', formula: 'HF' },
  h2o2: { ko: '과산화수소', en: 'Hydrogen Peroxide', formula: 'H₂O₂' },
  methanol: { ko: '메탄올', en: 'Methanol (Methyl Alcohol)', formula: 'CH₃OH' },
  h3po4: { ko: '인산', en: 'Phosphoric Acid', formula: 'H₃PO₄' },
  koh: { ko: '가성칼리(수산화칼륨)', en: 'Potassium Hydroxide', formula: 'KOH' },
  nacl: { ko: '염화나트륨', en: 'Sodium Chloride', formula: 'NaCl' },
  na2co3: { ko: '탄산나트륨', en: 'Sodium Carbonate', formula: 'Na₂CO₃' },
  naoh: { ko: '가성소다(수산화나트륨)', en: 'Sodium Hydroxide', formula: 'NaOH' },
  naocl: { ko: '차아염소산나트륨', en: 'Sodium Hypochlorite', formula: 'NaOCl' },
  h2so4: { ko: '황산', en: 'Sulfuric Acid', formula: 'H₂SO₄' },
  toluene: { ko: '톨루엔', en: 'Toluene', formula: 'C₇H₈' },
  brine: { ko: '소금물(염수)', en: 'Salt Brine', formula: 'NaCl' },
  seawater: { ko: '해수', en: 'Sea Water', formula: '-' },
};

export interface ManufacturerRow {
  id: string;
  guideId: GuideId;
  chemical: keyof typeof CHEMICALS | string;
  concentration: string;
  /** RESIN_GUIDES[guide].products 순서와 동일 */
  values: CellValue[];
  reference: string;
  note?: string;
}

const SKEW = '사진 기울어짐 — 일부 칸 미확인, 원문 확인 권장';
const POLYNT_NOTE = '원문 인쇄상 약품명과 값 행이 어긋나 있어 농도열 기준으로 판독, 원문 확인 권장';
const N = null;

type Raw = [string, string, CellValue[], string, string?];
const build = (guideId: GuideId, rows: Raw[]): ManufacturerRow[] =>
  rows.map(([chemical, concentration, values, reference, note]) => ({
    id: `${guideId}-${chemical}-${concentration}`, guideId, chemical, concentration, values, reference, note,
  }));

const sewonRows = build('sewon', [
  ['acetic', '10%', ['80', '80', '100', '100', '100', '100', '100'], '인쇄 p.18 No.2'],
  ['acetic', '15%', ['60', '60', '100', '100', '100', '100', '100'], '인쇄 p.18 No.3'],
  ['acetic', '25%', ['60', '60', '80', '100', '100', '100', '100'], '인쇄 p.18 No.4'],
  ['acetic', '50%', ['-', '-', '-', '80', '80', '80', '80'], '인쇄 p.18 No.5'],
  ['acetic', '75%', ['NR', 'NR', 'NR', '65', '65', '65', '-'], '인쇄 p.18 No.6'],
  ['acetic', '100% (빙초산)', ['NR', 'NR', 'NR', 'NR', '30', 'NR', '-'], '인쇄 p.18 No.7'],
  ['acetone', '10%', ['NR', 'NR', 'NR', 'NR', '80', '80', '-'], '인쇄 p.18 No.9'],
  ['acetone', '100%', ['NR', 'NR', 'NR', 'NR', 'NR', 'NR', '-'], '인쇄 p.18 No.10'],
  ['nh4oh', '5%', ['NR', 'NR', '80', '80', '65', '80', N], '인쇄 p.19 No.55', SKEW],
  ['nh4oh', '10%', ['NR', 'NR', '65', '65', '65', '65', N], '인쇄 p.19 No.56', SKEW],
  ['nh4oh', '20%', ['NR', 'NR', '40', '65', '40', '65', N], '인쇄 p.19 No.57', SKEW],
  ['nh4oh', '30%', ['NR', 'NR', '40', '40', '40', '40', N], '인쇄 p.19 No.58', SKEW],
  ['cuso4', 'All', ['80', '80', '100', '100', '120', '120', N], '인쇄 p.23 No.187', SKEW],
  ['diwater', '100%', ['-', '-', '-', '80', '80', '80', '-'], '인쇄 p.24 No.198'],
  ['demin', '100%', ['-', '-', '-', '80', '80', '80', '-'], '인쇄 p.24 No.199'],
  ['ethanol', '10%', ['NR', 'NR', 'NR', '40', '65', '40', N], '인쇄 p.25 No.249', SKEW],
  ['ethanol', '50%', ['NR', 'NR', 'NR', '40', '65', '40', N], '인쇄 p.25 No.250', SKEW],
  ['ethanol', '95%', ['NR', 'NR', 'NR', '25', '40', '25', N], '인쇄 p.25 No.251', SKEW],
  ['ethanol', '100%', ['NR', 'NR', 'NR', 'NR', 'NR', 'NR', N], '인쇄 p.25 No.252', SKEW],
  ['fecl3', 'All', ['80', '80', '100', '100', '100', '100', '100'], '인쇄 p.26 No.273'],
  ['hcl', '15%', ['80', '80', '100', '80', '110', '100', N], '인쇄 p.28 No.332', 'SR819SE 열 사진 기울어짐 — 원문 확인'],
  ['hcl', '20%', ['NR', 'NR', '60', '80', '110', '100', N], '인쇄 p.28 No.333', 'SR819SE 열 사진 기울어짐 — 원문 확인'],
  ['hcl', '30%', ['-', '-', '-', '65', '95', '80', N], '인쇄 p.28 No.334', 'SR819SE 열 사진 기울어짐 — 원문 확인'],
  ['hcl', '37%', ['-', '-', '-', '40', '50', '40', N], '인쇄 p.28 No.335', 'SR819SE 열 사진 기울어짐 — 원문 확인'],
  ['hf', '10%', ['-', '-', '-', '65', '65', '65', '-'], '인쇄 p.28 No.339'],
  ['hf', '20%', ['-', '-', '-', '40', '40', '40', '-'], '인쇄 p.28 No.340'],
  ['h3po4', '85%', ['-', '-', '-', '100', '100', '100', '100'], '인쇄 p.32 No.484'],
  ['h3po4', '100%', ['60', '60', N, '100', '105', '100', '100'], '인쇄 p.32 No.485', 'R585 칸 공란으로 보임 — 원문 확인'],
  ['koh', '45%', ['NR', 'NR', 'NR', '65', '25', '65', N], '인쇄 p.33 No.511', SKEW],
  ['na2co3', '10%', ['-', '-', '-', '90', '90', '80', '-'], '인쇄 p.34 No.551'],
  ['na2co3', '20%', ['-', '-', '-', '90', '90', '80', '-'], '인쇄 p.34 No.552'],
  ['na2co3', '25%', ['-', '-', '-', '90', '90', '80', '-'], '인쇄 p.34 No.553'],
  ['na2co3', '32%', ['-', '-', '-', '90', '90', '80', '-'], '인쇄 p.34 No.554'],
  ['na2co3', '35%', ['-', '-', '-', '80', '80', '80', '80'], '인쇄 p.34 No.555'],
  ['na2co3', "Sat'd(포화)", ['-', '-', '-', '80', '65', '80', '-'], '인쇄 p.34 No.556'],
  ['nacl', 'All', ['-', '-', '-', '100', '100', '100', '100'], '인쇄 p.34 No.559'],
  ['naoh', '5%', ['-', '-', '-', '80', '40', '80', '80'], '인쇄 p.35 No.574'],
  ['naoh', '10%', ['NR', 'NR', '-', '80', '40', '80', '80'], '인쇄 p.35 No.575'],
  ['naoh', '25%', ['NR', 'NR', '-', '80', '40', '80', '-'], '인쇄 p.35 No.576'],
  ['naoh', '50%', ['NR', 'NR', '-', '80', '40', '80', '-'], '인쇄 p.35 No.577'],
  ['naoh', "Sat'd(포화)", ['NR', 'NR', '-', '80', '40', '80', '-'], '인쇄 p.35 No.578'],
  ['naocl', '5 1/4%', ['NR', 'NR', 'NR', '80', '80', '80', '-'], '인쇄 p.35 No.579'],
  ['naocl', '10%', ['NR', 'NR', 'NR', '80', '80', '80', '50'], '인쇄 p.35 No.580'],
  ['naocl', '15%', ['NR', 'NR', 'NR', '80', '80', '80', '-'], '인쇄 p.35 No.581'],
  ['naocl', '18%', ['NR', 'NR', 'NR', '80', '50', '80', '50'], '인쇄 p.35 No.582'],
  ['h2so4', '10%', ['80', '80', '100', '100', '105', '100', '-'], '인쇄 p.36 No.626'],
  ['h2so4', '25%', ['80', '80', '100', '100', '75', '100', '100'], '인쇄 p.36 No.627'],
  ['h2so4', '50%', ['NR', 'NR', 'NR', '80', '60', '80', '-'], '인쇄 p.36 No.628'],
  ['h2so4', '70%', ['NR', 'NR', 'NR', '60', '50', '50', '50'], '인쇄 p.36 No.629'],
  ['h2so4', '75%', ['NR', 'NR', 'NR', '30', '50', '40', '30'], '인쇄 p.36 No.630'],
  ['h2so4', '80%', ['NR', 'NR', 'NR', 'NR', 'NR', 'NR', '-'], '인쇄 p.36 No.631'],
  ['toluene', '100%', ['NR', 'NR', 'NR', '25', '50', '40', N], '인쇄 p.37 No.660', SKEW],
]);

const A7 = (a: string, b: string, c: string, d: string, e: string, f: string, g: string): CellValue[] => [a, b, c, d, e, f, g, N, N, N];
const ashlandRows = build('ashland', [
  ['acetic', '1%', A7('-', '99', '99', '99', '99/99', '99', '99'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열은 행 정렬 불확실 — 원문 확인'],
  ['acetic', '10%', A7('99', '99', '99', '99', '99/99', '99', '99'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열 원문 확인'],
  ['acetic', '15%', A7('99', '99', '99', '99', '99/99', '99', '99'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열 원문 확인'],
  ['acetic', '25%', A7('99', '99', '99', '99', '99/99', '99', '99'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열 원문 확인'],
  ['acetic', '50%', A7('82', '82', '82', '82', '82/82', '82', '82'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열 원문 확인'],
  ['acetic', '75%', A7('66', '66', '66', '66', '38/38', '38', '66'), '인쇄 p.12 Acetic Acid', 'HETRON 800·AROPOL·92/99P 열 원문 확인'],
  ...([
    ['1%', '99', '104', '104', '110', '99/99', '104', '110', '110', '71/49'],
    ['5%', '99', '104', '104', '110', '99/99', '104', '110', '110', '71/49'],
    ['10%', '99', '104', '104', '110', '99/99', '104', '110', '110', '71/49'],
    ['15%', '99', '104', '104', '110', '99/99', '104', '110', '110', '71/49'],
    ['20%', '93', '93', '93', '110', '93/93', '93', '110', '82', '49/NR'],
    ['25%', '82', '82', '82', '82', '82/82', '82', '82', '66', '49/NR'],
    ['32%', '66', '66', '66', '82', '66/66', '66', '82', '66', 'NR/NR'],
    ['36%', '52', '52', '52', '71', '52/52', '52', '66', '52', 'NR/NR'],
    ['37%', '38', '38', '38', '52', '38/38', '38', '38', 'NR', 'NR/NR'],
  ] as const).map(([c, ...v]): Raw => ['hcl', c, [...v, N], '인쇄 p.28 Hydrochloric Acid (Footnote 22)', 'HETRON 92/99P 열 행 정렬 불확실 — 원문 확인']),
  ...([
    ['1%', '66', '66', '66', '66', '66/66', '66', '66', 'NR', '38/NR', '49/49'],
    ['5%', '66', '66', '66', '66', '66/66', '66', '66', 'NR', '38/NR', '38/38'],
    ['10%', '49', '49', '49', '66', '49/49', '49', '49', 'NR', 'LS27/NR', '38/38'],
    ['15%', '38', '38', '38', '38', '38/38', '38', '38', 'NR', 'NR/NR', '38/38'],
    ['20%', '32', '32', '32', '32', '32/32', '32', '32', 'NR', 'NR/NR', 'NR/NR'],
    ['22%', 'LS27', 'LS32', 'LS32', '32', 'LS27/LS27', 'LS32', '32', 'NR', 'NR/NR', 'NR/NR'],
    ['40%', 'NR', 'NR', 'NR', 'NR', 'NR/NR', 'NR', '32', 'NR', 'NR/NR', 'NR/NR'],
  ] as const).map(([c, ...v]): Raw => ['hf', c, [...v], '인쇄 p.30 Hydrofluoric Acid (Footnotes 1, 23)', 'LS = Limited Service']),
]);

const polyntRows = build('polynt', [
  ['diwater', '100%', ['80', '80', '80'], '인쇄 p.8 Deionized Water'],
  ['demin', '100%', ['80', '80', '80'], '인쇄 p.8 Demineralized Water'],
  ['ethanol', '10%', ['50', '50', '65'], '인쇄 p.9 Ethanol', POLYNT_NOTE],
  ['ethanol', '50%', ['40', '30', '65'], '인쇄 p.9 Ethanol', POLYNT_NOTE],
  ['ethanol', '100%', ['NR', 'NR', '40'], '인쇄 p.9 Ethanol', POLYNT_NOTE],
  ['hf', '10%', ['60', '60', '60'], '인쇄 p.12 Hydrofluoric Acid (Carbon veil+PC)', POLYNT_NOTE],
  ['hf', '15%', ['30', '30', '30'], '인쇄 p.12 Hydrofluoric Acid (Carbon veil+PC)', POLYNT_NOTE],
  ['hf', '20%', ['30', '30', '30'], '인쇄 p.12 Hydrofluoric Acid (Carbon veil+PC)', POLYNT_NOTE],
  ['h2o2', '30%', ['60', '60', '65'], '인쇄 p.12 Hydrogen Peroxide (DSV+BPO+PC)', POLYNT_NOTE],
  ['h2o2', '35%', ['25', '30', '40'], '인쇄 p.12 Hydrogen Peroxide (DSV+BPO+PC)', POLYNT_NOTE],
  ['h2o2', '50%', ['NR', 'NR', 'NR'], '인쇄 p.12 Hydrogen Peroxide', POLYNT_NOTE],
  ['methanol', '5%', ['50', '50', '50'], '인쇄 p.13 Methanol', POLYNT_NOTE],
  ['methanol', '20%', ['NR', 'NR', '40'], '인쇄 p.13 Methanol', POLYNT_NOTE],
  ['methanol', '40–100%', ['NR', 'NR', '40'], '인쇄 p.13 Methanol', POLYNT_NOTE],
  ['brine', "Sat'd(포화)", ['100', '100', '120'], '인쇄 p.16 Salt Brine', POLYNT_NOTE],
  ['seawater', '100%', ['100', '100', '100'], '인쇄 p.16 Sea Water', POLYNT_NOTE],
  ['na2co3', 'All', ['80', '80', '65'], '인쇄 p.17 Sodium Carbonate (DSV)', POLYNT_NOTE],
  ['h2so4', '25%', ['100', '100', '100'], '인쇄 p.18 Sulfuric Acid (DSV+ECR+CC)', POLYNT_NOTE],
  ['h2so4', '50%', ['95', '95', '95'], '인쇄 p.18 Sulfuric Acid (DSV+ECR+CC)', POLYNT_NOTE],
  ['h2so4', '70%', ['80', '80', '80'], '인쇄 p.18 Sulfuric Acid (DSV+ECR+CC)', POLYNT_NOTE],
  ['h2so4', '75%', ['40', '40', '50'], '인쇄 p.18 Sulfuric Acid (DSV+ECR+CC)', POLYNT_NOTE],
  ['h2so4', '>80%', ['NR', 'NR', 'NR'], '인쇄 p.18 Sulfuric Acid (DSV+ECR+CC)', POLYNT_NOTE],
  ['toluene', '100%', ['25', '25', '40'], '인쇄 p.19 Toluene', POLYNT_NOTE],
]);

export const MANUFACTURER_ROWS: ManufacturerRow[] = [...sewonRows, ...ashlandRows, ...polyntRows];

export const guideFor = (id: GuideId) => RESIN_GUIDES.find((guide) => guide.id === id)!;
export const chemicalLabel = (key: string) => CHEMICALS[key] ?? { ko: key, en: key, formula: '-' };

/** 한글·영문·화학식·농도·제품명으로 검색 */
export const searchManufacturerRows = (query: string, guideId: GuideId | 'all' = 'all') => {
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  return MANUFACTURER_ROWS.filter((row) => {
    if (guideId !== 'all' && row.guideId !== guideId) return false;
    if (!q) return true;
    const c = chemicalLabel(row.chemical);
    const hay = [c.ko, c.en, c.formula, c.formula.replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 8320)), row.concentration, guideFor(row.guideId).vendor, ...guideFor(row.guideId).products]
      .join('|').toLowerCase().replace(/\s+/g, '');
    return hay.includes(q);
  });
};
