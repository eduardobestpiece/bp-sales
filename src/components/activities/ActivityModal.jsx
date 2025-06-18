import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CheckSquare,
  Plus,
  X,
  Edit,
  Clock as ClockIcon
} from "lucide-react";
import { Activity } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";

export default function ActivityModal({ activity, workflow, open, onClose, onSuccess, users = [], workflows = [], selectedCompany, isTemplateMode = false }) {
  const [formData, setFormData] = useState(null); // Inicia como nulo
  const [isLoading, setIsLoading] = useState(false);

  const initializeState = () => {
    let initialData;
    if (activity) {
      // Editando atividade/template existente
      initialData = {
        title: isTemplateMode ? activity.name : activity.title || "",
        description: activity.description || "",
        due_date: isTemplateMode ? activity.days_to_complete || 1 : (activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : ""),
        company_id: activity.company_id || selectedCompany || "",
        checklist: Array.isArray(activity.checklist) ? activity.checklist.map((item, index) => ({
          // Garante um ID único e estável para cada item do checklist
          id: item.id || `checklist-${Date.now()}-${index}`, 
          item: item.item || "",
          completed: item.completed || false,
          assigned_to: item.assigned_to || ""
        })) : [],
        // ... outros campos ...
        workflow_id: activity.workflow_id || "",
        priority: activity.priority || "medium",
        status: activity.status || "pending",
        assigned_to: activity.assigned_to || [],
        stage: activity.stage || "",
        custom_fields: activity.custom_fields || {},
      };
    } else {
      // Criando nova atividade/template
      const currentUser = users.find(u => u.email);
      initialData = {
        title: "",
        description: "",
        due_date: isTemplateMode ? 1 : "",
        company_id: selectedCompany || "",
        checklist: [],
        // ... outros campos ...
        workflow_id: isTemplateMode ? "" : (workflow?.id || ""),
        priority: "medium",
        status: "pending",
        assigned_to: currentUser ? [currentUser.id] : [],
        stage: isTemplateMode ? "" : (workflow?.stages?.[0]?.name || ""),
        custom_fields: {},
      };
    }
    setFormData(initialData);
  };
  
  useEffect(() => {
    if (open) {
      initializeState();
    }
  }, [activity, open, isTemplateMode]);


  const handleSave = async () => {
    if (!formData || !formData.title?.trim()) {
      alert("Nome/Título é obrigatório.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isTemplateMode) {
        const templateData = {
          name: formData.title,
          description: formData.description,
          // Remove o ID temporário do frontend antes de enviar para o backend
          checklist: formData.checklist.map(({ id, ...rest }) => rest),
          days_to_complete: parseInt(formData.due_date, 10) || 1,
          company_id: formData.company_id
        };

        if (activity) {
          await ActivityTemplate.update(activity.id, templateData);
        } else {
          await ActivityTemplate.create(templateData);
        }
      } else {
        // Lógica para salvar atividade normal
        if (activity) {
          await Activity.update(activity.id, formData);
        } else {
          await Activity.create(formData);
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addChecklistItem = () => {
    const newItem = {
      // Cria um ID único e estável para o novo item
      id: `new-checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item: "",
      completed: false,
      assigned_to: ""
    };
    
    setFormData(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem]
    }));
  };

  const updateChecklistItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId)
    }));
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Não renderiza nada se o formData ainda não foi inicializado
  if (!formData) return null;

  const completedItems = formData.checklist.filter(item => item.completed).length;
  const totalItems = formData.checklist.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-[#E50F5F]">
              {isTemplateMode ? (activity ? 'Editar Modelo' : 'Criar Novo Modelo') : 'Detalhes da Atividade'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-[#D9D9D9]">
                  {isTemplateMode ? "Nome do Modelo" : "Título da Atividade"}
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                  placeholder={isTemplateMode ? "Nome do Modelo" : "Título da Atividade"}
                />
              </div>
              
              <div>
                <Label className="text-[#D9D9D9]">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] min-h-[100px] mt-1"
                  placeholder="Adicione uma descrição..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#9CA3AF]" />
                  <Label className="text-lg font-semibold text-[#D9D9D9]">Checklist</Label>
                  {totalItems > 0 && (
                    <Badge variant="outline" className="border-[#656464] text-[#9CA3AF]">
                      {progressPercentage}%
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-[#E50F5F] hover:text-[#E50F5F]/80" 
                  onClick={addChecklistItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar item
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.checklist.length === 0 && (
                  <p className="text-[#9CA3AF] bg-[#131313] p-3 rounded border border-[#656464]">
                    Nenhum item no checklist. Clique em "Adicionar item" para começar.
                  </p>
                )}
                
                {formData.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded bg-[#131313] border border-[#656464]">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => updateChecklistItem(item.id, 'completed', checked)}
                      className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F]"
                    />
                    
                    <Input
                      value={item.item}
                      onChange={(e) => updateChecklistItem(item.id, 'item', e.target.value)}
                      className="flex-1 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                      placeholder="Item do checklist"
                    />

                    <Select
                      value={item.assigned_to || "unassigned"}
                      onValueChange={(value) => updateChecklistItem(item.id, 'assigned_to', value === "unassigned" ? "" : value)}
                    >
                      <SelectTrigger className="w-auto p-2 border-[#656464] bg-[#131313]">
                        <SelectValue placeholder="Atribuir" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        <SelectItem value="unassigned" className="text-[#D9D9D9]">Ninguém</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id} className="text-[#D9D9D9]">
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300" 
                      onClick={() => removeChecklistItem(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-[#131313] p-4 rounded-lg">
            {isTemplateMode && (
              <div className="space-y-2">
                <Label htmlFor="days_to_complete" className="text-[#9CA3AF]">Prazo (dias)</Label>
                <Input
                  id="days_to_complete"
                  type="number"
                  value={formData.due_date}
                  onChange={(e) => updateFormField('due_date', parseInt(e.target.value, 10) || 1)}
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                  placeholder="Ex: 3"
                  min="1"
                />
              </div>
            )}

            <Button 
              onClick={handleSave} 
              className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}