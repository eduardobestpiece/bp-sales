
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Shield, Camera } from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timezones = Intl.supportedValuesOf('timeZone');

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    timezone: "America/Sao_Paulo"
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        birth_date: currentUser.birth_date ? new Date(currentUser.birth_date).toISOString().split('T')[0] : "",
        timezone: currentUser.timezone || "America/Sao_Paulo"
      });
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    try {
      await UserEntity.updateMyUserData(formData);
      await loadUser();
      // Add a success toast notification here in the future
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      // Add an error toast notification here in the future
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#D9D9D9]">Configurações</h1>
          <p className="text-[#9CA3AF] mt-1">Gerencie suas preferências e dados pessoais</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1C1C1C] border border-[#656464]">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 bg-[#E50F5F]">
                      <AvatarFallback className="bg-[#E50F5F] text-white text-2xl font-bold">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 border-2 border-[#1C1C1C]"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#D9D9D9]">
                      {user?.full_name || 'Usuário'}
                    </h3>
                    <p className="text-[#9CA3AF]">{user?.email}</p>
                  </div>
                </div>

                {/* Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#9CA3AF]" htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]" htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="Digite seu email"
                      type="email"
                      disabled
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]" htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]" htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      type="date"
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]" htmlFor="timezone">Fuso Horário</Label>
                     <Select 
                        value={formData.timezone} 
                        onValueChange={(value) => handleInputChange('timezone', value)}
                      >
                        <SelectTrigger id="timezone" className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                          <SelectValue placeholder="Selecione o fuso horário" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-h-60">
                           {timezones.map(tz => (
                            <SelectItem key={tz} value={tz} className="focus:bg-[#E50F5F]/20">{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-[#656464]">
                  <Button
                    onClick={handleSave}
                    className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[#9CA3AF]">
                  Configurações de segurança em desenvolvimento
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
