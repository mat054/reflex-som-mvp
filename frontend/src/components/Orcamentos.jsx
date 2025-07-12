import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orcamentoService, utils } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart
} from 'lucide-react';

const Orcamentos = () => {
  const { user } = useAuth();
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrcamentos();
  }, []);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const response = await orcamentoService.listar();
      setOrcamentos(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      rascunho: { label: 'Rascunho', variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      finalizado: { label: 'Finalizado', variant: 'default', className: 'bg-blue-100 text-blue-800' },
      convertido: { label: 'Convertido', variant: 'default', className: 'bg-green-100 text-green-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const OrcamentoCard = ({ orcamento }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">Orçamento #{orcamento.id}</CardTitle>
            <CardDescription>
              Criado em {utils.formatDate(orcamento.data_criacao)}
            </CardDescription>
          </div>
          {getStatusBadge(orcamento.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1" />
              <span>{orcamento.total_itens || 0} item(s)</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{utils.formatDate(orcamento.data_atualizacao)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-green-600">
              {utils.formatCurrency(orcamento.valor_total || 0)}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/orcamentos/${orcamento.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Link>
              </Button>
              {orcamento.status === 'finalizado' && (
                <Button size="sm" asChild>
                  <Link to={`/orcamentos/${orcamento.id}?action=reservar`}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Reservar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Orçamentos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus orçamentos e solicite reservas
            </p>
          </div>
          <Button asChild>
            <Link to="/orcamentos/criar">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Link>
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.length}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.filter(o => o.status === 'rascunho').length}
                  </p>
                  <p className="text-sm text-gray-600">Rascunhos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.filter(o => o.status === 'finalizado').length}
                  </p>
                  <p className="text-sm text-gray-600">Finalizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.filter(o => o.status === 'convertido').length}
                  </p>
                  <p className="text-sm text-gray-600">Convertidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Orçamentos */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : orcamentos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orcamentos.map((orcamento) => (
                <OrcamentoCard key={orcamento.id} orcamento={orcamento} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro orçamento para solicitar equipamentos
              </p>
              <Button asChild>
                <Link to="/orcamentos/criar">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Orçamento
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orcamentos;

