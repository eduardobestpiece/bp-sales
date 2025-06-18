import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-gradient-to-r from-[#E50F5F] to-[#FF1B6B] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-2xl">BP</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#D9D9D9]">BP Sales</h1>
        <p className="text-xl text-[#9CA3AF]">Sistema de Gestão de Vendas</p>
        
        <p className="text-[#9CA3AF]">Gerencie suas vendas, leads e equipe em um único lugar.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
          <div className="p-6 bg-[#1C1C1C] rounded-lg border border-[#656464]">
            <h3 className="text-xl font-semibold text-[#D9D9D9] mb-2">CRM Completo</h3>
            <p className="text-[#9CA3AF]">Gestão de leads e oportunidades</p>
          </div>
          
          <div className="p-6 bg-[#1C1C1C] rounded-lg border border-[#656464]">
            <h3 className="text-xl font-semibold text-[#D9D9D9] mb-2">Vendas</h3>
            <p className="text-[#9CA3AF]">Controle de vendas e comissões</p>
          </div>
          
          <div className="p-6 bg-[#1C1C1C] rounded-lg border border-[#656464]">
            <h3 className="text-xl font-semibold text-[#D9D9D9] mb-2">Relatórios</h3>
            <p className="text-[#9CA3AF]">Análises e insights detalhados</p>
          </div>
        </div>
        
        <div className="mt-12">
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white px-8 py-6 text-lg"
          >
            Acessar Sistema
          </Button>
        </div>
      </div>
      
      <footer className="mt-16 text-[#9CA3AF]">
        © 2024 BP Sales. Todos os direitos reservados.
      </footer>
    </div>
  );
} 