import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  FileText, 
  Database, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
  User,
  LogOut,
  Activity,
  BookOpen,
  DollarSign,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User as UserEntity } from "@/api/entities";
import { Company } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Drive",
    url: createPageUrl("Drive"),
    icon: FileText,
  },
  {
    title: "Atividades",
    url: createPageUrl("Activities"),
    icon: Activity,
  },
  {
    title: "Playbooks",
    url: createPageUrl("Playbooks"),
    icon: BookOpen,
  },
  {
    title: "Formulários",
    url: createPageUrl("Forms"),
    icon: FileText,
  },
  {
    title: "Registros",
    url: createPageUrl("Records"),
    icon: Database,
  },
  {
    title: "CRM",
    url: createPageUrl("CRM"),
    icon: Target,
  },
  {
    title: "Cadastros",
    url: createPageUrl("Management"),
    icon: Users,
  },
  {
    title: "Comissionamentos",
    url: createPageUrl("Commissions"),
    icon: DollarSign,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => localStorage.getItem("selectedCompanyId") || "all");
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      
      const companiesData = await Company.list();
      const userCompanyRoles = currentUser.company_roles || [];
      
      let accessibleCompanies = [];
      
      const isParentOwner = userCompanyRoles.some(role => {
        const company = companiesData.find(c => c.id === role.company_id);
        return company && company.company_type === 'parent' && role.role_function === 'proprietario';
      });

      if (isParentOwner) {
        // Se for proprietário de uma empresa PAI, tem acesso a TODAS as empresas.
        accessibleCompanies = companiesData;
      } else {
        // Lógica para outros tipos de usuários
        if (userCompanyRoles.length > 0) {
          for (const role of userCompanyRoles) {
            const userCompany = companiesData.find(c => c.id === role.company_id);
            if (userCompany) {
              // Se o usuário é proprietário de uma empresa MÃE, pode ver sua empresa e as filhas
              if (userCompany.company_type === 'mother' && role.role_function === 'proprietario') {
                const childCompanies = companiesData.filter(c => 
                  c.parent_company_id === userCompany.id || c.id === userCompany.id
                );
                accessibleCompanies = [...accessibleCompanies, ...childCompanies];
              }
              // Para outras funções, pode ver apenas as empresas às quais está diretamente associado
              else {
                if (!accessibleCompanies.some(ac => ac.id === userCompany.id)) {
                  accessibleCompanies.push(userCompany);
                }
              }
            }
          }
          
          // Remover duplicatas
          accessibleCompanies = accessibleCompanies.filter((company, index, self) => 
            index === self.findIndex(c => c.id === company.id)
          );
        }
      }
      
      // WORKAROUND: If user has no companies, show all companies for demo/admin purposes
      if (accessibleCompanies.length === 0 && companiesData.length > 0) {
        accessibleCompanies = companiesData;
      }
      
      setCompanies(accessibleCompanies);
      
      const savedCompanyId = localStorage.getItem("selectedCompanyId");
      if (savedCompanyId === "all" || (savedCompanyId && accessibleCompanies.some(c => c.id === savedCompanyId))) {
        setSelectedCompanyId(savedCompanyId);
      } else if (accessibleCompanies.length > 0) {
        const newCompanyId = accessibleCompanies[0].id;
        setSelectedCompanyId(newCompanyId);
        localStorage.setItem("selectedCompanyId", newCompanyId);
      } else {
        // If no accessible companies and no valid saved ID, default to 'all'
        setSelectedCompanyId("all");
        localStorage.setItem("selectedCompanyId", "all");
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  }, []); 

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData) {
      navigate('/');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  useEffect(() => {
    // Não carrega dados do usuário/empresa na página pública de formulário
    if (currentPageName !== 'ViewForm') {
        loadInitialData();
    }
  }, [loadInitialData, currentPageName]);

  const handleCompanyChange = (companyId) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
      localStorage.setItem("selectedCompanyId", companyId);
      // Não recarregar a página - apenas atualizar o estado
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const selectedCompanyName = selectedCompanyId === "all" ? "Todas Empresas" : (companies.find(c => c.id === selectedCompanyId)?.name || "Nenhuma empresa");

  // Se for a página de formulário público, renderiza apenas o conteúdo
  if (currentPageName === 'ViewForm') {
    return <div className="bg-[#131313] min-h-screen">{children}</div>;
  }

  // Se não houver usuário, não renderiza o layout
  if (!user) {
    return null;
  }

  return (
    <CompanyContext.Provider value={{ selectedCompanyId, setSelectedCompanyId: handleCompanyChange, companies }}>
      <div className="min-h-screen bg-[#131313] text-[#D9D9D9] font-['DM_Sans']">
        <style>
          {`
            :root {
              --primary-bg: #131313;
              --secondary-bg: #1C1C1C;
              --accent-color: #E50F5F;
              --border-color: #656464;
              --text-color: #D9D9D9;
              --text-muted: #9CA3AF;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: var(--secondary-bg);
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--border-color);
              border-radius: 3px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: var(--accent-color);
            }

            /* Custom Calendar Styles for Dark Theme */
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-caption-font-size: 1rem;
              --rdp-background-color: #1C1C1C;
              --rdp-accent-color: #E50F5F;
              --rdp-accent-color-dark: #E50F5F;
              --rdp-background-color-dark: #1C1C1C;
              --rdp-outline: 2px solid var(--rdp-accent-color);
              --rdp-outline-selected: 3px solid var(--rdp-accent-color);
              --rdp-color: #D9D9D9;
              --rdp-font-family: 'DM_Sans', sans-serif;
            }
            .rdp-caption_label {
              color: var(--rdp-accent-color);
              font-weight: bold;
            }
            .rdp-nav_button {
              color: var(--rdp-accent-color);
            }
            .rdp-head_cell {
              color: #9CA3AF;
              font-size: 0.8rem;
              font-weight: bold;
            }
            .rdp-day {
              color: #D9D9D9;
            }
            .rdp-day:hover {
              background-color: rgba(229, 15, 95, 0.1);
            }
            .rdp-day_today {
              background-color: transparent;
              color: var(--rdp-accent-color);
              font-weight: bold;
            }
            .rdp-day_selected, .rdp-day_selected:focus, .rdp-day_selected:hover {
              background-color: #E50F5F;
              color: white;
            }
            .rdp-day_disabled {
              color: #656464;
            }
          `}
        </style>

        <div className="flex h-screen">
          {/* Sidebar - Desktop */}
          <div className={`hidden lg:flex ${isCollapsed ? 'w-16' : 'w-64'} bg-[#1C1C1C] border-r border-[#656464] transition-all duration-300 flex-col`}>
            {/* Header do Sidebar */}
            <div className="border-b border-[#656464] p-3">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-[#E50F5F] to-[#FF1B6B] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BP</span>
                  </div>
                  {!isCollapsed && (
                    <div>
                      <h2 className="font-bold text-[#D9D9D9] text-sm">BP Sales</h2>
                      <p className="text-xs text-[#9CA3AF]">Sales & CRM Platform</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-[#D9D9D9] hover:bg-[#656464]/20 hover:text-[#E50F5F] w-6 h-6"
                >
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </Button>
              </div>
              
              {!isCollapsed && (
                <div className="mt-3">
                  <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 h-8 text-sm">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem 
                        value="all" 
                        className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 hover:bg-[#E50F5F]/20"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          Todas Empresas
                        </div>
                      </SelectItem>
                      {companies.map((company) => (
                        <SelectItem 
                          key={company.id} 
                          value={company.id} 
                          className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 hover:bg-[#E50F5F]/20"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3" />
                            {company.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Navegação */}
            <div className="flex-1 p-2 custom-scrollbar overflow-y-auto">
              <div className="space-y-1">
                <div className={`text-xs font-medium text-[#9CA3AF] uppercase tracking-wider px-2 py-1 ${isCollapsed ? 'text-center' : ''}`}>
                  {isCollapsed ? "•••" : "Navegação"}
                </div>
                
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 py-2 px-2 rounded-md transition-all duration-200 text-sm ${
                      location.pathname === item.url 
                        ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                        : 'text-[#D9D9D9] hover:bg-[#E50F5F]/10 hover:text-[#E50F5F]'
                    } ${isCollapsed ? 'justify-center px-2' : 'px-2'}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer do Sidebar */}
            <div className="border-t border-[#656464] p-3">
              <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Link 
                  to={createPageUrl("Settings")} 
                  className="flex items-center gap-2 flex-1 hover:bg-[#656464]/20 p-2 rounded-md transition-colors"
                >
                  <Avatar className="w-6 h-6 bg-[#E50F5F]">
                    <AvatarFallback className="bg-[#E50F5F] text-white text-xs font-semibold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#D9D9D9] text-xs truncate">
                        {user?.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-[#9CA3AF] truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  )}
                </Link>
                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 w-6 h-6"
                  >
                    <LogOut className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Mobile */}
          <div className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-[#1C1C1C] border-r border-[#656464] transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Mesmo conteúdo do sidebar desktop */}
            <div className="border-b border-[#656464] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#E50F5F] to-[#FF1B6B] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BP</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-[#D9D9D9] text-sm">BP Sales</h2>
                    <p className="text-xs text-[#9CA3AF]">Sales & CRM Platform</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#D9D9D9] hover:bg-[#656464]/20 hover:text-[#E50F5F] w-6 h-6"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="mt-3">
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 h-8 text-sm">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                    <SelectItem 
                      value="all" 
                      className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 hover:bg-[#E50F5F]/20"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        Todas Empresas
                      </div>
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem 
                        key={company.id} 
                        value={company.id} 
                        className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 hover:bg-[#E50F5F]/20"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          {company.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex-1 p-2 custom-scrollbar overflow-y-auto">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider px-2 py-1">
                  Navegação
                </div>
                
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 py-2 px-2 rounded-md transition-all duration-200 text-sm ${
                      location.pathname === item.url 
                        ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                        : 'text-[#D9D9D9] hover:bg-[#E50F5F]/10 hover:text-[#E50F5F]'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#656464] p-3">
              <div className="flex items-center gap-2">
                <Link 
                  to={createPageUrl("Settings")} 
                  className="flex items-center gap-2 flex-1 hover:bg-[#656464]/20 p-2 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Avatar className="w-6 h-6 bg-[#E50F5F]">
                    <AvatarFallback className="bg-[#E50F5F] text-white text-xs font-semibold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#D9D9D9] text-xs truncate">
                      {user?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-[#9CA3AF] truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 w-6 h-6"
                >
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Overlay Mobile */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header Mobile */}
            <header className="lg:hidden bg-[#1C1C1C] border-b border-[#656464] px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-[#D9D9D9] hover:bg-[#656464]/20 hover:text-[#E50F5F]"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-semibold text-[#D9D9D9]">BP Sales</h1>
              </div>
            </header>

            {/* Área de Conteúdo */}
            <main className="flex-1 bg-[#131313] overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </CompanyContext.Provider>
  );
}

