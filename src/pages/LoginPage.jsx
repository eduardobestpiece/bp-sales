import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserEntity } from '@/api/entities';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verificação hardcoded para o usuário específico
      if (email === 'eduardocostav4@gmail.com' && password === 'admin') {
        // Simular login bem-sucedido
        localStorage.setItem('user', JSON.stringify({
          email: 'eduardocostav4@gmail.com',
          full_name: 'Eduardo Costa',
          role: 'admin'
        }));
        navigate('/dashboard');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#E50F5F] to-[#FF1B6B] rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-bold text-2xl">BP</span>
          </div>
          <h2 className="text-3xl font-bold text-[#D9D9D9]">Bem-vindo ao BP Sales</h2>
          <p className="mt-2 text-[#9CA3AF]">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-[#1C1C1C] p-8 rounded-lg border border-[#656464]">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#D9D9D9]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#D9D9D9]">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-[#E50F5F] text-sm mt-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white py-6"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-[#9CA3AF] text-sm">
          © 2024 BP Sales. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
} 