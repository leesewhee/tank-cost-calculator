import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RESIN_GUIDES } from '@/lib/manufacturerResinGuides';
import { recommendResin, type EvidenceRow } from './resinEngine';
import catalog from './resin-evidence.json';

const rows = catalog.rows as EvidenceRow[];
const guideByManufacturer: Record<string, string | undefined> = {
  세원화성: RESIN_GUIDES.find(g => g.id === 'sewon')?.url,
  ASHLAND: RESIN_GUIDES.find(g => g.id === 'ashland')?.url,
  폴린트: RESIN_GUIDES.find(g => g.id === 'polynt')?.url,
};

export default function ResinReview() {
  const [manufacturer, setManufacturer] = useState('');
  const [chemical, setChemical] = useState('');
  const [concentration, setConcentration] = useState('');
  const [temperature, setTemperature] = useState('');
  const [ph, setPh] = useState('');
  const [mixture, setMixture] = useState(false);
  const [searched, setSearched] = useState(false);
  const available = catalog.chemicals.filter(c => rows.some(r => r.manufacturer === manufacturer && r.chemical === c.id));
  const result = useMemo(() => {
    if (!searched) return null;
    if (!manufacturer || !chemical || !concentration.trim() || !temperature.trim() || (ph.trim() && !Number.isFinite(Number(ph)))) return { error: '제조사·약품·농도·온도를 확인하세요.' };
    try {
      return { value: recommendResin(rows, {
        manufacturer, chemical, concentration: Number(concentration), temperature: Number(temperature),
        ph: ph.trim() ? Number(ph) : undefined, mixture,
      }) };
    } catch (error) { return { error: error instanceof Error ? error.message : '입력 확인 필요' }; }
  }, [manufacturer, chemical, concentration, temperature, ph, mixture, searched]);
  const guideUrl = guideByManufacturer[manufacturer];

  return <Card>
    <CardHeader><CardTitle>제조사별 수지 조건 검토</CardTitle>
      <p className="text-sm text-muted-foreground">추가 자료 89개 조건행을 농도와 온도에 대조합니다. 기존 조회표와 별도 자료이며, 후보는 설계·제작 승인 결과가 아닙니다.</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2"><Label>제조사</Label><Select value={manufacturer} onValueChange={v => { setManufacturer(v); setChemical(''); setSearched(false); }}><SelectTrigger aria-label="수지 제조사"><SelectValue placeholder="선택" /></SelectTrigger><SelectContent>{catalog.manufacturers.map(m => <SelectItem value={m} key={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>약품</Label><Select value={chemical} onValueChange={v => { setChemical(v); setSearched(false); }} disabled={!manufacturer}><SelectTrigger aria-label="수지 검토 약품"><SelectValue placeholder="선택" /></SelectTrigger><SelectContent>{available.map(c => <SelectItem value={c.id} key={c.id}>{c.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="review-concentration">농도 (%)</Label><Input id="review-concentration" type="number" min="0" max="100" value={concentration} onChange={e => { setConcentration(e.target.value); setSearched(false); }} placeholder="원문 농도 입력" /></div>
        <div className="space-y-2"><Label htmlFor="review-temperature">운전 온도 (°C)</Label><Input id="review-temperature" type="number" value={temperature} onChange={e => { setTemperature(e.target.value); setSearched(false); }} placeholder="온도 입력" /></div>
        <div className="space-y-2"><Label htmlFor="review-ph">pH (해당 시)</Label><Input id="review-ph" type="number" min="0" max="14" value={ph} onChange={e => { setPh(e.target.value); setSearched(false); }} placeholder="미확인" /></div>
        <label className="flex items-center gap-2 pt-6 text-sm"><Checkbox checked={mixture} onCheckedChange={v => { setMixture(v === true); setSearched(false); }} />혼합물·불순물·교번 운전</label>
      </div>
      <Button onClick={() => setSearched(true)}>조건 대조</Button>
      {result?.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}
      {result?.value && <div className="space-y-3" aria-live="polite">
        <p className="font-semibold">{result.value.status}{result.value.recommended ? ` · 첫 번째 후보: ${result.value.recommended}` : ''}</p>
        {result.value.limits.length > 0 && <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">제품</th><th className="p-2">원문 값</th><th className="p-2">판정</th></tr></thead><tbody>{result.value.limits.map(item => <tr key={item.product} className="border-b"><td className="p-2">{item.product}</td><td className="p-2">{item.value === null ? '자료 없음' : typeof item.value === 'number' ? `${item.value} °C` : item.value}</td><td className="p-2">{item.status}</td></tr>)}</tbody></table></div>}
        {result.value.notes.map((note, i) => <p key={i} className="text-sm text-muted-foreground">{note}</p>)}
        <p className="text-sm">해당 제조사의 수록 농도: {result.value.availableConcentrations.join(', ') || '없음'}</p>
        {result.value.row && <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
          <p>출처: {result.value.row.source}</p><p>판본: {result.value.row.edition || '미확인'}</p><p>온도 의미: {result.value.row.temperature_meaning}</p>
          <p>자료 표시 날짜: {'checked' in result.value.row ? String(result.value.row.checked) : '미확인'} · 프로젝트 원문 재확인 및 제조사 검토 필요</p>
          {guideUrl && <a href={guideUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary underline">업로드된 원문 사진 보기 ↗</a>}
          {manufacturer === '폴린트' && <p>이 조건행은 별도 판본의 전사 자료입니다. 업로드된 사진 PDF와 동일 판본인지 확인되지 않아 실제 사용 전 원문을 별도로 대조하세요.</p>}
        </div>}
        <p className="text-sm text-muted-foreground">정확히 일치하는 농도만 사용하며 보간하지 않습니다. 낮은 온도, 혼합물, 미확인 pH는 자동 후보에서 제외합니다.</p>
      </div>}
    </CardContent>
  </Card>;
}