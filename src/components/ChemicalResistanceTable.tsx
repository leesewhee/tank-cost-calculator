import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CHEMICAL_DATABASE, RATING_DESCRIPTIONS, CATEGORY_LABELS, type ResistanceRating } from '@/lib/chemicalResistance';
import { Search, AlertCircle } from 'lucide-react';
import { RESIN_GUIDES, CHEMICALS, chemicalLabel, searchManufacturerRows, type GuideId } from '@/lib/manufacturerResinGuides';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResinReview from '@/features/worldtech/ResinReview';

const RatingBadge = ({ rating }: { rating: ResistanceRating }) => {
  const colorClasses = {
    A: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    B: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    C: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    NR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Badge className={`${colorClasses[rating]} font-bold`}>
      {rating}
    </Badge>
  );
};

export const ChemicalResistanceTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');

  const manufacturerRows = useMemo(() => searchManufacturerRows(manufacturerSearch, manufacturerFilter as GuideId | 'all'), [manufacturerSearch, manufacturerFilter]);

  const filteredData = useMemo(() => {
    return CHEMICAL_DATABASE.filter((chem) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = chem.name.ko.toLowerCase().includes(searchLower) ||
                        chem.name.en.toLowerCase().includes(searchLower) ||
                        chem.formula.toLowerCase().includes(searchLower);
      const categoryMatch = categoryFilter === 'all' || chem.category === categoryFilter;
      return nameMatch && categoryMatch;
    });
  }, [searchTerm, categoryFilter]);

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manufacturer" className="space-y-4">
        <TabsList className="h-auto flex-wrap"><TabsTrigger value="manufacturer">제조사별 원문 조건</TabsTrigger><TabsTrigger value="review">조건 대조</TabsTrigger><TabsTrigger value="general">기존 일반 참고표</TabsTrigger></TabsList>
        <TabsContent value="review"><ResinReview /></TabsContent>
        <TabsContent value="manufacturer" className="space-y-4">
          <Card><CardHeader><CardTitle>제조사별 수지 온도 조건 (°C)</CardTitle><CardDescription>세원화성·ASHLAND·Polynt 원문에서 FRP 주요 약품 약 20종을 회사별로 옮겼습니다. 숫자의 의미는 제조사·판본·각주에 따라 다르며, 특히 ASHLAND는 시험·사용·평가 온도로서 반드시 최고 허용온도를 뜻하지 않습니다. NR은 사용 비권장입니다.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input className="pl-10" aria-label="제조사 조건 검색" placeholder="예: 황산, 염산, NaOH, H2SO4, Sulfuric, R585" value={manufacturerSearch} onChange={e => setManufacturerSearch(e.target.value)} /></div>
                <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">제조사 전체</SelectItem>{RESIN_GUIDES.map(g => <SelectItem key={g.id} value={g.id}>{g.vendor}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="flex flex-wrap gap-2">{Object.entries(CHEMICALS).map(([k, c]) => <Button key={k} type="button" size="sm" variant={manufacturerSearch === c.ko ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setManufacturerSearch(manufacturerSearch === c.ko ? '' : c.ko)}>{c.ko}</Button>)}</div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground p-3 rounded-md bg-muted/50">
                <span><b className="text-foreground">숫자</b> 제조사별 온도 표기(°C)</span><span><b className="text-destructive">NR</b> 사용 비권장</span><span><b>-</b> 원문에 자료 없음</span><span><b>미확인</b> 사진상 판독 불확실 — 원문 확인</span><span><b>A/B</b> ASHLAND 원문 표기 그대로(원문 각주 확인)</span><span><b>LS</b> Limited Service</span>
              </div>
            </CardContent></Card>
          {RESIN_GUIDES.filter(g => manufacturerFilter === 'all' || g.id === manufacturerFilter).map(g => {
            const rows = manufacturerRows.filter(r => r.guideId === g.id);
            return (
              <Card key={g.id}>
                <CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-lg">{g.vendor} <span className="text-sm font-normal text-muted-foreground">— {g.title}</span></CardTitle><a href={g.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-4">원문 사진 PDF ↗</a></div><CardDescription>{g.coverage} · {rows.length}건 표시</CardDescription></CardHeader>
                <CardContent>
                  {rows.length === 0 ? <p className="text-sm text-muted-foreground">이 회사 자료에서는 옮긴 항목이 없습니다. 촬영되지 않았거나 판독이 불확실한 페이지일 수 있으니 원문 PDF를 확인하세요.</p> :
                  <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="min-w-[160px]">화학약품</TableHead><TableHead>농도</TableHead>{g.products.map(p => <TableHead key={p} className="text-center text-xs whitespace-nowrap">{p}</TableHead>)}<TableHead className="min-w-[160px]">원문 위치</TableHead></TableRow></TableHeader><TableBody>
                    {rows.map(row => { const c = chemicalLabel(row.chemical); return (
                      <TableRow key={row.id}>
                        <TableCell><div className="font-medium">{c.ko} {c.formula !== '-' && <span className="font-mono text-xs text-primary">({c.formula})</span>}</div><div className="text-xs text-muted-foreground">{c.en}</div></TableCell>
                        <TableCell className="whitespace-nowrap">{row.concentration}</TableCell>
                        {row.values.map((v, i) => <TableCell key={i} className={`text-center whitespace-nowrap ${v === null ? 'text-xs text-muted-foreground italic' : v.includes('NR') ? 'text-destructive font-semibold' : 'font-medium'}`}>{v ?? '미확인'}</TableCell>)}
                        <TableCell className="text-xs"><a href={g.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{row.reference} ↗</a>{row.note && <div className="text-muted-foreground mt-1">{row.note}</div>}</TableCell>
                      </TableRow>); })}
                  </TableBody></Table></div>}
                </CardContent>
              </Card>);
          })}
          <p className="text-sm text-muted-foreground">옮기지 않은 약품·농도는 원문 PDF에서 확인하세요. 실제 적용 전 제조사 최신 기술자료와 실제 농도·온도·혼합물 조건을 별도로 확인해야 합니다.</p>
        </TabsContent>
        <TabsContent value="general" className="space-y-4">
      <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 text-sm">기존 표는 제조사 출처 미확인 일반 참고값입니다. 제조사 제품별 최고 사용온도와 직접 비교하거나 설계 승인값으로 사용하지 마세요. A/B/C 등급은 제조사 표의 온도·NR과 호환되지 않습니다.</div>
      <Card>
        <CardHeader>
          <CardTitle>화학약품 내식성 조회표</CardTitle>
          <CardDescription>FRP 수지별 화학약품 내식성 등급 및 최대 사용온도</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="약품명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-[180px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="분류" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {categories.map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ko}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">등급 범례:</span>
            {(Object.entries(RATING_DESCRIPTIONS) as [ResistanceRating, typeof RATING_DESCRIPTIONS['A']][]).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <RatingBadge rating={key} />
                <span className="text-sm text-muted-foreground">{val.ko}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold min-w-[180px]">화학약품</TableHead>
                    <TableHead className="text-center">출처</TableHead>
                    <TableHead className="text-center font-bold">화학식</TableHead>
                    <TableHead className="text-center font-bold">농도</TableHead>
                    <TableHead className="text-center font-bold bg-blue-500/10" colSpan={2}>폴리에스터</TableHead>
                    <TableHead className="text-center font-bold bg-green-500/10" colSpan={2}>비닐에스터</TableHead>
                    <TableHead className="text-center font-bold bg-amber-500/10" colSpan={2}>노볼락</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-center text-xs bg-blue-500/5">등급</TableHead>
                    <TableHead className="text-center text-xs bg-blue-500/5">°C</TableHead>
                    <TableHead className="text-center text-xs bg-green-500/5">등급</TableHead>
                    <TableHead className="text-center text-xs bg-green-500/5">°C</TableHead>
                    <TableHead className="text-center text-xs bg-amber-500/5">등급</TableHead>
                    <TableHead className="text-center text-xs bg-amber-500/5">°C</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((chem, idx) => (
                    <TableRow key={chem.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span>{chem.name.ko}</span>
                            {chem.formula !== '-' && (
                              <span className="font-mono text-sm text-primary">({chem.formula})</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABELS[chem.category].ko}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{chem.name.en}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">{chem.source?.type === 'manufacturer' ? chem.source.vendor : '출처 미확인'}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{chem.formula}</TableCell>
                      <TableCell className="text-center">{chem.concentration}</TableCell>
                      <TableCell className="text-center bg-blue-500/5">
                        <RatingBadge rating={chem.rating.polyester} />
                      </TableCell>
                      <TableCell className="text-center bg-blue-500/5">
                        {chem.maxTemp.polyester > 0 ? chem.maxTemp.polyester : '-'}
                      </TableCell>
                      <TableCell className="text-center bg-green-500/5">
                        <RatingBadge rating={chem.rating.vinylEster} />
                      </TableCell>
                      <TableCell className="text-center bg-green-500/5">
                        {chem.maxTemp.vinylEster > 0 ? chem.maxTemp.vinylEster : '-'}
                      </TableCell>
                      <TableCell className="text-center bg-amber-500/5">
                        <RatingBadge rating={chem.rating.novolac} />
                      </TableCell>
                      <TableCell className="text-center bg-amber-500/5">
                        {chem.maxTemp.novolac > 0 ? chem.maxTemp.novolac : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic text-center">
        ※ 실제 적용 시 공정 조건(온도, 농도, 복합 약품)에 따라 별도 시험을 권장합니다.
      </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChemicalResistanceTable;
