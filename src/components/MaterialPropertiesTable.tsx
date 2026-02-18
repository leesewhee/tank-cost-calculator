import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FRP_MATERIAL_PROPERTIES, RESIN_CHARACTERISTICS } from '@/lib/materialProperties';
import { Check, AlertTriangle } from 'lucide-react';

export const MaterialPropertiesTable = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FRP 물성 데이터표</CardTitle>
          <CardDescription>FRP 수지별 기계적, 열적, 물리적 특성 비교</CardDescription>
        </CardHeader>
        <CardContent>
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
