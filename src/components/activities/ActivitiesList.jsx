
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Calendar, Flag, Filter, Plus, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserEntity } from "@/api/entities";
import { Activity } from "@/api/entities";
import ActivityModal from "./ActivityModal";
import DeleteActivityModal from "./DeleteActivityModal";
import AdvancedFiltersModal from "./AdvancedFiltersModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import CreateActivityDropdown from "./CreateActivityDropdown";

function BulkActionsBar({ selectedIds, users, workflows, onApply, onClear }) {
    const [action, setAction] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [targetWorkflowId, setTargetWorkflowId] = useState('');
    const [targetStage, setTargetStage] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const targetWorkflow = workflows.find(w => w.id === targetWorkflowId);

    const handleApply = () => {
        let updates = {};
        if (action === 'assign' && targetUserId) {
            updates.assigned_to = [targetUserId];
        }
        if (action === 'move' && targetWorkflowId && targetStage) {
            updates.workflow_id = targetWorkflowId;
            updates.stage = targetStage;
        }
        if (action === 'set_due_date' && dueDate) {
            updates.due_date = dueDate.toISOString();
        }
        
        if (action === 'delete' && deleteConfirm === 'Excluir tudo') {
            onApply({ action: 'delete' });
        } else if (action !== 'delete') {
            onApply({ action, updates });
        }
    };
    
    return (
        <div className="p-4 bg-[#1C1C1C] border border-[#E50F5F] rounded-lg mb-6 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-[#D9D9D9]">{selectedIds.length} atividade(s) selecionada(s)</span>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Select value={action} onValueChange={(value) => { setAction(value); setTargetUserId(''); setTargetWorkflowId(''); setTargetStage(''); setDueDate(null); setDeleteConfirm(''); }}>
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                        <SelectValue placeholder="Ação em massa..."/>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectItem value="assign" className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">Atribuir responsável</SelectItem>
                        <SelectItem value="move" className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">Mover para workflow</SelectItem>
                        <SelectItem value="set_due_date" className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">Definir prazo</SelectItem>
                        <SelectItem value="delete" className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">Excluir</SelectItem>
                    </SelectContent>
                </Select>

                {action === 'assign' && (
                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                        <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                            <SelectValue placeholder="Selecionar usuário"/>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                            {users.map(u => (
                                <SelectItem key={u.id} value={u.id} className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">
                                    {u.full_name || u.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {action === 'move' && (
                    <>
                        <Select value={targetWorkflowId} onValueChange={setTargetWorkflowId}>
                            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                <SelectValue placeholder="Workflow"/>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                {workflows.map(w => (
                                    <SelectItem key={w.id} value={w.id} className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {targetWorkflow && (
                             <Select value={targetStage} onValueChange={setTargetStage}>
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                    <SelectValue placeholder="Fase"/>
                                    </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                    {targetWorkflow.stages.map(s => (
                                        <SelectItem key={s.name} value={s.name} className="text-[#D9D9D9] hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20">
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </>
                )}

                {action === 'set_due_date' && (
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                {dueDate ? dueDate.toLocaleDateString('pt-BR') : "Selecionar data"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                            <CalendarPicker mode="single" selected={dueDate} onSelect={setDueDate} initialFocus/>
                        </PopoverContent>
                    </Popover>
                )}

                {action === 'delete' && (
                    <Input 
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9]" 
                        placeholder='Digite "Excluir tudo"' 
                        value={deleteConfirm} 
                        onChange={e => setDeleteConfirm(e.target.value)} 
                    />
                )}
            </div>
            <Button 
                onClick={handleApply} 
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
                disabled={
                    (action === 'assign' && !targetUserId) ||
                    (action === 'move' && (!targetWorkflowId || !targetStage)) ||
                    (action === 'set_due_date' && !dueDate) ||
                    (action === 'delete' && deleteConfirm !== 'Excluir tudo') ||
                    !action
                }
            >
                Aplicar
            </Button>
            <Button 
                onClick={onClear} 
                variant="ghost" 
                className="text-[#D9D9D9] hover:bg-[#1C1C1C] hover:text-[#E50F5F]"
            >
                Limpar Seleção
            </Button>
        </div>
    )
}


export default function ActivitiesList({ 
  activities, 
  workflows, 
  users,
  companies, // Receive companies prop
  onRefresh, 
  filters = {},
  setFilters, // Receive setFilters prop
  selectedWorkflow,
  onCreateActivityClick
}) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);

  const loadCurrentUser = async () => {
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleUpdateActivity = async (activityId, updates) => {
    try {
      await Activity.update(activityId, updates);
      onRefresh();
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
    }
  };
  
  const handleUpdateChecklist = (activity, itemId, itemUpdates) => {
    const newChecklist = activity.checklist.map(item =>
      item.id === itemId ? { ...item, ...itemUpdates } : item
    );
    handleUpdateActivity(activity.id, { checklist: newChecklist });
  };
  
  const applyAdvancedFilters = (advancedFilters) => {
    setFilters(prev => ({ ...prev, ...advancedFilters }));
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !filters.searchTerm || 
      activity.title?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesAssignedTo = !filters.assignedTo || 
      (activity.assigned_to && activity.assigned_to.includes(filters.assignedTo));
    
    const matchesWorkflow = !filters.workflowId || 
      activity.workflow_id === filters.workflowId;
    
    const matchesStage = !filters.stage || 
      activity.stage === filters.stage;

    // Corrigir lógica de filtro por empresa - permitir "all"
    const matchesCompany = !filters.companyId || 
      filters.companyId === 'all' || 
      activity.company_id === filters.companyId;

    let matchesAdvancedDate = true;
    if (filters.dueDates?.length) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activityDate = activity.due_date ? new Date(activity.due_date) : null;
      if (activityDate) {
        activityDate.setHours(0, 0, 0, 0);
      }
      
      matchesAdvancedDate = filters.dueDates.some(dateFilter => {
        if (dateFilter === 'all') return true;
        if (dateFilter === 'today' && activityDate) {
          return activityDate.getTime() === today.getTime();
        }
        if (dateFilter === 'overdue' && activityDate) {
          return activityDate < today;
        }
        return false;
      });
    }

    return matchesSearch && matchesAssignedTo && matchesWorkflow && matchesStage && 
           matchesCompany && matchesAdvancedDate;
  });

  const getWorkflowName = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow?.name || 'Workflow não encontrado';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || 'Usuário';
  };

  const getUser = (userId) => {
    return users.find(u => u.id === userId);
  };

  const getStatusBadge = (stageType) => {
    const stageTypeConfig = {
      pending: { color: 'bg-gray-500' },
      in_progress: { color: 'bg-blue-500' },
      completed: { color: 'bg-green-500' },
      cancelled: { color: 'bg-red-500' }
    };
    
    const config = stageTypeConfig[stageType] || stageTypeConfig.pending;
    return (
      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
    );
  };

  const getPriorityFlag = (priority) => {
    const colors = {
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return <Flag className={`w-4 h-4 ${colors[priority] || 'text-gray-400'}`} />;
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const handleDelete = (activity) => {
    setSelectedActivity(activity);
    setShowDelete(true);
  };
  
  const handleActivityClick = (e, activityId) => {
      if (e.ctrlKey || e.metaKey) {
          setSelectedActivityIds(prev => 
              prev.includes(activityId) 
                  ? prev.filter(id => id !== activityId) 
                  : [...prev, activityId]
          );
      } else {
          if (!selectedActivityIds.includes(activityId) || selectedActivityIds.length > 1) {
              setSelectedActivityIds([activityId]);
          } else {
              setSelectedActivityIds([]);
          }
      }
  };

  const handleApplyBulkActions = async ({ action, updates }) => {
      try {
          if (action === 'delete') {
              await Activity.bulkDelete(selectedActivityIds);
          } else {
              await Activity.bulkUpdate(selectedActivityIds, updates);
          }
          setSelectedActivityIds([]);
          onRefresh();
      } catch (error) {
          console.error("Erro ao aplicar ação em massa:", error);
      }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
          <Input
            placeholder="Procurar por nome da atividade..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {users.slice(0, 4).map((user) => (
            <Avatar 
              key={user.id} 
              className={`w-8 h-8 cursor-pointer border-2 transition-all ${
                filters.assignedTo === user.id 
                  ? 'border-[#E50F5F] bg-[#E50F5F]' 
                  : 'border-[#656464] bg-[#656464] hover:border-[#E50F5F]/50'
              }`}
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                assignedTo: prev.assignedTo === user.id ? "" : user.id 
              }))}
            >
              <AvatarFallback className={`text-white text-xs ${
                filters.assignedTo === user.id ? 'bg-[#E50F5F]' : 'bg-[#656464]'
              }`}>
                {user.full_name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        <Button
          onClick={() => setShowAdvancedFilters(true)}
          variant="outline"
          className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F] hover:text-[#E50F5F] bg-[#131313]"
        >
          <Filter className="w-4 h-4 mr-2" />
          + Filtros
        </Button>

        <CreateActivityDropdown 
          onCreateNew={onCreateActivityClick}
          workflows={workflows}
          users={users}
          onRefresh={onRefresh}
        />
      </div>

       {selectedActivityIds.length > 1 && (
          <BulkActionsBar 
              selectedIds={selectedActivityIds}
              users={users}
              workflows={workflows}
              onApply={handleApplyBulkActions}
              onClear={() => setSelectedActivityIds([])}
          />
       )}

      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9]">Atividades ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                {Object.values(filters).some(f => f) || Object.values(filters).some(f => f && f !== "" && f !== null && Object.keys(f).length > 0) ? 
                  "Nenhuma atividade encontrada com os filtros aplicados" : 
                  "Nenhuma atividade cadastrada"
                }
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const activityWorkflow = workflows.find(w => w.id === activity.workflow_id);
                const activityStage = activityWorkflow?.stages.find(s => s.name === activity.stage);
                const stageType = activityStage?.type || 'pending';

                const canModify = currentUser?.role_function === 'administrador' || activity.assigned_to?.includes(currentUser?.id) || activity.created_by === currentUser?.email;

                return (
                  <div key={activity.id}>
                    <div 
                        onClick={(e) => handleActivityClick(e, activity.id)} 
                        className={`flex items-center justify-between p-3 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors cursor-pointer 
                            ${selectedActivityIds.includes(activity.id) ? 'border-[#E50F5F]' : ''}
                            ${expandedActivityId === activity.id ? 'rounded-b-none' : ''}
                        `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getStatusBadge(stageType)}
                          
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-[#D9D9D9] truncate text-sm">{activity.title}</h3>
                                  {getPriorityFlag(activity.priority)}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                                  <span className="truncate">{getWorkflowName(activity.workflow_id)}</span>
                                  <Select
                                    value={activity.stage}
                                    onValueChange={(newStage) => handleUpdateActivity(activity.id, { stage: newStage })}
                                  >
                                    <SelectTrigger className="text-xs h-6 p-1 border-none bg-transparent hover:bg-[#656464]/20 w-auto">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                      {workflows.find(w => w.id === activity.workflow_id)?.stages.map((stage, i) => (
                                        <SelectItem key={i} value={stage.name} className="focus:bg-[#E50F5F]/20">{stage.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-2">
                           <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-xs h-6 p-1 text-[#9CA3AF] hover:bg-[#656464]/20 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {activity.due_date ? new Date(activity.due_date).toLocaleDateString('pt-BR') : 'Prazo'}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                                  <CalendarPicker
                                    mode="single"
                                    selected={activity.due_date ? new Date(activity.due_date) : null}
                                    onSelect={(date) => handleUpdateActivity(activity.id, { due_date: date?.toISOString() })}
                                    initialFocus
                                  />
                              </PopoverContent>
                          </Popover>
                          
                          {activity.assigned_to && activity.assigned_to.length > 0 && (
                              <div className="flex items-center gap-1">
                                  <div className="flex -space-x-1">
                                      {activity.assigned_to.slice(0, 2).map((userId) => (
                                          <Avatar key={userId} className="w-6 h-6 bg-[#E50F5F] border border-[#1C1C1C]">
                                              <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                                                  {getUserName(userId).charAt(0)}
                                              </AvatarFallback>
                                          </Avatar>
                                      ))}
                                      {activity.assigned_to.length > 2 && (
                                          <div className="w-6 h-6 bg-[#656464] rounded-full border border-[#1C1C1C] flex items-center justify-center">
                                              <span className="text-xs text-white">+{activity.assigned_to.length - 2}</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          <div className="flex items-center gap-1">
                              {activity.checklist?.length > 0 && (
                                  <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="w-8 h-8 text-[#9CA3AF] hover:text-[#E50F5F]" 
                                      onClick={(e) => { e.stopPropagation(); setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id); }}
                                  >
                                      {expandedActivityId === activity.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                  </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditActivity(activity); }} className="text-[#9CA3AF] hover:text-[#E50F5F] h-8 w-8" disabled={!canModify}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(activity); }} className="text-[#9CA3AF] hover:text-red-500 h-8 w-8" disabled={!canModify}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                      </div>
                    </div>
                    {expandedActivityId === activity.id && activity.checklist?.length > 0 && (
                      <div className="pl-10 pr-4 py-3 bg-[#131313] border-l border-r border-b border-[#656464] rounded-b-lg space-y-2">
                        {activity.checklist.map(item => {
                          const assignedUser = getUser(item.assigned_to);
                          return (
                            <div key={item.id} className="flex items-center gap-3 text-sm py-1">
                                <Checkbox 
                                  checked={item.completed} 
                                  onCheckedChange={(checked) => handleUpdateChecklist(activity, item.id, { completed: checked })}
                                  className="border-gray-500 data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                                />
                                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{item.item}</span>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={item.assigned_to || 'unassigned'}
                                    onValueChange={(userId) => handleUpdateChecklist(activity, item.id, { assigned_to: userId === 'unassigned' ? null : userId })}
                                  >
                                    <SelectTrigger className="w-8 h-8 rounded-full p-0 border-none bg-transparent flex items-center justify-center hover:bg-gray-700">
                                      <SelectValue asChild>
                                          <Avatar className="w-7 h-7">
                                            {assignedUser ? (
                                              <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                                                  {assignedUser.full_name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'U'}
                                              </AvatarFallback>
                                            ) : (
                                              <AvatarFallback className="bg-gray-600 text-white text-xs">?</AvatarFallback>
                                            )}
                                          </Avatar>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                      <SelectItem value="unassigned" className="focus:bg-[#E50F5F]/20">Ninguém</SelectItem>
                                      {users.map(u => (
                                        <SelectItem key={u.id} value={u.id} className="focus:bg-[#E50F5F]/20">
                                          {u.full_name || u.email}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ActivityModal 
        activity={selectedActivity}
        workflow={selectedWorkflow}
        open={showActivityModal}
        onClose={() => {
          setShowActivityModal(false);
          setSelectedActivity(null);
        }}
        onSuccess={onRefresh}
        workflows={workflows}
        users={users}
        currentUser={currentUser}
      />
      
      <DeleteActivityModal 
        activity={selectedActivity}
        open={showDelete}
        onClose={() => {
          setShowDelete(false);
          setSelectedActivity(null);
        }}
        onSuccess={onRefresh}
      />

      <AdvancedFiltersModal
        open={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={applyAdvancedFilters}
        workflows={workflows}
        users={users}
        companies={companies}
        initialFilters={filters}
      />
    </>
  );
}
