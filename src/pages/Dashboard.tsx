import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cylinder, FileText, Settings, Shield, ClipboardList, Wrench, Calculator, Scale, Droplets, Table, Settings2, BarChart3, Beaker, Ruler, FolderOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const programs = [
  { id: "tank-quotation", title: "FRP 탱크 견적 시스템", description: "자동 수량 산출 및 견적 계산", icon: Cylinder, path: "/tank-quotation" },
  { id: "bolt-calculator", title: "볼트 길이 계산기", description: "플랜지, 와샤, 너트 조건별 볼트 길이 산출", icon: Wrench, path: "/bolt-calculator" },
  { id: "frp-calculator", title: "FRP 두께 계산기", description: "RTP-1 / ASME Section X 기준 FRP 용기 설계", icon: Calculator, path: "/frp-calculator" },
  { id: "weight-calculator", title: "FRP 무게 계산기", description: "탱크 또는 파이프 무게 계산", icon: Scale, path: "/weight-calculator" },
  { id: "tank-volume-calculator", title: "탱크 용량 계산기", description: "사각/원형 탱크 용량 및 충전 중량 계산", icon: Droplets, path: "/tank-volume-calculator" },
  { id: "handrail-calculator", title: "핸드레일 & 사다리 무게 계산기", description: "철/스테인리스 구조물 무게 계산", icon: Ruler, path: "/handrail-calculator" },
  { id: "flange-spec", title: "ANSI/JIS 플랜지 규격표", description: "ANSI B16.5 / JIS B2220 플랜지 규격 데이터", icon: Table, path: "/flange-spec" },
  { id: "flange-torque", title: "FRP 플랜지 토크 테이블", description: "RTP-1 기준 FRP 플랜지 체결 토크 권장값", icon: Settings2, path: "/flange-torque" },
  { id: "material-properties", title: "FRP 물성 데이터표", description: "수지별 기계적/열적/물리적 특성 비교", icon: BarChart3, path: "/material-properties" },
  { id: "chemical-resistance", title: "화학약품 내식성 조회표", description: "FRP 수지별 내식성 등급 및 최대 사용온도", icon: Beaker, path: "/chemical-resistance" },
  { id: "drawing-revision", title: "도면 리비전 관리", description: "프로젝트별 도면 버전 관리", icon: FileText, path: "/drawing-revision" },
  { id: "ladder-handrail", title: "사다리 · 핸드레일 제작 기준", description: "KOSHA GUIDE 기반 안전 기준 정리", icon: Shield, path: "/ladder-handrail" },
  { id: "ncr-report", title: "부적합보고서 관리", description: "프로젝트별 NCR 작성 및 관리", icon: ClipboardList, path: "/ncr-report" },
  { id: "document-management", title: "각종 서식 관리", description: "시방서 등 서식 업로드·다운로드 및 이력 관리", icon: FolderOpen, path: "/document-management" },
  { id: "worker-management", title: "작업자 관리", description: "프로젝트별 인원 관리 및 서류 업로드", icon: Users, path: "/worker-management" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary p-3 rounded-lg">
              <Settings className="w-10 h-10 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">월드테크 각종 프로그램 관리</h1>
              <p className="text-sm text-sidebar-foreground/70 mt-1">World Tech Program Management System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-6">프로그램 목록</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary" onClick={() => navigate(program.path)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <program.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">클릭하여 프로그램 실행</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-muted py-4 mt-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
