import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CHEMICAL_DATABASE, RATING_DESCRIPTIONS, CATEGORY_LABELS, type ResistanceRating } from '@/lib/chemicalResistance';
import { Search, AlertCircle } from 'lucide-react';

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
    </div>
  );
};

export default ChemicalResistanceTable;
