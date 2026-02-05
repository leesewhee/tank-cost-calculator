 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Cylinder, FileText, Settings } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 
 const programs = [
   {
     id: "tank-quotation",
     title: "FRP 탱크 견적 시스템",
     description: "자동 수량 산출 및 견적 계산",
     icon: Cylinder,
     path: "/tank-quotation",
   },
   {
     id: "drawing-revision",
     title: "도면 리비전 관리",
     description: "프로젝트별 도면 버전 관리",
     icon: FileText,
     path: "/drawing-revision",
   },
 ];
 
 const Dashboard = () => {
   const navigate = useNavigate();
 
   return (
     <div className="min-h-screen bg-background">
       {/* 헤더 */}
       <header className="bg-sidebar text-sidebar-foreground py-8">
         <div className="container max-w-6xl mx-auto px-4">
           <div className="flex items-center gap-3">
             <div className="bg-sidebar-primary p-3 rounded-lg">
               <Settings className="w-10 h-10 text-sidebar-primary-foreground" />
             </div>
             <div>
               <h1 className="text-3xl font-bold">월드테크 각종 프로그램 관리</h1>
               <p className="text-sm text-sidebar-foreground/70 mt-1">
                 World Tech Program Management System
               </p>
             </div>
           </div>
         </div>
       </header>
 
       {/* 프로그램 목록 */}
       <main className="container max-w-6xl mx-auto px-4 py-12">
         <h2 className="text-xl font-semibold mb-6">프로그램 목록</h2>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {programs.map((program) => (
             <Card
               key={program.id}
               className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary"
               onClick={() => navigate(program.path)}
             >
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
                 <p className="text-sm text-muted-foreground">
                   클릭하여 프로그램 실행
                 </p>
               </CardContent>
             </Card>
           ))}
         </div>
       </main>
 
       {/* 푸터 */}
       <footer className="bg-muted py-4 mt-8">
         <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
           <p>경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357</p>
         </div>
       </footer>
     </div>
   );
 };
 
 export default Dashboard;