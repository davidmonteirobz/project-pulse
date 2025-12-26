import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";

const Relatorios = () => {
  const handleExportPDF = () => {
    toast.info("Funcionalidade de exportação em PDF será implementada na próxima fase.");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Export Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Relatórios de Projetos</h2>
            <p className="text-sm text-muted-foreground">
              Visualize e exporte dados consolidados dos projetos
            </p>
          </div>
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF (em breve)
          </Button>
        </div>

        {/* Empty State Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Horas Estimadas</TableHead>
                  <TableHead className="text-center">Horas Registradas</TableHead>
                  <TableHead className="text-center">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="w-12 h-12 mb-3 opacity-30" />
                      <p className="font-medium">Nenhum relatório disponível</p>
                      <p className="text-sm">Os relatórios serão exibidos aqui após a integração com o banco de dados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="shadow-sm border-l-4 border-l-chart-1">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <FileDown className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Próximas funcionalidades</h3>
                <p className="text-sm text-muted-foreground">
                  Na próxima fase, você poderá exportar relatórios em PDF com dados detalhados de cada projeto, 
                  incluindo horas trabalhadas, etapas concluídas e métricas de desempenho.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
