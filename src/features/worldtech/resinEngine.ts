/** Source-bounded screening only. No interpolation or design approval. */
export interface EvidenceRow {
 manufacturer: string; chemical: string; concentration: string;
 limits: Record<string,number|string|null>; notes: string[]; source: string;
 auto_eligible: boolean; edition: string; temperature_meaning: string;
}
export interface ResinInput {
 manufacturer: string; chemical: string; concentration: number;
 temperature: number; ph?: number; mixture?: boolean;
}
export function matchesConcentration(c:number, token:string):boolean {
 if(token==='All')return true;
 if(/^>\d+(\.\d+)?$/.test(token))return c>Number(token.slice(1));
 if(/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(token)) {const [a,b]=token.split('-').map(Number);return c>=a&&c<=b;}
 return /^\d+(\.\d+)?$/.test(token)&&Math.abs(c-Number(token))<1e-9;
}
export function recommendResin(rows:EvidenceRow[], p:ResinInput) {
 if(!Number.isFinite(p.concentration)||p.concentration<0||p.concentration>100||!Number.isFinite(p.temperature)||p.temperature< -273.15||p.temperature>300)throw Error('농도·온도 입력 범위를 확인하세요.');
 if(p.ph!==undefined&&(!Number.isFinite(p.ph)||p.ph<0||p.ph>14))throw Error('pH 입력 범위를 확인하세요.');
 const key=p.chemical;
 const available=rows.filter(r=>r.manufacturer===p.manufacturer&&r.chemical===key);
 const row=available.find(r=>matchesConcentration(p.concentration,r.concentration));
 const notes=[...(row?.notes||[])];
 if(!row)notes.push('일치하는 검증 농도 행 없음. 보간·인접행·다른 제조사 전용 금지.');
 if(p.mixture)notes.push('혼합물·불순물·교번 운전: 단일 약품표 추천 보류.');
 const chlorine=p.manufacturer==='폴린트'&&key==='sodium-hypochlorite';
 if(chlorine)notes.push('유효염소 농도 기준, pH>11 필요. NaOCl 제품%와 구분.');
 if(chlorine&&p.ph===undefined)notes.push('pH 미입력: pH>11 확인 전 추천 보류.');
 const limits=Object.entries(row?.limits||{}).map(([product,value])=>{
  const eligible=!!row?.auto_eligible&&!p.mixture&&!(chlorine&&(p.ph===undefined||p.ph<=11))&&typeof value==='number'&&p.temperature>=0&&p.temperature<=value;
  const status=eligible?'표 범위 내 조건부 후보':value===null?'자료 없음':value==='NR'?'NR · 추천하지 않음':value==='LS'?'LS · 제한된 사용수명':value==='TC'?'제조사 문의':'온도/추가조건/농도기준 불일치';
  return {product,value,eligible,status};
 });
 const candidates=limits.filter(x=>x.eligible).map(x=>x.product);
 return {recommended:candidates[0]??null,candidates,limits,notes,row,availableConcentrations:available.map(r=>r.concentration),status:candidates.length?'조건부 후보 · 제조사/프로젝트 확인 전':'추천 보류'};
}
