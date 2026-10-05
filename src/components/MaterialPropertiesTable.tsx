import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FRP_MATERIAL_PROPERTIES, RESIN_CHARACTERISTICS } from '@/lib/materialProperties';
import { Check, AlertTriangle } from 'lucide-react';
import { RESIN_GUIDES } from '@/lib/manufacturerResinGuides';

export const MaterialPropertiesTable = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FRP 물성 데이터표</CardTitle>
          <CardDescription>기존 일반 참고 물성 비교 (제조사 출처 미확인; 제품별 사용온도와 별개)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-lg text-sm">
            이 물성표의 수치는 특정 제조사 제품의 보증값이 아닙니다. 화학약품·농도별 최고 사용온도는 <a href="/chemical-resistance" className="text-primary underline">화학약품 내식성 조회표의 제조사별 원문 조건</a>에서 확인하세요.
            <div className="flex flex-wrap gap-3 mt-2">{RESIN_GUIDES.map(g => <a key={g.id} href={g.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{g.vendor} 원문 사진 PDF ↗</a>)}</div>
          </div>
          <Tabs defaultValue="properties">
            <TabsList className="mb-6">
              <TabsTrigger value="properties">물성 데이터</TabsTrigger>
              <TabsTrigger value="characteristics">수지 특성</TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold min-w-[150px]">물성</TableHead>
                      <TableHead className="text-center font-bold bg-blue-500/10">폴리에스터</TableHead>
                      <TableHead className="text-center font-bold bg-green-500/10">비닐에스터</TableHead>
                      <TableHead className="text-center font-bold bg-amber-500/10">노볼락</TableHead>
                      <TableHead className="text-center font-bold">단위</TableHead>
                      <TableHead className="text-center font-bold">시험방법</TableHead>
                      <TableHead className="text-center font-bold">자료 출처</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FRP_MATERIAL_PROPERTIES.map((prop, idx) => (
                      <TableRow key={prop.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">{prop.property}</TableCell>
                        <TableCell className="text-center bg-blue-500/5">{prop.polyester}</TableCell>
                        <TableCell className="text-center bg-green-500/5">{prop.vinylEster}</TableCell>
                        <TableCell className="text-center bg-amber-500/5">{prop.novolac}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{prop.unit}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">{prop.testMethod}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{prop.source?.type === 'manufacturer' ? prop.source.vendor : '출처 미확인'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="characteristics">
              <div className="grid md:grid-cols-3 gap-6">
                {RESIN_CHARACTERISTICS.map((resin) => (
                  <Card key={resin.id} className="overflow-hidden">
                    <CardHeader className={`py-4 ${
                      resin.id === 'polyester' ? 'bg-blue-500/10' :
                      resin.id === 'vinylester' ? 'bg-green-500/10' :
                      'bg-amber-500/10'
                    }`}>
                      <CardTitle className="text-lg">{resin.resin}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                          <Check className="w-4 h-4" />장점
                        </h4>
                        <ul className="space-y-1">
                          {resin.advantages.map((adv, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>{adv}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />단점
                        </h4>
                        <ul className="space-y-1">
                          {resin.disadvantages.map((dis, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>{dis}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-2">적용 분야</h4>
                        <div className="flex flex-wrap gap-1">
                          {resin.applications.map((app, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{app}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic text-center">
        ※ 물성값은 유리섬유 함량, 적층 구조, 제조 조건에 따라 변동될 수 있습니다.
      </p>
    </div>
  );
};

export default MaterialPropertiesTable;
