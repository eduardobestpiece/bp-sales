
import React, { useState, useEffect, useContext } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Plus,
  Settings as SettingsIcon,
  Calendar,
  BarChart3,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/api/entities";
import { Sale } from "@/api/entities";
import { Deal } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import MetricCard from "../components/dashboard/MetricCard";
import TimeChart from "../components/dashboard/TimeChart";
import MetricsModal from "../components/dashboard/MetricsModal";

export default function Dashboard() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [metrics, setMetrics] = useState({
    leads: 0,
    sales: 0,
    revenue: 0,
    conversion: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [dateFilter, setDateFilter] = useState("last_30_days");

  useEffect(() => {
    if (selectedCompanyId) {
      loadDashboardData();
    }
  }, [dateFilter, selectedCompanyId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [allLeads, allSales, allDeals] = await Promise.all([
        Lead.list("-created_date"),
        Sale.list("-created_date"),
        Deal.list("-created_date")
      ]);

      const leads = allLeads.filter(l => l.company_id === selectedCompanyId);
      const sales = allSales.filter(s => {
          const leadForSale = allLeads.find(l => l.id === s.lead_id);
          return leadForSale && leadForSale.company_id === selectedCompanyId;
      });
      // Assuming deals have a direct company_id or can be linked through lead
      // For now, let's assume direct link is needed or filter through lead
      const deals = allDeals.filter(d => {
          const leadForDeal = allLeads.find(l => l.id === d.lead_id);
          return leadForDeal && leadForDeal.company_id === selectedCompanyId;
      });

      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.value || 0), 0);
      const conversionRate = leads.length > 0 ? (sales.length / leads.length) * 100 : 0;

      setMetrics({
        leads: leads.length,
        sales: sales.length,
        revenue: totalRevenue,
        conversion: conversionRate
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full min-h-screen bg-[#131313] p-4 lg:p-6">
      <div className="w-full max-w-none mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#D9D9D9]">Dashboard</h1>
            <p className="text-[#9CA3AF] mt-1">Visão geral das suas vendas e performance</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F] hover:text-[#E50F5F] bg-transparent"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button
              onClick={() => setShowMetricsModal(true)}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white border-none"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Associar Dados
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Total de Leads"
            value={metrics.leads}
            icon={Users}
            color="blue"
            trend="+12% este mês"
            isLoading={isLoading}
          />
          <MetricCard
            title="Vendas"
            value={metrics.sales}
            icon={Target}
            color="green"
            trend="+8% este mês"
            isLoading={isLoading}
          />
          <MetricCard
            title="Faturamento"
            value={formatCurrency(metrics.revenue)}
            icon={DollarSign}
            color="purple"
            trend="+15% este mês"
            isLoading={isLoading}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${metrics.conversion.toFixed(1)}%`}
            icon={TrendingUp}
            color="orange"
            trend="+5% este mês"
            isLoading={isLoading}
          />
        </div>

        {/* Gráfico de Tempo */}
        <Card className="bg-[#1C1C1C] border-[#656464] w-full">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[#D9D9D9]">Performance ao Longo do Tempo</CardTitle>
              <p className="text-[#9CA3AF] text-sm mt-1">Evolução das suas métricas principais</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-[#656464] text-[#D9D9D9] bg-transparent">
                <Calendar className="w-3 h-3 mr-1" />
                Últimos 30 dias
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#E50F5F] hover:border-[#E50F5F] bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Métrica
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <TimeChart />
          </CardContent>
        </Card>

        {/* Botão Adicionar Gráficos */}
        <Card className="bg-[#1C1C1C] border-[#656464] border-dashed w-full">
          <CardContent className="flex items-center justify-center py-12">
            <Button
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F] hover:text-[#E50F5F] bg-transparent"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Adicionar Gráficos
            </Button>
          </CardContent>
        </Card>

        {/* Modal de Métricas */}
        <MetricsModal 
          open={showMetricsModal}
          onClose={() => setShowMetricsModal(false)}
        />
      </div>
    </div>
  );
}
