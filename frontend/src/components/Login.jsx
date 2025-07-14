import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, Wifi } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // DEBUG: Test connection function
  const testConnection = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Starting connection test...');
      const result = await authService.testConnection();
      setDebugInfo(result);
      
      if (result.success) {
        setError('✅ Conexão OK! O problema pode estar no login específico.');
      } else {
        setError(`❌ Problema de conexão: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setError(`❌ Erro no teste: ${error.message}`);
      setDebugInfo({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro ao digitar
    if (error) setError('');
    if (debugInfo) setDebugInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Credenciais inválidas. Verifique seu email e senha.');
        }
      } else {
        setError('Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reflex Som</h1>
          <p className="mt-2 text-gray-600">Sistema de Locação de Equipamentos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite seu email e senha para acessar o sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              {/* DEBUG: Botão de teste de conexão - REMOVER EM PRODUÇÃO */}
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={loading}
                className="w-full flex items-center gap-2"
              >
                <Wifi className="h-4 w-4" />
                {loading ? 'Testando...' : 'Testar Conexão (Debug)'}
              </Button>

              {/* DEBUG: Informações de debug */}
              {debugInfo && (
                <div className="w-full p-3 bg-gray-100 rounded-md text-xs">
                  <strong>Debug Info:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <strong>Console:</strong> Abra F12 → Console para mais detalhes
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link
                  to="/registro"
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se aqui
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;

