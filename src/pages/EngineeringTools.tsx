import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolPageProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}

export const ToolPage = ({ title, subtitle, icon, children }: ToolPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground py-6 print:hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-sidebar-primary p-2 rounded-lg">{icon}</div>
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm text-sidebar-foreground/70">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl mx-auto px-4 py-8">{children}</main>
      <footer className="bg-muted py-4 mt-8 print:hidden">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

import { Wrench, Calculator, Scale, Ruler, Droplets, Table, Settings2, BarChart3, Beaker } from 'lucide-react';
import BoltCalculator from '@/components/BoltCalculator';
import FRPThicknessCalculator from '@/components/FRPThicknessCalculator';
import WeightCalculator from '@/components/WeightCalculator';
import HandrailCalculator from '@/components/HandrailCalculator';
import TankVolumeCalculator from '@/components/TankVolumeCalculator';
import FlangeSpecTable from '@/components/FlangeSpecTable';
import FlangeTorqueTable from '@/components/FlangeTorqueTable';
import MaterialPropertiesTable from '@/components/MaterialPropertiesTable';
import ChemicalResistanceTable from '@/components/ChemicalResistanceTable';

export const BoltCalculatorPage = () => (
  <ToolPage title="볼트 길이 계산기" subtitle="플랜지, 와샤, 너트, 가스켓 조건에 따른 적정 볼트 길이 산출" icon={<Wrench className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <BoltCalculator />
  </ToolPage>
);

export const FRPCalculatorPage = () => (
  <ToolPage title="FRP 두께 계산기" subtitle="RTP-1 및 ASME Section X 기준에 따른 FRP 용기 설계" icon={<Calculator className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <FRPThicknessCalculator />
  </ToolPage>
);

export const WeightCalculatorPage = () => (
  <ToolPage title="FRP 무게 계산기" subtitle="탱크 또는 파이프의 대략적인 무게 계산" icon={<Scale className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <WeightCalculator />
  </ToolPage>
);

export const HandrailCalculatorPage = () => (
  <ToolPage title="핸드레일 & 사다리 무게 계산기" subtitle="철 또는 스테인리스 재질의 구조물 무게 계산" icon={<Ruler className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <HandrailCalculator />
  </ToolPage>
);

export const TankVolumeCalculatorPage = () => (
  <ToolPage title="탱크 용량 계산기" subtitle="사각/원형 탱크의 용량, 표면적, 충전 중량 계산" icon={<Droplets className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <TankVolumeCalculator />
  </ToolPage>
);

export const FlangeSpecPage = () => (
  <ToolPage title="ANSI/JIS 플랜지 규격표" subtitle="ASME/ANSI B16.5 및 JIS B2220 기준 플랜지 규격 데이터" icon={<Table className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <FlangeSpecTable />
  </ToolPage>
);

export const FlangeTorquePage = () => (
  <ToolPage title="FRP 플랜지 토크 테이블" subtitle="RTP-1 표준 기반 FRP 플랜지 체결 토크 권장값" icon={<Settings2 className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <FlangeTorqueTable />
  </ToolPage>
);

export const MaterialPropertiesPage = () => (
  <ToolPage title="FRP 물성 데이터표" subtitle="FRP 수지별 기계적, 열적, 물리적 특성 비교" icon={<BarChart3 className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <MaterialPropertiesTable />
  </ToolPage>
);

export const ChemicalResistancePage = () => (
  <ToolPage title="화학약품 내식성 조회표" subtitle="FRP 수지별 화학약품 내식성 등급 및 최대 사용온도" icon={<Beaker className="w-8 h-8 text-sidebar-primary-foreground" />}>
    <ChemicalResistanceTable />
  </ToolPage>
);

export default ToolPage;
