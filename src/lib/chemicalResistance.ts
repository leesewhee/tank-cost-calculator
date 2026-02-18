// Chemical Resistance Database for FRP Resins

export type ResistanceRating = 'A' | 'B' | 'C' | 'NR';

export interface ChemicalData {
  id: string;
  name: { ko: string; en: string };
  formula: string;
  concentration: string;
  category: string;
  rating: {
    polyester: ResistanceRating;
    vinylEster: ResistanceRating;
    novolac: ResistanceRating;
  };
  maxTemp: {
    polyester: number;
    vinylEster: number;
    novolac: number;
  };
}

export const RATING_DESCRIPTIONS: Record<ResistanceRating, { ko: string; en: string }> = {
  A: { ko: '우수 - 장기 사용 적합', en: 'Excellent - Suitable for long-term use' },
  B: { ko: '양호 - 제한적 사용 가능', en: 'Good - Limited use acceptable' },
  C: { ko: '주의 - 단기 사용만 가능', en: 'Fair - Short-term use only' },
  NR: { ko: '부적합 - 사용 불가', en: 'Not Recommended' },
};

export const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  acid: { ko: '산', en: 'Acid' },
  alkali: { ko: '알칼리', en: 'Alkali' },
  salt: { ko: '염류', en: 'Salt' },
  solvent: { ko: '용제', en: 'Solvent' },
  oxidizer: { ko: '산화제', en: 'Oxidizer' },
  water: { ko: '수처리', en: 'Water Treatment' },
  other: { ko: '기타', en: 'Other' },
};

export const CHEMICAL_DATABASE: ChemicalData[] = [
  // Acids
  { id: 'hcl-10', name: { ko: '염산', en: 'Hydrochloric Acid' }, formula: 'HCl', concentration: '10%', category: 'acid', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 50, vinylEster: 80, novolac: 120 } },
  { id: 'hcl-37', name: { ko: '염산', en: 'Hydrochloric Acid' }, formula: 'HCl', concentration: '37%', category: 'acid', rating: { polyester: 'C', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 65, novolac: 100 } },
  { id: 'h2so4-10', name: { ko: '황산', en: 'Sulfuric Acid' }, formula: 'H₂SO₄', concentration: '10%', category: 'acid', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'h2so4-50', name: { ko: '황산', en: 'Sulfuric Acid' }, formula: 'H₂SO₄', concentration: '50%', category: 'acid', rating: { polyester: 'C', vinylEster: 'B', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 50, novolac: 90 } },
  { id: 'h2so4-98', name: { ko: '황산', en: 'Sulfuric Acid' }, formula: 'H₂SO₄', concentration: '98%', category: 'acid', rating: { polyester: 'NR', vinylEster: 'NR', novolac: 'C' }, maxTemp: { polyester: 0, vinylEster: 0, novolac: 40 } },
  { id: 'hno3-5', name: { ko: '질산', en: 'Nitric Acid' }, formula: 'HNO₃', concentration: '5%', category: 'acid', rating: { polyester: 'B', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 40, vinylEster: 65, novolac: 80 } },
  { id: 'hno3-20', name: { ko: '질산', en: 'Nitric Acid' }, formula: 'HNO₃', concentration: '20%', category: 'acid', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 50 } },
  { id: 'h3po4-30', name: { ko: '인산', en: 'Phosphoric Acid' }, formula: 'H₃PO₄', concentration: '30%', category: 'acid', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'h3po4-85', name: { ko: '인산', en: 'Phosphoric Acid' }, formula: 'H₃PO₄', concentration: '85%', category: 'acid', rating: { polyester: 'C', vinylEster: 'B', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 60, novolac: 90 } },
  { id: 'acetic-10', name: { ko: '초산', en: 'Acetic Acid' }, formula: 'CH₃COOH', concentration: '10%', category: 'acid', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 50, vinylEster: 80, novolac: 100 } },
  { id: 'hf-4', name: { ko: '불산', en: 'Hydrofluoric Acid' }, formula: 'HF', concentration: '4%', category: 'acid', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 40 } },
  { id: 'chromic-10', name: { ko: '크롬산', en: 'Chromic Acid' }, formula: 'CrO₃', concentration: '10%', category: 'acid', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 30, novolac: 50 } },

  // Alkalis
  { id: 'naoh-10', name: { ko: '가성소다', en: 'Sodium Hydroxide' }, formula: 'NaOH', concentration: '10%', category: 'alkali', rating: { polyester: 'B', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 40, vinylEster: 65, novolac: 80 } },
  { id: 'naoh-50', name: { ko: '가성소다', en: 'Sodium Hydroxide' }, formula: 'NaOH', concentration: '50%', category: 'alkali', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 50 } },
  { id: 'koh-10', name: { ko: '가성칼리', en: 'Potassium Hydroxide' }, formula: 'KOH', concentration: '10%', category: 'alkali', rating: { polyester: 'B', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 40, vinylEster: 60, novolac: 80 } },
  { id: 'nh4oh-10', name: { ko: '암모니아수', en: 'Ammonium Hydroxide' }, formula: 'NH₄OH', concentration: '10%', category: 'alkali', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 50, vinylEster: 65, novolac: 80 } },
  { id: 'ca-oh-sat', name: { ko: '석회수', en: 'Calcium Hydroxide' }, formula: 'Ca(OH)₂', concentration: '포화', category: 'alkali', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 80, novolac: 100 } },

  // Salts
  { id: 'nacl-sat', name: { ko: '염화나트륨', en: 'Sodium Chloride' }, formula: 'NaCl', concentration: '포화', category: 'salt', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'fecl3-10', name: { ko: '염화제이철', en: 'Ferric Chloride' }, formula: 'FeCl₃', concentration: '10%', category: 'salt', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'na2co3-20', name: { ko: '탄산나트륨', en: 'Sodium Carbonate' }, formula: 'Na₂CO₃', concentration: '20%', category: 'salt', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 60, vinylEster: 80, novolac: 100 } },
  { id: 'cuso4-sat', name: { ko: '황산구리', en: 'Copper Sulfate' }, formula: 'CuSO₄', concentration: '포화', category: 'salt', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },

  // Solvents
  { id: 'acetone', name: { ko: '아세톤', en: 'Acetone' }, formula: 'C₃H₆O', concentration: '100%', category: 'solvent', rating: { polyester: 'NR', vinylEster: 'NR', novolac: 'C' }, maxTemp: { polyester: 0, vinylEster: 0, novolac: 25 } },
  { id: 'methanol', name: { ko: '메탄올', en: 'Methanol' }, formula: 'CH₃OH', concentration: '100%', category: 'solvent', rating: { polyester: 'C', vinylEster: 'B', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 40, novolac: 60 } },
  { id: 'ethanol', name: { ko: '에탄올', en: 'Ethanol' }, formula: 'C₂H₅OH', concentration: '95%', category: 'solvent', rating: { polyester: 'B', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 30, vinylEster: 50, novolac: 65 } },
  { id: 'toluene', name: { ko: '톨루엔', en: 'Toluene' }, formula: 'C₇H₈', concentration: '100%', category: 'solvent', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 40 } },

  // Oxidizers
  { id: 'naocl-5', name: { ko: '차아염소산나트륨', en: 'Sodium Hypochlorite' }, formula: 'NaOCl', concentration: '5%', category: 'oxidizer', rating: { polyester: 'C', vinylEster: 'B', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 40, novolac: 65 } },
  { id: 'naocl-15', name: { ko: '차아염소산나트륨', en: 'Sodium Hypochlorite' }, formula: 'NaOCl', concentration: '15%', category: 'oxidizer', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 40 } },
  { id: 'h2o2-10', name: { ko: '과산화수소', en: 'Hydrogen Peroxide' }, formula: 'H₂O₂', concentration: '10%', category: 'oxidizer', rating: { polyester: 'C', vinylEster: 'B', novolac: 'A' }, maxTemp: { polyester: 25, vinylEster: 40, novolac: 60 } },
  { id: 'h2o2-30', name: { ko: '과산화수소', en: 'Hydrogen Peroxide' }, formula: 'H₂O₂', concentration: '30%', category: 'oxidizer', rating: { polyester: 'NR', vinylEster: 'C', novolac: 'B' }, maxTemp: { polyester: 0, vinylEster: 25, novolac: 40 } },

  // Water Treatment
  { id: 'di-water', name: { ko: '탈이온수', en: 'Deionized Water' }, formula: 'H₂O', concentration: '-', category: 'water', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'seawater', name: { ko: '해수', en: 'Seawater' }, formula: '-', concentration: '-', category: 'water', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
  { id: 'wastewater', name: { ko: '폐수 (일반)', en: 'Wastewater (General)' }, formula: '-', concentration: '-', category: 'water', rating: { polyester: 'A', vinylEster: 'A', novolac: 'A' }, maxTemp: { polyester: 65, vinylEster: 90, novolac: 120 } },
];
