// Transcribed only where both the chemical condition and product-column value are legible.
// These are product-specific guide entries, NOT interchangeable with generic resin families.
import ashland from '@/assets/resin-guides/ashland.pdf.asset.json';
import sewon from '@/assets/resin-guides/sewon.pdf.asset.json';
import polynt from '@/assets/resin-guides/polynt.pdf.asset.json';

export const RESIN_GUIDES = [
  { id: 'sewon', vendor: '세원화성', title: '내식용 수지의 내약품 성능표', url: sewon.url, coverage: '업로드된 사진 28장; 촬영본 전체를 원문에서 확인' },
  { id: 'ashland', vendor: 'ASHLAND', title: 'Chemical Resistance Guide', url: ashland.url, coverage: '업로드된 사진 19장; 촬영본 전체를 원문에서 확인' },
  { id: 'polynt', vendor: 'Polynt', title: 'Polynt Composites Corrosion Resistance Guide', url: polynt.url, coverage: '업로드된 사진 9장; 원본 책자의 일부 페이지가 누락됨' },
] as const;

export type GuideId = typeof RESIN_GUIDES[number]['id'];
export interface ManufacturerCondition {
  id: string;
  guideId: GuideId;
  chemical: string;
  concentration: string;
  product: string;
  temperature: number | 'NR';
  reference: string;
  note?: string;
}

export const MANUFACTURER_CONDITIONS: ManufacturerCondition[] = [
  // Sewon, photographed spread 9, printed page 18, section 06, rows 2–4.
  ...([
    ['10%', 'R280', 80, '2'], ['10%', 'R470', 80, '2'], ['10%', 'R585', 100, '2'],
    ['15%', 'R280', 60, '3'], ['15%', 'R470', 60, '3'], ['15%', 'R585', 100, '3'],
    ['25%', 'R280', 60, '4'], ['25%', 'R470', 60, '4'], ['25%', 'R585', 80, '4'],
    ['75%', 'R280', 'NR', '6'], ['75%', 'R470', 'NR', '6'], ['75%', 'R585', 'NR', '6'],
  ] as const).map(([concentration, product, temperature, row]) => ({ id: `sewon-acetic-${row}-${product}`, guideId: 'sewon' as const, chemical: '초산 (Acetic Acid)', concentration, product, temperature, reference: `06 내약품 성능표, 인쇄 p.18, No.${row}` })),
  // Ashland, photographed spread with printed page 12, Acetic Acid concentration rows.
  ...([
    ['1%', 'HETRON 942/35', 99], ['10%', 'HETRON 942/35', 99],
    ['25%', 'HETRON 942/35', 99], ['50%', 'HETRON 942/35', 82],
    ['75%', 'HETRON 942/35', 66],
    ['10%', 'HETRON 980/35', 99], ['50%', 'HETRON 980/35', 82],
    ['10%', 'HETRON FR998/35', 99], ['50%', 'HETRON FR998/35', 82],
    ['10%', 'HETRON 970/35', 99], ['50%', 'HETRON 970/35', 82],
  ] as const).map(([concentration, product, temperature]) => ({ id: `ashland-acetic-${concentration}-${product}`, guideId: 'ashland' as const, chemical: '초산 (Acetic Acid)', concentration, product, temperature, reference: 'TEMPERATURE (°C) FOR RESIN TYPES, 인쇄 p.12, Acetic Acid' })),
  // Polynt, photographed spread of D entries; the printed columns RF-1001/KRF-1001,
  // RF-2000SE/KRF-2000SE, RF-1051/KRF-1051 share headers as printed.
  ...(['RF-1001 / KRF-1001', 'RF-2000SE / KRF-2000SE', 'RF-1051 / KRF-1051'] as const).flatMap((product) => [
    { id: `polynt-deionized-${product}`, guideId: 'polynt' as const, chemical: '탈이온수 (Deionized Water)', concentration: '100%', product, temperature: 80, reference: 'EPOVIA 최고 사용온도(°C), Deionized Water 행' },
    { id: `polynt-demin-${product}`, guideId: 'polynt' as const, chemical: '탈염수 (Demineralized Water)', concentration: '100%', product, temperature: 80, reference: 'EPOVIA 최고 사용온도(°C), Demineralized Water 행' },
  ]),
];

export const guideFor = (id: GuideId) => RESIN_GUIDES.find((guide) => guide.id === id)!;