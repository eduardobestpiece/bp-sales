
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  List,
  Settings,
  X
} from "lucide-react";
import { Activity } from "@/api/entities";
import { Workflow } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import WorkflowsList from "../components/activities/WorkflowsList";
import ActivitiesList from "../components/activities/ActivitiesList";
import CreateWorkflowModal from "../components/activities/CreateWorkflowModal";
import ActivityModal from "../components/activities/ActivityModal";

export default function Activities() {
  const { selectedCompanyId, setSelectedCompanyId, companies } = useContext(CompanyContext);
  const [workflows, setWorkflows] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [activeTab, setActiveTab] = useState("workflows");

  // Filtros específicos para cada aba
  const [workflowFilters, setWorkflowFilters] = useState({
    searchTerm: ""
  });

  const [activityFilters, setActivityFilters] = useState({
    searchTerm: "",
    assignedTo: "",
    workflowId: "",
    stage: "",
    companyId: selectedCompanyId || "all"
  });

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    // Sincronizar filtro de atividades com a empresa selecionada do contexto global
    setActivityFilters(prev => ({...prev, companyId: selectedCompanyId || 'all'}));
  }, [selectedCompanyId]);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);

      const [workflowsData, activitiesData, usersData] = await Promise.all([
        Workflow.list("-created_date"),
        Activity.list("-created_date"),
        UserEntity.list()
      ]);
      
      // Filter workflows that the current user has access to (public, invited, or created by user)
      const accessibleWorkflows = workflowsData.filter(w => 
        w.permissions === 'public' || 
        w.invited_users?.includes(user?.id) || 
        w.created_by === user?.email
      );
      
      const accessibleWorkflowIds = accessibleWorkflows.map(w => w.id);
      // Filter activities belonging to accessible workflows
      const userActivities = activitiesData.filter(a => 
        accessibleWorkflowIds.includes(a.workflow_id)
      );

      setWorkflows(accessibleWorkflows);
      setActivities(userActivities);
      setUsers(usersData);

    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
    }
    setIsLoading(false);
  };

  const handleCompanyChange = (companyId) => {
      setSelectedCompanyId(companyId);
  };
  
  const handleOpenWorkflow = (workflowId) => {
    setActiveTab("activities");
    setActivityFilters(prev => ({
      ...prev,
      workflowId: workflowId,
      searchTerm: "",
      assignedTo: "",
      stage: ""
    }));
  };

  const clearWorkflowFilter = () => {
    setActivityFilters(prev => ({
      ...prev,
      workflowId: "",
      stage: ""
    }));
  };

  const getSelectedWorkflow = () => {
    return workflows.find(w => w.id === activityFilters.workflowId);
  };
  
  const handleCreateActivity = () => {
    setShowCreateActivity(true);
  };

  const filteredWorkflows = workflows.filter(w => selectedCompanyId === 'all' || w.company_id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Atividades</h1>
            <p className="text-[#9CA3AF] mt-1">
              Gerencie seus workflows e tarefas
              {companies.find(c => c.id === selectedCompanyId)?.name && (
                <span className="ml-2 text-[#E50F5F]">• {companies.find(c => c.id === selectedCompanyId)?.name}</span>
              )}
            </p>
          </div>
          
          {/* Company Selector (Moved/Updated if necessary, but according to outline, it was removed from header) */}
          {/* Re-adding the company selector outside of the main h1/p div, but still within the overall header flex container */}
          <div className="flex items-center gap-4">
            <Select value={selectedCompanyId || "all"} onValueChange={handleCompanyChange}>
              <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] min-w-[200px]">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 focus:text-[#D9D9D9]">
                    Todas Empresas
                </SelectItem>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id} 
                    className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 focus:text-[#D9D9D9]"
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter */}
        {activityFilters.workflowId && (
          <div className="flex items-center gap-2 p-3 bg-[#1C1C1C] border border-[#E50F5F]/50 rounded-lg">
            <span className="text-sm text-[#D9D9D9]">Filtrando por workflow:</span>
            <Badge className="bg-[#E50F5F]/20 text-[#E50F5F] border-[#E50F5F]/30">
              {getSelectedWorkflow()?.name || 'Workflow'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWorkflowFilter}
              className="text-[#9CA3AF] hover:text-[#E50F5F] h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1C1C1C] border border-[#656464]">
            <TabsTrigger
              value="workflows"
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Lista de Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="mt-6">
            {/* Filtros específicos para Workflows */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Procurar por nome do Workflow..."
                  value={workflowFilters.searchTerm}
                  onChange={(e) => setWorkflowFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              <Button
                onClick={() => setShowCreateWorkflow(true)}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Workflow
              </Button>
            </div>

            <WorkflowsList
              workflows={filteredWorkflows}
              activities={activities}
              onRefresh={loadPageData}
              searchTerm={workflowFilters.searchTerm}
              onOpenWorkflow={handleOpenWorkflow}
            />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <ActivitiesList
              activities={activities}
              workflows={workflows}
              users={users}
              companies={companies}
              onRefresh={loadPageData}
              filters={activityFilters}
              setFilters={setActivityFilters}
              selectedWorkflow={getSelectedWorkflow()}
              onCreateActivityClick={handleCreateActivity}
            />
          </TabsContent>
        </Tabs>

        {/* Modais */}
        <CreateWorkflowModal
          open={showCreateWorkflow}
          onClose={() => setShowCreateWorkflow(false)}
          onSuccess={loadPageData}
          selectedCompany={selectedCompanyId}
        />

        <ActivityModal
          activity={null}
          workflow={workflows.find(w => w.id === activityFilters.workflowId)}
          open={showCreateActivity}
          onClose={() => setShowCreateActivity(false)}
          onSuccess={loadPageData}
          users={users}
          workflows={workflows}
          selectedCompany={selectedCompanyId}
        />
      </div>
    </div>
  );
}
