import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservaService, utils } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Eye,
  MapPin,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Reservas = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await reservaService.listar();
      setReservas(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pendente: { 
        label: 'Pendente', 
        variant: 'secondary', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      aprovada: { 
        label: 'Aprovada', 
        variant: 'default', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      rejeitada: { 
        label: 'Rejeitada', 
        variant: 'destructive', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      ativa: { 
        label: 'Ativa', 
        variant: 'default', 
        className: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
      },
      concluida: { 
        label: 'Concluída', 
        variant: 'outline', 
        className: 'bg-gray-100 text-gray-800',
        icon: CheckCircle
      },
      cancelada: { 
        label: 'Cancelada', 
        variant: 'destructive', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
    };
    
    const statusInfo = statusMap[status] || { 
      label: status, 
      variant: 'outline',
      icon: AlertCircle
    };
    
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'text-yellow-600',
      aprovada: 'text-green-600',
      rejeitada: 'text-red-600',
      ativa: 'text-blue-600',
      concluida: 'text-gray-600',
      cancelada: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const ReservaCard = ({ reserva }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">Reserva #{reserva.id}</CardTitle>
            <CardDescription>
              Criada em {utils.formatDate(reserva.data_criacao)}
            </CardDescription>
          </div>
          {getStatusBadge(reserva.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Data do evento: {utils.formatDate(reserva.data_uso)}</span>
          </div>

          {reserva.local_evento && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{reserva.local_evento}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            <span>{reserva.total_itens || 0} item(s)</span>
          </div>

          <div className="flex items-center justify-between">
            <div className={`text-xl font-bold ${getStatusColor(reserva.status)}`}>
              {utils.formatCurrency(reserva.valor_total || 0)}
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/reservas/${reserva.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalhes
              </Link>
            </Button>
          </div>

          {reserva.observacoes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Observações:</strong> {reserva.observacoes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getStatusStats = () => {
    const stats = {
      total: reservas.length,
      pendente: reservas.filter(r => r.status === 'pendente').length,
      aprovada: reservas.filter(r => r.status === 'aprovada').length,
      ativa: reservas.filter(r => r.status === 'ativa').length,
      concluida: reservas.filter(r => r.status === 'concluida').length,
      rejeitada: reservas.filter(r => r.status === 'rejeitada').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Reservas</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o status das suas reservas de equipamentos
            </p>
          </div>
          <Button asChild>
            <Link to="/orcamentos/criar">
              <Package className="h-4 w-4 mr-2" />
              Nova Reserva
            </Link>
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendente}</p>
                  <p className="text-xs text-gray-600">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.aprovada}</p>
                  <p className="text-xs text-gray-600">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.ativa}</p>
                  <p className="text-xs text-gray-600">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats.concluida}</p>
                  <p className="text-xs text-gray-600">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejeitada}</p>
                  <p className="text-xs text-gray-600">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Reservas */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : reservas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma reserva encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Você ainda não possui reservas. Comece criando um orçamento e depois solicite a reserva.
              </p>
              <Button asChild>
                <Link to="/orcamentos/criar">
                  <Package className="h-4 w-4 mr-2" />
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

export default Reservas;

