
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Settings } from "lucide-react";

const FIELD_TYPES = [
  { value: "checklist", label: "Checklist", icon: "☑️" },
  { value: "text", label: "Texto", icon: "📝" },
  { value: "textarea", label: "Texto Longo", icon: "📄" },
  { value: "url", label: "URL", icon: "🔗" },
  { value: "number", label: "Número", icon: "🔢" },
  { value: "reference", label: "Referência", icon: "🔗" },
  { value: "document", label: "Documento", icon: "📋" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "phone", label: "Telefone", icon: "📞" },
  { value: "address", label: "Endereço", icon: "📍" },
  { value: "radio", label: "Rádio", icon: "🔘" },
  { value: "dropdown", label: "Dropdown", icon: "📋" },
  { value: "multiple", label: "Seleção Múltipla", icon: "☑️" },
  { value: "dynamic", label: "Caixa Dinâmica", icon: "🔄" },
  { value: "date", label: "Data", icon: "📅" },
  { value: "time", label: "Hora", icon: "⏰" },
  { value: "datetime", label: "Data e Hora", icon: "📅⏰" },
  { value: "fullname", label: "Nome e Sobrenome", icon: "👤" },
  { value: "currency", label: "Valor Monetário", icon: "💰" }
];

const REFERENCE_TYPES = [
  { value: "spreadsheets", label: "Planilhas da plataforma" },
  { value: "workflows", label: "Workflows" },
  { value: "users", label: "Usuários" },
  { value: "companies", label: "Empresas" },
  { value: "lead_sources", label: "Origens de leads" },
  { value: "loss_reasons", label: "Motivo de perda" },
  { value: "products", label: "Produtos" },
  { value: "forms", label: "Formulários" },
  { value: "drive_links", label: "Links drive" },
  { value: "leads", label: "Leads" }
];

export default function CustomFieldEditor({ field, onChange, onRemove, availableUsers = [] }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = (updates) => {
    onChange({ ...field, ...updates });
  };

  const updateSettings = (settingKey, value) => {
    const newSettings = { ...field.settings, [settingKey]: value };
    updateField({ settings: newSettings });
  };

  const addChecklistItem = () => {
    const items = field.settings?.items || [];
    const newItems = [...items, { id: Date.now().toString(), name: "", assignee: "" }];
    updateSettings('items', newItems);
  };

  const updateChecklistItem = (itemId, updates) => {
    const items = field.settings?.items || [];
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateSettings('items', updatedItems);
  };

  const removeChecklistItem = (itemId) => {
    const items = field.settings?.items || [];
    const filteredItems = items.filter(item => item.id !== itemId);
    updateSettings('items', filteredItems);
  };

  const addDynamicField = () => {
    const dynamicFields = field.settings?.dynamic_fields || [];
    const newField = {
      id: Date.now().toString(),
      type: "text",
      label: "",
      settings: {}
    };
    updateSettings('dynamic_fields', [...dynamicFields, newField]);
  };

  const updateDynamicField = (fieldId, updates) => {
    const dynamicFields = field.settings?.dynamic_fields || [];
    const updatedFields = dynamicFields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    updateSettings('dynamic_fields', updatedFields);
  };

  const removeDynamicField = (fieldId) => {
    const dynamicFields = field.settings?.dynamic_fields || [];
    const filteredFields = dynamicFields.filter(f => f.id !== fieldId);
    updateSettings('dynamic_fields', filteredFields);
  };

  const parseOptions = (optionsText) => {
    if (!optionsText) return [];
    return optionsText.split(/[,\n]/).map(opt => opt.trim()).filter(opt => opt);
  };

  const renderFieldSpecificSettings = () => {
    switch (field.type) {
      case 'checklist':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[#9CA3AF]">Itens do Checklist</Label>
              <Button
                type="button"
                onClick={addChecklistItem}
                size="sm"
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            <div className="space-y-2">
              {(field.settings?.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 bg-[#1C1C1C] rounded border border-[#656464]">
                  <Input
                    placeholder="Nome do item"
                    value={item.name}
                    onChange={(e) => updateChecklistItem(item.id, { name: e.target.value })}
                    className="flex-1 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                  />
                  <Select 
                    value={item.assignee} 
                    onValueChange={(value) => updateChecklistItem(item.id, { assignee: value })}
                  >
                    <SelectTrigger className="w-48 bg-[#131313] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value={null}>Sem responsável</SelectItem>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id} className="text-[#D9D9D9]">
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reference':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.settings?.multiple || false}
                onCheckedChange={(checked) => updateSettings('multiple', checked)}
              />
              <Label className="text-[#D9D9D9]">Múltiplas seleções</Label>
            </div>
            
            <div>
              <Label className="text-[#9CA3AF]">Tipo de Referência</Label>
              <Select 
                value={field.settings?.reference_type || ""} 
                onValueChange={(value) => updateSettings('reference_type', value)}
              >
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                  {REFERENCE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-[#D9D9D9]">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {field.settings?.reference_type === 'users' && (
              <div>
                <Label className="text-[#9CA3AF]">Tipo de Pesquisa</Label>
                <Select 
                  value={field.settings?.search_type || "name"} 
                  onValueChange={(value) => updateSettings('search_type', value)}
                >
                  <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                    <SelectItem value="name" className="text-[#D9D9D9]">Nome</SelectItem>
                    <SelectItem value="email" className="text-[#D9D9D9]">Email</SelectItem>
                    <SelectItem value="phone" className="text-[#D9D9D9]">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 'radio':
      case 'dropdown':
      case 'multiple':
        return (
          <div>
            <Label className="text-[#9CA3AF]">Opções (separadas por vírgula ou quebra de linha)</Label>
            <Textarea
              placeholder="Opção 1, Opção 2, Opção 3&#10;ou&#10;Opção 1&#10;Opção 2&#10;Opção 3"
              value={field.settings?.options_text || ""}
              onChange={(e) => {
                updateSettings('options_text', e.target.value);
                updateSettings('options', parseOptions(e.target.value));
              }}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              rows={4}
            />
          </div>
        );

      case 'dynamic':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[#9CA3AF]">Campos da Caixa Dinâmica</Label>
              <Button
                type="button"
                onClick={addDynamicField}
                size="sm"
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Campo
              </Button>
            </div>
            
            <div className="space-y-3">
              {(field.settings?.dynamic_fields || []).map((dynField) => (
                <div key={dynField.id} className="flex items-center gap-2 p-3 bg-[#1C1C1C] rounded border border-[#656464]">
                  <Select 
                    value={dynField.type} 
                    onValueChange={(value) => updateDynamicField(dynField.id, { type: value })}
                  >
                    <SelectTrigger className="w-48 bg-[#131313] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      {FIELD_TYPES.filter(t => t.value !== 'dynamic').map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-[#D9D9D9]">
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Nome do campo"
                    value={dynField.label}
                    onChange={(e) => updateDynamicField(dynField.id, { label: e.target.value })}
                    className="flex-1 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                  />
                  
                  <Button
                    type="button"
                    onClick={() => removeDynamicField(dynField.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div>
              <Label className="text-[#9CA3AF]">Limite de itens (opcional)</Label>
              <Input
                type="number"
                placeholder="Ex: 5 (deixe vazio para ilimitado)"
                value={field.settings?.limit || ""}
                onChange={(e) => updateSettings('limit', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              />
            </div>
          </div>
        );

      case 'fullname':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.settings?.single_field || false}
              onCheckedChange={(checked) => updateSettings('single_field', checked)}
            />
            <Label className="text-[#D9D9D9]">Campo Único (exigir nome e sobrenome)</Label>
          </div>
        );

      case 'phone':
        return (
          <div>
            <Label className="text-[#9CA3AF]">DDI Padrão</Label>
            <Input
              placeholder="Ex: 55 (Brasil)"
              value={field.settings?.default_ddi || "55"}
              onChange={(e) => updateSettings('default_ddi', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
            />
          </div>
        );

      case 'currency':
        return (
          <div>
            <Label className="text-[#9CA3AF]">Moeda</Label>
            <Select 
              value={field.settings?.currency || "BRL"} 
              onValueChange={(value) => updateSettings('currency', value)}
            >
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                <SelectItem value="BRL" className="text-[#D9D9D9]">Real (BRL)</SelectItem>
                <SelectItem value="USD" className="text-[#D9D9D9]">Dólar (USD)</SelectItem>
                <SelectItem value="EUR" className="text-[#D9D9D9]">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-[#131313] border-[#656464]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-[#9CA3AF] cursor-move" />
            <div>
              <Badge variant="outline" className="text-xs border-[#656464] text-[#9CA3AF]">
                {FIELD_TYPES.find(t => t.value === field.type)?.icon} {FIELD_TYPES.find(t => t.value === field.type)?.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[#9CA3AF] hover:text-[#E50F5F]"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#9CA3AF]">Nome do Campo</Label>
            <Input
              placeholder="Ex: Observações do Cliente"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1"
            />
          </div>
          
          <div>
            <Label className="text-[#9CA3AF]">Tipo de Campo</Label>
            <Select 
              value={field.type} 
              onValueChange={(value) => updateField({ type: value, settings: {} })}
            >
              <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] max-h-80 overflow-y-auto">
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-[#D9D9D9] hover:bg-[#E50F5F]/20">
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={field.required || false}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
          <Label className="text-[#D9D9D9]">Campo obrigatório</Label>
        </div>

        {showAdvanced && (
          <div className="border-t border-[#656464] pt-4">
            <h4 className="text-[#D9D9D9] font-medium mb-3">Configurações Avançadas</h4>
            {renderFieldSpecificSettings()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
