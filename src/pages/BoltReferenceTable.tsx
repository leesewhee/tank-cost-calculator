import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  BOLT_SIZES, BOLT_PITCH, STANDARD_WASHER_THICKNESS, HEAVY_WASHER_THICKNESS, STANDARD_NUT_HEIGHT, HEAVY_NUT_HEIGHT,
} from '@/lib/boltCalculator';

const BoltReferenceTable = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground py-6 print:hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/bolt-calculator')} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">볼트 규격 참조 테이블</h1>
              <p className="text-sm text-sidebar-foreground/70">볼트 사이즈별 피치, 와샤, 너트 규격 정보</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">단위 안내</p>
              <p className="text-muted-foreground">모든 치수는 mm 단위입니다. 피치는 미터 보통나사(coarse thread) 기준이며, 와샤와 너트 규격은 KS/ISO 표준을 따릅니다.</p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader><CardTitle className="text-lg">볼트 규격표</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-center w-20">사이즈</TableHead>
                    <TableHead className="font-semibold text-center">피치<span className="block text-xs font-normal text-muted-foreground">mm</span></TableHead>
                    <TableHead className="font-semibold text-center">3산 돌출<span className="block text-xs font-normal text-muted-foreground">mm</span></TableHead>
                    <TableHead className="font-semibold text-center bg-secondary/30">일반 와샤<span className="block text-xs font-normal text-muted-foreground">두께 mm</span></TableHead>
                    <TableHead className="font-semibold text-center bg-secondary/30">헤비 와샤<span className="block text-xs font-normal text-muted-foreground">두께 mm</span></TableHead>
                    <TableHead className="font-semibold text-center bg-accent/10">일반 너트<span className="block text-xs font-normal text-muted-foreground">높이 mm</span></TableHead>
                    <TableHead className="font-semibold text-center bg-accent/10">헤비 너트<span className="block text-xs font-normal text-muted-foreground">높이 mm</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BOLT_SIZES.map((size) => (
                    <TableRow key={size} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-semibold text-center text-primary">{size}</TableCell>
                      <TableCell className="font-mono text-center">{BOLT_PITCH[size]}</TableCell>
                      <TableCell className="font-mono text-center text-primary font-medium">{(BOLT_PITCH[size] * 3).toFixed(1)}</TableCell>
                      <TableCell className="font-mono text-center bg-secondary/10">{STANDARD_WASHER_THICKNESS[size]}</TableCell>
                      <TableCell className="font-mono text-center bg-secondary/10">{HEAVY_WASHER_THICKNESS[size]}</TableCell>
                      <TableCell className="font-mono text-center bg-accent/5">{STANDARD_NUT_HEIGHT[size]}</TableCell>
                      <TableCell className="font-mono text-center bg-accent/5">{HEAVY_NUT_HEIGHT[size]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">와샤 종류</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">일반 와샤</span><span>평와샤 (KS B 1326)</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">헤비 와샤</span><span>두꺼운 평와샤</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">너트 종류</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">일반 너트</span><span>육각너트 1종 (KS B 1012)</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">헤비 너트</span><span>육각너트 2종 (높은 형)</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8 pb-4">※ 본 규격표는 참고용이며, 실제 사용 시 해당 제조사의 규격을 확인하세요.</div>
      </main>

      <footer className="bg-muted py-4 mt-8 print:hidden">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

export default BoltReferenceTable;
