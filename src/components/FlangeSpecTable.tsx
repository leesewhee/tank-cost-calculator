import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getFlangeData, FLANGE_STANDARDS, type FlangeStandard } from '@/lib/flangeSpec';

export const FlangeSpecTable = () => {
  const [selectedStandard, setSelectedStandard] = useState<FlangeStandard>('ANSI-150');
  const flangeData = getFlangeData(selectedStandard);
  const currentStandard = FLANGE_STANDARDS.find(s => s.id === selectedStandard);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ANSI/JIS 플랜지 규격표</CardTitle>
          <CardDescription>ASME/ANSI B16.5 및 JIS B2220 기준 플랜지 규격 데이터</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">규격 선택</label>
              <Select value={selectedStandard} onValueChange={(v) => setSelectedStandard(v as FlangeStandard)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FLANGE_STANDARDS.map((std) => (
                    <SelectItem key={std.id} value={std.id}>{std.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentStandard && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">참조 규격:</span>
                <Badge variant="outline">{currentStandard.ref}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-bold">NPS</TableHead>
                  <TableHead className="text-center font-bold">DN</TableHead>
                  <TableHead className="text-center font-bold">파이프 OD<br/><span className="text-xs font-normal">(mm)</span></TableHead>
                  <TableHead className="text-center font-bold">플랜지 OD<br/><span className="text-xs font-normal">(mm)</span></TableHead>
                  <TableHead className="text-center font-bold">볼트 원 (BCD)<br/><span className="text-xs font-normal">(mm)</span></TableHead>
                  <TableHead className="text-center font-bold">볼트 수</TableHead>
                  <TableHead className="text-center font-bold">볼트 규격</TableHead>
                  <TableHead className="text-center font-bold">플랜지 두께<br/><span className="text-xs font-normal">(mm)</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flangeData.map((flange, idx) => (
                  <TableRow key={flange.nps} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="text-center font-medium">{flange.nps}</TableCell>
                    <TableCell className="text-center">{flange.dn}</TableCell>
                    <TableCell className="text-center">{flange.od.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{flange.flangeOD.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{flange.boltCircle.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{flange.boltHoles}</TableCell>
                    <TableCell className="text-center">{flange.boltSize}</TableCell>
                    <TableCell className="text-center">{flange.flangeThk.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic text-center">
        ※ 본 데이터는 참조용으로, 실제 적용 시 해당 규격서를 확인하시기 바랍니다.
      </p>
    </div>
  );
};

export default FlangeSpecTable;
