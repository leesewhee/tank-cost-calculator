import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';
import {
  getFlangeTorqueData,
  TORQUE_SEQUENCE,
  GASKET_TYPES,
  calculateAdjustedTorque,
  type UnitSystem,
  type FlangeTorqueData,
} from '@/lib/flangeTorque';

export const FlangeTorqueTable = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [gasketType, setGasketType] = useState<string>('ptfe');
  const [isLubricated, setIsLubricated] = useState<boolean>(false);

  const torqueData = getFlangeTorqueData(unitSystem);
  const selectedGasket = GASKET_TYPES.find(g => g.id === gasketType);

  const warningItems = [
    'FRP 플랜지는 금속 플랜지보다 낮은 토크를 사용해야 합니다.',
    '과도한 토크는 플랜지 손상 및 누설의 원인이 됩니다.',
    '온도 변화가 큰 환경에서는 정기적인 토크 재확인이 필요합니다.',
    '토크 렌치는 사용 전 반드시 교정해야 합니다.',
    '체결 후 24시간 경과 후 토크를 재확인하는 것을 권장합니다.',
  ];

  const referenceItems = [
    'ASME RTP-1 (Reinforced Thermoset Plastic Corrosion Resistant Equipment)',
    'ASME PCC-1 (Guidelines for Pressure Boundary Bolted Flange Joint Assembly)',
    '가스켓 제조사 권장 사항',
  ];

  const renderTorqueValue = (data: FlangeTorqueData) => {
    const adjustedNm = calculateAdjustedTorque(data.torqueNm, gasketType, isLubricated);
    const adjustedFtLb = calculateAdjustedTorque(data.torqueFtLb, gasketType, isLubricated);
    const maxAdjustedNm = calculateAdjustedTorque(data.maxTorqueNm, gasketType, isLubricated);
    const maxAdjustedFtLb = calculateAdjustedTorque(data.maxTorqueFtLb, gasketType, isLubricated);

    return (
      <>
        <TableCell className="text-center font-medium text-primary">
          {adjustedNm} Nm / {adjustedFtLb} ft-lb
        </TableCell>
        <TableCell className="text-center text-muted-foreground">
          {maxAdjustedNm} Nm / {maxAdjustedFtLb} ft-lb
        </TableCell>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            FRP 플랜지 토크 참조 테이블
          </CardTitle>
          <CardDescription>RTP-1 표준 기반 FRP 플랜지 체결 토크 권장값</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>단위 시스템</Label>
              <Select value={unitSystem} onValueChange={(v) => setUnitSystem(v as UnitSystem)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">인치 (ANSI)</SelectItem>
                  <SelectItem value="metric">미터 (DN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>가스켓 종류</Label>
              <Select value={gasketType} onValueChange={setGasketType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GASKET_TYPES.map((gasket) => (
                    <SelectItem key={gasket.id} value={gasket.id}>{gasket.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGasket && <p className="text-xs text-muted-foreground">{selectedGasket.description}</p>}
            </div>
            <div className="space-y-2">
              <Label>윤활 볼트 사용</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={isLubricated} onCheckedChange={setIsLubricated} />
                <span className="text-sm text-muted-foreground">{isLubricated ? 'ON (-25%)' : 'OFF'}</span>
              </div>
              <p className="text-xs text-muted-foreground">윤활유 또는 몰리 코팅 볼트 사용 시 토크 감소</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">호칭 경</TableHead>
                  <TableHead className="text-center">직경</TableHead>
                  <TableHead className="text-center">볼트 규격</TableHead>
                  <TableHead className="text-center">볼트 수</TableHead>
                  <TableHead className="text-center">조정 토크</TableHead>
                  <TableHead className="text-center">최대 토크</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {torqueData.map((data) => (
                  <TableRow key={data.size} className="hover:bg-muted/30">
                    <TableCell className="text-center font-medium">{data.size}</TableCell>
                    <TableCell className="text-center">{data.diameterMm} mm ({data.diameterInch}")</TableCell>
                    <TableCell className="text-center">{data.boltSize}</TableCell>
                    <TableCell className="text-center">{data.boltCount}</TableCell>
                    {renderTorqueValue(data)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            토크 체결 순서
          </CardTitle>
          <CardDescription>FRP 플랜지는 반드시 단계별 교차 패턴(별모양)으로 체결해야 합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center w-24">단계</TableHead>
                <TableHead className="text-center w-32">토크 비율</TableHead>
                <TableHead>체결 방법</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TORQUE_SEQUENCE.map((step) => (
                <TableRow key={step.pass}>
                  <TableCell className="text-center"><Badge variant="outline">{step.pass}</Badge></TableCell>
                  <TableCell className="text-center font-medium text-primary">{step.percentage}%</TableCell>
                  <TableCell>{step.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-3">8볼트 플랜지 체결 순서 예시:</p>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-48 h-48">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
                  const sequence = [1, 5, 3, 7, 2, 6, 4, 8];
                  const x = 100 + 80 * Math.cos((angle - 90) * Math.PI / 180);
                  const y = 100 + 80 * Math.sin((angle - 90) * Math.PI / 180);
                  return (
                    <g key={angle}>
                      <circle cx={x} cy={y} r="14" className="fill-primary" />
                      <text x={x} y={y} textAnchor="middle" dy="5" className="fill-primary-foreground text-sm font-bold">{sequence[index]}</text>
                    </g>
                  );
                })}
                <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-muted-foreground" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-muted-foreground" />
                <line x1="43" y1="43" x2="157" y2="157" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-muted-foreground" />
                <line x1="157" y1="43" x2="43" y2="157" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-muted-foreground" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">숫자는 체결 순서를 나타냅니다 (교차 패턴)</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            주의사항
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {warningItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            참조 규격
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {referenceItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground italic">※ 본 표의 토크값은 참고용이며, 실제 적용 시 설계 조건과 가스켓 제조사 권장값을 우선 적용하시기 바랍니다.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlangeTorqueTable;
