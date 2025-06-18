import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Calendar, Target, Settings, Building2 } from "lucide-react";

export default function AdvancedFiltersModal({ open, onClose, onApplyFilters, workflows, users, companies = [], initialFilters = {} }) {
  const [filters, setFilters] = useState(initialFilters);
  
  const [selectedWorkflowForStages, setSelectedWorkflowForStages] = useState(initialFilters.workflowId || "");

  useEffect(() => {
    if (open) {
      setFilters(initialFilters);
      setSelectedWorkflowForStages(initialFilters.workflowId || "");
    }
  }, [open, initialFilters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleWorkflowChange = (workflowId) => {
    handleFilterChange('workflowId', workflowId === "all" ? "" : workflowId);
    setSelectedWorkflowForStages(workflowId === "all" ? "" : workflowId);
    // Reset stage when workflow changes
    handleFilterChange('stage', ''); 
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    const cleared = {
      searchTerm: filters.searchTerm, // keep search term
      assignedTo: "",
      workflowId: "",
      stage: "",
      companyId: "",
      dueDates: [],
    };
    setFilters(cleared);
    setSelectedWorkflowForStages("");
    onApplyFilters(cleared);
    onClose();
  };

  const getSelectedWorkflow = () => {
    return workflows.find(w => w.id === selectedWorkflowForStages);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Filtros Avançados</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Empresa */}
          <div>
            <Label className="text-[#9CA3AF] mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </Label>
            <Select 
              value={filters.companyId || "all"} 
              onValueChange={(val) => handleFilterChange('companyId', val === "all" ? "" : val)}
            >
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Selecionar empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                <SelectItem value="all" className="text-[#D9D9D9]">Todas as empresas</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id} className="text-[#D9D9D9]">
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow */}
          <div>
            <Label className="text-[#9CA3AF] mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Workflow
            </Label>
            <Select value={filters.workflowId || "all"} onValueChange={handleWorkflowChange}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Selecionar workflow" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                <SelectItem value="all" className="text-[#D9D9D9]">Todos os workflows</SelectItem>
                {workflows.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id} className="text-[#D9D9D9]">
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fase - só aparece se workflow for selecionado */}
          {selectedWorkflowForStages && getSelectedWorkflow()?.stages && (
            <div>
              <Label className="text-[#9CA3AF] mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Fase
              </Label>
              <Select 
                value={filters.stage || "all"} 
                onValueChange={(val) => handleFilterChange('stage', val === "all" ? "" : val)}
              >
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Selecionar fase" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                  <SelectItem value="all" className="text-[#D9D9D9]">Todas as fases</SelectItem>
                  {getSelectedWorkflow().stages.map((stage, index) => (
                    <SelectItem key={index} value={stage.name} className="text-[#D9D9D9]">
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status (Removido para simplificar, a Fase já define o status) */}

          {/* Prioridade (Removido para simplificar) */}

          {/* Prazo */}
          <div>
            <Label className="text-[#9CA3AF] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Prazo
            </Label>
            <Select 
              value={filters.dueDates?.[0] || "all"} 
              onValueChange={(val) => handleFilterChange('dueDates', val === "all" ? [] : [val])}
            >
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Selecionar prazo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                <SelectItem value="all" className="text-[#D9D9D9]">Todas</SelectItem>
                <SelectItem value="today" className="text-[#D9D9D9]">Hoje</SelectItem>
                <SelectItem value="overdue" className="text-[#D9D9D9]">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 bg-[#131313]"
          >
            Limpar Filtros
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 bg-[#131313]"
            >
              Cancelar
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}