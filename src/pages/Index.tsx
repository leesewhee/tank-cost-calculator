import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TankInputForm } from "@/components/TankInputForm";
import { QuotationResult } from "@/components/QuotationResult";
import {
  TankDimensions,
  MaterialPrices,
  LaborPrices,
  FixedCosts,
  SafetyMargins,
  ThicknessConfig,
  CalculationResult,
  calculateTank,
  defaultMaterialPrices,
  defaultLaborPrices,
  defaultThickness,
} from "@/lib/calculations";
import { calculateTankExcel, ExcelCalculationResult } from "@/lib/excelCalculations";
import { Cylinder, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [excelResult, setExcelResult] = useState<ExcelCalculationResult | null>(null);
  const [dimensions, setDimensions] = useState<TankDimensions | null>(null);
  const [materialPrices, setMaterialPrices] = useState<MaterialPrices>(defaultMaterialPrices);
  const [laborPrices, setLaborPrices] = useState<LaborPrices>(defaultLaborPrices);
  const [thickness, setThickness] = useState<ThicknessConfig>(defaultThickness);
  const [useExcelPrimary, setUseExcelPrimary] = useState(false);
  const navigate = useNavigate();
  
  const handleCalculate = (
    dims: TankDimensions,
    matPrices: MaterialPrices,
    labPrices: LaborPrices,
    fixedCosts: FixedCosts,
    safetyMargins: SafetyMargins,
    thicknessConfig: ThicknessConfig
  ) => {
    const calculationResult = calculateTank(
      dims, matPrices, labPrices, fixedCosts, safetyMargins, thicknessConfig
    );
    const excelCalcResult = calculateTankExcel(
      dims, matPrices, labPrices, fixedCosts, safetyMargins, thicknessConfig
    );
    
    setResult(calculationResult);
    setExcelResult(excelCalcResult);
    setDimensions(dims);
    setMaterialPrices(matPrices);
    setLaborPrices(labPrices);
    setThickness(thicknessConfig);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-sidebar text-sidebar-foreground py-6 print:hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <Cylinder className="w-8 h-8 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FRP 탱크 견적 시스템</h1>
                <p className="text-sm text-sidebar-foreground/70">
                  자동 수량 산출 및 견적 계산
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
              <FileSpreadsheet className="w-4 h-4" />
              <span>World Quotation System</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="print:hidden">
            <TankInputForm onCalculate={handleCalculate} />
          </div>
          
          {/* 결과 */}
          <div className="lg:col-span-1 print:col-span-full">
            {result && excelResult && dimensions ? (
              <QuotationResult
                result={result}
                excelResult={excelResult}
                dimensions={dimensions}
                materialPrices={materialPrices}
                laborPrices={laborPrices}
                thickness={thickness}
                useExcelPrimary={useExcelPrimary}
                onTogglePrimary={setUseExcelPrimary}
              />
            ) : (
              <div className="section-card flex flex-col items-center justify-center min-h-[400px] text-center">
                <Cylinder className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  견적 결과가 여기에 표시됩니다
                </h3>
                <p className="text-sm text-muted-foreground/70">
                  탱크 사이즈를 입력하고 "견적 계산하기" 버튼을 클릭하세요
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* 푸터 */}
      <footer className="bg-muted py-4 mt-8 print:hidden">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
